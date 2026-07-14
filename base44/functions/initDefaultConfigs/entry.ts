/**
 * initDefaultConfigs v2.0
 * Inicializa configurações padrão do sistema.
 * Cria os registros de ConfiguracaoSistema se não existirem.
 * Admin-only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const DEFAULT_CONFIGS = [
  // Propagação
  { chave: 'propagacao_grupo_empresas_ativa',   ativa: true,  categoria: 'propagacao' },
  { chave: 'propagacao_empresa_grupo_ativa',    ativa: true,  categoria: 'propagacao' },
  { chave: 'propagacao_financeiro_ativa',       ativa: true,  categoria: 'propagacao' },
  { chave: 'propagacao_cadastros_ativa',        ativa: true,  categoria: 'propagacao' },
  { chave: 'propagacao_rh_ativa',               ativa: true,  categoria: 'propagacao' },
  { chave: 'propagacao_comercial_ativa',        ativa: true,  categoria: 'propagacao' },
  // Segurança
  { chave: 'rbac_granular_ativo',               ativa: true,  categoria: 'seguranca' },
  { chave: 'auditoria_completa_ativa',          ativa: true,  categoria: 'seguranca' },
  { chave: '2fa_obrigatorio_admin',             ativa: false, categoria: 'seguranca' },
  { chave: 'sessao_timeout_ativo',              ativa: true,  categoria: 'seguranca' },
  { chave: 'login_multiplos_dispositivos',      ativa: true,  categoria: 'seguranca' },
  // Notificações
  { chave: 'notif_estoque_baixo',               ativa: true,  categoria: 'notificacoes' },
  { chave: 'notif_titulo_vencendo',             ativa: true,  categoria: 'notificacoes' },
  { chave: 'notif_whatsapp_pedido',             ativa: false, categoria: 'notificacoes' },
  // Integrações
  { chave: 'integracao_nfe_ativa',              ativa: false, categoria: 'integracoes' },
  { chave: 'integracao_boleto_ativa',           ativa: false, categoria: 'integracoes' },
  { chave: 'integracao_whatsapp',               ativa: false, categoria: 'integracoes' },
  { chave: 'marketplace_sync_ativo',            ativa: false, categoria: 'integracoes' },
  // Estoque & Produção
  { chave: 'estoque_alerta_minimo_ativo',       ativa: true,  categoria: 'estoque' },
  { chave: 'estoque_reserva_automatica',        ativa: true,  categoria: 'estoque' },
  { chave: 'producao_apontamento_mobile',       ativa: false, categoria: 'estoque' },
  // Financeiro
  { chave: 'financeiro_aprovacao_despesa_ativa',ativa: true,  categoria: 'financeiro' },
  { chave: 'conciliacao_bancaria_automatica',   ativa: false, categoria: 'financeiro' },
  { chave: 'boleto_envio_automatico',           ativa: false, categoria: 'financeiro' },
  // Logística
  { chave: 'logistica_rastreamento_ativo',      ativa: false, categoria: 'logistica' },
  { chave: 'logistica_assinatura_digital',      ativa: false, categoria: 'logistica' },
  { chave: 'logistica_roteirizacao_ia',         ativa: false, categoria: 'logistica' },
  // Comercial & CRM
  { chave: 'crm_pipeline_ativo',                ativa: true,  categoria: 'crm' },
  { chave: 'comercial_aprovacao_pedido_ativa',  ativa: true,  categoria: 'comercial' },
  { chave: 'comercial_desconto_aprovacao',      ativa: true,  categoria: 'comercial' },
  { chave: 'crm_follow_up_automatico',          ativa: false, categoria: 'crm' },
  // Compras
  { chave: 'compras_aprovacao_ativa',           ativa: true,  categoria: 'compras' },
  { chave: 'compras_cotacao_automatica',        ativa: false, categoria: 'compras' },
  // RH
  { chave: 'rh_ponto_eletronico_ativo',         ativa: false, categoria: 'rh' },
  { chave: 'rh_ferias_aprovacao',               ativa: true,  categoria: 'rh' },
  { chave: 'rh_gamificacao_producao',           ativa: false, categoria: 'rh' },
  // IA
  { chave: 'ia_preditiva_vendas',               ativa: false, categoria: 'ia' },
  { chave: 'ia_anomalia_financeira',            ativa: false, categoria: 'ia' },
  { chave: 'ia_churn_clientes',                 ativa: false, categoria: 'ia' },
  { chave: 'ia_precificacao_inteligente',       ativa: false, categoria: 'ia' },
  { chave: 'ia_sugestao_compras',               ativa: false, categoria: 'ia' },
  { chave: 'ia_classificacao_clientes',         ativa: false, categoria: 'ia' },
  { chave: 'ia_roteirizacao_automatica',        ativa: false, categoria: 'ia' },
  // Relatórios & BI
  { chave: 'relatorios_consolidados_grupo',     ativa: true,  categoria: 'relatorios' },
  { chave: 'bi_forecast_ativo',                 ativa: false, categoria: 'relatorios' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;
    // Etapa 2: salva em ambos os contextos (Grupo + Todas Empresas do Grupo)
    const group_id = body?.group_id || null;
    const empresa_id = body?.empresa_id || null;

    const api = base44.asServiceRole.entities.ConfiguracaoSistema;
    const results = { created: [], skipped: [], errors: [] };

    // Buscar todas as empresas do grupo para preencher em dual-context real
    let empresasDoGrupo = [];
    if (group_id) {
      try {
        empresasDoGrupo = await base44.asServiceRole.entities.Empresa.filter({ group_id }, null, 50);
      } catch (_) {}
    }

    // Contextos para salvar: global sempre + grupo (se informado) + todas empresas do grupo
    const contextos = [{}]; // global (sem group_id nem empresa_id)
    if (group_id) contextos.push({ group_id });
    // Empresa explícita passada no body
    if (empresa_id) contextos.push({ empresa_id, group_id: group_id || undefined });
    // Todas as empresas do grupo (exceto a já adicionada)
    for (const emp of empresasDoGrupo) {
      if (emp.id && emp.id !== empresa_id) {
        contextos.push({ empresa_id: emp.id, group_id });
      }
    }

    for (const ctx of contextos) {
      for (const cfg of DEFAULT_CONFIGS) {
        try {
          const filterBase = { chave: cfg.chave, ...ctx };
          if (!force) {
            const existing = await api.filter(filterBase, '-updated_date', 1);
            if (Array.isArray(existing) && existing.length > 0) {
              results.skipped.push(`${cfg.chave}@${JSON.stringify(ctx)}`);
              continue;
            }
          }
          await api.create({
            chave: cfg.chave,
            ativa: cfg.ativa,
            categoria: cfg.categoria,
            ...ctx,
          });
          results.created.push(`${cfg.chave}@${JSON.stringify(ctx)}`);
          // Anti-429: delay entre criações (aumentado para evitar burst)
          await new Promise(r => setTimeout(r, 150));
        } catch (e) {
          const msg = String(e?.message || e);
          // Se 429, aguarda muito mais antes de prosseguir
          if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
            await new Promise(r => setTimeout(r, 2000));
            // Tenta de novo uma vez após o backoff
            try {
              await api.create({ chave: cfg.chave, ativa: cfg.ativa, categoria: cfg.categoria, ...ctx });
              results.created.push(`${cfg.chave}@${JSON.stringify(ctx)}_retry`);
            } catch (_) {
              results.errors.push({ chave: cfg.chave, ctx, error: 'rate_limit_after_retry' });
            }
          } else {
            results.errors.push({ chave: cfg.chave, ctx, error: msg.slice(0, 80) });
          }
        }
      }
      // Delay maior entre contextos para respeitar rate limit
      await new Promise(r => setTimeout(r, 500));
    }

    // Auditoria
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        acao: 'Execução',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: 'ConfiguracaoSistema',
        descricao: `initDefaultConfigs: ${results.created.length} criados, ${results.skipped.length} pulados em ${contextos.length} contexto(s)`,
        group_id: group_id || null,
        empresa_id: empresa_id || null,
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({
      ok: true,
      contextos: contextos.length,
      total_por_contexto: DEFAULT_CONFIGS.length,
      created: results.created.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      details: results,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});