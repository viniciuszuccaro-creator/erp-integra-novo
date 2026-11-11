import { readFileSync } from 'fs';
import { join } from 'path';

// Executa o código de produção com fontes controladas; não grava dados reais.
export default async function testConclusaoEntrega(log, root) {
  const ler = (p) => readFileSync(join(root, 'base44/functions/onEntregaUpdated', p), 'utf-8');
  const url = (s) => `data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
  const calcUrl = url(ler('saldosCalculo.ts')), comprovanteUrl = url(ler('comprovante.ts'));
  const saldosUrl = url(ler('saldos.ts').replace("'./saldosCalculo.ts'", JSON.stringify(calcUrl)).replace("'./comprovante.ts'", JSON.stringify(comprovanteUrl)));
  const endpoint = (await import(url(ler('entry.ts')
    .replace("import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';", 'const createClientFromRequest = () => globalThis.__entregaCliente;')
    .replace("'./saldosCalculo.ts'", JSON.stringify(calcUrl)).replace("'./saldos.ts'", JSON.stringify(saldosUrl)).replace("'./comprovante.ts'", JSON.stringify(comprovanteUrl))))).default;
  const { avaliarConclusaoOP } = await import(calcUrl);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const check = (nome, ok) => log(ok ? 'pass' : 'fail', `Entrega/Produção 360: ${nome}`);
  const contexto = { group_id: '222222222222222222222222', empresa_id: '333333333333333333333333' };
  const pedido = { ...contexto, id: '111111111111111111111111', updated_date: 'p1', numero_pedido: 'PED-000001', status: 'Em Produção', itens_revenda: [{ produto_id: 'revenda', quantidade: 2, unidade: 'UN' }], itens_armado_padrao: [{ produto_id: 'fabricado', quantidade: 10, unidade: 'PC' }] };
  const op = { ...contexto, id: '444444444444444444444444', pedido_id: pedido.id, updated_date: 'op1', status: 'Pronto para Expedição', itens_vinculados: [{ pedido_id: pedido.id, item_id: 'armado-0', quantidade: 10, unidade: 'PC' }], historico_mudancas_status: [{ status_novo: 'Pronto para Expedição' }] };
  const entrega = { ...contexto, id: '555555555555555555555555', pedido_id: pedido.id, status: 'Entregue', updated_date: 'e1', valor_frete: 0 };
  const segunda = { ...entrega, id: '666666666666666666666666', tipo_frete: 'Retira', updated_date: 'e2' };
  const linha = { ...contexto, id: '777777777777777777777777', entrega_id: entrega.id, pedido_id: pedido.id, pedido_item_id: 'armado-0', op_id: op.id, quantidade: 4, unidade: 'PC' };
  const restante = { ...linha, id: '888888888888888888888888', entrega_id: segunda.id, quantidade: 6 };
  const avaliar = (mudancas = {}) => avaliarConclusaoOP(mudancas.pedido || pedido, mudancas.op || op, mudancas.entregas || [entrega, segunda], mudancas.linhas || [linha, restante]);
  check('entrega e retirada cumulativas completam os itens da OP', avaliar().pode_concluir);
  check('primeira entrega parcial preserva a OP', !avaliar({ linhas: [linha] }).pode_concluir);
  check('entrega cancelada não conta como atendimento', !avaliar({ entregas: [entrega, { ...segunda, status: 'Cancelado' }] }).pode_concluir);
  check('entrega em trânsito não conta', !avaliar({ entregas: [entrega, { ...segunda, status: 'Em Trânsito' }] }).pode_concluir);
  check('vínculo com outra OP não preenche o saldo', !avaliar({ linhas: [linha, { ...restante, op_id: 'outra' }] }).pode_concluir);
  check('produto sem identificação da OP não prova atendimento', !avaliar({ linhas: [{ ...linha, op_id: null }, { ...restante, op_id: null }] }).pode_concluir);
  check('vínculo explícito na entrega é aceito quando a linha não tem OP', avaliar({ entregas: [{ ...entrega, op_id: op.id }, { ...segunda, op_id: op.id }], linhas: [{ ...linha, op_id: null }, { ...restante, op_id: null }] }).pode_concluir);
  check('vínculos contraditórios da entrega são bloqueados', !avaliar({ entregas: [{ ...entrega, op_id: 'outra' }, segunda] }).pode_concluir);
  check('excesso de quantidade não conclui silenciosamente', !avaliar({ linhas: [linha, { ...restante, quantidade: 7 }] }).pode_concluir);
  check('unidades incompatíveis não são somadas', !avaliar({ linhas: [linha, { ...restante, unidade: 'KG' }] }).pode_concluir);
  for (const quantidade of [null, 0, -1, true, 'inválida', '']) check(`quantidade inválida ${JSON.stringify(quantidade)} é recusada`, !avaliar({ linhas: [linha, { ...restante, quantidade }] }).pode_concluir);
  check('KG de progresso não substituem a evidência por item', !avaliar({ op: { ...op, progresso_fisico_kg: 100 }, linhas: [] }).pode_concluir);
  check('OP sem itens permanece pendente', !avaliar({ op: { ...op, itens_vinculados: [] } }).pode_concluir);
  check('OP de outra empresa não é concluída', !avaliar({ op: { ...op, empresa_id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } }).pode_concluir);
  check('OP com outro pedido exige resolução pelo módulo proprietário', !avaliar({ op: { ...op, itens_vinculados: [{ ...op.itens_vinculados[0], pedido_id: 'outro' }] } }).pode_concluir);
  check('evidência de outra empresa não é somada', !avaliar({ linhas: [linha, { ...restante, empresa_id: 'aaaaaaaaaaaaaaaaaaaaaaaa' }] }).pode_concluir);
  check('pedido cancelado não avança a produção', !avaliar({ pedido: { ...pedido, status: 'Cancelado' } }).pode_concluir);
  check('OP com quantidade maior que o pedido é recusada', !avaliar({ op: { ...op, itens_vinculados: [{ ...op.itens_vinculados[0], quantidade: 11 }] } }).pode_concluir);
  check('item explícito incorreto não usa fallback de produto', !avaliar({ linhas: [linha, { ...restante, pedido_item_id: 'inexistente', produto_id: 'fabricado' }] }).pode_concluir);
  const unitario = { ...op, itens_vinculados: [{ ...op.itens_vinculados[0], quantidade: 4 }] };
  check('OP parcial do pedido conclui somente sua própria quantidade', avaliar({ op: unitario, linhas: [linha] }).pode_concluir);
  const repetido = { ...pedido, itens_armado_padrao: [...pedido.itens_armado_padrao, { ...pedido.itens_armado_padrao[0] }] };
  check('produto repetido exige identidade de item', !avaliar({ pedido: repetido, linhas: [{ ...linha, pedido_item_id: null, produto_id: 'fabricado' }, { ...restante, pedido_item_id: null, produto_id: 'fabricado' }] }).pode_concluir);

  const matches = (r, q) => Object.entries(q).every(([k, v]) => k === '$or' ? v.some((f) => matches(r, f)) : v && typeof v === 'object' && '$in' in v ? v.$in.includes(r[k]) : r[k] === v);
  const nova = (completa = false, opcoes = {}) => {
    const estado = { usuario: { id: '999999999999999999999999', role: 'admin', full_name: 'Operador de teste' }, logs: [], consultas: [], alteracoes: [], paginasOp: 0, concorrente: false };
    const registros = {
      Empresa: [{ id: contexto.empresa_id, group_id: contexto.group_id }], Pedido: [clone(pedido)],
      Entrega: clone(completa ? [entrega, segunda] : [entrega]),
      EntregaItens: clone(completa ? [linha, restante] : [linha]),
      OrdemProducao: [clone(op), { ...clone(op), id: 'aaaaaaaaaaaaaaaaaaaaaaaa', empresa_id: 'bbbbbbbbbbbbbbbbbbbbbbbb' }],
      MovimentacaoEstoque: [{ ...contexto, id: 'cccccccccccccccccccccccc', origem_documento_id: entrega.id }], ContaReceber: [], CentroCusto: [], PlanoDeContas: [],
    };
    const api = {};
    for (const nome of Object.keys(registros)) api[nome] = {
      filter: async (filtro, opcoes = {}) => {
        estado.consultas.push({ nome, filtro: clone(filtro), opcoes: clone(opcoes) });
        if (nome === 'OrdemProducao' && !opcoes.cursor && ++estado.paginasOp === 2 && estado.concorrente) registros.OrdemProducao[0].updated_date = 'op-alterada';
        const encontrados = registros[nome].filter((r) => matches(r, filtro));
        const inicio = Number(opcoes.cursor || 0), limite = 1;
        return { items: clone(encontrados.slice(inicio, inicio + limite)), has_more: encontrados.length > inicio + limite, next_cursor: String(inicio + limite) };
      },
      create: async (dados) => { estado.alteracoes.push({ nome, dados: clone(dados) }); const r = { ...clone(dados), id: 'dddddddddddddddddddddddd' }; registros[nome].push(r); return r; },
      update: async (id, dados) => {
        estado.alteracoes.push({ nome, id, dados: clone(dados) });
        const r = registros[nome].find((v) => v.id === id); Object.assign(r, clone(dados), { updated_date: 'nova-versao' }); return clone(r);
      },
    };
    api.AuditLog = { create: async (dados) => { estado.logs.push(clone(dados)); return dados; } };
    api.PerfilAcesso = { get: async () => opcoes.perfil || null };
    if (opcoes.usuario) estado.usuario = clone(opcoes.usuario);
    const client = { auth: { me: async () => estado.usuario }, entities: api, asServiceRole: { entities: api } };
    return { client, estado, registros };
  };
  const entrada = { event: { type: 'update' }, data: { id: entrega.id, ...contexto, status: 'Entregue', updated_date: entrega.updated_date }, old_data: { status: 'Em Trânsito' } };
  const chamar = (fonte, body = entrada) => {
    globalThis.__entregaCliente = fonte.client;
    return endpoint(new Request('https://teste.local', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }));
  };
  const parcial = nova(); const respParcial = await chamar(parcial), dadoParcial = await respParcial.json();
  check('evento parcial retorna OP pendente sem alterar produção', respParcial.status === 200 && dadoParcial.ops_concluidas.length === 0 && dadoParcial.ops_pendentes.length === 1 && parcial.estado.alteracoes.length === 0);
  const completa = nova(true); const respCompleta = await chamar(completa), dadoCompleto = await respCompleta.json();
  check('evento de atendimento integral conclui somente a OP da empresa', respCompleta.status === 200 && dadoCompleto.ops_concluidas[0] === op.id && completa.estado.alteracoes.length === 1 && completa.registros.OrdemProducao[1].status === 'Pronto para Expedição');
  check('histórico original é preservado', completa.registros.OrdemProducao[0].historico_mudancas_status.length === 2);
  check('auditoria da conclusão tem antes/depois e contexto', completa.estado.logs.some((l) => l.entidade === 'OrdemProducao' && l.group_id === contexto.group_id && l.empresa_id === contexto.empresa_id && l.dados_anteriores.status === 'Pronto para Expedição' && l.dados_novos.status === 'Concluída'));
  check('fontes são paginadas sem truncar as entregas', completa.estado.consultas.some((c) => c.nome === 'EntregaItens' && c.opcoes.cursor));
  check('todas as leituras mantêm grupo/empresa explícitos', completa.estado.consultas.every((c) => c.filtro.group_id === contexto.group_id && (c.nome === 'Empresa' || c.filtro.empresa_id === contexto.empresa_id)));
  await chamar(completa);
  check('reprocessamento não conclui novamente a OP', completa.estado.alteracoes.length === 1);
  const concorrente = nova(true); concorrente.estado.concorrente = true;
  const dadosConcorrentes = await (await chamar(concorrente)).json();
  check('mudança de versão na segunda conferência preserva a OP', concorrente.estado.alteracoes.length === 0 && dadosConcorrentes.ops_pendentes[0].motivo.includes('alterada'));
  for (const [nome, ajustar, body, status] of [
    ['anônimo', (f) => { f.estado.usuario = null; }, entrada, 401],
    ['usuário comum', (f) => { f.estado.usuario.role = 'user'; }, entrada, 403],
    ['administrador bloqueado', (f) => { f.estado.usuario.bloqueado = true; }, entrada, 403],
    ['contexto malicioso', () => {}, { ...entrada, data: { ...entrada.data, group_id: { $ne: null } } }, 400],
    ['outra empresa', () => {}, { ...entrada, data: { ...entrada.data, empresa_id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } }, 404],
    ['entrega inexistente', () => {}, { ...entrada, data: { ...entrada.data, id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } }, 404],
    ['versão antiga', () => {}, { ...entrada, data: { ...entrada.data, updated_date: 'antiga' } }, 409],
    ['situação adulterada', (f) => { f.registros.Entrega[0].status = 'Cancelado'; }, entrada, 409],
    ['pedido fora do contexto', (f) => { f.registros.Pedido[0].empresa_id = 'aaaaaaaaaaaaaaaaaaaaaaaa'; }, entrada, 422],
  ]) {
    const caso = nova(true); ajustar(caso);
    check(`${nome} é bloqueado antes dos efeitos`, (await chamar(caso, body)).status === status && caso.estado.alteracoes.length === 0);
  }
  const adulterado = nova(true);
  await chamar(adulterado, { ...entrada, data: { ...entrada.data, pedido_id: 'aaaaaaaaaaaaaaaaaaaaaaaa', valor_frete: 999999, op_id: 'aaaaaaaaaaaaaaaaaaaaaaaa' } });
  check('pedido, OP e frete do payload não substituem os dados oficiais', adulterado.estado.alteracoes.length === 1 && adulterado.estado.alteracoes[0].id === op.id);
  const vinculadoSemPermissao = nova(true, { usuario: { id: 'bbbbbbbbbbbbbbbbbbbbbbbb', role: 'user', full_name: 'Entregador', empresas_vinculadas: [contexto.empresa_id] } });
  const respostaSemPermissao = await chamar(vinculadoSemPermissao);
  const dadosSemPermissao = await respostaSemPermissao.json();
  check('usuário vinculado sem permissão não recebe 403 nem efeitos indevidos', respostaSemPermissao.status === 200 && vinculadoSemPermissao.estado.alteracoes.length === 0 && dadosSemPermissao.ops_concluidas.length === 0);
  const comProducao = nova(true, {
    usuario: { id: 'cccccccccccccccccccccccc', role: 'user', full_name: 'Apontador', empresa_id: contexto.empresa_id, perfil_acesso_id: 'dddddddddddddddddddddddd', empresas_vinculadas: [contexto.empresa_id] },
    perfil: { ativo: true, permissoes: { 'Produção': { OrdemProducao: ['editar'] } } },
  });
  const respostaProducao = await chamar(comProducao); const dadosProducao = await respostaProducao.json();
  check('permissão de produção conclui a OP sem liberar estoque ou financeiro', respostaProducao.status === 200 && dadosProducao.ops_concluidas[0] === op.id && comProducao.estado.alteracoes.length === 1);
  const semMudanca = nova(true);
  const repetidoEvento = await (await chamar(semMudanca, { ...entrada, old_data: { status: 'Entregue' } })).json();
  check('evento sem mudança de situação não executa efeitos', repetidoEvento.skipped && semMudanca.estado.alteracoes.length === 0);
  delete globalThis.__entregaCliente;
}