import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { z } from 'npm:zod@3.24.2';

// Catálogo headless de Produtos (multiempresa)
// GET /functions/catalogProducts?empresa_id=...&q=...&limit=...
// POST body: { empresa_id, group_id?, q?, limit?, sort? }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Público autenticado do app; se público externo, considere token no futuro
    const user = await base44.auth.me().catch(() => null);

    // Coleta params
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    const raw = method === 'GET' ? {
      empresa_id: url.searchParams.get('empresa_id'),
      group_id: url.searchParams.get('group_id'),
      q: url.searchParams.get('q') || undefined,
      limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined,
      sort: url.searchParams.get('sort') || undefined
    } : await req.json().catch(() => ({}));

    const Schema = z.object({
      empresa_id: z.string().min(1, 'empresa_id é obrigatório'),
      group_id: z.string().optional().nullable(),
      q: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional().default(50),
      sort: z.string().optional()
    });
    const parsed = Schema.safeParse(raw);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Parâmetros inválidos', issues: parsed.error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const { empresa_id, group_id, q, limit, sort } = parsed.data;

    const filter = { empresa_id, status: 'Ativo' };
    if (q) {
      // busca simples por trecho no campo descricao
      filter['descricao'] = { $ilike: `%${q}%` };
    }

    const order = sort || '-updated_date';
    const produtos = await base44.entities.Produto.filter(filter, order, limit);

    const payload = produtos.map(p => ({
      id: p.id,
      descricao: p.descricao,
      preco_venda: p.preco_venda,
      estoque_disponivel: p.estoque_disponivel,
      unidade: p.unidade_venda || p.unidade_medida,
      peso_kg: p.peso_liquido_kg || null,
      volume_m3: p.volume_m3 || null,
      foto_url: p.foto_produto_url || null,
      marca: p.marca_nome || null,
      grupo: p.grupo_produto_nome || p.grupo || null
    }));

    return new Response(JSON.stringify({ ok: true, items: payload }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});