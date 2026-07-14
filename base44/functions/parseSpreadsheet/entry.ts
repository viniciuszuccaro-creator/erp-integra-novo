import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import XLSX from 'npm:xlsx@0.18.5';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const fileUrl = body?.file_url;

    const ctx = await getUserAndPerfil(base44);
    const permErr = await assertPermission(base44, ctx, 'Sistema', 'Importacao', 'visualizar');
    if (permErr) return permErr;
    if (!fileUrl) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    const resp = await fetch(fileUrl);
    if (!resp.ok) {
      return Response.json({ error: `Failed to fetch file: ${resp.status}` }, { status: 400 });
    }
    const arrayBuffer = await resp.arrayBuffer();

    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      return Response.json({ rows: [] });
    }
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    await audit(base44, user, { acao: 'Visualização', modulo: 'Sistema', entidade: 'Importacao', descricao: `Planilha lida (${sheetName})`, dados_novos: { fileUrl, linhas: rows.length } });
    return Response.json({ rows });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});