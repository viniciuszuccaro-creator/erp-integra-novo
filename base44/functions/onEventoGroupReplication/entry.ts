import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * P2.2: Propagação Grupo → Empresas — Evento (Reunião, Tarefa, etc.)
 * Evento criado no Grupo replica para colaboradores de todas as empresas
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { groupId, eventoId } = await req.json();
    if (!groupId || !eventoId) {
      return Response.json({ error: 'groupId e eventoId obrigatórios' }, { status: 400 });
    }

    const evento = await base44.entities.Evento.get(eventoId);
    if (!evento || evento.group_id !== groupId) {
      return Response.json({ error: 'Evento do grupo não encontrado' }, { status: 404 });
    }

    const empresas = await base44.entities.Empresa.filter({ group_id: groupId }, null, 100);
    if (!empresas.length) {
      return Response.json({ success: true, message: 'Nenhuma empresa no grupo', replicated: [] });
    }

    const replicated = [];
    for (const empresa of empresas) {
      try {
        const eventoEmpresa = {
          ...evento,
          id: undefined,
          empresa_id: empresa.id,
          group_id: groupId,
        };
        delete eventoEmpresa.id;

        const novo = await base44.entities.Evento.create(eventoEmpresa);
        replicated.push({ empresa_id: empresa.id, evento_id: novo.id });
      } catch (err) {
        console.error(`Erro ao replicar Evento para ${empresa.id}:`, err.message);
      }
    }

    return Response.json({ success: true, replicated, message: `Evento replicado para ${replicated.length} empresa(s)` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});