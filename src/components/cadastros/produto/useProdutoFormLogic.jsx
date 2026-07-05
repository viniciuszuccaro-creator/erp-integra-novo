import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * Hook extraído de ProdutoForm.jsx — encapsula toda a lógica de negócios.
 * Refatoração Regra-Mãe: dividir arquivos grandes em partes menores.
 */
export default function useProdutoFormLogic({ formData, setFormData }) {
  const [iaSugestao, setIaSugestao] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [calculoConversao, setCalculoConversao] = useState(null);
  const [sugestoesIA, setSugestoesIA] = useState({});
  const [modoManual, setModoManual] = useState(false);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (formData.eh_bitola) recalcularFatoresConversao();
  }, [formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m, formData.eh_bitola]);

  useEffect(() => {
    if (formData.altura_cm > 0 && formData.largura_cm > 0 && formData.comprimento_cm > 0) {
      const volume_m3 = (formData.altura_cm * formData.largura_cm * formData.comprimento_cm) / 1000000;
      setFormData(prev => ({ ...prev, volume_m3 }));
    } else if (formData.volume_m3 !== 0) {
      setFormData(prev => ({ ...prev, volume_m3: 0 }));
    }
  }, [formData.altura_cm, formData.largura_cm, formData.comprimento_cm, formData.volume_m3]);

  useEffect(() => {
    if (modoManual) { setIaSugestao(null); return; }
    if ((formData.descricao || '').length >= 5) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => analisarDescricaoIA(formData.descricao), 700);
    } else { setIaSugestao(null); }
    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  }, [formData.descricao, modoManual]);

  const recalcularFatoresConversao = () => {
    const pesoKgM = formData.peso_teorico_kg_m || 0;
    const comprimentoM = formData.comprimento_barra_padrao_m || 12;
    const kgPorPeca = pesoKgM * comprimentoM;
    const pecaPorTon = kgPorPeca > 0 ? (1000 / kgPorPeca) : 0;
    const novosFatores = {
      kg_por_metro: pesoKgM, kg_por_peca: kgPorPeca,
      metros_por_peca: comprimentoM, peca_por_ton: pecaPorTon, kg_por_ton: 1000
    };
    setFormData(prev => ({ ...prev, fatores_conversao: novosFatores }));
    setCalculoConversao(novosFatores);
  };

  const analisarDescricaoIA = async (descricao) => {
    if (!descricao || descricao.length < 5) return;
    setProcessandoIA(true);
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta descrição de produto: "${descricao}". Se for bitola de aço, retorne eh_bitola:true, peso_teorico_kg_m, bitola_diametro_mm, tipo_aco, ncm, grupo_produto, comprimento_barra_m, unidade_principal, unidades_secundarias. Caso contrário sugira grupo_produto, ncm, unidade_principal e unidades_secundarias apropriadas.`,
        response_json_schema: {
          type: "object",
          properties: {
            eh_bitola: { type: "boolean" }, peso_teorico_kg_m: { type: "number" },
            bitola_diametro_mm: { type: "number" }, tipo_aco: { type: "string" },
            ncm: { type: "string" }, grupo_produto: { type: "string" },
            comprimento_barra_m: { type: "number" }, unidade_principal: { type: "string" },
            unidades_secundarias: { type: "array", items: { type: "string" } },
            explicacao: { type: "string" }
          }
        }
      });
      setIaSugestao(resultado);
      toast.success('✨ IA analisou o produto!');
    } catch (error) {
      toast.error('Erro ao processar IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const aplicarSugestaoIA = () => {
    if (!iaSugestao || modoManual) return;
    setFormData(prev => ({
      ...prev,
      eh_bitola: iaSugestao.eh_bitola || false,
      peso_teorico_kg_m: iaSugestao.peso_teorico_kg_m || 0,
      bitola_diametro_mm: iaSugestao.bitola_diametro_mm || 0,
      tipo_aco: iaSugestao.tipo_aco || 'CA-50',
      ncm: iaSugestao.ncm || '',
      grupo: iaSugestao.grupo_produto || prev.grupo,
      comprimento_barra_padrao_m: iaSugestao.comprimento_barra_m || 12,
      unidade_principal: iaSugestao.unidade_principal || 'KG',
      unidades_secundarias: iaSugestao.unidades_secundarias || ['KG']
    }));
    toast.success('✅ Sugestões aplicadas!');
    setIaSugestao(null);
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_produto_url: file_url });
      toast.success('✅ Foto carregada!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploadingFoto(false);
    }
  };

  const toggleUnidadeSecundaria = (unidade) => {
    const unidades = formData.unidades_secundarias || [];
    setFormData(prev => ({
      ...prev,
      unidades_secundarias: unidades.includes(unidade)
        ? unidades.filter(u => u !== unidade)
        : [...unidades, unidade]
    }));
  };

  const handleDadosNCM = (dados) => {
    setFormData(prev => ({ ...prev, unidade_medida: dados.unidade || prev.unidade_medida, cest: dados.cest || prev.cest }));
    setSugestoesIA(prev => ({ ...prev, ncm_info: `${dados.descricao}${dados.obs ? ' - ' + dados.obs : ''}`, aliquotas: dados }));
    toast.success("NCM encontrado!", { description: dados.descricao });
  };

  const enviarParaProducao = () => {
    setFormData(prev => ({ ...prev, tipo_item: 'Matéria-Prima Produção', setor_atividade_id: 'setor-fabrica-001', setor_atividade_nome: 'Fábrica' }));
    setModoManual(false);
    toast.success('🏭 Produto movido para Produção!', { description: 'Lembre-se de salvar as alterações' });
  };

  return {
    iaSugestao, processandoIA, uploadingFoto, calculoConversao, sugestoesIA, modoManual, setModoManual,
    analisarDescricaoIA, aplicarSugestaoIA, handleUploadFoto, toggleUnidadeSecundaria, handleDadosNCM, enviarParaProducao,
  };
}