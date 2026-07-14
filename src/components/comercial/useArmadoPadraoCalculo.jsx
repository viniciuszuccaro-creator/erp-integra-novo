import { useState } from 'react';
import { toast } from 'sonner';

/**
 * V21.1 - Hook com cálculos e operações CRUD do Armado Padrão
 * Extraído de ArmadoPadraoTab.jsx para reduzir tamanho do componente.
 */
export function useArmadoPadraoCalculo({ formData, setFormData, onNext }) {
  const [tipoPeca, setTipoPeca] = useState(null);
  const [dadosPeca, setDadosPeca] = useState({});
  const [pecaEditandoIndex, setPecaEditandoIndex] = useState(null);

  const tiposPeca = [
    { id: 'coluna', label: 'Coluna', icon: '🏛️', descricao: 'Coluna retangular com estribos' },
    { id: 'viga', label: 'Viga', icon: '📏', descricao: 'Viga retangular com estribos' },
    { id: 'estaca', label: 'Estaca/Broca', icon: '🔩', descricao: 'Estaca com estribo circular' },
    { id: 'bloco', label: 'Bloco', icon: '🧱', descricao: 'Bloco de coroamento/fundação' }
  ];

  const etapasObra = [
    { id: 'fundacao', nome: 'Fundação' },
    { id: 'estrutura', nome: 'Estrutura' },
    { id: 'cobertura', nome: 'Cobertura' },
    { id: 'acabamento', nome: 'Acabamento' }
  ];

  const calcularPeca = () => {
    let resultado = {
      ...dadosPeca,
      tipo_peca: tipoPeca,
      identificador: dadosPeca.identificador || `${tipoPeca.toUpperCase()}-${Date.now()}`,
      quantidade: dadosPeca.quantidade || 1,
      // Vol 5.3: Vínculo a obra, etapa, ponto, pavimento, posição, revisão e data prevista
      etapa_obra_id: dadosPeca.etapa_obra_id || '',
      etapa_obra_nome: dadosPeca.etapa_obra_nome || '',
      ponto: dadosPeca.ponto || '',
      pavimento: dadosPeca.pavimento || '',
      posicao: dadosPeca.posicao || '',
      revisao: dadosPeca.revisao || 1,
      data_prevista: dadosPeca.data_prevista || '',
      // Vol 5.3: QR Code para produção, separação e entrega
      qr_code: `ARM-${dadosPeca.identificador || tipoPeca.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      // Vol 5.3: Controle de produção/faturamento (impede remoção)
      produzido: dadosPeca.produzido || false,
      quantidade_faturada: dadosPeca.quantidade_faturada || 0,
      quantidade_ferros_principais: dadosPeca.quantidade_ferros_principais || 4,
      bitola_principal: dadosPeca.bitola_principal || '',
      reforco_bitola: dadosPeca.reforco_bitola || '',
      reforco_quantidade: dadosPeca.reforco_quantidade || 0,
      estribo_bitola: dadosPeca.estribo_bitola || '',
      estribo_largura: dadosPeca.estribo_largura || 0,
      estribo_altura: dadosPeca.estribo_altura || 0,
      distancia_estribo: dadosPeca.distancia_estribo || 20
    };

    if (tipoPeca === 'coluna' || tipoPeca === 'viga') {
      const comprimento = dadosPeca.comprimento || 0;
      const distanciaEstribo = dadosPeca.distancia_estribo || 20;
      const qtdeEstribos = Math.ceil((comprimento * 100) / distanciaEstribo);
      resultado.estribo_quantidade = qtdeEstribos;
      resultado.quantidade_estribos = qtdeEstribos * resultado.quantidade;
      const reforco = dadosPeca.reforco_bitola ? ` + ${dadosPeca.reforco_quantidade || 0} ferros ${dadosPeca.reforco_bitola}` : '';
      resultado.reforco_descricao = reforco;
    }

    if (tipoPeca === 'estaca') {
      const comprimento = dadosPeca.comprimento || 0;
      const distanciaEstribo = dadosPeca.distancia_estribo || 20;
      const qtdeEstribos = Math.ceil((comprimento * 100) / distanciaEstribo);
      resultado.estribo_quantidade = qtdeEstribos;
      resultado.quantidade_estribos = qtdeEstribos * resultado.quantidade;
    }

    if (tipoPeca === 'bloco') {
      const comprimentoCm = dadosPeca.comprimento || 0;
      const larguraCm = dadosPeca.largura || 0;
      const espacamento = dadosPeca.espacamento || 15;
      const ferrosLado1 = Math.ceil(comprimentoCm / espacamento) + 1;
      const ferrosLado2 = Math.ceil(larguraCm / espacamento) + 1;
      const costelas = Math.floor(larguraCm / 30) || 0;
      resultado.ferros_lado1 = ferrosLado1;
      resultado.ferros_lado2 = ferrosLado2;
      resultado.costelas_quantidade = costelas;
      resultado.bitola_costela = dadosPeca.bitola_principal;
    }

    resultado.descricao_automatica = gerarDescricaoTecnica(resultado);
    const pesoEstimado = estimarPeso(resultado);
    resultado.peso_total_kg = pesoEstimado;
    const precoPorKg = 8.50;
    resultado.preco_venda_total = pesoEstimado * precoPorKg;
    // Vol 5.3: Memória de cálculo do peso
    resultado.memoria_calculo = `Peso = ${pesoEstimado.toFixed(2)} kg (peso médio 1.5 kg/m × comprimento × ferros × qty + estribos)`;
    return resultado;
  };

  const gerarDescricaoTecnica = (peca) => {
    const etapaTexto = peca.etapa_obra_nome ? ` [${peca.etapa_obra_nome}]` : '';
    if (peca.tipo_peca === 'coluna' || peca.tipo_peca === 'viga') {
      return `${peca.quantidade} ${peca.tipo_peca.toUpperCase()}${etapaTexto} de ${peca.comprimento}m — ` +
        `${peca.quantidade_ferros_principais || 0} ferros ${peca.bitola_principal}` +
        `${peca.reforco_descricao || ''} — ` +
        `Estribo ${peca.estribo_largura}x${peca.estribo_altura}cm (${peca.estribo_bitola}) a cada ${peca.distancia_estribo}cm`;
    }
    if (peca.tipo_peca === 'estaca') {
      return `${peca.quantidade} ESTACA${etapaTexto} de ${peca.comprimento}m — ` +
        `${peca.quantidade_ferros_principais || 0} ferros ${peca.bitola_principal}mm — ` +
        `Estribo Ø${peca.estribo_diametro}cm (${peca.estribo_bitola}mm) a cada ${peca.distancia_estribo}cm`;
    }
    if (peca.tipo_peca === 'bloco') {
      return `${peca.quantidade} BLOCO${etapaTexto} ${peca.comprimento}x${peca.largura}x${peca.altura}cm — ` +
        `${peca.ferros_lado1} ferros lado 1 + ${peca.ferros_lado2} ferros lado 2 — ` +
        `Bitola ${peca.bitola_principal}mm`;
    }
    return peca.identificador;
  };

  const estimarPeso = (peca) => {
    const pesoMedioPorMetro = 1.5;
    let pesoTotal = 0;
    if (peca.tipo_peca === 'coluna' || peca.tipo_peca === 'viga' || peca.tipo_peca === 'estaca') {
      const comprimento = peca.comprimento || 0;
      const qtdePecas = peca.quantidade || 1;
      const qtdeFerros = peca.quantidade_ferros_principais || 4;
      pesoTotal += comprimento * qtdeFerros * qtdePecas * pesoMedioPorMetro;
      if (peca.reforco_bitola && peca.reforco_quantidade) {
        pesoTotal += comprimento * peca.reforco_quantidade * qtdePecas * pesoMedioPorMetro;
      }
      const perimetroEstribo = peca.tipo_peca === 'estaca'
        ? Math.PI * (peca.estribo_diametro || 30) / 100
        : 2 * ((peca.estribo_largura || 15) + (peca.estribo_altura || 25)) / 100;
      pesoTotal += perimetroEstribo * (peca.quantidade_estribos || 0) * 0.5;
    }
    if (peca.tipo_peca === 'bloco') {
      const comprimentoM = (peca.comprimento || 0) / 100;
      const larguraM = (peca.largura || 0) / 100;
      const ferrosTotal = (peca.ferros_lado1 || 0) + (peca.ferros_lado2 || 0) + (peca.costelas_quantidade || 0);
      pesoTotal += (comprimentoM + larguraM) * ferrosTotal * (peca.quantidade || 1) * pesoMedioPorMetro;
    }
    return pesoTotal;
  };

  const adicionarOuEditarPeca = () => {
    if (!tipoPeca) { toast.error('Selecione um tipo de peça'); return; }
    const pecaCalculada = calcularPeca();
    setFormData(prev => {
      const novosItens = [...(prev.itens_armado_padrao || [])];
      if (pecaEditandoIndex !== null) {
        novosItens[pecaEditandoIndex] = pecaCalculada;
        toast.success('✅ Peça atualizada');
      } else {
        novosItens.push(pecaCalculada);
        toast.success('✅ Peça adicionada');
      }
      return { ...prev, itens_armado_padrao: novosItens };
    });
    setTipoPeca(null);
    setDadosPeca({});
    setPecaEditandoIndex(null);
  };

  const removerPeca = (index) => {
    // Vol 5.3: Impedir remoção de peça já produzida ou faturada — exigir revisão/estorno autorizado
    const peca = formData.itens_armado_padrao?.[index];
    if (peca?.produzido || (peca?.quantidade_faturada || 0) > 0) {
      toast.error('❌ Peça já produzida/faturada — não pode ser removida. Use estorno autorizado.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      itens_armado_padrao: prev.itens_armado_padrao.filter((_, i) => i !== index)
    }));
    toast.success('✅ Peça removida');
  };

  const editarPeca = (index) => {
    const pecaParaEditar = formData.itens_armado_padrao[index];
    setTipoPeca(pecaParaEditar.tipo_peca);
    setDadosPeca(pecaParaEditar);
    setPecaEditandoIndex(index);
    toast.info('✏️ Editando peça');
  };

  const cancelarEdicao = () => {
    setTipoPeca(null);
    setDadosPeca({});
    setPecaEditandoIndex(null);
    toast.info('❌ Edição cancelada');
  };

  const consolidarPorEtapa = () => {
    const itensComEtapa = formData.itens_armado_padrao.filter(p => p.etapa_obra_id);
    if (itensComEtapa.length === 0) {
      toast.error('Nenhum item possui etapa de obra definida');
      return;
    }
    const etapas = {};
    itensComEtapa.forEach(peca => {
      const etapaId = peca.etapa_obra_id;
      if (!etapas[etapaId]) {
        etapas[etapaId] = { etapa_obra_id: etapaId, etapa_obra_nome: peca.etapa_obra_nome, pecas: [], peso_total_kg: 0, valor_total: 0 };
      }
      etapas[etapaId].pecas.push(peca);
      etapas[etapaId].peso_total_kg += peca.peso_total_kg || 0;
      etapas[etapaId].valor_total += peca.preco_venda_total || 0;
    });
    const resumo = Object.values(etapas);
    toast.success(`📊 Consolidado em ${resumo.length} etapa(s) de obra`);
    return resumo;
  };

  const gerarItensComerciais = () => {
    const itensComerciais = formData.itens_armado_padrao.map(peca => ({
      produto_id: null,
      codigo_sku: peca.identificador,
      descricao: peca.descricao_automatica,
      unidade_medida: 'UN',
      quantidade: peca.quantidade,
      quantidade_kg: peca.peso_total_kg,
      preco_unitario: peca.preco_venda_total / peca.quantidade,
      valor_item: peca.preco_venda_total,
      peso_unitario: peca.peso_total_kg / peca.quantidade,
      origem_armado: true,
      item_producao_id: peca.id
    }));
    setFormData(prev => ({
      ...prev,
      itens_revenda: [...(prev.itens_revenda || []), ...itensComerciais]
    }));
    toast.success(`✅ ${itensComerciais.length} peça(s) enviada(s) para Aba Revenda`);
    onNext();
  };

  return {
    tipoPeca, setTipoPeca,
    dadosPeca, setDadosPeca,
    pecaEditandoIndex, setPecaEditandoIndex,
    tiposPeca, etapasObra,
    adicionarOuEditarPeca, removerPeca, editarPeca, cancelarEdicao,
    consolidarPorEtapa, gerarItensComerciais
  };
}