import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import { toast } from "sonner";

export const FORMATOS_DISPONIVEIS = [
  { id: 'reto', label: 'Reto', medidas: ['A'] },
  { id: 'L', label: 'L (1 dobra)', medidas: ['A', 'B'] },
  { id: 'U', label: 'U (2 dobras)', medidas: ['A', 'B', 'C'] },
  { id: 'Z', label: 'Z (3 dobras)', medidas: ['A', 'B', 'C', 'D'] },
  { id: 'gancho', label: 'Gancho', medidas: ['A', 'B', 'C'] },
  { id: 'estribo', label: 'Estribo', medidas: ['A', 'B'] }
];

export const ETAPAS_OBRA = [
  { id: 'fundacao', nome: 'Fundação' },
  { id: 'estrutura', nome: 'Estrutura' },
  { id: 'cobertura', nome: 'Cobertura' },
  { id: 'acabamento', nome: 'Acabamento' }
];

export function calcularPesoPosicao(posicao, bitolas) {
  const bitola = bitolas.find(b => b.bitola_diametro_mm === parseFloat(posicao.bitola));
  const pesoMetro = bitola?.peso_teorico_kg_m || 1.0;
  const medidas = posicao.medidas || {};
  const comprimentoTotal = Object.values(medidas).reduce((sum, val) => sum + (val || 0), 0);
  const comprimentoMetros = comprimentoTotal / 100;
  return comprimentoMetros * pesoMetro * (posicao.quantidade || 1);
}

export default function useCorteDobraIA(formData, setFormData, empresaId) {
  const [posicaoSelecionada, setPosicaoSelecionada] = useState(null);
  const [editando, setEditando] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [previewPosicoes, setPreviewPosicoes] = useState(null);

  const { data: bitolas = [] } = useRLSQuery(
    'Produto', { eh_bitola: true, status: 'Ativo' }, '-descricao', 200,
    { enabled: !!(empresaId || formData?.empresa_id || formData?.group_id) }
  );

  const handleUploadIA = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setProcessandoIA(true);
    toast.success('🤖 Processando arquivo com IA...');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise este projeto de estrutura metálica e extraia TODAS as posições de corte e dobra. Para cada posição, retorne: codigo, bitola (mm), formato (reto, L, U, Z, gancho, estribo), quantidade, etapa (fundacao, estrutura, cobertura), medidas (A,B,C,D em cm).`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            posicoes: { type: 'array', items: { type: 'object', properties: {
              codigo: { type: 'string' }, bitola: { type: 'string' }, formato: { type: 'string' },
              quantidade: { type: 'number' }, etapa: { type: 'string' },
              medidas: { type: 'object', properties: { A: { type: 'number' }, B: { type: 'number' }, C: { type: 'number' }, D: { type: 'number' } } }
            } } },
            confianca: { type: 'number' }, observacoes: { type: 'string' }
          }
        }
      });

      if (resultado.posicoes && resultado.posicoes.length > 0) {
        const posicoesComPeso = resultado.posicoes.map(pos => {
          const pesoEstimado = calcularPesoPosicao(pos, bitolas);
          return {
            ...pos, peso_kg: pesoEstimado, origem_ia: true, confianca_ia: resultado.confianca || 85,
            etapa_obra_id: pos.etapa || '', etapa_obra_nome: ETAPAS_OBRA.find(e => e.id === pos.etapa)?.nome || ''
          };
        });
        // Vol 5.4: Prévia antes de gravar — usuário confirma antes de commitar
        setPreviewPosicoes({
          posicoes: posicoesComPeso,
          arquivo_nome: file.name,
          arquivo_url: file_url,
          confianca: resultado.confianca || 85,
          observacoes: resultado.observacoes || ''
        });
        toast.info(`📋 IA detectou ${posicoesComPeso.length} posição(ões) — confirme para gravar`);
      } else {
        toast.error('❌ Nenhuma posição foi detectada pela IA');
      }
    } catch (error) {
      console.error('Erro ao processar IA:', error);
      toast.error('❌ Erro ao processar arquivo');
    } finally {
      setProcessandoIA(false);
    }
  };

  const adicionarManual = () => {
    setEditando({
      codigo: `N${((formData?.itens_corte_dobra || []).length) + 1}`,
      bitola: '', formato: 'reto', quantidade: 1, medidas: { A: 0 },
      etapa_obra_id: '', etapa_obra_nome: '', origem_ia: false,
      // Vol 5.4: Vínculo a obra, etapa, ponto, pavimento, posição, revisão e data prevista
      ponto: '', pavimento: '', posicao: '', revisao: 1, data_prevista: '',
      // Vol 5.4: Controle de produção/faturamento (impede remoção)
      produzido: false, quantidade_faturada: 0,
    });
  };

  const salvarPosicao = () => {
    if (!editando.bitola || !editando.quantidade) { toast.error('Preencha bitola e quantidade'); return; }
    const pesoCalculado = calcularPesoPosicao(editando, bitolas);
    // Vol 5.4: QR Code para produção, separação e entrega + memória de cálculo
    const qrCode = `CD-${editando.codigo || Date.now().toString(36)}-${Date.now().toString(36).toUpperCase()}`;
    const memoriaCalculo = `Peso = ${pesoCalculado.toFixed(2)} kg (comprimento × peso teórico/m × quantidade)`;
    const posicaoFinal = { ...editando, peso_kg: pesoCalculado, qr_code: editando.qr_code || qrCode, memoria_calculo: memoriaCalculo };
    if (editando.index !== undefined) {
      const novasPos = [...(formData?.itens_corte_dobra || [])];
      novasPos[editando.index] = posicaoFinal;
      setFormData(prev => ({ ...prev, itens_corte_dobra: novasPos }));
    } else {
      setFormData(prev => ({ ...prev, itens_corte_dobra: [...(prev?.itens_corte_dobra || []), posicaoFinal] }));
    }
    setEditando(null);
    toast.success('✅ Posição salva');
  };

  const removerPosicao = (index) => {
    // Vol 5.4: Impedir remoção de posição já produzida ou faturada
    const pos = formData?.itens_corte_dobra?.[index];
    if (pos?.produzido || (pos?.quantidade_faturada || 0) > 0) {
      toast.error('❌ Posição já produzida/faturada — não pode ser removida. Use estorno autorizado.');
      return;
    }
    setFormData(prev => ({ ...prev, itens_corte_dobra: (prev?.itens_corte_dobra || []).filter((_, i) => i !== index) }));
    toast.success('✅ Posição removida');
  };

  const consolidarPorEtapa = () => {
    const itensComEtapa = (formData?.itens_corte_dobra || []).filter(p => p.etapa_obra_id);
    if (itensComEtapa.length === 0) { toast.error('Nenhuma posição possui etapa de obra definida'); return; }
    const etapas = {};
    itensComEtapa.forEach(pos => {
      const etapaId = pos.etapa_obra_id;
      if (!etapas[etapaId]) etapas[etapaId] = { etapa_obra_id: etapaId, etapa_obra_nome: pos.etapa_obra_nome, posicoes: [], peso_total_kg: 0 };
      etapas[etapaId].posicoes.push(pos);
      etapas[etapaId].peso_total_kg += pos.peso_kg || 0;
    });
    const resumo = Object.values(etapas);
    toast.success(`📊 Consolidado em ${resumo.length} etapa(s) de obra`);
    return resumo;
  };

  // Vol 5.4: Confirmar importação IA — grava no formData apenas após confirmação
  const confirmarImportacaoIA = () => {
    if (!previewPosicoes) return;
    setFormData(prev => ({
      ...prev,
      itens_corte_dobra: [...(prev?.itens_corte_dobra || []), ...previewPosicoes.posicoes],
      projetos_ia: [...(prev?.projetos_ia || []), {
        arquivo_url: previewPosicoes.arquivo_url, arquivo_nome: previewPosicoes.arquivo_nome,
        tipo_arquivo: previewPosicoes.arquivo_nome.endsWith('.pdf') ? 'PDF' : 'DWG',
        processado_ia: true, data_processamento: new Date().toISOString(),
        pecas_detectadas: previewPosicoes.posicoes.length, confianca_media: previewPosicoes.confianca
      }]
    }));
    toast.success(`✅ ${previewPosicoes.posicoes.length} posição(ões) confirmada(s) e gravada(s)!`);
    setPreviewPosicoes(null);
  };

  const cancelarImportacaoIA = () => {
    setPreviewPosicoes(null);
    toast.info('Importação IA cancelada');
  };

  const formatoSelecionado = FORMATOS_DISPONIVEIS.find(f => f.id === editando?.formato);

  return {
    bitolas, posicaoSelecionada, setPosicaoSelecionada,
    editando, setEditando, processandoIA, previewPosicoes,
    handleUploadIA, adicionarManual, salvarPosicao, removerPosicao, consolidarPorEtapa,
    confirmarImportacaoIA, cancelarImportacaoIA,
    formatoSelecionado,
  };
}