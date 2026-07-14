import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch (permErr) { console.error('PerfilAcesso fetch falhou (onPedidoCreated):', permErr); } return { user, perfil }; }
function _normAct(a){if(!a)return 'visualizar';const s=String(a).toLowerCase();const map={ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar'};return map[s]||s;}
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em assertPermission (onPedidoCreated):',auditErr);}return Response.json({error:'Forbidden'},{status:403});}return null;}
function assertContextPresence({empresa_id,group_id},requireEmpresa=true){if(requireEmpresa&&!empresa_id&&!group_id)return Response.json({error:'Contexto multiempresa obrigatório (empresa_id ou group_id)'},{status:400});return null;}
function extractRequestMeta(req){try{const headers=req?.headers||new Headers();const ipHeader=headers.get('x-forwarded-for')||headers.get('x-real-ip')||headers.get('cf-connecting-ip');return{ip:ipHeader?String(ipHeader).split(',')[0].trim():null,user_agent:headers.get('user-agent')||null,request_id:headers.get('x-request-id')||headers.get('cf-ray')||null};}catch(_){return{ip:null,user_agent:null,request_id:null};}}
async function ensureContextFields(base44,data,requireEmpresa=true){try{if(!data)return data;let enriched={...data};if(requireEmpresa&&!enriched.empresa_id&&!enriched.group_id)return Response.json({error:'Contexto multiempresa obrigatório (empresa_id ou group_id)'},{status:400});if(!enriched.group_id&&enriched.empresa_id){const empresas=await base44.asServiceRole.entities.Empresa.filter({id:enriched.empresa_id},undefined,1);const emp=Array.isArray(empresas)?empresas[0]:null;if(emp?.group_id)enriched.group_id=emp.group_id;}return enriched;}catch(_){return data;}}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em audit (onPedidoCreated):',auditErr);}}
// Inlined validationUtils
function ensureEventType(event,expectedType){return event?.type===expectedType;}
// Inlined estoque/auditUtils
async function stockAudit(base44,user,{acao,entidade,registro_id,descricao,empresa_id=null,empresa_nome=null,dados_novos=null,duracao_ms=null},meta=null){try{const merged=dados_novos&&typeof dados_novos==='object'?{...dados_novos}:{};if(meta)merged._meta=meta;await audit(base44,user||{full_name:'Sistema'},{acao,modulo:'Estoque',entidade,registro_id,descricao,empresa_id,empresa_nome,dados_novos:Object.keys(merged).length?merged:null,duracao_ms},meta);}catch(_){}}
// Inlined notificationService
async function notify(base44,notif,options={}){const{whatsapp=false}=options;const{titulo,mensagem,tipo='alerta',categoria='Sistema',prioridade='Normal',empresa_id=null,dados=null}=notif||{};try{if(base44?.asServiceRole?.entities?.Notificacao?.create)await base44.asServiceRole.entities.Notificacao.create({titulo,mensagem,tipo,categoria,prioridade,empresa_id,dados});}catch(_){}if(whatsapp&&empresa_id){try{const cfgs=await base44.asServiceRole.entities?.ConfiguracaoWhatsApp?.filter?.({empresa_id},'-updated_date',1);const whats=Array.isArray(cfgs)&&cfgs.length?cfgs[0]:null;if(whats&&whats.ativo!==false&&whats.numero_whatsapp){await base44.asServiceRole.functions.invoke('whatsappSend',{action:'sendText',numero:whats.numero_whatsapp,mensagem:`[${categoria}] ${titulo}: ${mensagem}`,empresaId:empresa_id});}}catch(_){}}}
// Inlined pedido/onPedidoCreatedHandler (includes processReservas, auditPedidoReserva, emitPedidoMovementsGenerated)
function validatePedidoForReserva(pedido){const itensRev=Array.isArray(pedido?.itens_revenda)?pedido.itens_revenda:[];const itensArm=Array.isArray(pedido?.itens_armado_padrao)?pedido.itens_armado_padrao:[];const itensCD=Array.isArray(pedido?.itens_corte_dobra)?pedido.itens_corte_dobra:[];const totalItens=itensRev.length+itensArm.length+itensCD.length;const warnings=[];if(totalItens===0)warnings.push('sem_itens');if(!pedido?.empresa_id)warnings.push('sem_empresa_id');if(!pedido?.cliente_id)warnings.push('sem_cliente');return{ok:warnings.length===0,total_itens:totalItens,warnings};}
const ITEM_KEYS=['itens_revenda','itens_armado_padrao','itens_corte_dobra'];
async function processReservas(base44,data,user){const movimentos=[];for(const key of ITEM_KEYS){const itens=Array.isArray(data?.[key])?data[key]:[];for(const it of itens){const produtoId=it?.produto_id;const quantidade=Number(it?.quantidade||0);if(!produtoId||quantidade<=0)continue;const [produto]=await base44.asServiceRole.entities.Produto.filter({id:produtoId});const podeSomar=produto&&(produto.unidade_estoque===it?.unidade||!it?.unidade);if(podeSomar){const novoReservado=Number(produto?.estoque_reservado||0)+Number(quantidade||0);await base44.asServiceRole.entities.Produto.update(produto.id,{estoque_reservado:novoReservado});}const movRecord={origem_movimento:'pedido',tipo_movimento:'reserva',produto_id:it?.produto_id,produto_descricao:produto?.descricao,quantidade,unidade_medida:it?.unidade||produto?.unidade_estoque||'UN',empresa_id:data?.empresa_id||null,group_id:data?.group_id||null,data_movimentacao:new Date().toISOString(),motivo:`Reserva para Pedido ${data?.numero_pedido||data?.id}`,valor_total:0,responsavel:user?.full_name||user?.email,responsavel_id:user?.id};const mov=await base44.asServiceRole.entities.MovimentacaoEstoque.create(movRecord);if(mov?.id)movimentos.push(mov.id);}}return movimentos;}
async function auditPedidoReserva(base44,user,{pedido,movimentos}){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',acao:'Criação',modulo:'Estoque',entidade:'MovimentacaoEstoque',registro_id:pedido?.id||null,descricao:`Movimentações geradas a partir do Pedido ${pedido?.numero_pedido||pedido?.id||''}`,empresa_id:pedido?.empresa_id||null,dados_novos:{quantidade_movimentos:Array.isArray(movimentos)?movimentos.length:0},data_hora:new Date().toISOString()});}catch(_){}}
async function emitPedidoMovementsGenerated(base44,{pedido,movimentos,validation}){const empresa_id=pedido?.empresa_id||null;const count=Array.isArray(movimentos)?movimentos.length:0;try{if(base44?.asServiceRole?.entities?.Notificacao?.create)await base44.asServiceRole.entities.Notificacao.create({titulo:'Reserva de Estoque',mensagem:`${count} movimentações geradas para o pedido ${pedido?.numero_pedido||pedido?.id||''}`,tipo:'info',categoria:'Comercial',prioridade:count>0?'Normal':'Baixa',empresa_id,dados:{pedido_id:pedido?.id,movimentos_count:count,validation}});}catch(_){}}
async function handleOnPedidoCreated(base44,ctx,data,user){const validation=validatePedidoForReserva(data);const movimentos=await processReservas(base44,data,user);await auditPedidoReserva(base44,user,{pedido:data,movimentos});await emitPedidoMovementsGenerated(base44,{pedido:data,movimentos,validation});return{movimentos,validation};}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const meta = extractRequestMeta(req);

    const body = await req.json();
    const { event, data, old_data } = body || {};
    if (!event || !data) return Response.json({ ok: true, skipped: true });
    {
      const ctxErr = assertContextPresence(data, true);
      if (ctxErr) return ctxErr;
    }

    const dataEnriched = await ensureContextFields(base44, data, true);
    if ((dataEnriched as any)?.error) return dataEnriched;

    if (event.type === 'create') {
      // Permissão: editar estoque e criar movimentação
      const perm = await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
      if (perm) return perm;

      const { movimentos } = await handleOnPedidoCreated(base44, ctx, dataEnriched, user);

      await stockAudit(base44, user, {
        acao: 'Criação',
        entidade: 'MovimentacaoEstoque',
        registro_id: dataEnriched?.id || null,
        descricao: 'Movimentações geradas a partir de Pedido criado',
        empresa_id: dataEnriched?.empresa_id || null,
        dados_novos: { quantidade_movimentos: Array.isArray(movimentos) ? movimentos.length : (movimentos?.length || 0) }
      }, meta);

      // Notificação leve via helper centralizado (multiempresa)
      await emitPedidoMovementsGenerated(base44, { pedido: dataEnriched, movimentos, validation: null });

      // WhatsApp proativo: confirmação de pedido criado (multiempresa)
      try {
        const empresaId = dataEnriched?.empresa_id || null;
        const groupId = dataEnriched?.group_id || null;
        const clienteId = dataEnriched?.cliente_id || null;
        const vars = {
          cliente: dataEnriched?.cliente_nome || '',
          pedido: dataEnriched?.numero_pedido || dataEnriched?.id || '',
          valor_total: dataEnriched?.valor_total != null ? Number(dataEnriched.valor_total).toFixed(2) : ''
        };
        const internal_token = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
        await base44.asServiceRole.functions.invoke('whatsappSend', {
          action: 'sendText', empresaId, groupId, clienteId, pedidoId: dataEnriched?.id,
          templateKey: 'pedido_criado', vars, internal_token
        });
      } catch (_) {}

      // WhatsApp proativo: alerta de estoque baixo para itens do pedido (envio para admin - multiempresa)
      try {
        const itemLists = [
          ...(Array.isArray(dataEnriched?.itens_revenda) ? dataEnriched.itens_revenda : []),
          ...(Array.isArray(dataEnriched?.itens_armado_padrao) ? dataEnriched.itens_armado_padrao : []),
          ...(Array.isArray(dataEnriched?.itens_corte_dobra) ? dataEnriched.itens_corte_dobra : []),
        ];
        const produtoIds = Array.from(new Set(itemLists.map(i => i?.produto_id).filter(Boolean)));
        for (const pid of produtoIds) {
          const prod = await base44.asServiceRole.entities.Produto.filter({ id: pid }, undefined, 1).then(r => r?.[0]).catch(() => null);
          if (!prod) continue;
          const disponivelCalc = (Number(prod.estoque_atual || 0) - Number(prod.estoque_reservado || 0));
          const minimo = Number(prod.estoque_minimo || 0);
          if (minimo > 0 && disponivelCalc <= minimo) {
            const internal_token = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
            await base44.asServiceRole.functions.invoke('whatsappSend', {
              action: 'sendText',
              empresaId: dataEnriched?.empresa_id || null,
              groupId: dataEnriched?.group_id || null,
              templateKey: 'estoque_baixo',
              vars: { produto: prod.descricao || pid, disponivel: disponivelCalc, minimo },
              internal_token
            });
          }
        }
      } catch (_) {}

      // Otimização de rota logística (multiempresa) ao criar pedido
      try {
        await base44.asServiceRole.functions.invoke('optimizeDeliveryRoute', {
          pedidoId: dataEnriched?.id,
          empresa_id: dataEnriched?.empresa_id || null,
          group_id: dataEnriched?.group_id || null,
          endereco: dataEnriched?.endereco_entrega_principal || null,
          janela: {
            inicio: dataEnriched?.endereco_entrega_principal?.horario_inicio || null,
            fim: dataEnriched?.endereco_entrega_principal?.horario_fim || null
          },
          optimize: true
        });
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            acao: 'Execução', modulo: 'Expedição', tipo_auditoria: 'integracao', entidade: 'Roteirização',
            descricao: 'Rota otimizada ao criar pedido',
            empresa_id: dataEnriched?.empresa_id || null, group_id: dataEnriched?.group_id || null,
            dados_novos: { pedido_id: dataEnriched?.id }, data_hora: new Date().toISOString(), sucesso: true
          });
        } catch (_) {}
      } catch (_) {}

      // API-First: webhook e-commerce (create)
      try {
        const empresaId = dataEnriched?.empresa_id || null;
        if (empresaId) {
          const cfgList = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ chave: `integracoes_${empresaId}` }, undefined, 1);
          const cfg = cfgList?.[0]?.integracao_site || null;
          const url = cfg?.webhook_url; const secret = cfg?.shared_secret;
          if (url) {
            await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-shared-secret': secret || '' }, body: JSON.stringify({ type: 'pedido_created', empresa_id: empresaId, group_id: dataEnriched?.group_id || null, pedido: { id: dataEnriched?.id, numero_pedido: dataEnriched?.numero_pedido, valor_total: dataEnriched?.valor_total } }) });
            try { await base44.asServiceRole.entities.AuditLog.create({ usuario: user.full_name || 'Sistema', usuario_id: user.id, acao: 'Criação', modulo: 'Integrações', tipo_auditoria: 'integracao', entidade: 'site_webhook', descricao: 'Pedido criado enviado ao site', empresa_id: empresaId, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
          }
        }
      } catch (_) {}
    }

    if (event.type === 'update') {
      const prev = old_data || {};
      const novo = data;
      const statusAnt = prev.status;
      const statusNovo = novo.status;
      if (statusNovo && statusNovo !== statusAnt && /em\s*tr[âa]nsito/i.test(statusNovo)) {
        const internal_token = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
        const clienteId = novo.cliente_id || null;
        const empresaId = novo.empresa_id || null;
        const groupId = novo.group_id || null;
        const vars = { cliente: novo.cliente_nome || '', pedido: novo.numero_pedido || novo.id || '', data_prevista: novo.data_prevista_entrega || '', rastreio: novo.link_rastreamento || '' };
        try {
          await base44.asServiceRole.functions.invoke('whatsappSend', { action: 'sendText', empresaId, groupId, clienteId, pedidoId: novo.id, templateKey: 'pedido_em_transito', vars, internal_token });
        } catch (_) {}
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: user.full_name || 'Sistema', usuario_id: user.id, acao: 'Criação', modulo: 'Comercial', tipo_auditoria: 'integracao', entidade: 'WhatsApp', descricao: 'Aviso de pedido em trânsito enviado', empresa_id: empresaId, group_id: groupId, dados_novos: { pedido_id: novo.id, numero_pedido: novo.numero_pedido }, data_hora: new Date().toISOString(), sucesso: true }); } catch {}

        // API-First: webhook e-commerce (status update)
        try {
          if (empresaId) {
            const cfgList = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ chave: `integracoes_${empresaId}` }, undefined, 1);
            const cfg = cfgList?.[0]?.integracao_site || null;
            const url = cfg?.webhook_url; const secret = cfg?.shared_secret;
            if (url) {
              await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-shared-secret': secret || '' }, body: JSON.stringify({ type: 'pedido_status', empresa_id: empresaId, group_id: groupId || null, pedido: { id: novo.id, numero_pedido: novo.numero_pedido, status: statusNovo } }) });
            }
          }
        } catch (_) {}
        }

        // 2) Em Expedição / Pronto para Expedir → mensagem explícita
        if (statusNovo && statusNovo !== statusAnt && /(expedi[cç][aã]o|pronto\s*para\s*expedir)/i.test(statusNovo)) {
        const internal_token = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
        const clienteId = novo.cliente_id || null;
        const empresaId = novo.empresa_id || null;
        const groupId = novo.group_id || null;
        const mensagem = `Olá ${novo.cliente_nome || ''}! Seu pedido ${novo.numero_pedido || novo.id || ''} está em expedição.`.trim();
        try { await base44.asServiceRole.functions.invoke('whatsappSend', { action: 'sendText', empresaId, groupId, clienteId, pedidoId: novo.id, mensagem, internal_token }); } catch (_) {}
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: user.full_name || 'Sistema', usuario_id: user.id, acao: 'Criação', modulo: 'Comercial', tipo_auditoria: 'integracao', entidade: 'WhatsApp', descricao: 'Aviso de pedido em expedição enviado', empresa_id: empresaId, group_id: groupId, dados_novos: { pedido_id: novo.id, numero_pedido: novo.numero_pedido }, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
        }

        // 3) Entregue/Concluído → mensagem explícita
        if (statusNovo && statusNovo !== statusAnt && /(entregue|finalizad[oa]|conclu[ií]d[oa])/i.test(statusNovo)) {
        const internal_token = Deno.env.get('DEPLOY_AUDIT_TOKEN') || '';
        const clienteId = novo.cliente_id || null;
        const empresaId = novo.empresa_id || null;
        const groupId = novo.group_id || null;
        const mensagem = `Olá ${novo.cliente_nome || ''}! Seu pedido ${novo.numero_pedido || novo.id || ''} foi entregue. Obrigado pela preferência!`.trim();
        try { await base44.asServiceRole.functions.invoke('whatsappSend', { action: 'sendText', empresaId, groupId, clienteId, pedidoId: novo.id, mensagem, internal_token }); } catch (_) {}
        try { await base44.asServiceRole.entities.AuditLog.create({ usuario: user.full_name || 'Sistema', usuario_id: user.id, acao: 'Criação', modulo: 'Comercial', tipo_auditoria: 'integracao', entidade: 'WhatsApp', descricao: 'Aviso de pedido entregue enviado', empresa_id: empresaId, group_id: groupId, dados_novos: { pedido_id: novo.id, numero_pedido: novo.numero_pedido }, data_hora: new Date().toISOString(), sucesso: true }); } catch {}
        }
        }

        return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});