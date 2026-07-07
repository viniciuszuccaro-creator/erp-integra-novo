import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import useContextoVisual from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePermissions from "@/components/lib/usePermissions";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

/**
 * Hook extraído de TabelaPrecoFormCompleto.jsx
 * Encapsula estado, queries, handlers de tabela de preço + itens + IA PriceBrain.
 */
export default function useTabelaPrecoForm({ tabela, onSubmit }) {
  const queryClient = useQueryClient();
  const [salvando, setSalvando] = useState(false);
  const [user, setUser] = useState(null);
  const { empresaAtual, grupoAtual, filterInContext, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeCriar = canCreate("Cadastros", "Tabela de Preco") || canCreate("Cadastros", "TabelaPreco") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Tabela de Preco") || canEdit("Cadastros", "TabelaPreco") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Tabela de Preco") || canDelete("Cadastros", "TabelaPreco") || canDelete("Cadastros", null);

  useEffect(() => { const loadUser = async () => { setUser(await base44.auth.me()); }; loadUser(); }, []);

  const [formData, setFormData] = useState({
    nome: tabela?.nome || '', descricao: tabela?.descricao || '', tipo: tabela?.tipo || 'Padrão',
    data_inicio: tabela?.data_inicio || new Date().toISOString().split('T')[0], data_fim: tabela?.data_fim || '',
    ativo: tabela?.ativo !== undefined ? tabela.ativo : true,
    empresa_id: tabela?.empresa_id || empresaAtual?.id || user?.empresa_selecionada_id || '',
    group_id: tabela?.group_id || groupId || '', compartilhar_grupo: tabela?.compartilhar_grupo || false
  });

  const [activeTab, setActiveTab] = useState('config');
  const [modoInclusao, setModoInclusao] = useState('lote');
  const [calculando, setCalculando] = useState(false);
  const [searchProduto, setSearchProduto] = useState('');
  const [itensTabela, setItensTabela] = useState([]);
  const [filtroLote, setFiltroLote] = useState({ setor_id: '', grupo_id: '', marca_id: '', ncm: '', curva_abc: '', eh_bitola: '' });
  const [regraCalculo, setRegraCalculo] = useState({ base: 'custo_medio', tipo: 'markup', valor: 30, aplicar_por_setor: false, markup_por_setor: {} });

  const { data: produtos = [] } = useRLSQuery('Produto', {}, 'descricao', 500, { enabled: contextoValido });
  const { data: setoresAtividade = [] } = useRLSQuery('SetorAtividade', {}, 'nome', 200, { enabled: contextoValido });
  const { data: gruposProduto = [] } = useRLSQuery('GrupoProduto', {}, 'nome', 200, { enabled: contextoValido });
  const { data: marcas = [] } = useRLSQuery('Marca', {}, 'nome', 200, { enabled: contextoValido });
  const { data: itensExistentes = [] } = useRLSQuery('TabelaPrecoItem', { tabela_preco_id: tabela?.id }, 'produto_descricao', 1000, { enabled: !!tabela?.id && contextoValido });

  useEffect(() => { if (itensExistentes.length > 0) setItensTabela(itensExistentes); }, [itensExistentes]);

  const handleAdicionarProdutoIndividual = (produto) => {
    if (itensTabela.some(i => i.produto_id === produto.id)) { toast.error('Produto já incluído na tabela'); return; }
    const custoBase = produto.custo_medio || produto.custo_aquisicao || 0;
    const precoVenda = produto.preco_venda || custoBase * 1.3;
    const margem = custoBase > 0 ? ((precoVenda - custoBase) / custoBase * 100) : 0;
    setItensTabela(prev => [...prev, { produto_id: produto.id, produto_descricao: produto.descricao, produto_codigo: produto.codigo || '', setor_atividade_nome: produto.setor_atividade_nome || '', grupo_produto_nome: produto.grupo_produto_nome || '', marca_nome: produto.marca_nome || '', custo_base: custoBase, preco: precoVenda, desconto_maximo_percentual: 10, margem_percentual: margem }]);
    toast.success(`✅ ${produto.descricao} adicionado`);
    setSearchProduto('');
  };

  const handleAdicionarProdutosLote = () => {
    const produtosFiltrados = produtos.filter(p => {
      if (filtroLote.setor_id && p.setor_atividade_id !== filtroLote.setor_id) return false;
      if (filtroLote.grupo_id && p.grupo_produto_id !== filtroLote.grupo_id) return false;
      if (filtroLote.marca_id && p.marca_id !== filtroLote.marca_id) return false;
      if (filtroLote.ncm && !p.ncm?.includes(filtroLote.ncm)) return false;
      if (filtroLote.curva_abc && p.classificacao_abc !== filtroLote.curva_abc) return false;
      if (filtroLote.eh_bitola && p.eh_bitola !== (filtroLote.eh_bitola === 'true')) return false;
      return true;
    });
    const novosItens = produtosFiltrados.filter(p => !itensTabela.some(i => i.produto_id === p.id)).map(p => {
      const custoBase = p.custo_medio || p.custo_aquisicao || 0;
      const precoVenda = p.preco_venda || custoBase * 1.3;
      const margem = custoBase > 0 ? ((precoVenda - custoBase) / custoBase * 100) : 0;
      return { produto_id: p.id, produto_descricao: p.descricao, produto_codigo: p.codigo || '', setor_atividade_nome: p.setor_atividade_nome || '', grupo_produto_nome: p.grupo_produto_nome || '', marca_nome: p.marca_nome || '', custo_base: custoBase, preco: precoVenda, desconto_maximo_percentual: 10, margem_percentual: margem };
    });
    setItensTabela(prev => [...prev, ...novosItens]);
    toast.success(`✅ ${novosItens.length} produtos adicionados`);
  };

  const handleRecalcularPrecos = () => {
    setCalculando(true);
    const itensAtualizados = itensTabela.map(item => {
      let custoBase = item.custo_base;
      if (regraCalculo.base === 'custo_medio') { const produtoAtual = produtos.find(p => p.id === item.produto_id); custoBase = produtoAtual?.custo_medio || item.custo_base; }
      let markup = regraCalculo.valor;
      if (regraCalculo.aplicar_por_setor && item.setor_atividade_nome) markup = regraCalculo.markup_por_setor[item.setor_atividade_nome] || regraCalculo.valor;
      let novoPreco = custoBase;
      switch (regraCalculo.tipo) { case 'markup': novoPreco = custoBase * (1 + markup / 100); break; case 'margem': novoPreco = custoBase / (1 - markup / 100); break; case 'valor_fixo': novoPreco = custoBase + markup; break; }
      const margem = custoBase > 0 ? ((novoPreco - custoBase) / custoBase * 100) : 0;
      return { ...item, custo_base: custoBase, preco: novoPreco, margem_percentual: margem };
    });
    setItensTabela(itensAtualizados);
    setCalculando(false);
    toast.success(`✅ ${itensAtualizados.length} preços recalculados`);
  };

  const handleSugerirPrecosIA = async () => {
    if (itensTabela.length === 0) { toast.error('Adicione produtos à tabela primeiro'); return; }
    setCalculando(true);
    try {
      const amostra = itensTabela.slice(0, 15).map(i => ({ descricao: i.produto_descricao, setor: i.setor_atividade_nome, grupo: i.grupo_produto_nome, marca: i.marca_nome, custo_base: i.custo_base, preco_atual: i.preco, margem_atual: i.margem_percentual }));
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o PriceBrain 3.0, IA especialista em precificação estratégica V21.0.\n\nAnalise esta amostra de produtos da tabela "${formData.nome}" (tipo: ${formData.tipo}):\n\n${JSON.stringify(amostra, null, 2)}\n\nCONTEXTO V21.0:\n- Produtos classificados por Setor + Grupo + Marca (dupla classificação)\n- Tipo de tabela: ${formData.tipo}\n- Data início: ${formData.data_inicio}\n\nMISSÃO:\n1. Analise margem por SETOR (Revenda vs Fábrica vs Almoxarifado)\n2. Considere GRUPO (Bitolas vendem com margem menor, produtos acabados com margem maior)\n3. Avalie MARCA (marcas premium permitem markup maior)\n4. Detecte oportunidades de cross-sell\n\nRETORNE:\n- markup_sugerido_geral: markup base (%)\n- markup_por_setor: objeto com markup específico por setor {Revenda: 25, Fábrica: 35}\n- estrategia: explicação da estratégia (max 200 chars)\n- produtos_promocao: IDs de produtos para promoção\n- observacoes: insights (max 150 chars)`,
        response_json_schema: { type: "object", properties: { markup_sugerido_geral: { type: "number" }, markup_por_setor: { type: "object", additionalProperties: { type: "number" } }, estrategia: { type: "string" }, produtos_promocao: { type: "array", items: { type: "string" } }, observacoes: { type: "string" } } }
      });
      const itensAtualizados = itensTabela.map(item => {
        const custoBase = item.custo_base;
        const markupSetor = resultado.markup_por_setor[item.setor_atividade_nome] || resultado.markup_sugerido_geral;
        const novoPreco = custoBase * (1 + markupSetor / 100);
        const margem = ((novoPreco - custoBase) / custoBase * 100);
        return { ...item, preco: novoPreco, preco_sugerido_ia: novoPreco, margem_percentual: margem, markup_aplicado_ia: markupSetor, sugestao_ia: resultado.produtos_promocao.includes(item.produto_id) ? '🎯 Giro baixo - promoção recomendada' : null };
      });
      setItensTabela(itensAtualizados);
      toast.success(`✨ IA PriceBrain 3.0: ${resultado.estrategia}`);
      if (resultado.observacoes) setTimeout(() => toast.info(`💡 ${resultado.observacoes}`), 1500);
      setRegraCalculo(prev => ({ ...prev, aplicar_por_setor: true, markup_por_setor: resultado.markup_por_setor }));
    } catch (error) { toast.error('❌ Erro ao consultar IA: ' + error.message); }
    finally { setCalculando(false); }
  };

  const handleRemoverItem = (idx) => { setItensTabela(prev => prev.filter((_, i) => i !== idx)); toast.success('Item removido'); };
  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();

  const handleExcluir = async () => {
    const ok = await confirm({ title: 'Confirmar Exclusão', description: `Tem certeza que deseja excluir a tabela "${formData.nome}"? Esta ação não pode ser desfeita.`, confirmText: 'Excluir' });
    if (!ok) return;
    if (!podeExcluir) { toast.error('Seu perfil nao permite excluir tabelas de preco'); return; }
    if (tabela?.id) { await deleteInContext('TabelaPreco', tabela.id); queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] }); }
    if (onSubmit) onSubmit({ ...formData, _action: 'delete' });
  };

  const handleAlternarStatus = () => setFormData({ ...formData, ativo: !formData.ativo });

  const handleSalvar = async () => {
    if (!formData.nome || !formData.tipo || !formData.data_inicio) { toast.error('❌ Preencha: Nome, Tipo e Data Início'); return; }
    if (!contextoValido) { toast.error('Selecione um grupo ou empresa antes de salvar a tabela de preco'); return; }
    if (tabela?.id ? !podeEditar : !podeCriar) { toast.error('Seu perfil nao permite salvar tabelas de preco'); return; }
    setSalvando(true);
    try {
      const dadosTabela = { ...formData, empresa_id: empresaAtual?.id || formData.empresa_id || user?.empresa_selecionada_id || user?.empresa_id, group_id: groupId || formData.group_id, criado_por: user?.email || 'sistema' };
      let tabelaId = tabela?.id;
      if (!tabelaId) { const tabelaCriada = await createInContext('TabelaPreco', dadosTabela); tabelaId = tabelaCriada.id; }
      else await updateInContext('TabelaPreco', tabelaId, dadosTabela);
      if (tabela?.id && itensExistentes.length > 0) for (const itemAntigo of itensExistentes) await deleteInContext('TabelaPrecoItem', itemAntigo.id);
      if (itensTabela.length > 0) for (const item of itensTabela) {
        await createInContext('TabelaPrecoItem', { tabela_preco_id: tabelaId, produto_id: item.produto_id, produto_descricao: item.produto_descricao, produto_codigo: item.produto_codigo || '', setor_atividade_nome: item.setor_atividade_nome || '', grupo_produto_nome: item.grupo_produto_nome || '', marca_nome: item.marca_nome || '', custo_base: Number(item.custo_base) || 0, preco: Number(item.preco) || 0, desconto_maximo_percentual: Number(item.desconto_maximo_percentual) || 0, margem_percentual: Number(item.margem_percentual) || 0, markup_aplicado_ia: item.markup_aplicado_ia || null });
      }
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco-itens'] });
      queryClient.invalidateQueries({ queryKey: ['tabela-preco-itens'] });
      toast.success(`✅ Tabela "${formData.nome}" salva com ${itensTabela.length} produtos!`);
      if (onSubmit) onSubmit({ _salvamentoCompleto: true });
    } catch (error) { toast.error('❌ Erro ao salvar: ' + error.message); }
    finally { setSalvando(false); }
  };

  const produtosFiltrados = produtos.filter(p => !itensTabela.some(i => i.produto_id === p.id) && (searchProduto === '' || p.descricao.toLowerCase().includes(searchProduto.toLowerCase())));
  const podeAvancar = formData.nome && formData.tipo && formData.data_inicio;
  const produtosDisponiveis = produtos.filter(p => {
    if (filtroLote.setor_id && p.setor_atividade_id !== filtroLote.setor_id) return false;
    if (filtroLote.grupo_id && p.grupo_produto_id !== filtroLote.grupo_id) return false;
    if (filtroLote.marca_id && p.marca_id !== filtroLote.marca_id) return false;
    if (filtroLote.ncm && !p.ncm?.includes(filtroLote.ncm)) return false;
    if (filtroLote.curva_abc && p.classificacao_abc !== filtroLote.curva_abc) return false;
    if (filtroLote.eh_bitola && p.eh_bitola !== (filtroLote.eh_bitola === 'true')) return false;
    return !itensTabela.some(i => i.produto_id === p.id);
  });

  return {
    formData, setFormData, activeTab, setActiveTab, modoInclusao, setModoInclusao, calculando, searchProduto, setSearchProduto,
    itensTabela, setItensTabela, filtroLote, setFiltroLote, regraCalculo, setRegraCalculo,
    produtos, setoresAtividade, gruposProduto, marcas, itensExistentes, produtosFiltrados, produtosDisponiveis, podeAvancar,
    contextoValido, podeCriar, podeEditar, podeExcluir, salvando,
    handleAdicionarProdutoIndividual, handleAdicionarProdutosLote, handleRecalcularPrecos, handleSugerirPrecosIA,
    handleRemoverItem, handleExcluir, handleAlternarStatus, handleSalvar, ConfirmExcluirDialog
  };
}