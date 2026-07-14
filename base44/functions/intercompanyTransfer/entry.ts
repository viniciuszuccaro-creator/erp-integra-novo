import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch {} return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch{}return Response.json({error:'Forbidden'},{status:403});}return null;}
function assertContextPresence({empresa_id,group_id},requireEmpresa=true){if(requireEmpresa&&!empresa_id&&!group_id)return Response.json({error:'Contexto multiempresa obrigatório (empresa_id ou group_id)'},{status:400});return null;}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch{}}

// Transação Interempresas: cria ContaPagar (origem) e ContaReceber (destino) vinculadas
// Payload: { from_empresa_id, to_empresa_id, valor, descricao }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const fromId = body?.from_empresa_id; const toId = body?.to_empresa_id;
    const valor = Number(body?.valor || 0); const descricao = body?.descricao || 'Transferência interempresas';
    if (!fromId || !toId || !valor || valor <= 0) return Response.json({ error: 'Parâmetros inválidos' }, { status: 400 });

    const { perfil } = await getUserAndPerfil(base44);
    const denied = await assertPermission(base44, { user, perfil }, 'Financeiro', 'Intercompany', 'criar');
    if (denied) return denied;

    const ctxErrFrom = assertContextPresence({ empresa_id: fromId }, true);
    if (ctxErrFrom) return ctxErrFrom;
    const ctxErrTo = assertContextPresence({ empresa_id: toId }, true);
    if (ctxErrTo) return ctxErrTo;

    const dataHoje = new Date().toISOString().slice(0,10);

    const pagar = await base44.asServiceRole.entities.ContaPagar.create({
      empresa_id: fromId,
      origem: 'empresa',
      descricao: `${descricao} → empresa ${toId}`,
      valor,
      data_emissao: dataHoje,
      data_vencimento: dataHoje,
      status: 'Pendente',
      pago_por: 'empresa'
    });

    const receber = await base44.asServiceRole.entities.ContaReceber.create({
      empresa_id: toId,
      origem: 'empresa',
      descricao: `${descricao} ← empresa ${fromId}`,
      valor,
      data_emissao: dataHoje,
      data_vencimento: dataHoje,
      status: 'Pendente'
    });

    // Auditoria dupla
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Sistema',
        usuario_id: user?.id,
        acao: 'Criação', modulo: 'Financeiro', entidade: 'TransacaoInterempresas',
        descricao: `Geradas contas cruzadas (Pagar:${pagar.id} / Receber:${receber.id})`,
        dados_novos: { from_empresa_id: fromId, to_empresa_id: toId, valor, descricao },
        data_hora: new Date().toISOString(),
      });
    } catch {}

    await audit(base44, user, { acao: 'Criação', modulo: 'Financeiro', entidade: 'Intercompany', registro_id: pagar.id, descricao: 'Transferência interempresas criada', dados_novos: { from_empresa_id: fromId, to_empresa_id: toId, valor } });
    return Response.json({ ok: true, pagar_id: pagar.id, receber_id: receber.id });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});