import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function parseBody(text) {
  // formatos aceitos:
  // 1) "-23.5,-46.6 ENTREGA:123 PLACA:ABC1D23"
  // 2) "lat=-23.5&lng=-46.6&entrega_id=123&placa=ABC1D23"
  try {
    if (!text) return {};
    if (text.includes('&') && text.includes('=')) {
      const params = new URLSearchParams(text);
      return {
        latitude: parseFloat(params.get('lat') || params.get('latitude')),
        longitude: parseFloat(params.get('lng') || params.get('longitude')),
        entrega_id: params.get('entrega_id') || params.get('entrega'),
        placa: params.get('placa') || undefined,
        motorista_id: params.get('motorista_id') || undefined,
        token: params.get('token') || undefined,
      };
    }
    const m = text.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
    const entrega = (text.match(/ENTREGA[:=]\s*(\w+)/i) || [])[1];
    const placa = (text.match(/PLACA[:=]\s*([A-Z0-9-]+)/i) || [])[1];
    const token = (text.match(/TOKEN[:=]\s*(\w+)/i) || [])[1];
    return {
      latitude: m ? parseFloat(m[1]) : undefined,
      longitude: m ? parseFloat(m[2]) : undefined,
      entrega_id: entrega,
      placa,
      token,
    };
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);

    let payload;
    const ct = req.headers.get('content-type') || '';
    if (/application\/json/i.test(ct)) payload = await req.json();
    else if (/application\/x-www-form-urlencoded/i.test(ct)) payload = Object.fromEntries(new URLSearchParams(await req.text()));
    else payload = parseBody(await req.text());

    const { latitude, longitude, entrega_id, placa, motorista_id, precisao_metros } = payload || {};
    if (!(latitude && longitude && entrega_id)) {
      return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    // Verificação simples de token (opcional, configurável)
    const tokenHeader = req.headers.get('x-shared-token') || payload?.token;
    const expected = Deno.env.get('SMS_SHARED_TOKEN');
    if (expected && tokenHeader !== expected) {
      return Response.json({ error: 'Token inválido' }, { status: 403 });
    }

    // Operação como service role (webhook sem usuário)
    const lista = await base44.asServiceRole.entities.Entrega.filter({ id: entrega_id }, undefined, 1);
    const entrega = lista?.[0] || null;

    const pos = await base44.asServiceRole.entities.PosicaoVeiculo.create({
      entrega_id,
      romaneio_id: entrega?.romaneio_id || null,
      motorista_id: motorista_id || null,
      motorista_nome: entrega?.motorista || null,
      placa: placa || entrega?.placa || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
      precisao_metros: precisao_metros ? Number(precisao_metros) : undefined,
      conectividade: 'SMS',
      data_hora: new Date().toISOString()
    });

    return Response.json({ status: 'ok', id: pos?.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});