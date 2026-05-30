// @ts-nocheck
/* global Deno */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

/**
 * PROPAGAÇÃO BIDIRECIONAL GRUPO ↔ EMPRESAS
 * Sincroniza dados automaticamente quando cadastros são criados/atualizados em qualquer nível
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, entityName, entityId, data, groupId, empresaId } = await req.json();

    // CENÁRIO 1: Criação/Atualização no GRUPO → Propagar para todas as EMPRESAS
    if (groupId && !empresaId) {
      console.log(`[PROPAGAÇÃO] ${action} no GRUPO ${groupId} → empresas vinculadas`);

      // Buscar todas as empresas do grupo
      const empresasDoGrupo = await base44.asServiceRole.entities.Empresa.filter(
        { group_id: groupId },
        "-updated_date",
        100
      );

      // Propagar para cada empresa
      for (const empresa of empresasDoGrupo) {
        try {
          const dataComEmpresa = {
            ...data,
            empresa_id: empresa.id,
            group_id: groupId,
            propagado_do_grupo: true,
            propagacao_timestamp: new Date().toISOString(),
          };

          if (action === "create") {
            await base44.asServiceRole.entities[entityName].create(dataComEmpresa);
            console.log(`✓ Propagado para empresa ${empresa.id}`);
          } else if (action === "update" && entityId) {
            // Buscar registro na empresa correspondente
            const registros = await base44.asServiceRole.entities[entityName].filter(
              { group_id: groupId, empresa_id: empresa.id },
              "updated_date",
              1
            );
            if (registros.length > 0) {
              await base44.asServiceRole.entities[entityName].update(registros[0].id, dataComEmpresa);
              console.log(`✓ Atualizado na empresa ${empresa.id}`);
            }
          }
        } catch (err) {
          console.error(`✗ Erro ao propagar para empresa ${empresa.id}:`, err.message);
        }
      }
    }

    // CENÁRIO 2: Criação/Atualização na EMPRESA → Sincronizar com GRUPO
    else if (empresaId) {
      console.log(`[SINCRONIZAÇÃO] ${action} na empresa ${empresaId} → GRUPO`);

      const dataComGrupo = {
        ...data,
        empresa_origem: empresaId,
        sincronizado_de_empresa: true,
        sincronizacao_timestamp: new Date().toISOString(),
      };

      try {
        if (action === "create") {
          await base44.asServiceRole.entities[entityName].create(dataComGrupo);
          console.log(`✓ Sincronizado com GRUPO`);
        } else if (action === "update" && entityId) {
          await base44.asServiceRole.entities[entityName].update(entityId, dataComGrupo);
          console.log(`✓ Atualizado no GRUPO`);
        }
      } catch (err) {
        console.error(`✗ Erro ao sincronizar com GRUPO:`, err.message);
      }
    }

    // Registrar auditoria
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user.full_name || user.email,
      acao: action,
      modulo: "Sistema",
      tipo_auditoria: "propagacao",
      entidade: entityName,
      descricao: `Propagação ${action} - Grupo:${groupId || "N/A"} / Empresa:${empresaId || "N/A"}`,
      grupo_id: groupId,
      empresa_id: empresaId,
      data_hora: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: "Propagação executada com sucesso",
    });
  } catch (error) {
    console.error("[ERROR] propagateGroupData:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});