import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { processarComprovante, usuarioVinculado } from './comprovante.ts';
import { consultarSaldosPedido, lerVinculados } from './saldos.ts';
import { consultarItensEntrega, registrarItensEntrega } from './itensEntrega.ts';
import { avaliarConclusaoOP } from './saldosCalculo.ts';
const pagina = (v) => Array.isArray(v) ? v : v?.items || [];
// Inlined guard helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) {
  const user = await base44.auth.me().catch((e) => e.status === 401 ? null : Promise.reject(e));
  const perfil = user?.perfil_acesso_id ? await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id).catch((e) => e.status === 404 ? null : Promise.reject(e)) : null;
  return { user, perfil };
}
function _normAct(a) { if (!a) return 'visualizar'; const s = String(a).toLowerCase(); const map = { ver:'visualizar',view:'visualizar',read:'visualizar',listar:'visualizar',status:'visualizar',delete:'excluir',remove:'excluir',destroy:'excluir',apagar:'excluir',cancel:'cancelar',cancelar:'cancelar',create:'criar',add:'criar',emitir:'criar',enviar:'criar',update:'editar',edit:'editar',carta:'editar',corrigir:'editar',approve:'aprovar',aprovar:'aprovar',export:'exportar',exportar:'exportar' }; return map[s]||s; }
function backendHasPermission(perfil,m,sec,act='visualizar',role=null){if(role==='admin')return true;const perms=perfil?.permissoes;if(!perms)return false;const desired=_normAct(act);const modNode=perms[m];if(!modNode)return false;if(!sec)return Object.values(modNode).some(n=>{if(Array.isArray(n))return n.includes(desired)||(desired==='visualizar'&&n.includes('ver'));if(n&&typeof n==='object')return Object.values(n).some(v=>Array.isArray(v)&&(v.includes(desired)||(desired==='visualizar'&&v.includes('ver'))));return false;});const path=Array.isArray(sec)?sec:String(sec).split('.').filter(Boolean);let cursor=modNode;for(let i=0;i<path.length;i++){if(cursor==null)return false;cursor=cursor[path[i]];}if(!cursor)return false;if(Array.isArray(cursor))return cursor.includes(desired)||(desired==='visualizar'&&cursor.includes('ver'));if(typeof cursor==='object'){const stack=[cursor];while(stack.length){const node=stack.pop();if(Array.isArray(node)){if(node.includes(desired)||(desired==='visualizar'&&node.includes('ver')))return true;}else if(node&&typeof node==='object')Object.values(node).forEach(v=>stack.push(v));}}return false;}
async function assertPermission(base44,{user,perfil},m,sec,act){const allowed=backendHasPermission(perfil,m,sec,act,user?.role||null);if(!allowed){try{await base44.asServiceRole.entities.AuditLog.create({usuario:user?.full_name||user?.email||'Usuário',usuario_id:user?.id,acao:'Bloqueio',modulo:m,entidade:Array.isArray(sec)?sec.join('.'):(sec||'-'),descricao:`Ação negada no backend: ${m}/${sec||'-'} → ${act}`,data_hora:new Date().toISOString()});}catch(auditErr){console.error('AuditLog falhou em assertPermission (onEntregaUpdated):',auditErr);}return Response.json({error:'Forbidden'},{status:403});}return null;}
async function audit(base44, user, { acao = 'Edição', modulo = 'Expedição', entidade = 'Entrega', registro_id = null, descricao = '', dados_anteriores = null, dados_novos = null, group_id = null, empresa_id = null }) {
  await base44.asServiceRole.entities.AuditLog.create({
    usuario: user.full_name || user.email, usuario_id: user.id,
    acao: acao === 'Erro' ? 'Edição' : acao, modulo, entidade, registro_id, descricao,
    group_id, empresa_id, dados_anteriores, dados_novos,
    tipo_auditoria: acao === 'Bloqueio' ? 'seguranca' : 'entidade',
    sucesso: !['Erro', 'Bloqueio'].includes(acao), data_hora: new Date().toISOString(),
  });
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (body?.acao === 'consultar_saldos_pedido') return await consultarSaldosPedido(base44, ctx, body);
    // §23 — itens efetivamente entregues (saldo oficial bloqueia excesso na gravação).
    if (body?.acao === 'consultar_itens_entrega') return await consultarItensEntrega(base44, ctx, body);
    if (body?.acao === 'registrar_itens_entrega') return await registrarItensEntrega(base44, ctx, body);
    if (body?.acao) return await processarComprovante(base44, ctx, body);
    const { event, data: payload, old_data } = body || {};
    if (!event || event.type !== 'update' || !payload) return Response.json({ ok: true, skipped: true });
    if (![payload.id, payload.group_id, payload.empresa_id].every((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id))) return Response.json({ error: 'Entrega, grupo e empresa válidos são obrigatórios.' }, { status: 400 });
    const contexto = { group_id: payload.group_id, empresa_id: payload.empresa_id };
    if (user.bloqueado || (user.role !== 'admin' && !usuarioVinculado(ctx, contexto.group_id, contexto.empresa_id))) {
      await audit(base44, user, { ...contexto, acao: 'Bloqueio', registro_id: payload.id, descricao: 'Evento de entrega recusado: usuário bloqueado ou sem vínculo com o grupo/empresa.' });
      return Response.json({ error: 'Evento de entrega exige usuário ativo com vínculo ao grupo/empresa.' }, { status: 403 });
    }
    // O evento identifica a entrega. Situação, valores, pedido e OP são sempre relidos.
    const [entregas, empresas] = await Promise.all([
      base44.entities.Entrega.filter({ id: payload.id, ...contexto }, { limit: 1 }),
      base44.entities.Empresa.filter({ id: contexto.empresa_id, group_id: contexto.group_id }, { limit: 1 }),
    ]);
    const data = pagina(entregas)[0];
    if (!data || !pagina(empresas).length) return Response.json({ error: 'Entrega ou empresa não encontrada neste grupo.' }, { status: 404 });
    const registrar = (campos) => audit(base44, user, { ...contexto, registro_id: data.id, dados_anteriores: data, ...campos });
    if (payload.status !== data.status || (payload.updated_date && payload.updated_date !== data.updated_date)) {
      await registrar({ acao: 'Bloqueio', descricao: 'Evento desatualizado ou situação divergente do registro oficial.' });
      return Response.json({ error: 'A entrega mudou; evento desatualizado não executa efeitos operacionais.' }, { status: 409 });
    }
    if (!data.status || data.status === old_data?.status) return Response.json({ ok: true, skipped: true });
    let pedido = null;
    if (data.pedido_id) {
      if (typeof data.pedido_id !== 'string' || !/^[a-f\d]{24}$/i.test(data.pedido_id)) return Response.json({ error: 'Vínculo do pedido inválido.' }, { status: 422 });
      pedido = pagina(await base44.entities.Pedido.filter({ id: data.pedido_id, ...contexto }, { limit: 1 }))[0];
      if (!pedido) return Response.json({ error: 'Pedido da entrega indisponível neste contexto.' }, { status: 422 });
    }
    const results = { contas_pagar_criadas: [], movimentos_estoque: [], ops_concluidas: [], ops_pendentes: [] };

    // 1) Confirmação de entrega -> opcional ContaPagar do frete
    if (data.status === 'Entregue') {
      const frete = Number(data?.valor_frete || 0);
      const transportadoraNome = data?.transportadora || null;
      const transportadoraId = data?.transportadora_id || null;

      // Conta de frete a pagar (service role; RBAC verificado via guard)
      // Cada efeito respeita a permissão do próprio domínio; um domínio sem permissão não bloqueia os demais.
      const podeFrete = frete > 0 && (transportadoraId || transportadoraNome)
        && !(await assertPermission(base44, ctx, 'Financeiro', 'ContaPagar', 'criar'));
      if (podeFrete) {
        // tenta localizar CC e Plano de Contas padrão para logística
        let centroId = null; let planoId = null;
        try {
          const ccs = await base44.asServiceRole.entities.CentroCusto.filter({ descricao: 'Logística', ...contexto }, { limit: 1 });
          centroId = pagina(ccs)[0]?.id || null;
        } catch (e) { console.error('[onEntregaUpdated] catch:', e); }
        try {
          const pcs = await base44.asServiceRole.entities.PlanoDeContas.filter({ descricao: 'Frete', ...contexto }, { limit: 1 });
          planoId = pagina(pcs)[0]?.id || null;
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
            await registrar({ acao: 'Erro', modulo: 'Financeiro', entidade: 'ContaPagar', descricao: `Falha ao criar frete: ${e.message}` });
          }
        } else {
          await registrar({ acao: 'Visualização', modulo: 'Financeiro', entidade: 'ContaPagar', descricao: 'Sem CC/Plano padrão para frete; não foi criada ContaPagar.' });
        }
      }

      // Baixa final de estoque (saída genérica quando aplicável)
      try {
        const podeEstoque = !(await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar'));
        // evita duplicidade: se já houver movimento para esta entrega, não recriar
        let jaExiste = false;
        try {
          const existentes = await base44.asServiceRole.entities.MovimentacaoEstoque.filter({ origem_documento_id: data.id, ...contexto }, { limit: 1 });
          jaExiste = pagina(existentes).length > 0;
        } catch (e) { console.error('[onEntregaUpdated] catch:', e); }
        if (podeEstoque && !jaExiste) {
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
        await registrar({ acao: 'Erro', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', descricao: `Falha baixa por entrega: ${e.message}` });
      }

      // §23: entrega parcial não conclui todas as OPs do pedido.
      const podeProducao = Boolean(pedido) && !(await assertPermission(base44, ctx, 'Produção', 'OrdemProducao', 'editar'));
      if (podeProducao) {
        const filtro = { ...contexto, pedido_id: pedido.id };
        const api = base44.asServiceRole.entities;
        const ops = await lerVinculados(api.OrdemProducao, { ...filtro, status: 'Pronto para Expedição' });
        if (ops.length) {
          const entregasPedido = await lerVinculados(api.Entrega, filtro);
          const itensEntrega = await lerVinculados(api.EntregaItens, {
            ...contexto, $or: [{ pedido_id: pedido.id }, { entrega_id: { $in: entregasPedido.map((e) => e.id) } }],
          });
          // Segunda conferência em lote; atualizações individuais preservam os gatilhos existentes.
          const atuais = new Map((await lerVinculados(api.OrdemProducao, { ...filtro, status: 'Pronto para Expedição' })).map((op) => [op.id, op]));
          const candidatas = [];
          for (const op of ops) {
            const avaliacao = avaliarConclusaoOP(pedido, op, entregasPedido, itensEntrega);
            if (!avaliacao.pode_concluir || atuais.get(op.id)?.updated_date !== op.updated_date) {
              results.ops_pendentes.push({ op_id: op.id, motivo: !avaliacao.pode_concluir ? avaliacao.motivo : 'OP alterada durante a conferência; reprocessamento necessário.' });
            } else candidatas.push(op);
          }
          for (let inicio = 0; inicio < candidatas.length; inicio += 6) {
            await Promise.all(candidatas.slice(inicio, inicio + 6).map(async (op) => {
              const dataHora = new Date().toISOString();
              const depois = await api.OrdemProducao.update(op.id, {
                status: 'Concluída', data_conclusao_real: dataHora,
                historico_mudancas_status: [...(op.historico_mudancas_status || []), {
                  data_hora: dataHora, status_anterior: op.status, status_novo: 'Concluída',
                  usuario: user.full_name || user.email,
                  motivo: `Atendimento integral por item comprovado nas entregas/retiradas do pedido ${pedido.numero_pedido || pedido.id}.`,
                }],
              });
              await registrar({ acao: 'Edição', modulo: 'Produção', entidade: 'OrdemProducao', registro_id: op.id,
                descricao: 'OP concluída somente após atendimento integral e verificável por item.', dados_anteriores: op, dados_novos: depois });
              results.ops_concluidas.push(op.id);
            }));
          }
          if (results.ops_pendentes.length) await registrar({ acao: 'Visualização', modulo: 'Produção',
            descricao: 'OPs preservadas: atendimento parcial, vínculo não verificável ou alteração concorrente.', dados_novos: { ops_pendentes: results.ops_pendentes } });
        }
      }

      await registrar({ acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: data.id, descricao: 'Entrega confirmada (gatilho financeiro/estoque/produção)' });
    }

    // 2) Logística reversa -> entrada em estoque
    if (data.status === 'Devolvido' || data?.logistica_reversa?.ativada) {
      // Estoque: entrada por devolução
      try {
        const podeEstoque = !(await assertPermission(base44, ctx, 'Estoque', 'MovimentacaoEstoque', 'criar'));
        const qty = podeEstoque ? Number(data?.logistica_reversa?.quantidade_devolvida || 0) : 0;
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
        await registrar({ acao: 'Erro', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', descricao: `Falha entrada reversa: ${e.message}` });
      }

      // Financeiro: cancelar cobranças pendentes do pedido (se houver)
      try {
        const podeCancelar = !(await assertPermission(base44, ctx, 'Financeiro', 'ContaReceber', 'editar'));
        if (podeCancelar && data?.pedido_id) {
          const titulos = await lerVinculados(base44.asServiceRole.entities.ContaReceber, { ...contexto, pedido_id: data.pedido_id, status: 'Pendente' });
          for (const t of (titulos || [])) {
            await base44.asServiceRole.entities.ContaReceber.update(t.id, {
              status: 'Cancelado',
              observacoes: `Cancelado por logística reversa da entrega ${data.id}`
            });
          }
          if ((titulos || []).length) {
            await registrar({ acao: 'Edição', modulo: 'Financeiro', entidade: 'ContaReceber', descricao: `Cancelados ${(titulos||[]).length} títulos pendentes do pedido por devolução` });
          }
        }
      } catch (e) {
        await registrar({ acao: 'Erro', modulo: 'Financeiro', entidade: 'ContaReceber', descricao: `Falha ao cancelar CR por devolução: ${e.message}` });
      }

      await registrar({ acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: data.id, descricao: 'Logística Reversa processada' });
    }

    return Response.json({ ok: true, ...results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}