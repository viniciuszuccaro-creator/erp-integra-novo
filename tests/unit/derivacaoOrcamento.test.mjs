import { carregarCentral360, criarFonteDerivacao } from './central360Fixtures.mjs';

// Testa o código de produção com fontes controladas, sem tocar os dados do ERP.
export default async function testDerivacaoOrcamento(log, root) {
  const { endpoint, montarDerivacao, reservarNumeroDocumento } = await carregarCentral360(root);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const check = (nome, ok) => log(ok ? 'pass' : 'fail', `Derivação 360: ${nome}`);
  const base = { id: '111111111111111111111111', group_id: '222222222222222222222222', empresa_id: '333333333333333333333333', cliente_id: '444444444444444444444444', cliente_nome: 'Cliente de teste', numero_orcamento: 'ORC-0999', status: 'Pendente', updated_date: 'v1', condicoes_pagamento: 'À Vista', prazo_entrega: '7 dias úteis', valor_total: 78, itens: [{ produto_id: '555555555555555555555555', descricao: 'Revenda', quantidade: 2, unidade: 'UN', valor_unitario: 10, desconto_percentual: 10, valor_total: 18 }, { produto_id: '666666666666666666666666', descricao: 'Fabricação', tipo: 'fabricacao', quantidade: 3, unidade: 'UN', valor_unitario: 20, valor_total: 60 }] };
  const user = { id: '777777777777777777777777', role: 'admin', full_name: 'Operador de teste' };
  const entrada = { acao: 'duplicar', orcamento_id: base.id, group_id: base.group_id, empresa_id: base.empresa_id, versao: 'v1', operacao_id: '11111111-1111-4111-8111-111111111111', revisado: true, indices: [] };
  const chamar = async (fonte, body = entrada) => {
    globalThis.__central360Cliente = fonte.client;
    return endpoint(new Request('https://teste.local', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }));
  };
  const nova = (opcoes) => criarFonteDerivacao(base, user, opcoes);
  const copia = nova();
  const r = await chamar(copia), dados = await r.json();
  check('duplicação cria uma proposta pendente com número reservado no servidor', r.status === 200 && dados.novo_orcamento?.numero_orcamento === 'ORC-0001' && dados.novo_orcamento.status === 'Pendente');
  check('origem mantém seus itens e total', JSON.stringify(copia.estado.orcamentos[0].itens) === JSON.stringify(base.itens) && copia.estado.orcamentos[0].valor_total === 78);
  check('fabricação, descontos e total são preservados sem copiar aprovações', dados.novo_orcamento?.itens[1].tipo === 'fabricacao' && dados.novo_orcamento.itens[0].desconto_percentual === 10 && dados.novo_orcamento.valor_total === 78 && !dados.novo_orcamento.aprovado_por && !dados.novo_orcamento.pedido_gerado_id);
  check('vínculo de origem fica confirmado e a reserva é concluída', dados.novo_orcamento?.origem_derivacao.confirmada === true && copia.estado.orcamentos[0].derivacao_orcamento.fase === 'concluida');
  check('auditorias têm contexto e antes/depois', copia.estado.logs.length >= 4 && copia.estado.logs.every((l) => l.group_id === base.group_id && l.empresa_id === base.empresa_id && l.dados_anteriores && l.dados_novos));
  const repetida = await (await chamar(copia)).json();
  check('reenvio da mesma duplicação não cria outra proposta', repetida.repetida && copia.estado.posts === 1);
  const divisao = nova();
  const separar = { ...entrada, acao: 'desmembrar', indices: [1] };
  const dividido = await (await chamar(divisao, separar)).json();
  check('desmembramento move só as linhas selecionadas e recalcula ambos os totais', dividido.ok && divisao.estado.orcamentos[0].itens.length === 1 && divisao.estado.orcamentos[0].valor_total === 18 && dividido.novo_orcamento.valor_total === 60 && dividido.novo_orcamento.itens[0].tipo === 'fabricacao');
  check('repetição do desmembramento não remove novamente os itens', (await (await chamar(divisao, separar)).json()).repetida && divisao.estado.orcamentos[0].valor_total === 18 && divisao.estado.posts === 1);
  for (const indices of [[], [-1], [2], [0, 0], ['0']]) {
    const caso = nova();
    check(`seleção inválida ${JSON.stringify(indices)} é rejeitada antes do POST`, (await chamar(caso, { ...separar, indices })).status === 422 && caso.estado.posts === 0);
  }
  for (const [nome, body, status] of [
    ['sem conferência', { ...entrada, revisado: false }, 400], ['operação inválida', { ...entrada, operacao_id: 'x' }, 400],
    ['versão antiga', { ...entrada, versao: 'antiga' }, 409], ['outra empresa', { ...entrada, empresa_id: 'aaaaaaaaaaaaaaaaaaaaaaaa' }, 404],
    ['grupo malicioso', { ...entrada, group_id: { $ne: null } }, 400],
  ]) {
    const caso = nova();
    check(`${nome} bloqueada sem criar`, (await chamar(caso, body)).status === status && caso.estado.posts === 0);
  }
  for (const status of ['Aprovado', 'Convertido', 'Rejeitado']) {
    const caso = nova(); caso.estado.orcamentos[0].status = status;
    check(`desmembramento de ${status} não modifica a proposta`, (await chamar(caso, separar)).status === 422 && caso.estado.posts === 0);
  }
  const adulterado = nova();
  const malicioso = await (await chamar(adulterado, { ...entrada, itens: [{ quantidade: 999, valor_unitario: 0 }], valor_total: 0, cliente_id: 'outro', status: 'Aprovado' })).json();
  check('não aceita itens, preços, total, cliente ou aprovação do navegador', malicioso.novo_orcamento?.valor_total === 78 && malicioso.novo_orcamento.cliente_id === base.cliente_id && malicioso.novo_orcamento.status === 'Pendente');
  const legado = montarDerivacao({ ...base, itens: [{ descricao: '<b>Legado</b> javascript:teste', quantidade: 2, valor_unitario: 10, valor_total: 15 }] }, user, 'duplicar');
  check('desconto legado é inferido e texto é sanitizado', legado.payload.itens[0].desconto_percentual === 25 && legado.payload.itens[0].descricao === 'Legado teste');
  const perdido = nova({ perderResposta: true });
  check('falha após criar não declara sucesso', (await chamar(perdido)).status === 409 && perdido.estado.orcamentos[0].derivacao_orcamento.fase === 'revisao');
  check('destino existente é conciliado após resposta perdida', (await chamar(perdido)).status === 200 && perdido.estado.posts === 1);
  const incerto = nova({ falharSemCriar: true });
  await chamar(incerto); await chamar(incerto);
  check('criação incerta sem destino não é reenviada', incerto.estado.posts === 1 && incerto.estado.orcamentos.length === 1);
  const antes = nova({ falharNumero: true });
  await chamar(antes);
  check('falha anterior à criação é retomada com segurança', antes.estado.posts === 0 && (await chamar(antes)).status === 200 && antes.estado.posts === 1);
  const transferencia = nova({ falharConfirmacao: true });
  await chamar(transferencia, separar);
  check('falha na confirmação final mantém a origem reservada após mover itens', transferencia.estado.orcamentos[0].derivacao_orcamento.fase === 'vinculada' && transferencia.estado.orcamentos[0].valor_total === 18);
  const filhoPendente = transferencia.estado.orcamentos[1];
  check('destino não avança enquanto a origem não conclui a conciliação', (await chamar(transferencia, { ...entrada, acao: 'fechar', orcamento_id: filhoPendente.id, versao: filhoPendente.updated_date, itens: filhoPendente.itens })).status === 409);
  check('retomada final não remove itens duas vezes', (await chamar(transferencia, separar)).status === 200 && transferencia.estado.posts === 1 && transferencia.estado.orcamentos[0].valor_total === 18);
  const tudo = nova({ falharConfirmacao: true });
  const moverTudo = { ...separar, indices: [0, 1] }; await chamar(tudo, moverTudo);
  check('origem vazia após mover todas as linhas permite conciliar sem nova criação', tudo.estado.orcamentos[0].itens.length === 0 && (await chamar(tudo, moverTudo)).status === 200 && tudo.estado.posts === 1);
  const segunda = { ...entrada, versao: copia.estado.orcamentos[0].updated_date, operacao_id: '22222222-2222-4222-8222-222222222222' };
  check('nova duplicação intencional usa outra operação e outro número', (await chamar(copia, segunda)).status === 200 && copia.estado.posts === 2 && copia.estado.orcamentos[2].numero_orcamento === 'ORC-0002');
  check('reenvio de operação histórica continua idempotente', (await (await chamar(copia)).json()).repetida && copia.estado.posts === 2);
  const alterada = nova({ alterarOrigem: true });
  check('alteração concorrente preserva destino e não remove linhas da origem', (await chamar(alterada, separar)).status === 409 && alterada.estado.posts === 1 && alterada.estado.orcamentos[0].itens.length === 2);
  const paralelo = nova();
  const respostas = await Promise.all([chamar(paralelo), chamar(paralelo)]);
  check('duas confirmações concorrentes criam no máximo uma proposta', paralelo.estado.posts === 1 && respostas.some((v) => v.status === 409));
  const numeracao = nova();
  const numeros = await Promise.all([reservarNumeroDocumento(numeracao.client, base.group_id, base.empresa_id, 'orcamento'), reservarNumeroDocumento(numeracao.client, base.group_id, base.empresa_id, 'orcamento')]);
  check('números concorrentes não repetem a reserva', new Set(numeros).size === 2);
  const ocupado = nova(); ocupado.estado.orcamentos.push({ group_id: base.group_id, empresa_id: base.empresa_id, numero_orcamento: 'ORC-0001' });
  check('numeração ocupada no legado é pulada', await reservarNumeroDocumento(ocupado.client, base.group_id, base.empresa_id, 'orcamento') === 'ORC-0002');
  const semPerfil = nova(); semPerfil.estado.usuario = { ...user, role: 'user', empresas_vinculadas: [base.empresa_id] };
  check('usuário sem permissão granular é bloqueado', (await chamar(semPerfil)).status === 403 && semPerfil.estado.posts === 0);
  const apenasCriar = nova(); apenasCriar.estado.usuario = { ...user, role: 'user', perfil_acesso_id: 'p', empresas_vinculadas: [base.empresa_id] }; apenasCriar.estado.perfil = { ativo: true, permissoes: { Comercial: { Pedidos: ['ver', 'criar'] } } };
  check('desmembrar também exige editar', (await chamar(apenasCriar, separar)).status === 403 && apenasCriar.estado.posts === 0);
  const semVinculo = nova(); semVinculo.estado.usuario = { ...apenasCriar.estado.usuario, empresas_vinculadas: [] }; semVinculo.estado.perfil = apenasCriar.estado.perfil;
  check('permissão comercial não substitui vínculo com empresa/grupo', (await chamar(semVinculo)).status === 403 && semVinculo.estado.posts === 0);
  const bloqueado = nova(); bloqueado.estado.usuario = { ...user, bloqueado: true };
  check('administrador bloqueado não executa a ação', (await chamar(bloqueado)).status === 403);
  const carteira = nova(); carteira.estado.usuario = { ...apenasCriar.estado.usuario, restricoes_adicionais: { pode_ver_apenas_proprios_registros: true } }; carteira.estado.perfil = apenasCriar.estado.perfil;
  check('restrição de carteira é respeitada', (await chamar(carteira)).status === 403);
  const anonimo = nova(); anonimo.estado.usuario = null;
  check('chamada anônima é bloqueada', (await chamar(anonimo)).status === 401);
  const pendente = nova({ falharSemCriar: true }); await chamar(pendente);
  const versao = pendente.estado.orcamentos[0].updated_date;
  check('origem com operação pendente não aceita salvar/fechar/converter', (await chamar(pendente, { ...entrada, acao: 'salvar', versao, itens: base.itens })).status === 409);
  delete globalThis.__central360Cliente;
}