import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import useContextoVisual from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePermissions from "@/components/lib/usePermissions";
import { buildInitialFormData } from "./useProdutoFormState";
import useProdutoIA from "./useProdutoIA";

/**
 * Hook extraído de ProdutoFormV22_Completo.jsx
 * Encapsula estado, queries, validações, submit, upload, exclusão.
 */
export default function useProdutoForm({ produto, onSubmit, onSuccess, closeSelf }) {
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [user, setUser] = useState(null);
  const {
    empresaAtual, grupoAtual, carimbarContexto, filterInContext,
    createInContext, updateInContext, deleteInContext
  } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeCriar = canCreate("Cadastros", "Produto") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Produto") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Produto") || canDelete("Cadastros", null);

  useEffect(() => {
    const loadUser = async () => { try { setUser(await base44.auth.me()); } catch (e) { console.error("Failed to load user:", e); } };
    loadUser();
  }, []);

  const [formData, setFormData] = useState(() => buildInitialFormData(produto));
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [calculoConversao, setCalculoConversao] = useState(null);
  const [modoManual, setModoManual] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const { iaSugestao, setIaSugestao, processandoIA, sugestoesIA, setSugestoesIA, gerandoDescricaoSEO, gerandoImagem, analisarDescricaoIA, aplicarSugestaoIA, gerarDescricaoSEO, gerarImagemIA } = useProdutoIA({ formData, setFormData });

  const { data: todosProdutos = [] } = useRLSQuery('Produto', {}, '-created_date', 100, { staleTime: 300000, enabled: !produto && abaAtiva === 'dados-gerais' && contextoValido });
  const { data: setores = [] } = useRLSQuery('SetorAtividade', {}, 'nome', 200, { staleTime: 300000, enabled: abaAtiva === 'dados-gerais' && contextoValido });
  const { data: grupos = [] } = useRLSQuery('GrupoProduto', {}, 'nome', 200, { staleTime: 300000, enabled: abaAtiva === 'dados-gerais' && contextoValido });
  const { data: marcas = [] } = useRLSQuery('Marca', {}, 'nome', 200, { staleTime: 300000, enabled: abaAtiva === 'dados-gerais' && contextoValido });
  const { data: locaisEstoque = [] } = useRLSQuery('LocalEstoque', {}, 'nome', 200, { staleTime: 300000, enabled: abaAtiva === 'estoque-avancado' && contextoValido });
  const { data: planoContas = [] } = useRLSQuery('PlanoDeContas', {}, 'codigo', 500, { staleTime: 300000, enabled: abaAtiva === 'fiscal-contabil' && contextoValido });

  useEffect(() => {
    if (!produto && !formData.codigo && Array.isArray(todosProdutos)) {
      const ultimoCodigo = todosProdutos.map(p => p.codigo).filter(c => c && /^\d+$/.test(c)).map(c => parseInt(c)).sort((a, b) => b - a)[0] || 0;
      const proximoCodigo = (ultimoCodigo + 1).toString().padStart(4, '0');
      setFormData(prev => ({ ...prev, codigo: proximoCodigo }));
    }
  }, [todosProdutos, produto, formData.codigo]);

  useEffect(() => { if (formData.eh_bitola) recalcularFatoresConversao(); }, [formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m, formData.eh_bitola]);

  useEffect(() => {
    if (formData.altura_cm > 0 && formData.largura_cm > 0 && formData.comprimento_cm > 0) {
      const volume_m3 = (formData.altura_cm * formData.largura_cm * formData.comprimento_cm) / 1000000;
      setFormData(prev => ({ ...prev, volume_m3 }));
    }
  }, [formData.altura_cm, formData.largura_cm, formData.comprimento_cm]);

  const recalcularFatoresConversao = () => {
    const pesoKgM = formData.peso_teorico_kg_m || 0;
    const comprimentoM = formData.comprimento_barra_padrao_m || 12;
    const kgPorPeca = pesoKgM * comprimentoM;
    const pecaPorTon = kgPorPeca > 0 ? (1000 / kgPorPeca) : 0;
    const novosFatores = { kg_por_metro: pesoKgM, kg_por_peca: kgPorPeca, metros_por_peca: comprimentoM, peca_por_ton: pecaPorTon, kg_por_ton: 1000 };
    setFormData(prev => ({ ...prev, fatores_conversao: novosFatores }));
    setCalculoConversao(novosFatores);
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_produto_url: file_url });
      toast.success('✅ Foto carregada!');
    } catch (error) { toast.error('Erro ao fazer upload'); }
    finally { setUploadingFoto(false); }
  };

  const toggleUnidadeSecundaria = (unidade) => {
    const unidades = formData.unidades_secundarias || [];
    if (unidades.includes(unidade)) setFormData(prev => ({ ...prev, unidades_secundarias: unidades.filter(u => u !== unidade) }));
    else setFormData(prev => ({ ...prev, unidades_secundarias: [...unidades, unidade] }));
  };

  const handleDadosNCM = (dados) => {
    setFormData((prev) => ({ ...prev, unidade_medida: dados.unidade || prev.unidade_medida, cest: dados.cest || prev.cest }));
    setSugestoesIA((prev) => ({ ...prev, ncm_info: `${dados.descricao}${dados.obs ? ' - ' + dados.obs : ''}`, aliquotas: dados }));
    toast.success("NCM encontrado!", { description: dados.descricao });
  };

  const submitProduto = async () => {
    if (!formData.descricao) { toast.error('Preencha a descrição do produto'); return; }
    if (!contextoValido) { toast.error('Selecione um grupo ou empresa antes de salvar o produto'); return; }
    if (produto?.id ? !podeEditar : !podeCriar) { toast.error('Seu perfil nao permite salvar produtos'); return; }
    if (formData.codigo && !produto?.id) {
      try {
        const produtosExistentes = await filterInContext('Produto', { codigo: formData.codigo }, '-created_date', 1);
        if (produtosExistentes.length > 0) { toast.error(`❌ Código "${formData.codigo}" já existe em outro produto`); setAbaAtiva('dados-gerais'); return; }
      } catch (error) { console.error('Erro ao verificar código duplicado:', error); }
    }
    if (!formData.setor_atividade_id) { toast.error('Selecione o Setor de Atividade'); setAbaAtiva('dados-gerais'); return; }
    if (!formData.grupo_produto_id) { toast.error('Selecione o Grupo de Produto'); setAbaAtiva('dados-gerais'); return; }
    if (!formData.marca_id) { toast.error('Selecione a Marca'); setAbaAtiva('dados-gerais'); return; }
    if (!formData.unidades_secundarias || formData.unidades_secundarias.length === 0) { toast.error('Selecione pelo menos 1 unidade de venda/compra'); setAbaAtiva('conversoes'); return; }
    if (formData.eh_bitola && formData.peso_teorico_kg_m === 0) { toast.error('Bitolas precisam ter peso teórico preenchido'); setAbaAtiva('dados-gerais'); return; }

    const dadosBase = {
      ...formData, unidade_medida: formData.unidade_principal || formData.unidade_medida || 'KG',
      tributacao: { icms_cst: formData.tributacao.icms_cst || '', icms_aliquota: formData.tributacao.icms_aliquota || 0, pis_cst: formData.tributacao.pis_cst || '', pis_aliquota: formData.tributacao.pis_aliquota || 0, cofins_cst: formData.tributacao.cofins_cst || '', cofins_aliquota: formData.tributacao.cofins_aliquota || 0, ipi_cst: formData.tributacao.ipi_cst || '', ipi_aliquota: formData.tributacao.ipi_aliquota || 0 }
    };
    const dadosSubmit = carimbarContexto(dadosBase, 'empresa_id');
    try {
      if (produto?.id) { await updateInContext('Produto', produto.id, dadosSubmit); toast.success('✅ Produto atualizado com sucesso!'); }
      else { await createInContext('Produto', dadosSubmit); toast.success('✅ Produto criado com sucesso!'); }
      if (onSuccess) onSuccess();
      if (onSubmit) onSubmit(dadosSubmit);
      if (typeof closeSelf === 'function') closeSelf();
    } catch (error) { toast.error('❌ Erro ao salvar produto: ' + error.message); }
  };

  const handleExcluir = () => { if (!podeExcluir) { toast.error('Seu perfil nao permite excluir produtos'); return; } setConfirmandoExclusao(true); };

  const confirmarExclusao = () => {
    setConfirmandoExclusao(false);
    if (produto?.id) {
      deleteInContext('Produto', produto.id).then(() => { toast.success('Produto excluido com sucesso!'); if (onSuccess) onSuccess(); if (typeof closeSelf === 'function') closeSelf(); }).catch((error) => toast.error('Erro ao excluir produto: ' + error.message));
      return;
    }
    if (onSubmit) onSubmit({ ...formData, _action: 'delete' });
  };

  const handleAlternarStatus = () => setFormData({ ...formData, status: formData.status === 'Ativo' ? 'Inativo' : 'Ativo' });

  return {
    abaAtiva, setAbaAtiva, formData, setFormData, user, contextoValido, podeCriar, podeEditar, podeExcluir,
    iaSugestao, setIaSugestao, processandoIA, sugestoesIA, setSugestoesIA, gerandoDescricaoSEO, gerandoImagem,
    analisarDescricaoIA, aplicarSugestaoIA, gerarDescricaoSEO, gerarImagemIA,
    todosProdutos, setores, grupos, marcas, locaisEstoque, planoContas,
    uploadingFoto, calculoConversao, modoManual, setModoManual, confirmandoExclusao,
    recalcularFatoresConversao, handleUploadFoto, toggleUnidadeSecundaria, handleDadosNCM,
    submitProduto, handleExcluir, confirmarExclusao, handleAlternarStatus, carimbarContexto,
    createInContext, updateInContext, deleteInContext
  };
}