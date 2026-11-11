import { readFileSync } from 'fs';
import { join } from 'path';

// §18 — executa as fontes de produção da alçada de aprovação com dados controlados; não grava dados reais.
export default async function testAlcadasAprovacao(log, root) {
  const ler = (p) => readFileSync(join(root, 'base44/functions/solicitacoesAprovacao', p), 'utf-8');
  const url = (s) => `data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
  const alcadasUrl = url(ler('alcadas.ts'));
  const { avaliarAlcada, nivelDoAprovador } = await import(alcadasUrl);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const check = (nome, ok) => log(ok ? 'pass' : 'fail', `Aprovações §18: ${nome}`);

  const contexto = { group_id: 'gggggggggggggggggggggggg', empresa_id: 'eeeeeeeeeeeeeeeeeeeeeeee' };
  const perfilGerencial = { nivel_perfil: 'Gerencial', permissoes: { Comercial: { Aprovacoes: ['aprovar'] } } };
  const gerente = {
    id: 'uuuuuuuuuuuuuuuuuuuuuuuu', role: 'user', full_name: 'Gerente Comercial', perfil_acesso_id: 'pppppppppppppppppppppppp',
    empresas_vinculadas: [{ empresa_id: contexto.empresa_id, ativo: true, nivel_acesso: 'Gerencial' }],
  };
  const solicitacaoBase = { ...contexto, id: 'ssssssssssssssssssssssss', status: 'pendente', solicitante_id: 'oooooooooooooooooooooooo', tipo_solicitacao: 'liberar_credito', valor_solicitado: 0, dados_propostos: {} };

  check('perfil gerencial alcança o nível Gerente', nivelDoAprovador(gerente, perfilGerencial) === 'Gerente');
  check('administrador do workspace tem nível máximo', nivelDoAprovador({ role: 'admin' }, null) === 'Admin');
  check('nível exigido acima do aprovador bloqueia', !avaliarAlcada({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Diretor' }, user: gerente, perfil: perfilGerencial }).permitido);
  check('nível exigido compatível libera', avaliarAlcada({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Gerente' }, user: gerente, perfil: perfilGerencial }).permitido);
  check('limite individual bloqueia valor acima', !avaliarAlcada({ solicitacao: { ...solicitacaoBase, valor_solicitado: 9000 }, user: { ...gerente, restricoes_adicionais: { limite_aprovacao_valor: 5000 } }, perfil: perfilGerencial }).permitido);
  check('limite individual libera valor dentro da faixa', avaliarAlcada({ solicitacao: { ...solicitacaoBase, valor_solicitado: 4000 }, user: { ...gerente, restricoes_adicionais: { limite_aprovacao_valor: 5000 } }, perfil: perfilGerencial }).permitido);
  check('administrador não é limitado por valor', avaliarAlcada({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Diretor', valor_solicitado: 999999 }, user: { id: 'adm', role: 'admin' }, perfil: null }).permitido);

  globalThis.Deno = { serve: (h) => { globalThis.__aprovHandler = h; } };
  await import(url(ler('entry.ts')
    .replace("import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';", 'const createClientFromRequest = () => globalThis.__aprovCliente;')
    .replace("'./alcadas.ts'", JSON.stringify(alcadasUrl))));
  const endpoint = globalThis.__aprovHandler;

  const nova = (opcoes = {}) => {
    const estado = {
      usuario: clone(opcoes.usuario || gerente),
      solicitacoes: { [opcoes.solicitacao.id]: clone(opcoes.solicitacao) },
      clientes: { [opcoes.cliente.id]: clone(opcoes.cliente) },
      logs: [], decisoes: [], clienteAtualizacoes: [],
    };
    const api = {
      SolicitacaoAprovacao: {
        get: async (id) => (estado.solicitacoes[id] ? clone(estado.solicitacoes[id]) : Promise.reject({ status: 404 })),
        update: async (id, dados) => { estado.decisoes.push(clone(dados)); return { ...clone(estado.solicitacoes[id]), ...clone(dados) }; },
      },
      PerfilAcesso: { get: async () => opcoes.perfil || null },
      Pedido: { get: async () => null, update: async () => ({}) },
      Cliente: {
        get: async (id) => (estado.clientes[id] ? clone(estado.clientes[id]) : Promise.reject({ status: 404 })),
        update: async (id, dados) => { estado.clienteAtualizacoes.push(clone(dados)); Object.assign(estado.clientes[id], clone(dados)); return clone(estado.clientes[id]); },
      },
      AuditLog: { create: async (dados) => { estado.logs.push(clone(dados)); return dados; } },
    };
    const client = { auth: { me: async () => estado.usuario }, entities: api, asServiceRole: { entities: api, functions: { invoke: async () => ({}) } } };
    return { client, estado };
  };
  const chamar = (fonte, body) => {
    globalThis.__aprovCliente = fonte.client;
    return endpoint(new Request('https://teste.local', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }));
  };
  const body = { action: 'approve', solicitacao_id: solicitacaoBase.id, group_id: contexto.group_id, empresa_id: contexto.empresa_id, comentarios_aprovacao: 'ok' };
  const clienteValido = { id: 'cccccccccccccccccccccccc', ...contexto, condicao_comercial: { limite_credito: 1000 } };

  const bloqueada = nova({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Diretor' }, cliente: clienteValido, perfil: perfilGerencial });
  const respostaBloqueada = await chamar(bloqueada, body);
  check('servidor recusa nível insuficiente sem gravar decisão', respostaBloqueada.status === 403 && bloqueada.estado.decisoes.length === 0 && bloqueada.estado.logs.some((l) => l.acao === 'Bloqueio'));

  const acimaDoLimite = nova({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Gerente', valor_solicitado: 90000 }, cliente: clienteValido, perfil: perfilGerencial, usuario: { ...gerente, restricoes_adicionais: { limite_aprovacao_valor: 10000 } } });
  const respostaLimite = await chamar(acimaDoLimite, body);
  check('servidor recusa valor acima do limite individual', respostaLimite.status === 403 && acimaDoLimite.estado.decisoes.length === 0);

  const aplicada = nova({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Gerente', dados_propostos: { cliente_id: clienteValido.id } }, cliente: clienteValido, perfil: perfilGerencial });
  const respostaAplicada = await chamar(aplicada, { ...body, contraproposta: { limite_credito: 7500 } });
  const dadosAplicados = await respostaAplicada.json();
  check('contraproposta é aplicada pelo servidor no cadastro do cliente', respostaAplicada.status === 200 && dadosAplicados.contraproposta_aplicada?.aplicado === true && aplicada.estado.clientes[clienteValido.id].condicao_comercial.limite_credito === 7500);
  check('aplicação registra antes/depois na auditoria', aplicada.estado.logs.some((l) => l.entidade === 'Cliente' && l.dados_anteriores?.condicao_comercial?.limite_credito === 1000));

  const outroGrupo = nova({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Gerente', dados_propostos: { cliente_id: clienteValido.id } }, cliente: { ...clienteValido, group_id: 'outro-grupo' }, perfil: perfilGerencial });
  const dadosOutroGrupo = await (await chamar(outroGrupo, { ...body, contraproposta: { limite_credito: 7500 } })).json();
  check('cliente de outro grupo não recebe o limite', dadosOutroGrupo.contraproposta_aplicada?.aplicado === false && outroGrupo.estado.clienteAtualizacoes.length === 0);

  const semTipo = nova({ solicitacao: { ...solicitacaoBase, nivel_alcada: 'Gerente', tipo_solicitacao: 'desconto_pedido', entidade_alvo: 'Pedido', entidade_alvo_id: 'ppp', dados_propostos: { cliente_id: clienteValido.id } }, cliente: clienteValido, perfil: perfilGerencial });
  const dadosSemTipo = await (await chamar(semTipo, { ...body, contraproposta: { limite_credito: 7500 } })).json();
  check('contraproposta não altera cadastro em aprovação de desconto', semTipo.estado.clienteAtualizacoes.length === 0 && (dadosSemTipo.contraproposta_aplicada ?? null) === null);
}