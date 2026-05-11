import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

let LAST_BACKUP_RUN_AT = 0;
const BACKUP_COOLDOWN_MS = 60 * 60 * 1000;

// Util: decode secret (base64 ou hex) para Uint8Array
function decodeKey(str) {
  if (!str) throw new Error('BACKUP_ENCRYPTION_KEY ausente');
  try {
    // base64
    const b = atob(str.replace(/\n/g, ''));
    return new Uint8Array([...b].map(c => c.charCodeAt(0)));
  } catch (_) {
    // hex
    const clean = str.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length % 2 !== 0) throw new Error('Chave inválida');
    const out = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) out[i/2] = parseInt(clean.slice(i, i+2), 16);
    return out;
  }
}

async function getBackupKeyRaw() {
  const decoded = decodeKey(Deno.env.get('BACKUP_ENCRYPTION_KEY'));
  if (decoded.length === 32) return decoded;
  const digest = await crypto.subtle.digest('SHA-256', decoded);
  return new Uint8Array(digest);
}

async function encryptJSON(obj) {
  const keyRaw = await getBackupKeyRaw();
  const key = await crypto.subtle.importKey('raw', keyRaw, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  const toB64 = (u8) => {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < u8.length; i += chunkSize) {
      binary += String.fromCharCode(...u8.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };
  return { v: 1, algo: 'AES-GCM', iv_b64: toB64(iv), data_b64: toB64(cipher), created_at: new Date().toISOString() };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    // Admin-only se houver usuário (execução manual). Agendamento pode rodar sem usuário.
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin required' }, { status: 403 });
    }

    let body = {}; try { body = await req.json(); } catch { body = {}; }
    if (!body?.force && Date.now() - LAST_BACKUP_RUN_AT < BACKUP_COOLDOWN_MS) {
      return Response.json({ ok: true, skipped: true, reason: 'backup em cooldown anti-rate-limit' });
    }
    LAST_BACKUP_RUN_AT = Date.now();
    const filtros = body?.filtros || {};

    // Entidades principais (multiempresa aplicada via filtros opcionais)
    const where = (extra = {}) => ({ ...(filtros?.empresa_id ? { empresa_id: filtros.empresa_id } : {}), ...(filtros?.group_id ? { group_id: filtros.group_id } : {}), ...extra });

    const entidades = {
      Cliente: await base44.asServiceRole.entities.Cliente.filter(where(), '-updated_date', 200),
      Fornecedor: await base44.asServiceRole.entities.Fornecedor.filter(where(), '-updated_date', 200),
      Produto: await base44.asServiceRole.entities.Produto.filter(where(), '-updated_date', 200),
      Pedido: await base44.asServiceRole.entities.Pedido.filter(where(), '-updated_date', 200),
      ContaPagar: await base44.asServiceRole.entities.ContaPagar.filter(where(), '-updated_date', 200),
      ContaReceber: await base44.asServiceRole.entities.ContaReceber.filter(where(), '-updated_date', 200),
      NotaFiscal: await base44.asServiceRole.entities.NotaFiscal.filter(where(), '-updated_date', 200),
      Entrega: await base44.asServiceRole.entities.Entrega.filter(where(), '-updated_date', 200),
      MovimentacaoEstoque: await base44.asServiceRole.entities.MovimentacaoEstoque.filter(where(), '-updated_date', 200),
    };

    const payload = {
      scope: { empresa_id: filtros?.empresa_id ?? null, group_id: filtros?.group_id ?? null },
      generated_at: new Date().toISOString(),
      version: 1,
      entidades,
    };

    const encrypted = await encryptJSON(payload);
    const blob = new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const name = `backup_${filtros?.group_id || 'grp'}_${filtros?.empresa_id || 'emp'}_${ts}.enc.json`;
    const file = new File([blob], name, { type: 'application/json' });

    const up = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });

    // Registro de controle + auditoria
    try {
      await base44.asServiceRole.entities.BackupAutomatico?.create?.({
        file_uri: up?.file_uri,
        nome_arquivo: name,
        escopo: payload.scope,
        tamanho_bytes: blob.size,
        entidades_count: Object.fromEntries(Object.entries(entidades).map(([k,v]) => [k, Array.isArray(v)? v.length : 0])),
        sucesso: true,
        data_execucao: new Date().toISOString(),
      });
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || 'Automação',
        usuario_id: user?.id || null,
        acao: 'Exportação',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: 'BackupAutomatico',
        descricao: `Backup automático gerado (${name})`,
        dados_novos: { file_uri: up?.file_uri, scope: payload.scope },
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({ ok: true, file_uri: up?.file_uri, name });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});