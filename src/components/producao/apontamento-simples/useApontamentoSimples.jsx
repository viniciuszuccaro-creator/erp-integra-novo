import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import { useUser } from "@/components/lib/UserContext";

export default function useApontamentoSimples(opId, op, onApontamentoSalvo) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getFiltroContexto } = useContextoVisual();
  const { user: authUser } = useUser();

  const { data: colaboradores = [] } = useRLSQuery(
    'Colaborador', {}, '-created_date', 200,
    { enabled: !!getFiltroContexto("empresa_id") }
  );

  const operador = authUser || null;
  const fallbackColab = colaboradores[0];
  const operadorNome = operador?.full_name || operador?.email || fallbackColab?.nome_completo || "Operador";
  const operadorId = operador?.id || fallbackColab?.id || null;

  const [formApontamento, setFormApontamento] = useState({
    setor: op?.status || "Em Corte",
    item_elemento: "",
    quantidade_produzida: 0,
    peso_produzido_kg: 0,
    quantidade_refugada: 0,
    peso_refugado_kg: 0,
    motivo_refugo: "",
    tempo_minutos: 0,
    hora_inicio: "",
    hora_fim: "",
    observacoes: "",
    tipo: "Andamento",
  });

  const resetForm = () => {
    setFormApontamento({
      setor: op?.status || "Em Corte",
      item_elemento: "",
      quantidade_produzida: 0,
      peso_produzido_kg: 0,
      quantidade_refugada: 0,
      peso_refugado_kg: 0,
      motivo_refugo: "",
      tempo_minutos: 0,
      hora_inicio: "",
      hora_fim: "",
      observacoes: "",
      tipo: "Andamento",
    });
  };

  const salvarApontamentoMutation = useMutation({
    mutationFn: async () => {
      const ctx = { empresa_id: op.empresa_id, group_id: op.group_id };
      const novoApontamento = {
        data_hora: new Date().toISOString(),
        operador: operadorNome,
        operador_id: operadorId,
        setor: formApontamento.setor,
        item_elemento: formApontamento.item_elemento,
        quantidade_produzida: formApontamento.quantidade_produzida,
        peso_produzido_kg: formApontamento.peso_produzido_kg,
        quantidade_refugada: formApontamento.quantidade_refugada || 0,
        peso_refugado_kg: formApontamento.peso_refugado_kg || 0,
        motivo_refugo: formApontamento.motivo_refugo || "",
        tempo_minutos: formApontamento.tempo_minutos,
        hora_inicio: formApontamento.hora_inicio,
        hora_fim: formApontamento.hora_fim,
        observacoes: formApontamento.observacoes,
        tipo: formApontamento.tipo,
      };

      const apontamentosAtuais = op.apontamentos || [];
      const itensAtualizados = (op.itens_producao || []).map((item) => {
        if (item.elemento === formApontamento.item_elemento) {
          return {
            ...item,
            apontado: true,
            data_apontamento: new Date().toISOString(),
            operador_apontamento: operadorNome,
            peso_real_total: (item.peso_real_total || 0) + formApontamento.peso_produzido_kg,
          };
        }
        return item;
      });

      const itensConcluidos = itensAtualizados.filter((i) => i.apontado).length;
      const percentual = op.itens_producao?.length > 0 ? Math.round((itensConcluidos / op.itens_producao.length) * 100) : 0;

      const refugosAtuais = op.refugos || [];
      const novoRefugo = formApontamento.quantidade_refugada > 0
        ? {
            data: new Date().toISOString(),
            item_elemento: formApontamento.item_elemento,
            bitola: itensAtualizados.find((i) => i.elemento === formApontamento.item_elemento)?.bitola_principal,
            quantidade_refugada: formApontamento.quantidade_refugada,
            peso_refugado_kg: formApontamento.peso_refugado_kg,
            motivo: formApontamento.motivo_refugo,
            operador: operadorNome,
            operador_id: operadorId,
            custo_perdido: formApontamento.peso_refugado_kg * 8.5,
            reaproveitavel: false,
          }
        : null;

      const custosReais = {
        material: (op.custos_reais?.material || 0) + formApontamento.peso_produzido_kg * 8.5,
        mao_obra: (op.custos_reais?.mao_obra || 0) + (formApontamento.tempo_minutos / 60) * 50,
        overhead: op.custos_reais?.overhead || 0,
        total: 0,
      };
      custosReais.total = custosReais.material + custosReais.mao_obra + custosReais.overhead;

      const dadosAtualizados = {
        apontamentos: [...apontamentosAtuais, novoApontamento],
        itens_producao: itensAtualizados,
        peso_real_total_kg: (op.peso_real_total_kg || 0) + formApontamento.peso_produzido_kg,
        perda_kg_real: (op.perda_kg_real || 0) + formApontamento.peso_refugado_kg,
        itens_concluidos: itensConcluidos,
        percentual_conclusao: percentual,
        status: percentual === 100 ? "Inspeção" : formApontamento.setor,
        data_inicio_real: op.data_inicio_real || new Date().toISOString(),
        custos_reais: custosReais,
        tempo_real_horas: (op.tempo_real_horas || 0) + formApontamento.tempo_minutos / 60,
      };

      if (novoRefugo) {
        dadosAtualizados.refugos = [...refugosAtuais, novoRefugo];
        dadosAtualizados.perda_percentual_real = op.peso_teorico_total_kg > 0
          ? (((op.peso_real_total_kg || 0) + formApontamento.peso_produzido_kg) / op.peso_teorico_total_kg - 1) * 100
          : 0;
        await base44.entities.AuditLog.create({
          ...ctx,
          usuario: operadorNome,
          usuario_id: operadorId,
          acao: "Criação",
          modulo: "Produção",
          tipo_auditoria: "entidade",
          entidade: "Refugo",
          registro_id: opId,
          descricao: `Refugo no item ${formApontamento.item_elemento} (${formApontamento.motivo_refugo || "n/i"})`,
          dados_novos: novoRefugo,
          data_hora: new Date().toISOString(),
          sucesso: true,
        });
      }

      if (percentual === 100 && !op.estoque_baixado) {
        const config = await base44.entities.ConfiguracaoProducao.filter({ empresa_id: op.empresa_id });
        if (config.length > 0 && config[0]?.modo_integracao_estoque === "reserva_baixa") {
          const baixas = [];
          // Fase 8: lê o campo do schema (materia_prima_prevista), legado como fallback
          for (const material of op.materia_prima_prevista || op.materiais_necessarios || []) {
            const quantidadeKg = Number(material.quantidade_prevista ?? material.quantidade_kg ?? 0);
            if (quantidadeKg <= 0) continue;
            const movBaixa = await base44.entities.MovimentacaoEstoque.create({
              ...ctx,
              tipo_movimento: "saida",
              origem_movimento: "producao",
              origem_documento_id: op.id,
              produto_id: material.produto_id,
              produto_descricao: material.produto_descricao || material.descricao,
              quantidade: quantidadeKg,
              unidade_medida: material.unidade,
              documento: op.numero_op,
              motivo: "Consumo em produção",
              data_movimentacao: new Date().toISOString(),
              responsavel: operadorNome,
              responsavel_id: operadorId,
            });
            await base44.entities.AuditLog.create({
              ...ctx,
              usuario: operadorNome,
              usuario_id: operadorId,
              acao: "Criação",
              modulo: "Estoque",
              tipo_auditoria: "entidade",
              entidade: "MovimentacaoEstoque",
              registro_id: movBaixa.id,
              descricao: `Baixa de material na OP ${op.numero_op}`,
              dados_novos: movBaixa,
              data_hora: new Date().toISOString(),
              sucesso: true,
            });
            baixas.push(movBaixa.id);
            const produto = await base44.entities.Produto.filter({ id: material.produto_id });
            if (produto[0]) {
              await base44.entities.Produto.update(material.produto_id, {
                estoque_atual: (produto[0].estoque_atual || 0) - quantidadeKg,
                estoque_reservado: (produto[0].estoque_reservado || 0) - quantidadeKg,
              });
            }
          }
          dadosAtualizados.estoque_baixado = true;
          dadosAtualizados.baixa_estoque_ids = baixas;
        }
      }

      const opAtualizada = await base44.entities.OrdemProducao.update(opId, dadosAtualizados);
      await base44.entities.AuditLog.create({
        ...ctx,
        usuario: operadorNome,
        usuario_id: operadorId,
        acao: "Edição",
        modulo: "Produção",
        tipo_auditoria: "entidade",
        entidade: "OrdemProducao",
        registro_id: opId,
        descricao: `Apontamento no item ${formApontamento.item_elemento} (${formApontamento.setor})`,
        dados_novos: dadosAtualizados,
        data_hora: new Date().toISOString(),
        sucesso: true,
      });
      return opAtualizada;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens-producao"] });
      toast({ title: "✅ Apontamento registrado!" });
      onApontamentoSalvo?.();
      resetForm();
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao registrar apontamento", description: error.message, variant: "destructive" });
    },
  });

  return {
    formApontamento,
    setFormApontamento,
    salvarApontamentoMutation,
    itensDisponiveis: op?.itens_producao || [],
  };
}