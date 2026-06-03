import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * restoreAllCadastrosFromSnapshot V2
 *
 * Modes:
 *   action=dedup_produto  → Remove duplicatas de Produto, mantém 1 por código único
 *   action=restore        → Restaura entidades faltantes do snapshot (sem duplicar)
 *   action=status         → Apenas conta e informa o estado atual
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'status';
    const sr = base44.asServiceRole;

    // ─── ACTION: status ───────────────────────────────────────────────────────
    if (action === 'status') {
      const produtosAll = await sr.entities.Produto.filter({}, '-id', 2000, 0);
      const total = Array.isArray(produtosAll) ? produtosAll.length : 0;

      // Detectar duplicatas por código
      const codigoMap = new Map();
      const duplicateIds = [];
      for (const p of (Array.isArray(produtosAll) ? produtosAll : [])) {
        const key = (p.codigo || '').trim().toLowerCase();
        if (!key) continue;
        if (codigoMap.has(key)) {
          duplicateIds.push(p.id);
        } else {
          codigoMap.set(key, p.id);
        }
      }

      return Response.json({
        status: 'ok',
        produto_total: total,
        produto_unicos: codigoMap.size,
        produto_duplicados: duplicateIds.length,
        alerta: total > 1000 ? `⚠️ ${total} produtos no banco — ${duplicateIds.length} duplicados. Execute action=dedup_produto para limpar.` : null,
      });
    }

    // ─── ACTION: dedup_produto ────────────────────────────────────────────────
    if (action === 'dedup_produto') {
      const batchSize = 100;
      let offset = 0;
      const codigoMap = new Map(); // codigo → id do primeiro (manter)
      const toDelete = [];

      // Varrer todos os produtos em batches
      while (true) {
        const batch = await sr.entities.Produto.filter({}, '-created_date', batchSize, offset);
        if (!Array.isArray(batch) || batch.length === 0) break;

        for (const p of batch) {
          const key = (p.codigo || '').trim().toLowerCase() || `__no_code_${p.id}`;
          if (codigoMap.has(key)) {
            toDelete.push(p.id); // duplicata — marcar para exclusão
          } else {
            codigoMap.set(key, p.id); // primeiro com este código — manter
          }
        }

        if (batch.length < batchSize) break;
        offset += batchSize;
      }

      // Deletar duplicatas sequencialmente com delay para evitar 429
      let deleted = 0;
      const errors = [];
      const MAX_DELETE = 150; // Máximo por execução (evita timeout + 429)
      const toDeleteLimited = toDelete.slice(0, MAX_DELETE);

      for (const id of toDeleteLimited) {
        try {
          await sr.entities.Produto.delete(id);
          deleted++;
          // Pausa de 400ms entre cada deleção — respeita rate limit
          await new Promise(r => setTimeout(r, 400));
        } catch (e) {
          const msg = String(e?.message || e);
          errors.push({ id, error: msg });
          // Se rate limit, espera 3s antes de continuar
          if (msg.includes('Rate limit') || msg.includes('429')) {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      }

      // Log de auditoria
      try {
        await sr.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Admin',
          usuario_id: user.id,
          acao: 'Exclusão',
          modulo: 'Cadastros',
          tipo_auditoria: 'sistema',
          entidade: 'Produto',
          descricao: `Deduplicação: ${deleted} produtos duplicados removidos. Restaram ${codigoMap.size} únicos.`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return Response.json({
        status: 'success',
        message: `✅ Deduplicação concluída: ${deleted} duplicatas removidas`,
        produto_unicos_mantidos: codigoMap.size,
        produto_deletados: deleted,
        errors: errors.slice(0, 20),
      });
    }

    // ─── ACTION: restore ─────────────────────────────────────────────────────
    if (action === 'restore') {
      const results = { created: {}, skipped: {}, errors: {} };
      const groupId = body.group_id || null;
      const empresaId = body.empresa_id || null;

      // Mapa de entidades para restaurar (apenas se count < meta)
      const RESTORE_MAP = {
        Banco: {
          meta: 7,
          campo: 'codigo_banco',
          data: [
            { codigo_banco: '001', nome_banco: 'Banco do Brasil', pais: 'Brasil', ativo: true },
            { codigo_banco: '033', nome_banco: 'Santander', pais: 'Brasil', ativo: true },
            { codigo_banco: '104', nome_banco: 'Caixa Econômica Federal', pais: 'Brasil', ativo: true },
            { codigo_banco: '237', nome_banco: 'Bradesco', pais: 'Brasil', ativo: true },
            { codigo_banco: '341', nome_banco: 'Itaú', pais: 'Brasil', ativo: true },
            { codigo_banco: '756', nome_banco: 'Sicoob', pais: 'Brasil', ativo: true },
            { codigo_banco: '077', nome_banco: 'Banco Inter', pais: 'Brasil', ativo: true },
          ],
        },
        TipoFrete: {
          meta: 3,
          campo: 'nome',
          data: [
            { nome: 'CIF', tipo: 'CIF', responsavel_pagamento: 'Remetente', ativo: true },
            { nome: 'FOB', tipo: 'FOB', responsavel_pagamento: 'Destinatário', ativo: true },
            { nome: 'Retira', tipo: 'Retira', responsavel_pagamento: 'Destinatário', ativo: true },
          ],
        },
      };

      for (const [entity, cfg] of Object.entries(RESTORE_MAP)) {
        try {
          const existing = await sr.entities[entity].filter({}, '-id', 200, 0);
          const count = Array.isArray(existing) ? existing.length : 0;
          if (count >= cfg.meta) {
            results.skipped[entity] = count;
            continue;
          }

          const existingKeys = new Set(
            (Array.isArray(existing) ? existing : []).map(r => String(r[cfg.campo] || '').toLowerCase())
          );

          const toCreate = cfg.data
            .filter(r => !existingKeys.has(String(r[cfg.campo] || '').toLowerCase()))
            .map(r => ({ ...r, ...(groupId ? { group_id: groupId } : {}), ...(empresaId ? { empresa_id: empresaId } : {}) }));

          if (toCreate.length > 0) {
            await sr.entities[entity].bulkCreate(toCreate);
            results.created[entity] = toCreate.length;
          } else {
            results.skipped[entity] = count;
          }
        } catch (e) {
          results.errors[entity] = String(e?.message || e);
        }
      }

      return Response.json({ status: 'success', message: '✅ Restore concluído', ...results });
    }

    return Response.json({ error: `Ação desconhecida: "${action}". Use: status | dedup_produto | restore` }, { status: 400 });

  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});