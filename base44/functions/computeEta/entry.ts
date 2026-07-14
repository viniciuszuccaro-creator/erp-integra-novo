import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const GMAPS_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { origin, destination } = await req.json();
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    if (!GMAPS_KEY) {
      // fallback simples por Haversine (50 km/h)
      const R = 6371e3;
      const toRad = (x) => x * Math.PI / 180;
      const dLat = toRad(destination.lat - origin.lat);
      const dLng = toRad(destination.lng - origin.lng);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(origin.lat))*Math.cos(toRad(destination.lat))*Math.sin(dLng/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = (R * c) / 1000; // km
      const eta_minutes = Math.round((dist / 50) * 60);
      return Response.json({ eta_minutes, distance_km: dist, source: 'haversine' });
    }

    const params = new URLSearchParams({
      origins: `${origin.lat},${origin.lng}`,
      destinations: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      units: 'metric',
      key: GMAPS_KEY,
    });
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Distance Matrix error: ${resp.status}`);
    const data = await resp.json();
    const el = data?.rows?.[0]?.elements?.[0];
    const eta_minutes = el?.duration_in_traffic?.value ? Math.round(el.duration_in_traffic.value / 60) : (el?.duration?.value ? Math.round(el.duration.value / 60) : null);
    const distance_km = el?.distance?.value ? Math.round((el.distance.value / 1000) * 10) / 10 : null;
    return Response.json({ eta_minutes, distance_km, source: 'google' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});