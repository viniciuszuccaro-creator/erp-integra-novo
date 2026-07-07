import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/components/lib/UserContext";
import { useRLSQuery } from "@/components/lib/useRLSQuery";

/**
 * Hook extraído de GerarOPModal.jsx
 * Encapsula toda a lógica de geração de OP automática:
 * - Estado dos passos (seleção → configuração → processando → concluído)
 * - Query de produtos para lookup de bitolas
 * - Mutation que cria OP, reserva estoque, atualiza pedido e registra histórico
 * - Validações de formulário
 */
export function useGerarOPLogic({ isOpen, onClose, pedido }) {
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [gerando, setGerando] = useState(false);
  const [opsGeradas, setOpsGeradas] = useState([]);
  const [itensSelecionados, setItensSelecionados] = useState([]);

  const [configGlobal, setConfigGlobal] = useState({
    data_emissao: new Date().toISOString().split('T')[0],
    data_inicio_prevista: "",
    setor_producao: "Produção",
    responsavel: "",
    turno: "Manhã",
    prioridade: "Normal"
  });

  const [configProducao, setConfigProducao] = useState(null);

  // Fetch produtos para lookup de bitolas — via useRLSQuery (cache compartilhado)
  const { data: produtos = [] } = useRLSQuery(
    'Produto', { status: "Ativo" }, '-descricao', 500,
    { enabled: !!pedido?.empresa_id && isOpen }
  );

  // Carregar configuração de produção da empresa
  useEffect(() => {
    if (isOpen && pedido?.empresa_id) {
      base44.entities.ConfiguracaoProducao.filter({ empresa_id: pedido.empresa_id })
        .then(configs => {
          if (configs[0]) {
            setConfigProducao(configs[0]);
            setConfigGlobal(prev => ({
              ...prev,
              setor_producao: configs[0].setor_producao_padrao || prev.setor_producao,
              turno: configs[0].turno_padrao || prev.turno,
              prioridade: configs[0].prioridade_padrao || prev.prioridade,
              data_inicio_prevista: prev.data_inicio_prevista || new Date().toISOString().split('T')[0],
            }));
          }
        });
    }
  }, [isOpen, pedido]);

  // Carregar itens de produção do pedido
  useEffect(() => {
    if (isOpen && pedido?.itens_producao) {
      const itemsComOP = pedido.itens_producao.map((item, index) => ({
        ...item,
        index,
        selecionado: item.gerar_op_automaticamente !== false,
        numero_op: `ITEM-${String(index + 1).padStart(2, '0')}`
      }));
      setItensSelecionados(itemsComOP);
    }
  }, [isOpen, pedido]);

  const toggleItem = (index) => {
    setItensSelecionados(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, selecionado: !item.selecionado } : item
      )
    );
  };

  const toggleAll = () => {
    const todosSelecionados = itensSelecionados.every(i => i.selecionado);
    setItensSelecionados(prev =>
      prev.map(item => ({ ...item, selecionado: !todosSelecionados }))
    );
  };

  const validar = () => {
    if (itensSelecionados.filter(i => i.selecionado).length === 0) {
      toast({ title: "⚠️ Nenhum item selecionado", description: "Selecione ao menos um item ou clique 'Selecionar Todos' para continuar.", variant: "destructive" });
      return false;
    }
    if (!configGlobal.data_inicio_prevista) {
      toast({ title: "⚠️ Data de início obrigatória", description: "Informe a data prevista para início da produção", variant: "destructive" });
      return false;
    }
    return true;
  };

  const avancarParaConfig = () => {
    if (itensSelecionados.filter(i => i.selecionado).length === 0) {
      toast({ title: "⚠️ Nenhum item selecionado", description: "Selecione ao menos um item para avançar.", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const gerarOPAutomaticaMutation = useMutation({
    mutationFn: async () => {
      if (!pedido || !pedido.itens_producao || pedido.itens_producao.length === 0) {
        throw new Error("Pedido sem itens de produção");
      }

      const numeroOP = `OP-${Date.now()}`;
      const materiaisNecessarios = [];
      const bitolaMap = {};

      for (const item of pedido.itens_producao) {
        if (item.ferro_principal_bitola && item.ferro_principal_peso_kg > 0) {
          const key = item.ferro_principal_bitola;
          if (!bitolaMap[key]) bitolaMap[key] = { bitola: key, peso_total: 0, descricao: `Bitola ${key}` };
          bitolaMap[key].peso_total += item.ferro_principal_peso_kg;
        }
        if (item.estribo_bitola && item.estribo_peso_kg > 0) {
          const key = item.estribo_bitola;
          if (!bitolaMap[key]) bitolaMap[key] = { bitola: key, peso_total: 0, descricao: `Bitola ${key} (Estribo)` };
          bitolaMap[key].peso_total += item.estribo_peso_kg;
        }
      }

      for (const [bitola, dados] of Object.entries(bitolaMap)) {
        const bitolaProduto = produtos.find(p =>
          p.eh_bitola && p.descricao?.includes(bitola) && p.empresa_id === pedido.empresa_id && p.status === "Ativo"
        );
        if (bitolaProduto) {
          const disponivel = (bitolaProduto.estoque_atual || 0) - (bitolaProduto.estoque_reservado || 0);
          materiaisNecessarios.push({
            produto_id: bitolaProduto.id, bitola_id: bitolaProduto.id, descricao: dados.descricao,
            quantidade_kg: dados.peso_total, unidade: "KG", disponivel_estoque: disponivel >= dados.peso_total, reservado: false
          });
        } else {
          materiaisNecessarios.push({
            produto_id: null, bitola_id: null, descricao: dados.descricao,
            quantidade_kg: dados.peso_total, unidade: "KG", disponivel_estoque: false, reservado: false
          });
        }
      }

      const perdaPercentual = configProducao?.perda_aco_percentual || 5;
      const pesoTeorico = pedido.itens_producao.reduce((sum, i) => sum + (i.peso_total_kg || 0), 0);
      const perdaKg = (pesoTeorico * perdaPercentual) / 100;
      const faltaEstoque = materiaisNecessarios.some(m => !m.disponivel_estoque);

      const inicio = new Date(configGlobal.data_inicio_prevista || new Date().toISOString().split('T')[0]);
      inicio.setDate(inicio.getDate() + (configProducao?.prazo_padrao_op_dias || 7));
      const dataConclusaoPrevista = inicio.toISOString().split('T')[0];

      const op = await base44.entities.OrdemProducao.create({
        group_id: pedido.group_id,
        empresa_id: pedido.empresa_id,
        numero_op: numeroOP,
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        origem: "pedido",
        gerada_automaticamente: true,
        tipo_producao: configProducao?.tipo_producao_padrao || "misto",
        data_emissao: configGlobal.data_emissao,
        data_inicio_prevista: configGlobal.data_inicio_prevista,
        data_conclusao_prevista: dataConclusaoPrevista,
        prazo_dias: configProducao?.prazo_padrao_op_dias || 7,
        prioridade: configGlobal.prioridade,
        status: faltaEstoque ? "Aguardando Matéria-Prima" : "Liberada",
        setor_producao: configGlobal.setor_producao,
        responsavel: configGlobal.responsavel,
        turno: configGlobal.turno,
        itens_producao: pedido.itens_producao.map(item => ({
          origem_item_pedido_id: item.identificador,
          elemento: item.identificador,
          tipo_peca: item.tipo_peca,
          modalidade: item.modelo_base?.includes('armad') ? 'armado' : 'corte_dobra',
          bitola_principal: item.ferro_principal_bitola,
          quantidade_barras_principal: item.ferro_principal_quantidade,
          comprimento_barra: item.comprimento,
          estribo_bitola: item.estribo_bitola,
          estribo_largura: item.estribo_largura,
          estribo_altura: item.estribo_altura,
          estribo_distancia: item.estribo_distancia,
          estribo_quantidade_calculada: item.estribo_quantidade,
          quantidade_pecas: item.quantidade,
          peso_teorico_total: item.peso_total_kg,
          descricao_automatica: `${item.tipo_peca} - ${item.identificador}`,
          apontado: false
        })),
        materiais_necessarios: materiaisNecessarios,
        peso_teorico_total_kg: pesoTeorico,
        perda_percentual_configurada: perdaPercentual,
        perda_kg_prevista: perdaKg,
        alerta_falta_estoque: faltaEstoque,
        estoque_reservado: false,
        estoque_baixado: false,
        percentual_conclusao: 0,
        itens_total: pedido.itens_producao.length,
        itens_concluidos: 0,
        observacoes: configProducao?.observacoes_padrao || "",
        historico_status: [{
          status_anterior: null,
          status_novo: faltaEstoque ? "Aguardando Matéria-Prima" : "Liberada",
          data_hora: new Date().toISOString(),
          usuario: user?.full_name || "Sistema",
          observacao: `OP gerada automaticamente do pedido ${pedido.numero_pedido}`
        }]
      });

      if (!faltaEstoque) {
        const reservasIds = [];
        for (const material of materiaisNecessarios) {
          if (!material.produto_id || !material.disponivel_estoque) continue;
          const currentProduct = await base44.entities.Produto.get(material.produto_id);
          if (!currentProduct) continue;

          const movReserva = await base44.entities.MovimentacaoEstoque.create({
            group_id: pedido.group_id,
            empresa_id: pedido.empresa_id,
            origem_movimento: "producao",
            origem_documento_id: op.id,
            tipo_movimento: "reserva",
            produto_id: material.produto_id,
            produto_descricao: material.descricao,
            quantidade: material.quantidade_kg,
            unidade_medida: "KG",
            estoque_anterior: currentProduct.estoque_atual || 0,
            estoque_atual: currentProduct.estoque_atual || 0,
            reservado_anterior: currentProduct.estoque_reservado || 0,
            reservado_atual: (currentProduct.estoque_reservado || 0) + material.quantidade_kg,
            disponivel_anterior: (currentProduct.estoque_atual || 0) - (currentProduct.estoque_reservado || 0),
            disponivel_atual: (currentProduct.estoque_atual || 0) - ((currentProduct.estoque_reservado || 0) + material.quantidade_kg),
            data_movimentacao: new Date().toISOString(),
            documento: numeroOP,
            motivo: "Reserva para produção",
            responsavel: user?.full_name || "Sistema"
          });
          reservasIds.push(movReserva.id);
          await base44.entities.Produto.update(material.produto_id, {
            estoque_reservado: (currentProduct.estoque_reservado || 0) + material.quantidade_kg
          });
        }
        await base44.entities.OrdemProducao.update(op.id, {
          estoque_reservado: true,
          reserva_estoque_ids: reservasIds
        });
      }

      await base44.entities.Pedido.update(pedido.id, {
        ordem_producao_ids: [...(pedido.ordem_producao_ids || []), op.id],
        status: faltaEstoque ? "Aguardando Matéria-Prima" : "Em Produção"
      });

      await base44.entities.HistoricoCliente.create({
        group_id: pedido.group_id,
        empresa_id: pedido.empresa_id,
        cliente_id: pedido.cliente_id,
        cliente_nome: pedido.cliente_nome,
        modulo_origem: "Producao",
        referencia_id: op.id,
        referencia_tipo: "OrdemProducao",
        referencia_numero: numeroOP,
        tipo_evento: "Criacao",
        titulo_evento: "OP gerada automaticamente",
        descricao_detalhada: `Ordem de Produção ${numeroOP} gerada a partir do pedido ${pedido.numero_pedido}. Peso teórico: ${pesoTeorico.toFixed(2)} kg${faltaEstoque ? '. ATENÇÃO: Falta material em estoque.' : ''}`,
        usuario_responsavel: user?.full_name || "Sistema",
        data_evento: new Date().toISOString()
      });

      return op;
    },
    onSuccess: (op) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['ordens-producao'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      toast({ title: "✅ OP gerada com sucesso!", description: `Número: ${op.numero_op}` });
      setOpsGeradas([op]);
      setStep(4);
      setGerando(false);
    },
    onError: (error) => {
      console.error("Erro ao gerar OPs:", error);
      toast({ title: "❌ Erro ao gerar OPs", description: error.message || "Ocorreu um erro inesperado.", variant: "destructive" });
      setGerando(false);
      setStep(2);
    }
  });

  const gerarOPs = async () => {
    if (!validar()) return;
    setGerando(true);
    setStep(3);
    gerarOPAutomaticaMutation.mutate();
  };

  const fechar = () => {
    setStep(1);
    setOpsGeradas([]);
    gerarOPAutomaticaMutation.reset();
    onClose();
  };

  return {
    step, setStep, gerando, opsGeradas, itensSelecionados,
    configGlobal, setConfigGlobal, configProducao,
    toggleItem, toggleAll, avancarParaConfig, gerarOPs, fechar,
    gerarOPAutomaticaMutation
  };
}