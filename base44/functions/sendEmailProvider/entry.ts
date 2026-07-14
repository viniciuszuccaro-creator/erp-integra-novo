import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch {} return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch{}return Response.json({error:'Forbidden'},{status:403});}return null;}
function assertContextPresence({empresa_id,group_id},requireEmpresa=true){if(requireEmpresa&&!empresa_id&&!group_id)return Response.json({error:'Contexto multiempresa obrigatório (empresa_id ou group_id)'},{status:400});return null;}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch{}}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const { empresaId, destinatario, destinatario_nome, assunto, mensagem, tipo_conteudo = 'html', anexos = [], action = 'send' } = payload || {};

    const ctx = await getUserAndPerfil(base44);
    const permErr = await assertPermission(base44, ctx, 'Integrações', 'Email', 'criar');
    if (permErr) return permErr;
    const ctxErr = assertContextPresence({ empresa_id: empresaId, group_id: null }, true);
    if (ctxErr) return ctxErr;

    // Busca configuração de Email
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Email', chave: `email_${empresaId}` });
    const emailCfg = cfgs?.[0]?.configuracoes_email || null;

    if (action === 'status') {
      return Response.json({ configurado: !!emailCfg, provedor: emailCfg?.provedor || 'Core' });
    }

    // Se não configurado, usa integração segura do Core
    if (!emailCfg || emailCfg.ativo === false) {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: destinatario, subject: assunto, body: mensagem });
      await audit(base44, user, { acao: 'Criação', modulo: 'Integrações', entidade: 'Email', descricao: `E-mail enviado via Core para ${destinatario}` , dados_novos: { empresaId, destinatario, assunto } });
      return Response.json({ sucesso: true, modo: 'core', status: 'enviado' });
    }

    const provedor = emailCfg.provedor;

    if (provedor === 'SendGrid') {
      const payloadSG = {
        personalizations: [{ to: [{ email: destinatario, name: destinatario_nome }], subject: assunto }],
        from: { email: emailCfg.email_remetente || 'noreply@zuccaro.com.br', name: emailCfg.nome_remetente || 'ERP Zuccaro' },
        content: [{ type: tipo_conteudo === 'html' ? 'text/html' : 'text/plain', value: mensagem }],
      };
      if (anexos?.length) {
        payloadSG.attachments = anexos.map(a => ({ content: a.conteudo_base64, filename: a.nome_arquivo, type: a.tipo_mime, disposition: 'attachment' }));
      }
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${emailCfg.api_key}` }, body: JSON.stringify(payloadSG) });
      if (!r.ok) return Response.json({ error: await r.text() }, { status: 502 });
      await audit(base44, user, { acao: 'Criação', modulo: 'Integrações', entidade: 'Email', descricao: `E-mail enviado via SendGrid para ${destinatario}` , dados_novos: { empresaId, destinatario, assunto } });
      return Response.json({ sucesso: true, modo: 'real', status: 'enviado' });
    }

    // Fallback padrão (ou provedores não implementados): usa Core
    await base44.asServiceRole.integrations.Core.SendEmail({ to: destinatario, subject: assunto, body: mensagem });
    await audit(base44, user, { acao: 'Criação', modulo: 'Integrações', entidade: 'Email', descricao: `E-mail enviado (fallback Core) para ${destinatario}` , dados_novos: { empresaId, destinatario, assunto } });
    return Response.json({ sucesso: true, modo: 'core', status: 'enviado' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});