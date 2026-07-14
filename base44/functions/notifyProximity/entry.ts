import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function haversineKm(a, b) {
  const R = 6371e3; // m
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const la1 = toRad(a.lat); const la2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return (2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1-h))) / 1000; // km
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Automations chamam sem usuário explícito
    const body = await req.json().catch(()=>({}));
    const evento = body?.event || {};
    let dados = body?.data || body?.posicao || null;

    // Fallback: se vier só o ID da posição, buscar
    if (!dados?.latitude && body?.posicao_id) {
      const pos = await base44.asServiceRole.entities.PosicaoVeiculo.filter({ id: body.posicao_id }, undefined, 1);
      dados = pos?.[0] || null;
    }

    if (!dados?.entrega_id || typeof dados.latitude !== 'number') {
      return Response.json({ skipped: true });
    }

    const listaE = await base44.asServiceRole.entities.Entrega.filter({ id: dados.entrega_id }, undefined, 1);
    const entrega = listaE?.[0];
    if (!entrega) return Response.json({ skipped: true });

    const lat = entrega?.endereco_entrega_completo?.latitude;
    const lng = entrega?.endereco_entrega_completo?.longitude;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return Response.json({ skipped: true, reason: 'destino sem coordenadas' });
    }

    const distKm = haversineKm({ lat: dados.latitude, lng: dados.longitude }, { lat, lng });
    const thresholdKm = 0.8; // ~800m

    // Verifica se já notificou aproximação
    const jaEnviada = (entrega?.notificacoes_enviadas || []).some(n => n?.tipo === 'Chegada' && n?.status_envio === 'Enviado');
    if (distKm <= thresholdKm && !jaEnviada) {
      // ETA (best-effort)
      let etaMin = Math.round((distKm / 30) * 60); // 30 km/h padrão urbano
      try {
        const r = await base44.asServiceRole.functions.invoke('computeEta', {
          origin: { lat: dados.latitude, lng: dados.longitude },
          destination: { lat, lng }
        });
        if (r?.data?.eta_minutes != null) etaMin = r.data.eta_minutes;
      } catch {}

      // Notificação ao usuário do portal, se existir
      const portalUserId = entrega?.portal_usuario_id || entrega?.cliente_portal_usuario_id || null;
      if (portalUserId) {
        try {
          await base44.asServiceRole.entities.Notificacao.create({
            destinatario_id: portalUserId,
            titulo: 'Sua entrega está chegando! 🚚',
            mensagem: `O motorista está a ~${Math.max(0.1, Math.round(distKm*10)/10)} km. ETA ~${etaMin} min.`,
            entidade: 'Entrega',
            referencia_id: entrega.id,
            canal: 'Sistema',
            lida: false
          });
        } catch {}
      }

      // Marca controle em Entrega
      try {
        const historico = Array.isArray(entrega.notificacoes_enviadas) ? entrega.notificacoes_enviadas : [];
        historico.push({
          tipo: 'Chegada', canal: 'Sistema', destinatario: portalUserId || 'cliente', data_envio: new Date().toISOString(), status_envio: 'Enviado',
          mensagem: `ETA ~${etaMin} min`
        });
        await base44.asServiceRole.entities.Entrega.update(entrega.id, { notificacoes_enviadas: historico });
      } catch {}

      return Response.json({ notified: true, dist_km: distKm, eta_min: etaMin });
    }

    return Response.json({ notified: false, dist_km: distKm });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});