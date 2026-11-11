// Guardas de acesso reutilizadas pelo domínio de entregas (comprovante, saldos e itens entregues).
const normalizar = (v) => String(v || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const chave = (v) => normalizar(v).replace(/[^a-z0-9]/g, '');
const LEITURA = new Set(['ver', 'visualizar', 'consultar', 'read', 'view', 'listar']);
const ESCRITA = new Set(['editar', 'update', 'edit', 'corrigir', 'gerenciar', 'atualizar', 'criar', 'create', 'add']);

function moduloExpedicao(ctx) {
  return Object.entries(ctx.perfil?.permissoes || {}).find(([k]) => chave(k) === 'expedicao')?.[1];
}

function contem(v, aliases) {
  if (Array.isArray(v)) return v.some((a) => aliases.has(normalizar(a)));
  if (v && typeof v === 'object') return Object.values(v).some((filho) => contem(filho, aliases));
  return false;
}

// Permissão granular por módulo/seção: leitura e escrita são verificações distintas.
export function temPermissaoAcao(ctx, modulo, secoes, acao = 'ver') {
  if (ctx.user?.bloqueado) return false;
  if (ctx.user?.role === 'admin') return true;
  if (!ctx.perfil || ctx.perfil.ativo === false) return false;
  const chaveModulo = chave(modulo);
  const permissoes = Object.entries(ctx.perfil.permissoes || {}).find(([k]) => chave(k) === chaveModulo)?.[1];
  const aliases = secoes.map(chave);
  const acoes = LEITURA.has(normalizar(acao)) ? LEITURA : ESCRITA;
  return Object.entries(permissoes || {}).some(([k, v]) => aliases.includes(chave(k)) && contem(v, acoes));
}

export function temPermissaoLeitura(ctx, modulo, secoes) {
  return temPermissaoAcao(ctx, modulo, secoes, 'ver');
}

export function usuarioVinculado(ctx, groupId, empresaId) {
  if (ctx.user?.bloqueado) return false;
  if (ctx.user?.role === 'admin') return true;
  const empresa = (ctx.user.empresas_vinculadas || []).some((v) => typeof v === 'string' ? v === empresaId : v.empresa_id === empresaId && v.ativo !== false);
  const grupo = (ctx.user.grupos_vinculados || []).some((v) => typeof v === 'string' ? v === groupId : v.grupo_id === groupId && v.ativo !== false);
  return empresa || grupo;
}

// Compatibilidade com o fluxo legado do comprovante (leitura = ver; gravação = editar).
export function permitido(ctx, leitura) {
  if (ctx.user.bloqueado) return false;
  if (ctx.user.role === 'admin') return true;
  if (!ctx.perfil || ctx.perfil.ativo === false) return false;
  const secao = Object.entries(moduloExpedicao(ctx) || {}).find(([k]) => ['entrega', 'entregas'].includes(normalizar(k)))?.[1];
  return contem(secao, leitura ? LEITURA : ESCRITA);
}