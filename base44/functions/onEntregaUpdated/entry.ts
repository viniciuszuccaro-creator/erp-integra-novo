import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) { const user = await base44.auth.me().catch(() => null); let perfil = null; try { if (user?.perfil_acesso_id) perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id); } catch (permErr) { console.error('PerfilAcesso fetch falhou (onEntregaUpdated):', permErr); } return { user, perfil }; }
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em assertPermission (onEntregaUpdated):',auditErr);}return Response.json({error:'Forbidden'},{status:403});}return null;}
async function audit(base44,user,{acao='Ação',modulo='Sistema',entidade='-',registro_id=null,descricao='',dados_novos=null,empresa_id=null,empresa_nome=null,duracao_ms=null},meta=null){try{const pd=(dados_novos&&typeof dados_novos==='object')?{...dados_novos}:{};if(meta)pd._meta=meta;await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Sistema',usuario_id:user?.id,acao,modulo,entidade,registro_id,descricao,empresa_id:empresa_id||null,empresa_nome:empresa_nome||null,duracao_ms:typeof duracao_ms==='number'?duracao_ms:null,dados_novos:Object.keys(pd).length?pd:null,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em audit (onEntregaUpdated):',auditErr);}}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { event, data, old_data } = body || {};
    if (!event || event.type !== 'update' || !data) return Response.json({ ok: true, skipped: true });

    const statusChanged = data?.status && data?.status !== old_data?.status;
    if (!statusChanged) return Response.json({ ok: true, skipped: true });

    const results = { contas_pagar_criadas: [], movimentos_estoque: [] };

    // 1) Confirmação de entrega -> opcional ContaPagar do frete
    if (data.status === 'Entregue') {
      const frete = Number(data?.valor_frete || 0);
      const transportadoraNome = data?.transportadora || null;
      const transportadoraId = data?.transportadora_id || null;

      // Conta de frete a pagar (service role; RBAC verificado via guard)
      if (frete > 0 && (transportadoraId || transportadoraNome)) {
        await assertPermission(base44, ctx, 'Financeiro', 'ContaPagar', 'criar');
        // tenta localizar CC e Plano de Contas padrão para logística
        let centroId = null; let planoId = null;
        try {
          const ccs = await base44.asServiceRole.entities.CentroCusto.filter({ descricao: 'Logística', empresa_id: data.empresa_id });
          centroId = ccs?.[0]?.id || null;
        } catch (e) { console.error('[onEntregaUpdated] catch:', e); }
        try {
          const pcs = await base44.asServiceRole.entities.PlanoDeContas.filter({ descricao: 'Frete', empresa_id: data.empresa_id });
          planoId = pcs?.[0]?.id || null;
        } catch (e) { console.error('[onEntregaUpdated] catch:', e); }

        if (centroId && planoId) {
          try {
            const conta = await base44.asServiceRole.entities.ContaPagar.create({
              descricao: `Frete entrega pedido ${data?.numero_pedido || ''}`.trim(),
              fornecedor: transportadoraNome || 'Transportadora',
              fornecedor_id: transportadoraId || undefined,
              valor: frete,
              data_emissao: new Date().toISOString().slice(0,10),
              data_vencimento: new Date().toISOString().slice(0,10),
              status: 'Pendente',
              status_pagamento: 'Pendente',
              forma_pagamento: 'Boleto',
              empresa_id: data?.empresa_id || null,
              group_id: data?.group_id || null,
              centro_custo_id: centroId,
              plano_contas_id: planoId,
              observacoes: 'Gerada automaticamente na confirmação de entrega'
            });
            results.contas_pagar_criadas.push(conta?.id);
          } catch (e) {
            await audit(base44, user, { acao: 'Erro', modulo: 'Financeiro', entidade: 'ContaPagar', descricao: `Falha ao criar frete: ${e.message}` });
          }
        } else {
          await audit(base44, user, { acao: 'Visualização', modulo: 'Financeiro', entidade: 'ContaPagar', descricao: 'Sem CC/Plano padrão para frete; não foi criada ContaPagar.' });
        }
      }

      // Baixa final de estoque (saída genérica quando aplicável)
      try {
        await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
        // evita duplicidade: se já houver movimento para esta entrega, não recriar
        let jaExiste = false;
        try {
          const existentes = await base44.asServiceRole.entities.MovimentacaoEstoque.filter({ origem_documento_id: data.id }, '-created_date', 1);
          jaExiste = Array.isArray(existentes) && existentes.length > 0;
        } catch (e) { console.error('[onEntregaUpdated] catch:', e); }
        if (!jaExiste) {
          const qtyKg = Number(data?.peso_total_kg || 0);
          const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create({
            origem_movimento: 'pedido',
            origem_documento_id: data.id,
            documento: data?.numero_pedido || undefined,
            tipo_movimento: 'saida',
            produto_descricao: `Baixa por Entrega do Pedido ${data?.numero_pedido || ''}`.trim(),
            quantidade: qtyKg > 0 ? qtyKg : 1,
            unidade_medida: qtyKg > 0 ? 'KG' : 'UN',
            empresa_id: data?.empresa_id || null,
            group_id: data?.group_id || null,
            data_movimentacao: new Date().toISOString(),
            motivo: `Entrega ${data?.id} confirmada`,
            responsavel: user?.full_name || user?.email,
            responsavel_id: user?.id
          });
          results.movimentos_estoque.push(mov?.id);
        }
      } catch (e) {
        await audit(base44, user, { acao: 'Erro', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', descricao: `Falha baixa por entrega: ${e.message}` });
      }

      await audit(base44, user, { acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: data.id, descricao: 'Entrega confirmada (gatilho financeiro/estoque)' });
    }

    // 2) Logística reversa -> entrada em estoque
    if (data.status === 'Devolvido' || data?.logistica_reversa?.ativada) {
      // Estoque: entrada por devolução
      try {
        await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar');
        const qty = Number(data?.logistica_reversa?.quantidade_devolvida || 0);
        const val = Number(data?.logistica_reversa?.valor_devolvido || 0);
        if (qty > 0) {
          const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create({
            origem_movimento: 'devolucao',
            origem_documento_id: data.id,
            tipo_movimento: 'entrada',
            produto_id: data?.logistica_reversa?.produto_id || null,
            produto_descricao: data?.logistica_reversa?.motivo || 'Logística Reversa',
            quantidade: qty,
            unidade_medida: 'UN',
            empresa_id: data?.empresa_id || null,
            group_id: data?.group_id || null,
            data_movimentacao: new Date().toISOString(),
            motivo: `Logística Reversa da Entrega ${data?.id}`,
            valor_total: val,
            responsavel: user?.full_name || user?.email,
            responsavel_id: user?.id
          });
          results.movimentos_estoque.push(mov?.id);
        }
      } catch (e) {
        await audit(base44, user, { acao: 'Erro', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', descricao: `Falha entrada reversa: ${e.message}` });
      }

      // Financeiro: cancelar cobranças pendentes do pedido (se houver)
      try {
        if (data?.pedido_id) {
          const titulos = await base44.asServiceRole.entities.ContaReceber.filter({ pedido_id: data.pedido_id, status: 'Pendente' });
          for (const t of (titulos || [])) {
            await base44.asServiceRole.entities.ContaReceber.update(t.id, {
              status: 'Cancelado',
              observacoes: `Cancelado por logística reversa da entrega ${data.id}`
            });
          }
          if ((titulos || []).length) {
            await audit(base44, user, { acao: 'Edição', modulo: 'Financeiro', entidade: 'ContaReceber', descricao: `Cancelados ${(titulos||[]).length} títulos pendentes do pedido por devolução` });
          }
        }
      } catch (e) {
        await audit(base44, user, { acao: 'Erro', modulo: 'Financeiro', entidade: 'ContaReceber', descricao: `Falha ao cancelar CR por devolução: ${e.message}` });
      }

      await audit(base44, user, { acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: data.id, descricao: 'Logística Reversa processada' });
    }

    return Response.json({ ok: true, ...results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});