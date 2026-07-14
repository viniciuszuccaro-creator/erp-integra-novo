import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@4.0.0';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch {} return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch{}return Response.json({error:'Forbidden'},{status:403});}return null;}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: requer permissão para exportar no módulo Estoque
    const ctx = await getUserAndPerfil(base44);
    const permErr = await assertPermission(base44, ctx, 'Estoque', 'Produto', 'exportar');
    if (permErr) return permErr;

    let body = {};
    try { body = await req.json(); } catch {}

    const filtros = body?.filtros || {};

    // Prefer products flagged as steel rebar/bitola; fallback to group 'Bitola'
    const primaryFilter = { ...filtros, eh_bitola: true };
    let produtos = await base44.entities.Produto.filter(primaryFilter, 'descricao', 1000);

    if (!Array.isArray(produtos) || produtos.length === 0) {
      const fallbackFilter = { ...filtros, grupo: 'Bitola' };
      try {
        produtos = await base44.entities.Produto.filter(fallbackFilter, 'descricao', 1000);
      } catch {
        produtos = [];
      }
    }

    // Generate PDF (landscape to fit columns)
    const doc = new jsPDF({ orientation: 'landscape' });

    // Header
    doc.setFontSize(16);
    doc.text('Relatório de Estoque de Aço (Bitolas)', 14, 14);
    doc.setFontSize(10);
    const now = new Date();
    doc.text(`Gerado por: ${user.full_name || user.email} • ${now.toLocaleString('pt-BR')}`, 14, 20);
    if (filtros?.empresa_id) doc.text(`Empresa: ${String(filtros.empresa_id)}`, 14, 26);
    if (filtros?.group_id) doc.text(`Grupo: ${String(filtros.group_id)}`, 90, 26);

    // Table headers
    doc.setFontSize(11);
    const headers = ['Descrição', 'Diâmetro (mm)', 'Tipo Aço', 'Estoque (kg)', 'Reservado (kg)', 'Disponível (kg)', 'Custo Médio', 'Preço Venda'];
    let y = 36;
    let x = 14;
    const colWidths = [75, 30, 30, 32, 32, 32, 32, 32]; // sum fits A4 landscape width margins

    headers.forEach((h, idx) => {
      doc.text(h, x, y);
      x += colWidths[idx];
    });

    doc.setFontSize(9);
    y += 8;

    const addRow = (vals) => {
      if (y > 190) { // new page if near bottom
        doc.addPage('landscape');
        y = 20;
      }
      let cx = 14;
      vals.forEach((v, idx) => {
        const str = String(v ?? '-');
        doc.text(str, cx, y);
        cx += colWidths[idx];
      });
      y += 7;
    };

    const fmtNum = (n) => {
      const v = Number(n || 0);
      return isFinite(v) ? v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '-';
    };

    const fmtMoney = (n) => (n == null ? '-' : `R$ ${Number(n).toFixed(2).replace('.', ',')}`);

    (produtos || []).forEach((p) => {
      const estoque = Number(p.estoque_atual) || 0;
      const reservado = Number(p.estoque_reservado) || 0;
      const disponivel = (Number.isFinite(Number(p.estoque_disponivel)) ? Number(p.estoque_disponivel) : (estoque - reservado));

      addRow([
        p.descricao || p.codigo || '-',
        p.bitola_diametro_mm ?? '-',
        p.tipo_aco ?? '-',
        fmtNum(estoque),
        fmtNum(reservado),
        fmtNum(disponivel),
        fmtMoney(p.custo_medio),
        fmtMoney(p.preco_venda),
      ]);
    });

    // Footer summary
    const totalItens = (produtos || []).length;
    const somaEstoque = (produtos || []).reduce((s, p) => s + (Number(p.estoque_atual) || 0), 0);
    y += 6;
    if (y > 190) { doc.addPage('landscape'); y = 20; }
    doc.setFontSize(10);
    doc.text(`Itens: ${totalItens}  •  Estoque total (kg): ${fmtNum(somaEstoque)}`, 14, y);

    const pdfBytes = doc.output('arraybuffer');

    // Audit trail
    try {
      await base44.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Usuário',
        usuario_id: user.id,
        acao: 'Exportação',
        modulo: 'Estoque',
        tipo_auditoria: 'entidade',
        entidade: 'Produto',
        descricao: `Exportou relatório de aço/bitolas (${totalItens} itens).`,
        dados_novos: { filtros, total_itens: totalItens },
        empresa_id: filtros?.empresa_id || null,
        data_hora: new Date().toISOString(),
      });
    } catch {}

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=estoque_aco.pdf'
      }
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});