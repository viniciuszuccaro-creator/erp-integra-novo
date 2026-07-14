import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import * as XLSX from 'npm:xlsx@0.18.5';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch (permErr) { console.error('PerfilAcesso fetch falhou (parseSpreadsheet):', permErr); } return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em assertPermission (parseSpreadsheet):',auditErr);}return Response.json({error:'Forbidden'},{status:403});}return null;}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em audit (parseSpreadsheet):',auditErr);}}

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