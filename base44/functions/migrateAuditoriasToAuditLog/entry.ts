import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function mapAcaoGlobalToAuditLog(acao) {
  const mapa = {
    'Login': 'Login',
    'Logout': 'Logout',
    'Criar': 'Criação',
    'Editar': 'Edição',
    'Excluir': 'Exclusão',
    'Visualizar': 'Visualização',
    'Aprovar': 'Aprovação',
    'Rejeitar': 'Rejeição',
    'Exportar': 'Exportação',
    'Importar': 'Importação',
    'Troca Empresa': 'Troca de Empresa'
  };
  return mapa[acao] || 'Visualização';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const migrated = { acesso: 0, gps: 0, ia: 0, global: 0, skipped: 0 };

    async function ensureAuditLog(entry) {
      const exists = await base44.asServiceRole.entities.AuditLog.filter({ entidade: entry.entidade, registro_id: entry.registro_id }, undefined, 1);
      if (exists && exists.length > 0) return false;
      await base44.asServiceRole.entities.AuditLog.create(entry);
      return true;
    }

    // AuditoriaAcesso -> AuditLog (tipo_auditoria: 'acesso')
    try {
      const acesso = await base44.asServiceRole.entities.AuditoriaAcesso?.filter?.({}) || [];
      for (const a of acesso) {
        const ok = await ensureAuditLog({
          usuario: a.usuario_nome || a.usuario_email || 'Usuário',
          usuario_id: a.usuario_id || null,
          empresa_id: a.empresa_id || null,
          empresa_nome: a.empresa_nome || null,
          acao: mapAcaoGlobalToAuditLog(a.tipo_acao || 'Visualizar'),
          modulo: 'Sistema',
          tipo_auditoria: 'acesso',
          entidade: 'AuditoriaAcesso',
          registro_id: a.id,
          descricao: `Acesso: ${a.tipo_acao || '—'} (contexto: ${a.contexto || '-'})`,
          dados_novos: {
            grupo_id: a.grupo_id || null,
            ip: a.ip_address,
            ip_localizacao: a.ip_localizacao,
            user_agent: a.user_agent,
            dispositivo_tipo: a.dispositivo_tipo,
            sistema_operacional: a.sistema_operacional,
            navegador: a.navegador,
            latitude: a.latitude,
            longitude: a.longitude,
            sucesso: a.sucesso,
            motivo_falha: a.motivo_falha
          },
          data_hora: a.data_hora || new Date().toISOString(),
          sucesso: a.sucesso !== false
        });
        ok ? migrated.acesso++ : migrated.skipped++;
      }
    } catch (_) {}

    // AuditoriaGPS -> AuditLog (tipo_auditoria: 'gps')
    try {
      const gps = await base44.asServiceRole.entities.AuditoriaGPS?.filter?.({}) || [];
      for (const g of gps) {
        const ok = await ensureAuditLog({
          usuario: g.motorista_nome || 'Sistema',
          usuario_id: g.motorista_id || null,
          empresa_id: g.empresa_id || null,
          acao: 'Visualização',
          modulo: 'Expedição',
          tipo_auditoria: 'gps',
          entidade: 'AuditoriaGPS',
          registro_id: g.id,
          descricao: `GPS: ${g.tipo_evento || 'Evento'} - ${g.placa || ''}`.trim(),
          dados_novos: {
            romaneio_id: g.romaneio_id,
            entrega_id: g.entrega_id,
            veiculo_id: g.veiculo_id,
            placa: g.placa,
            latitude: g.latitude,
            longitude: g.longitude,
            precisao_metros: g.precisao_metros,
            velocidade_kmh: g.velocidade_kmh,
            endereco_aproximado: g.endereco_aproximado,
            conectividade: g.conectividade,
            bateria_nivel: g.bateria_nivel,
            app_versao: g.app_versao
          },
          data_hora: g.data_hora || new Date().toISOString(),
          sucesso: true
        });
        ok ? migrated.gps++ : migrated.skipped++;
      }
    } catch (_) {}

    // AuditoriaIA -> AuditLog (tipo_auditoria: 'ia')
    try {
      const ia = await base44.asServiceRole.entities.AuditoriaIA?.filter?.({}) || [];
      for (const i of ia) {
        const ok = await ensureAuditLog({
          usuario: i.usuario_nome || 'Sistema',
          usuario_id: i.usuario_id || null,
          empresa_id: i.empresa_id || null,
          acao: 'Visualização',
          modulo: i.modulo || 'Sistema',
          tipo_auditoria: 'ia',
          entidade: 'AuditoriaIA',
          registro_id: i.id,
          descricao: `IA: ${i.funcionalidade || '-'} (${i.status || 'Status'})`,
          dados_novos: {
            input_prompt: i.input_prompt,
            input_dados: i.input_dados,
            arquivo_entrada_url: i.arquivo_entrada_url,
            output_resultado: i.output_resultado,
            confianca_percentual: i.confianca_percentual,
            tokens_usados: i.tokens_usados,
            tempo_resposta_ms: i.tempo_resposta_ms,
            custo_estimado: i.custo_estimado,
            modelo_usado: i.modelo_usado,
            aceito_usuario: i.aceito_usuario,
            rejeitado_motivo: i.rejeitado_motivo
          },
          data_hora: i.data_hora || new Date().toISOString(),
          sucesso: i.status === 'Sucesso'
        });
        ok ? migrated.ia++ : migrated.skipped++;
      }
    } catch (_) {}

    // AuditoriaGlobal -> AuditLog (tipo_auditoria: 'global')
    try {
      const glob = await base44.asServiceRole.entities.AuditoriaGlobal?.filter?.({}) || [];
      for (const ag of glob) {
        const ok = await ensureAuditLog({
          usuario: ag.usuario_nome || ag.usuario_email || 'Usuário',
          usuario_id: ag.usuario_id || null,
          empresa_id: ag.empresa_id || null,
          acao: mapAcaoGlobalToAuditLog(ag.acao),
          modulo: ag.modulo || 'Sistema',
          tipo_auditoria: 'global',
          entidade: 'AuditoriaGlobal',
          registro_id: ag.id,
          descricao: `Global: ${ag.entidade_afetada || '—'} ${ag.acao || ''}`.trim(),
          dados_anteriores: ag.dados_antes || null,
          dados_novos: ag.dados_depois || null,
          data_hora: ag.data_hora || new Date().toISOString(),
          sucesso: ag.sucesso !== false,
          duracao_ms: ag.duracao_ms
        });
        ok ? migrated.global++ : migrated.skipped++;
      }
    } catch (_) {}

    return Response.json({ success: true, migrated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});