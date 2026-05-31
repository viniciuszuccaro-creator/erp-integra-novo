/**
 * initDefaultConfigs — Inicializa configurações padrão do sistema.
 * Cria os registros de ConfiguracaoSistema para todos os toggles
 * se não existirem ainda.
 * Admin-only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DEFAULT_CONFIGS = [
  // Propagação
  { chave: 'propagacao_grupo_empresas_ativa',  ativa: true,  categoria: 'propagacao' },
  { chave: 'propagacao_empresa_grupo_ativa',   ativa: true,  categoria: 'propagacao' },
  { chave: 'propagacao_financeiro_ativa',      ativa: true,  categoria: 'propagacao' },
  // Segurança
  { chave: 'rbac_granular_ativo',              ativa: true,  categoria: 'seguranca' },
  { chave: 'auditoria_completa_ativa',         ativa: true,  categoria: 'seguranca' },
  { chave: '2fa_obrigatorio_admin',            ativa: false, categoria: 'seguranca' },
  // Notificações
  { chave: 'notif_estoque_baixo',              ativa: true,  categoria: 'notificacoes' },
  { chave: 'notif_titulo_vencendo',            ativa: true,  categoria: 'notificacoes' },
  { chave: 'notif_whatsapp_pedido',            ativa: false, categoria: 'notificacoes' },
  // Integrações
  { chave: 'integracao_nfe',                   ativa: false, categoria: 'integracoes' },
  { chave: 'integracao_boletos',               ativa: false, categoria: 'integracoes' },
  { chave: 'integracao_whatsapp',              ativa: false, categoria: 'integracoes' },
  { chave: 'marketplace_sync_ativo',           ativa: false, categoria: 'integracoes' },
  // Estoque
  { chave: 'estoque_alerta_minimo_ativo',      ativa: true,  categoria: 'estoque' },
  { chave: 'estoque_reserva_automatica',       ativa: true,  categoria: 'estoque' },
  { chave: 'producao_apontamento_mobile',      ativa: false, categoria: 'estoque' },
  // Financeiro
  { chave: 'financeiro_aprovacao_despesa_ativa', ativa: true, categoria: 'financeiro' },
  { chave: 'conciliacao_bancaria_automatica',    ativa: false, categoria: 'financeiro' },
  { chave: 'boleto_envio_automatico',            ativa: false, categoria: 'financeiro' },
  // Logística
  { chave: 'logistica_rastreamento_ativo',     ativa: false, categoria: 'logistica' },
  { chave: 'logistica_assinatura_digital',     ativa: false, categoria: 'logistica' },
  { chave: 'logistica_roteirizacao_ia',        ativa: false, categoria: 'logistica' },
  // IA
  { chave: 'ia_preditiva_vendas',              ativa: false, categoria: 'ia' },
  { chave: 'ia_anomalia_financeira',           ativa: false, categoria: 'ia' },
  { chave: 'ia_churn_clientes',               ativa: false, categoria: 'ia' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const api = base44.asServiceRole.entities.ConfiguracaoSistema;
    const results = { created: [], skipped: [], errors: [] };

    for (const cfg of DEFAULT_CONFIGS) {
      try {
        const existing = await api.filter({ chave: cfg.chave }, '-updated_date', 1);
        if (Array.isArray(existing) && existing.length > 0) {
          results.skipped.push(cfg.chave);
          continue;
        }
        await api.create({ chave: cfg.chave, ativa: cfg.ativa, categoria: cfg.categoria });
        results.created.push(cfg.chave);
      } catch (e) {
        results.errors.push({ chave: cfg.chave, error: e.message });
      }
    }

    return Response.json({
      ok: true,
      total: DEFAULT_CONFIGS.length,
      created: results.created.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      details: results,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});