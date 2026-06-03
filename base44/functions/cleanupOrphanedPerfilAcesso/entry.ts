/**
 * cleanupOrphanedPerfilAcesso — Remove referências órfãs de PerfilAcesso
 * Limpa caches e referências que apontam para IDs deletados/inválidos
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ORPHANED_IDS = ['692316b82206c99d5778f10c']; // ID órfão conhecida

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Tenta buscar e deletar cada PerfilAcesso órfão
    const deleted = [];
    const notFound = [];

    for (const orphanId of ORPHANED_IDS) {
      try {
        // Tenta ler para confirmar se existe
        const existing = await base44.asServiceRole.entities.PerfilAcesso.get(orphanId).catch(() => null);
        if (!existing) {
          notFound.push(orphanId);
          continue;
        }
        // Se existe, deleta
        await base44.asServiceRole.entities.PerfilAcesso.delete(orphanId);
        deleted.push(orphanId);
      } catch (error) {
        if (error?.response?.status === 404 || /not found/i.test(error?.message)) {
          notFound.push(orphanId);
        } else {
          throw error;
        }
      }
    }

    return Response.json({
      ok: true,
      deleted,
      notFound,
      message: `Limpeza concluída: ${deleted.length} deletados, ${notFound.length} já inexistentes`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});