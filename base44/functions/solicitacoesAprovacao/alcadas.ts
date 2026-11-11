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
export function nivelDoAprovador(user, perfil) {
  if (user?.role === 'admin') return 'Admin';
  const vinculos = Array.isArray(user?.empresas_vinculadas) ? user.empresas_vinculadas : [];
  const candidatos = [
    ...vinculos.filter((v) => v && v.ativo !== false).map((v) => normalizarNivel(v.nivel_acesso)),
    normalizarNivel(perfil?.nivel_perfil),
  ].filter(Boolean);
  if (!candidatos.length) return 'Consulta';
  return candidatos.sort((a, b) => pesoDoNivel(b) - pesoDoNivel(a))[0];
}

export function limiteDoAprovador(user) {
  const valor = Number(user?.restricoes_adicionais?.limite_aprovacao_valor || 0);
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

// Decide se este usuário pode aprovar esta solicitação, com base no nível exigido e no
// limite individual. Rejeitar nunca passa por aqui: negar é sempre permitido.
export function avaliarAlcada({ solicitacao, user, perfil }) {
  const nivel = nivelDoAprovador(user, perfil);
  if (user?.role === 'admin') return { permitido: true, nivel, motivo: null };

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