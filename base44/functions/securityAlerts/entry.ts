import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

let LAST_SECURITY_ALERTS_RUN_AT = 0;
const SECURITY_ALERTS_COOLDOWN_MS = 15 * 60 * 1000;

// Agregado de alertas de segurança com envio de e-mail para administradores
// Heurísticas simples: alto volume de Exclusões, alterações em perfis, bloqueios de acesso em curto período
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    const isScheduled = !user;
    if (!isScheduled && user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    // Janela de análise (minutos)
    // Filtros multiempresa opcionais via payload { filtros: { empresa_id?, group_id? } }
    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }
    if (!payload?.force && Date.now() - LAST_SECURITY_ALERTS_RUN_AT < SECURITY_ALERTS_COOLDOWN_MS) {
      return Response.json({ ok: true, skipped: true, reason: 'alertas em cooldown anti-rate-limit' });
    }
    LAST_SECURITY_ALERTS_RUN_AT = Date.now();
    const filtros = payload?.filtros || {};

    const WINDOW_MIN = 15;
    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MIN * 60 * 1000);

    // Buscar últimos logs recentes (limite razoável)
    const logs = await base44.asServiceRole.entities.AuditLog.filter({}, '-created_date', 120);

    // Normalizar data do log
    const getLogDate = (l) => {
      if (l?.data_hora) return new Date(l.data_hora);
      if (l?.created_date) return new Date(l.created_date);
      return null;
    };

    const inScope = (l) => {
      if (filtros?.empresa_id) {
        const eid = l?.empresa_id ?? l?.dados_novos?.empresa_id ?? null;
        if (eid && eid !== filtros.empresa_id) return false;
      }
      if (filtros?.group_id) {
        const gid = l?.group_id ?? l?.dados_novos?.group_id ?? null;
        if (gid && gid !== filtros.group_id) return false;
      }
      return true;
    };

    const recent = logs.filter((l) => {
      const d = getLogDate(l);
      return d && d >= windowStart && inScope(l);
    });

    // Estatísticas
    const countBy = (arr, fn) => arr.reduce((acc, v) => { const k = fn(v); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const byAction = countBy(recent, (l) => l.acao || '');

    const suspicious = [];

    // 1) Muitas exclusões em curto período
    if ((byAction['Exclusão'] || 0) >= 5) {
      suspicious.push({ tipo: 'Exclusões em massa', severidade: 'Alta', detalhes: `Exclusões recentes: ${byAction['Exclusão']}` });
    }

    // 2) Alterações em PerfilAcesso
    const perfilChanges = recent.filter((l) => l.entidade === 'PerfilAcesso' && (l.acao === 'Criação' || l.acao === 'Edição'));
    if (perfilChanges.length >= 3) {
      suspicious.push({ tipo: 'Mudanças frequentes de perfil', severidade: 'Média', detalhes: `${perfilChanges.length} mudanças em ${WINDOW_MIN} min` });
    }

    // 3) Bloqueios de acesso (gerados pelo layout quando permissão nega)
    const blocks = recent.filter((l) => l.acao === 'Bloqueio');
    if (blocks.length >= 10) {
      suspicious.push({ tipo: 'Muitos bloqueios de acesso', severidade: 'Média', detalhes: `${blocks.length} bloqueios em ${WINDOW_MIN} min` });
    }

    // 4) RBAC backend negações (entityGuard)
    const rbacBlocks = recent.filter((l) => l.acao === 'Bloqueio' && (l.tipo_auditoria === 'seguranca' || (l.descricao && /RBAC backend negou/i.test(l.descricao))));
    if (rbacBlocks.length >= 5) {
      suspicious.push({ tipo: 'RBAC backend negações', severidade: 'Média', detalhes: `${rbacBlocks.length} negações em ${WINDOW_MIN} min` });
    }

    // 5) Funções lentas (FunctionLatency) registradas pelo cliente (>1500ms)
    const funcLatency = recent.filter((l) => l.entidade === 'FunctionLatency' && (Number(l?.duracao_ms) || 0) > 1500);
    if (funcLatency.length >= 5) {
      const max = Math.max(...funcLatency.map((l) => Number(l?.duracao_ms) || 0));
      suspicious.push({ tipo: 'Funções lentas', severidade: max > 3000 ? 'Alta' : 'Média', detalhes: `${funcLatency.length} chamadas >1500ms (pico ${Math.round(max)}ms)` });
    }

    // Se nada suspeito, retorna rápido
    if (suspicious.length === 0) {
      return Response.json({ ok: true, message: 'Sem alertas', analyzed: recent.length });
    }

    // Registrar auditoria consolidada das tentativas bloqueadas/alertas
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || 'automacao',
        usuario_id: user?.id || null,
        acao: 'Visualização',
        modulo: 'Sistema',
        tipo_auditoria: 'seguranca',
        entidade: 'SecurityAlerts',
        descricao: `Alertas de segurança detectados (${suspicious.length}) na janela de ${WINDOW_MIN} min`,
        dados_novos: { suspicious, totais: byAction, analisados: recent.length },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    // Obter admins para notificar
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, undefined, 20);
    const toList = admins.map((u) => u.email).filter(Boolean);

    const highAlerts = suspicious.filter((s) => s.severidade === 'Alta');
    if (toList.length > 0 && highAlerts.length > 0) {
      const subject = 'Alerta de Segurança • ERP Zuccaro (Crítico)';
      const body = [
        `Janela analisada: últimos ${WINDOW_MIN} minutos`,
        '',
        ...highAlerts.map((s, i) => `${i + 1}. ${s.tipo} [${s.severidade}] - ${s.detalhes}`),
        '',
        `Total de eventos analisados: ${recent.length}`
      ].join('\n');

      await Promise.all(toList.map((to) => base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject,
        body,
        from_name: 'ERP Zuccaro Segurança'
      })));
    }

    // Slack (opcional) - tenta Webhook primeiro; se ausente, tenta App Connector 'slackbot'
    try {
      const cfgAllSlack = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({});
      const scfg = cfgAllSlack?.[0]?.observabilidade?.alerts?.slack;
      const slackAlerts = suspicious.filter((s) => s.severidade === 'Média' || s.severidade === 'Alta');
      if (slackAlerts.length > 0) {
        const text = [
          `:rotating_light: Segurança: ${slackAlerts.length} alerta(s) nos últimos ${WINDOW_MIN} minutos`,
          ...slackAlerts.slice(0, 5).map((s, i) => `${i + 1}. *${s.tipo}* [${s.severidade}] - ${s.detalhes}`),
          recent.length ? `Eventos analisados: ${recent.length}` : ''
        ].filter(Boolean).join('\n');

        if (scfg?.enabled && scfg?.channel) {
          try {
            const { accessToken } = await base44.asServiceRole.connectors.getConnection('slackbot');
            await fetch('https://slack.com/api/chat.postMessage', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ channel: scfg.channel, text, username: 'ERP Zuccaro Bot', icon_emoji: ':rotating_light:' })
            });
          } catch (_) { /* sem Slack conectado, segue sem erro */ }
        }
      }
    } catch (_) {}

    // WhatsApp opcional para gestores via Configuração do Sistema
    try {
      const cfgAll = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({});
      const wcfg = cfgAll?.[0]?.seguranca?.alerts?.whatsapp;
      if (wcfg?.enabled && wcfg?.to) {
        const msg = `Segurança: ${suspicious.length} alerta(s) em ${WINDOW_MIN} min. Ex.: ${(suspicious[0]?.tipo || 'N/A')} - ${(suspicious[0]?.detalhes || '')}`;
        await base44.asServiceRole.functions.invoke('whatsappSend', {
          to: wcfg.to,
          message: msg,
          empresa_id: filtros?.empresa_id || null,
        });
      }
    } catch (_) {}

    return Response.json({ ok: true, alerts: suspicious.length, recipients: toList.length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});