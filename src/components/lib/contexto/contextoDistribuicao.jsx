// Regra-Mãe 3: Extraído de useContextoVisual.jsx — helpers de origem/distribuição de registros do grupo

export function createDistribuicaoHelpers(empresasDoGrupoArg = []) {
  const empresasDoGrupo = Array.isArray(empresasDoGrupoArg) ? empresasDoGrupoArg : [];

  const obterLabelOrigem = (item) => {
    if (!item) return '-';
    if (item.origem === 'grupo') return 'Grupo';
    if (item.empresa_id) {
      const empresa = empresasDoGrupo.find(e => e.id === item.empresa_id);
      return empresa?.nome_fantasia || empresa?.razao_social || item.empresa_id;
    }
    return '-';
  };

  const obterLabelEmpresa = (item) => {
    if (!item) return '-';
    if (item.origem === 'grupo' && item.rateado_para_empresas) return 'Grupo (distribuído)';
    if (item.origem === 'grupo' && !item.rateado_para_empresas) return 'Grupo (apenas grupo)';
    if (item.empresa_id) {
      const empresa = empresasDoGrupo.find(e => e.id === item.empresa_id);
      return empresa?.nome_fantasia || empresa?.razao_social || '-';
    }
    return '-';
  };

  const obterCorOrigem = (item) => {
    if (!item) return 'bg-slate-100 text-slate-700';
    if (item.origem === 'grupo') return 'bg-blue-100 text-blue-700';
    return 'bg-purple-100 text-purple-700';
  };

  const temDistribuicao = (item) => {
    return item?.rateado_para_empresas === true &&
           item?.distribuicao_realizada &&
           item.distribuicao_realizada.length > 0;
  };

  const obterStatusDistribuicao = (item) => {
    if (!temDistribuicao(item)) return null;
    const distribuicao = item.distribuicao_realizada;
    const todosPagos = distribuicao.every(d => d.status === 'Pago' || d.status === 'Recebido');
    const algunsPagos = distribuicao.some(d => d.status === 'Pago' || d.status === 'Recebido');
    if (todosPagos) return 'Total';
    if (algunsPagos) return 'Parcial';
    return 'Pendente';
  };

  const obterPercentualPago = (item) => {
    if (!temDistribuicao(item)) return 0;
    const distribuicao = item.distribuicao_realizada;
    const totalPago = distribuicao.reduce((sum, d) => {
      if (d.status === 'Pago' || d.status === 'Recebido') return sum + d.valor;
      return sum;
    }, 0);
    const total = distribuicao.reduce((sum, d) => sum + d.valor, 0);
    return total > 0 ? (totalPago / total) * 100 : 0;
  };

  const adicionarColunasContexto = (dados) => {
    if (!dados) return [];
    return dados.map(item => ({
      ...item,
      _origem_label: obterLabelOrigem(item),
      _empresa_label: obterLabelEmpresa(item),
      _origem_cor: obterCorOrigem(item),
      _tem_distribuicao: temDistribuicao(item),
      _status_distribuicao: obterStatusDistribuicao(item),
      _percentual_pago: obterPercentualPago(item)
    }));
  };

  return {
    obterLabelOrigem,
    obterLabelEmpresa,
    obterCorOrigem,
    temDistribuicao,
    obterStatusDistribuicao,
    obterPercentualPago,
    adicionarColunasContexto,
  };
}