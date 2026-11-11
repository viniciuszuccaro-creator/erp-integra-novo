// §18 — Alçada de aprovação e contraproposta aplicada no servidor.
// Fontes já existentes: PerfilAcesso.nivel_perfil, User.empresas_vinculadas[].nivel_acesso,
// User.restricoes_adicionais.limite_aprovacao_valor e SolicitacaoAprovacao.nivel_alcada/valor_limite_alcada.

const PESO_NIVEL = { Consulta: 0, Vendedor: 1, Supervisor: 2, Gerente: 3, Diretor: 4, Admin: 5 };

const ALIAS_NIVEL = {
  consulta: 'Consulta',
  operacional: 'Vendedor',
  personalizado: 'Vendedor',
  vendedor: 'Vendedor',
  supervisor: 'Supervisor',
  gerencial: 'Gerente',
  gerente: 'Gerente',
  administrador: 'Diretor',
  diretor: 'Diretor',
  admin: 'Admin',
};

export function normalizarNivel(valor) {
  if (!valor) return null;
  return ALIAS_NIVEL[String(valor).toLowerCase()] || null;
}

export function pesoDoNivel(nivel) {
  return PESO_NIVEL[nivel] ?? 0;
}

// Nível real do aprovador: papel de administrador do workspace prevalece; senão o maior
// nível entre o vínculo com empresas e o perfil de acesso atribuído.
// Multiempresa: com a empresa em escopo, só o vínculo daquela empresa conta — vínculo de
// outra empresa não eleva a alçada de quem decide aqui.
export function nivelDoAprovador(user, perfil, escopo = {}) {
  if (user?.role === 'admin') return 'Admin';
  const vinculos = (Array.isArray(user?.empresas_vinculadas) ? user.empresas_vinculadas : []).filter((v) => v && v.ativo !== false);
  const empresaEscopo = escopo?.empresaId || null;
  const doEscopo = empresaEscopo ? vinculos.filter((v) => v.empresa_id === empresaEscopo) : vinculos;
  const candidatos = [
    ...doEscopo.map((v) => normalizarNivel(v.nivel_acesso)),
    normalizarNivel(perfil?.nivel_perfil),
  ].filter(Boolean);
  if (!candidatos.length) return 'Consulta';
  return candidatos.sort((a, b) => pesoDoNivel(b) - pesoDoNivel(a))[0];
}

// §18 — a categoria da solicitação define a área que aprova (Vol 6.1).
const CATEGORIA_MODULO = {
  Comercial: 'Comercial',
  Compras: 'Compras',
  Financeiro: 'Financeiro',
  Fiscal: 'Fiscal',
  RH: 'RH',
  Operacional: 'Producao',
  Sistema: 'Sistema',
};

const TIPO_CATEGORIA = {
  desconto_pedido: 'Comercial',
  alteracao_preco: 'Comercial',
  cadastro_fornecedor: 'Compras',
  aprovacao_compra: 'Compras',
  liberar_credito: 'Financeiro',
  liberacao_vencido: 'Financeiro',
  estorno_financeiro: 'Financeiro',
  cancelamento_nf: 'Fiscal',
  outro: 'Sistema',
};

export function categoriaDaSolicitacao(solicitacao) {
  return solicitacao?.categoria_alcada || TIPO_CATEGORIA[solicitacao?.tipo_solicitacao] || 'Sistema';
}

export function moduloDaCategoria(categoria) {
  return CATEGORIA_MODULO[categoria] || 'Sistema';
}

// A ação de aprovação pode estar em qualquer seção do módulo (ou na seção coringa *).
function perfilAprovaModulo(permissoesModulo) {
  if (!permissoesModulo || typeof permissoesModulo !== 'object') return null;
  const secoes = Object.values(permissoesModulo);
  return secoes.some((acoes) => Array.isArray(acoes) && acoes.some((a) => ['aprovar', 'gerir'].includes(String(a).toLowerCase())));
}

export function limiteDoAprovador(user) {
  const valor = Number(user?.restricoes_adicionais?.limite_aprovacao_valor || 0);
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

// Decide se este usuário pode aprovar esta solicitação, com base no nível exigido e no
// limite individual. Rejeitar nunca passa por aqui: negar é sempre permitido.
export function avaliarAlcada({ solicitacao, user, perfil, escopo }) {
  const ambito = escopo || { empresaId: solicitacao?.empresa_id || null, groupId: solicitacao?.group_id || null };
  const nivel = nivelDoAprovador(user, perfil, ambito);
  const categoria = categoriaDaSolicitacao(solicitacao);
  const modulo = moduloDaCategoria(categoria);
  if (user?.role === 'admin') return { permitido: true, nivel, categoria, modulo, motivo: null };

  // Categoria: quem decide por crédito/compra/fiscal precisa da ação de aprovação na área.
  // Perfis sem o módulo declarado seguem a permissão genérica de aprovações já exigida na entrada.
  if (perfilAprovaModulo(perfil?.permissoes?.[modulo]) === false) {
    return {
      permitido: false,
      nivel,
      categoria,
      modulo,
      motivo: `Sem permissão de aprovação na categoria ${categoria} (módulo ${modulo}).`,
    };
  }

  const exigido = normalizarNivel(solicitacao?.nivel_alcada);
  if (exigido && pesoDoNivel(exigido) > pesoDoNivel(nivel)) {
    return {
      permitido: false,
      nivel,
      motivo: `Alçada insuficiente: a solicitação exige nível ${exigido} e o seu nível é ${nivel}.`,
    };
  }

  const teto = limiteDoAprovador(user) || Number(solicitacao?.valor_limite_alcada || 0);
  const valor = Number(solicitacao?.valor_solicitado || solicitacao?.dados_propostos?.valor || 0);
  if (teto > 0 && valor > teto) {
    return {
      permitido: false,
      nivel,
      motivo: `Valor de ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} acima do seu limite de aprovação de ${teto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
    };
  }

  return { permitido: true, nivel, motivo: null };
}

// Aplica a contraproposta de limite de crédito no cadastro único do cliente (Cadastros Gerais),
// com verificação de grupo/empresa e registro de antes/depois. O navegador não grava mais o cadastro.
export async function aplicarContraproposta({ base44, solicitacao, contraproposta, user }) {
  const limite = Number(contraproposta?.limite_credito || 0);
  if (!(limite > 0)) return null;
  if (solicitacao?.tipo_solicitacao !== 'liberar_credito') return null;

  const clienteId = solicitacao?.dados_propostos?.cliente_id;
  if (!clienteId) return { aplicado: false, motivo: 'Solicitação sem cliente vinculado.' };

  const cliente = await base44.asServiceRole.entities.Cliente
    .get(clienteId)
    .catch((e) => (e?.status === 404 ? null : Promise.reject(e)));
  if (!cliente) return { aplicado: false, motivo: 'Cliente não encontrado.' };
  if (cliente.group_id && cliente.group_id !== solicitacao.group_id) {
    return { aplicado: false, motivo: 'Cliente fora do grupo da solicitação.' };
  }
  const compartilhados = Array.isArray(cliente.empresas_compartilhadas_ids) ? cliente.empresas_compartilhadas_ids : [];
  const mesmaEmpresa = !cliente.empresa_id
    || cliente.empresa_id === solicitacao.empresa_id
    || compartilhados.includes(solicitacao.empresa_id);
  if (!mesmaEmpresa) return { aplicado: false, motivo: 'Cliente não pertence à empresa da solicitação.' };

  const antes = cliente.condicao_comercial || {};
  const depois = {
    ...antes,
    limite_credito: limite,
    limite_aprovado_por: user?.full_name || user?.email || 'Usuário',
    limite_aprovado_em: new Date().toISOString().slice(0, 10),
  };

  await base44.asServiceRole.entities.Cliente.update(cliente.id, { condicao_comercial: depois });

  try {
    await base44.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id || null,
      empresa_id: solicitacao.empresa_id || null,
      group_id: solicitacao.group_id || null,
      acao: 'Aprovação',
      modulo: 'Comercial',
      entidade: 'Cliente',
      registro_id: cliente.id,
      descricao: `Contraproposta de limite de crédito aplicada pela solicitação ${solicitacao.id}`,
      dados_anteriores: { condicao_comercial: antes },
      dados_novos: { condicao_comercial: depois },
      data_hora: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[solicitacoesAprovacao/alcadas] falha ao auditar contraproposta:', e);
  }

  return { aplicado: true, cliente_id: cliente.id, limite_credito: limite };
}

// §18 — políticas de aprovação já existentes (ConfiguracaoSistema.chave = aprovacao_politicas).
// Empresa prevalece sobre grupo; nada é criado aqui.
export async function carregarPoliticas(base44, { group_id, empresa_id } = {}) {
  try {
    const porEmpresa = empresa_id
      ? await base44.entities.ConfiguracaoSistema.filter({ chave: 'aprovacao_politicas', empresa_id }, undefined, 1)
      : [];
    const porGrupo = (!porEmpresa?.length && group_id)
      ? await base44.entities.ConfiguracaoSistema.filter({ chave: 'aprovacao_politicas', group_id }, undefined, 1)
      : [];
    const cfg = porEmpresa?.[0] || porGrupo?.[0] || null;
    return cfg?.valor_json || cfg?.politicas || null;
  } catch (e) {
    console.error('[solicitacoesAprovacao/alcadas] falha ao ler políticas:', e);
    return null;
  }
}

// Faixa da política (mín/máx por valor) para a entidade alvo ou para a categoria.
export function faixaDaPolitica(politicas, { entidadeAlvo, categoria, valor }) {
  const chaves = [entidadeAlvo, moduloDaCategoria(categoria)].filter(Boolean);
  for (const chave of chaves) {
    const faixas = Array.isArray(politicas?.[chave]) ? politicas[chave] : [];
    const alvo = Number(valor || 0);
    const faixa = faixas.find((f) => {
      const min = Number(f?.min ?? 0);
      const max = f?.max == null ? Infinity : Number(f.max);
      return alvo >= min && alvo <= max;
    });
    if (faixa) return faixa;
  }
  return null;
}

// Nível e teto que a política exige para este valor. Serve para o servidor não aceitar
// que o payload rebaixe a alçada (só elevar).
export function exigenciaDaPolitica({ politicas, entidadeAlvo, categoria, valor }) {
  const faixa = faixaDaPolitica(politicas, { entidadeAlvo, categoria, valor });
  if (!faixa) return null;
  const niveis = Array.isArray(faixa.niveis) ? faixa.niveis : [];
  const nivel = normalizarNivel(faixa.nivel_alcada || faixa.nivel || niveis[0]?.nivel || null);
  const limite = Number(faixa.valor_limite_alcada || faixa.valor_limite || 0);
  if (!nivel && !(limite > 0)) return null;
  return { nivel, valor_limite: Number.isFinite(limite) && limite > 0 ? limite : 0 };
}

// Escolhe o maior dos dois níveis exigidos (nunca rebaixar).
export function nivelMaisExigente(a, b) {
  const na = normalizarNivel(a);
  const nb = normalizarNivel(b);
  if (!na) return nb;
  if (!nb) return na;
  return pesoDoNivel(na) >= pesoDoNivel(nb) ? na : nb;
}