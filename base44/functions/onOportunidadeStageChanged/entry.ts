import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch {} return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch{}return Response.json({error:'Forbidden'},{status:403});}return null;}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch{}}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { event, data, old_data } = body || {};
    if (!event || !data) return Response.json({ ok: true, skipped: true });

    // Disparar quando etapa mudar para Proposta (ou Qualificação->Proposta)
    const mudouEtapa = data?.etapa && data?.etapa !== old_data?.etapa;
    const etapaAlvo = ['Proposta', 'Qualificação', 'Contato Inicial'];
    if (!mudouEtapa || !etapaAlvo.includes(data.etapa)) {
      return Response.json({ ok: true, skipped: true });
    }

    const perm = await assertPermission(base44, ctx, 'Comercial', 'OrcamentoCliente', 'criar');
    if (perm) return perm;

    const orcPayload = {
      cliente_id: data?.cliente_id || null,
      cliente_nome: data?.cliente_nome || data?.cliente || '',
      descricao: data?.titulo || 'Orçamento gerado a partir da Oportunidade',
      origem: 'CRM',
      valor_total_estimado: data?.valor_estimado || 0,
      data_abertura: new Date().toISOString().slice(0, 10),
      status: 'Aberto',
      responsavel: data?.responsavel || user?.full_name || user?.email,
      responsavel_id: data?.responsavel_id || user?.id,
      group_id: data?.group_id || null,
      empresa_id: data?.empresa_id || null,
      oportunidade_id: data?.id
    };

    const created = await base44.asServiceRole.entities.OrcamentoCliente.create(orcPayload);

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Comercial', entidade: 'OrcamentoCliente', registro_id: created?.id,
      descricao: 'Orçamento criado automaticamente ao avançar a Oportunidade', dados_novos: orcPayload
    });

    return Response.json({ ok: true, orcamento_id: created?.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});