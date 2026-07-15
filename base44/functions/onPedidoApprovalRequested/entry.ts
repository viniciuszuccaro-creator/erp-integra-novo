import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch (permErr) { console.error('PerfilAcesso fetch falhou (onPedidoApprovalRequested):', permErr); } return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em assertPermission (onPedidoApprovalRequested):',auditErr);}return Response.json({error:'Forbidden'},{status:403});}return null;}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event, data, old_data } = await req.json();
    if (event?.type !== 'update' || !data) return Response.json({ ok: true, skipped: true });

    // Quando status_aprovacao mudar para pendente, notifica aprovador
    if (data?.status_aprovacao === 'pendente' && data?.usuario_aprovador_id && old_data?.status_aprovacao !== 'pendente') {
      // Permissão básica de visualizar comercial
      const perm = await assertPermission(base44, ctx, 'Comercial', 'Pedido', 'visualizar');
      if (perm) return perm;

      // Busca aprovador
      let aprovador = null;
      try {
        aprovador = await base44.asServiceRole.entities.User.get(data.usuario_aprovador_id);
      } catch (e) { console.error('[onPedidoApprovalRequested] catch:', e); }

      const to = aprovador?.email || user?.email;
      if (to) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to,
          subject: `Aprovação de Desconto - Pedido ${data?.numero_pedido || data?.id}`,
          body: `Há uma solicitação de aprovação de desconto para o Pedido ${data?.numero_pedido || data?.id}.\nPercentual solicitado: ${data?.desconto_solicitado_percentual || 0}%\nSolicitante: ${data?.usuario_solicitante_id || '-'}\nAcesse o módulo Comercial para aprovar.`
        });
      }
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});