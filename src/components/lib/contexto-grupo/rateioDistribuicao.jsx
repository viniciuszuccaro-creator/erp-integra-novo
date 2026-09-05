// Regra-Mãe 3: Extraído de useContextoGrupoEmpresa.jsx — rateio e distribuição de documentos do grupo para empresas
import { base44 } from "@/api/base44Client";

export function criarHelpersDistribuicao({ getGrupoId, getEmpresasDoGrupo }) {
  const obterPoliticaPadrao = async (tipoDocumento) => {
    const grupoId = getGrupoId?.();
    if (!grupoId) return null;

    const politicas = await base44.entities.PoliticaDistribuicao.filter({
      grupo_id: grupoId,
      tipo_documento: tipoDocumento,
      ativa: true,
      padrao_para_tipo: true
    });

    return politicas[0] || null;
  };

  const calcularDistribuicao = (valorTotal, politica, empresas = null) => {
    if (!politica) return [];

    const empresasParaRatear = empresas || getEmpresasDoGrupo?.() || [];
    const distribuicao = [];

    if (politica.criterio === 'percentual') {
      empresasParaRatear.forEach(empresa => {
        const participante = politica.empresas_participantes?.find(
          p => p.empresa_id === empresa.id
        );
        if (participante && participante.ativo) {
          const valor = (valorTotal * participante.percentual) / 100;
          distribuicao.push({
            empresa_id: empresa.id,
            empresa_nome: empresa.nome_fantasia || empresa.razao_social,
            valor: valor,
            percentual: participante.percentual
          });
        }
      });
    } else if (politica.criterio === 'fixo_por_empresa') {
      empresasParaRatear.forEach(empresa => {
        const participante = politica.empresas_participantes?.find(
          p => p.empresa_id === empresa.id
        );
        if (participante && participante.ativo) {
          distribuicao.push({
            empresa_id: empresa.id,
            empresa_nome: empresa.nome_fantasia || empresa.razao_social,
            valor: participante.valor_fixo,
            percentual: (participante.valor_fixo / valorTotal) * 100
          });
        }
      });
    }

    return distribuicao;
  };

  const ratearDocumento = async (entidade, documentoId, distribuicao) => {
    const titulosGerados = [];
    const docs = await base44.entities[entidade].filter({ id: documentoId });
    const docOriginal = docs[0];
    const groupIdDoc = docOriginal?.group_id || getGrupoId?.() || null;

    for (const dist of distribuicao) {
      const novaTitulo = {
        ...docOriginal,
        id: undefined,
        created_date: undefined,
        updated_date: undefined,
        group_id: groupIdDoc,
        empresa_id: dist.empresa_id,
        origem: 'empresa',
        documento_grupo_id: documentoId,
        valor: dist.valor,
        valor_original_grupo: docOriginal.valor,
        percentual_rateio: dist.percentual,
        rateado_para_empresas: false,
        sincronizar_baixa_com_grupo: true
      };

      const created = await base44.entities[entidade].create(novaTitulo);
      titulosGerados.push({
        ...dist,
        titulo_id: created.id,
        status: created.status
      });
    }

    await base44.entities[entidade].update(documentoId, {
      rateado_para_empresas: true,
      distribuicao_realizada: titulosGerados
    });

    // Regra-Mãe 5d: auditoria do rateio de documento do grupo
    try { await base44.entities.AuditLog.create({
      acao: 'Criação', modulo: 'Financeiro', entidade, registro_id: documentoId,
      descricao: `Documento do grupo rateado para ${titulosGerados.length} empresa(s)`,
      data_hora: new Date().toISOString(),
      group_id: groupIdDoc, grupo_id: groupIdDoc,
      usuario: 'Sistema', tipo_auditoria: 'operacional', sucesso: true,
      dados_anteriores: { valor: docOriginal?.valor, rateado_para_empresas: false },
      dados_novos: { titulos_gerados: titulosGerados }
    }); } catch (e) { console.error('[Rateio] Falha ao auditar:', e?.message || e); }

    return titulosGerados;
  };

  const sincronizarBaixaParaEmpresas = async (entidade, documentoGrupoId, valorPago) => {
    const docs = await base44.entities[entidade].filter({ id: documentoGrupoId });
    const docGrupo = docs[0];

    if (!docGrupo || !docGrupo.distribuicao_realizada || docGrupo.distribuicao_realizada.length === 0) {
      return;
    }

    const percentualPago = valorPago / docGrupo.valor;

    for (const dist of docGrupo.distribuicao_realizada) {
      const valorPagoEmpresa = dist.valor * percentualPago;

      await base44.entities[entidade].update(dist.titulo_id, {
        valor_pago: valorPagoEmpresa,
        status: percentualPago >= 1 ? 'Pago' : docGrupo.status,
        data_pagamento: percentualPago >= 1 ? new Date().toISOString().split('T')[0] : null
      });
    }

    // Regra-Mãe 5d: auditoria da sincronização de baixa do grupo para empresas
    try { await base44.entities.AuditLog.create({
      acao: 'Baixa', modulo: 'Financeiro', entidade, registro_id: documentoGrupoId,
      descricao: `Baixa do grupo sincronizada para ${docGrupo.distribuicao_realizada.length} título(s) de empresa(s)`,
      data_hora: new Date().toISOString(),
      group_id: docGrupo.group_id || null, grupo_id: docGrupo.group_id || null,
      usuario: 'Sistema', tipo_auditoria: 'operacional', sucesso: true,
      dados_anteriores: { status_grupo: docGrupo.status, valor: docGrupo.valor },
      dados_novos: { valor_pago: valorPago, percentual_pago: percentualPago }
    }); } catch (e) { console.error('[Rateio] Falha ao auditar:', e?.message || e); }
  };

  const sincronizarBaixaParaGrupo = async (entidade, documentoEmpresaId) => {
    const docsEmpresa = await base44.entities[entidade].filter({ id: documentoEmpresaId });
    const docEmpresa = docsEmpresa[0];

    if (!docEmpresa || !docEmpresa.documento_grupo_id) {
      return;
    }

    const docsGrupo = await base44.entities[entidade].filter({ id: docEmpresa.documento_grupo_id });
    const docGrupo = docsGrupo[0];

    let totalPago = 0;
    let todosPagos = true;

    for (const dist of docGrupo.distribuicao_realizada) {
      const docsItem = await base44.entities[entidade].filter({ id: dist.titulo_id });
      const doc = docsItem[0];
      totalPago += doc.valor_pago || 0;
      if (doc.status !== 'Pago' && doc.status !== 'Recebido') {
        todosPagos = false;
      }
    }

    await base44.entities[entidade].update(docGrupo.id, {
      valor_pago: totalPago,
      status: todosPagos ? 'Pago' : 'Pendente'
    });

    // Regra-Mãe 5d: auditoria da sincronização de baixa da empresa para o grupo
    try { await base44.entities.AuditLog.create({
      acao: 'Baixa', modulo: 'Financeiro', entidade, registro_id: docGrupo.id,
      descricao: 'Baixa consolidada da empresa para o documento do grupo',
      data_hora: new Date().toISOString(),
      group_id: docGrupo.group_id || null, grupo_id: docGrupo.group_id || null,
      usuario: 'Sistema', tipo_auditoria: 'operacional', sucesso: true,
      dados_anteriores: { status: docGrupo.status, valor_pago: docGrupo.valor_pago },
      dados_novos: { valor_pago: totalPago, status: todosPagos ? 'Pago' : 'Pendente', todos_pagos: todosPagos }
    }); } catch (e) { console.error('[Rateio] Falha ao auditar:', e?.message || e); }
  };

  return {
    obterPoliticaPadrao,
    calcularDistribuicao,
    ratearDocumento,
    sincronizarBaixaParaEmpresas,
    sincronizarBaixaParaGrupo,
  };
}