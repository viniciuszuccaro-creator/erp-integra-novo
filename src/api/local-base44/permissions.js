/**
 * Cliente Base44 local — RBAC local + auditoria de mutações (Regra-Mãe 5b/5d)
 * Regra-Mãe 3: extraído de localBase44Client.js — comportamento preservado
 */
import { makeId, now } from './storage';
import { getEntityStore, notify, saveDb } from './store';
import { loadDb, readUser } from './topology';
import { getCurrentContext } from './context';

const normalizePermissionText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .replace(/[^a-z0-9.]/g, '');

const normalizePermissionAction = (action = 'visualizar') => {
  const key = normalizePermissionText(action);
  const map = {
    ver: 'visualizar',
    view: 'visualizar',
    read: 'visualizar',
    listar: 'visualizar',
    consultar: 'visualizar',
    create: 'criar',
    add: 'criar',
    importar: 'criar',
    update: 'editar',
    edit: 'editar',
    executar: 'editar',
    gerenciar: 'editar',
    delete: 'excluir',
    remove: 'excluir',
    apagar: 'excluir',
    approve: 'aprovar',
    export: 'exportar',
    imprimir: 'exportar',
  };
  return map[key] || key || 'visualizar';
};

const LOCAL_MODULE_ALIASES = {
  dashboard: 'dashboard',
  dashboardcorporativo: 'dashboard',
  comercial: 'comercial',
  comercialevendas: 'comercial',
  compras: 'compras',
  comprasesuprimentos: 'compras',
  financeiro: 'financeiro',
  financeiroecontabil: 'financeiro',
  estoque: 'estoque',
  estoqueealmoxarifado: 'estoque',
  expedicao: 'expedicao',
  expedicaologistica: 'expedicao',
  producao: 'producao',
  rh: 'rh',
  recursoshumanos: 'rh',
  fiscal: 'fiscal',
  cadastros: 'cadastros',
  cadastrosgerais: 'cadastros',
  crm: 'crm',
  relatorios: 'relatorios',
  relatorioseanalises: 'relatorios',
  agenda: 'agenda',
  administracao: 'sistema',
  administracaosistema: 'sistema',
  sistema: 'sistema',
};

const LOCAL_SECTION_ALIASES = {
  controledeacesso: 'acessos',
  gestaoacessos: 'acessos',
  acessos: 'acessos',
  integracoes: 'integracoes',
  ia: 'ia',
  iaeotimizacao: 'ia',
  configuracoesgerais: 'configuracoes',
  configuracoes: 'configuracoes',
  cliente: 'pessoas',
  clientes: 'pessoas',
  fornecedor: 'pessoas',
  fornecedores: 'pessoas',
  transportadora: 'pessoas',
  transportadoras: 'pessoas',
  colaborador: 'pessoas',
  colaboradores: 'pessoas',
  representante: 'pessoas',
  representantes: 'pessoas',
  contatob2b: 'pessoas',
  segmentocliente: 'pessoas',
  regiaoatendimento: 'pessoas',
  pessoasparceiros: 'pessoas',
};

const permissionNodeAllows = (node, action) => {
  if (Array.isArray(node)) return node.map(normalizePermissionAction).includes(action);
  if (!node || typeof node !== 'object') return false;
  const stack = [node];
  while (stack.length) {
    const current = stack.pop();
    if (Array.isArray(current)) {
      if (current.map(normalizePermissionAction).includes(action)) return true;
    } else if (current && typeof current === 'object') {
      Object.values(current).forEach((value) => stack.push(value));
    }
  }
  return false;
};

const findPermissionNode = (root, key) => {
  if (!root || typeof root !== 'object') return undefined;
  const normalizedKey = normalizePermissionText(key);
  const found = Object.keys(root).find((item) => normalizePermissionText(item) === normalizedKey);
  return found ? root[found] : undefined;
};

const findPermissionNodeByPath = (root, path = []) => {
  let cursor = root;
  for (const rawPart of path) {
    if (!cursor || typeof cursor !== 'object') return undefined;
    const alias = LOCAL_SECTION_ALIASES[normalizePermissionText(rawPart)] || rawPart;
    cursor = findPermissionNode(cursor, alias);
  }
  return cursor;
};

export const evaluateLocalPermission = ({ module, section, entityName, action } = {}) => {
  const db = loadDb();
  const user = readUser();
  if (!user) return { allowed: false, reason: 'usuario-local-ausente' };
  if (user.role === 'admin') return { allowed: true, reason: 'admin-local' };

  const perfilId = user.perfil_acesso_id;
  const perfil = perfilId
    ? getEntityStore(db, 'PerfilAcesso').find((item) => String(item.id) === String(perfilId))
    : null;
  const permissoes = perfil?.permissoes;
  if (!permissoes || typeof permissoes !== 'object') return { allowed: false, reason: 'perfil-sem-permissoes' };

  const moduleKey = LOCAL_MODULE_ALIASES[normalizePermissionText(module || entityName)] || normalizePermissionText(module || entityName);
  const sectionPath = Array.isArray(section)
    ? section
    : String(section || entityName || '').split('.').filter(Boolean);
  const sectionKey = LOCAL_SECTION_ALIASES[normalizePermissionText(sectionPath[0] || entityName)] || normalizePermissionText(sectionPath[0] || entityName);
  const desired = normalizePermissionAction(action);
  const moduleNode = findPermissionNode(permissoes, moduleKey);
  if (!moduleNode) return { allowed: false, reason: 'modulo-negado' };
  if (!sectionKey) return { allowed: permissionNodeAllows(moduleNode, desired), reason: 'modulo' };
  const sectionNode = findPermissionNodeByPath(moduleNode, sectionPath.length ? sectionPath : [sectionKey]);
  return {
    allowed: permissionNodeAllows(sectionNode || moduleNode, desired),
    reason: sectionNode ? 'secao' : 'modulo-fallback',
  };
};

const ENTITY_PERMISSION_SCOPE = {
  User: { module: 'Sistema', section: 'Controle de Acesso' },
  PerfilAcesso: { module: 'Sistema', section: 'Controle de Acesso' },
  ConfiguracaoSistema: { module: 'Sistema', section: 'Configuracoes' },
  GrupoEmpresarial: { module: 'Cadastros', section: 'Organizacional' },
  Empresa: { module: 'Cadastros', section: 'Organizacional' },
  Cliente: { module: 'Cadastros', section: 'Pessoas' },
  Fornecedor: { module: 'Cadastros', section: 'Pessoas' },
  Transportadora: { module: 'Cadastros', section: 'Pessoas' },
  Colaborador: { module: 'Cadastros', section: 'Pessoas' },
  Representante: { module: 'Cadastros', section: 'Pessoas' },
  ContatoB2B: { module: 'Cadastros', section: 'Pessoas' },
  Produto: { module: 'Estoque', section: 'Produtos' },
  GrupoProduto: { module: 'Cadastros', section: 'Produtos' },
  Marca: { module: 'Cadastros', section: 'Produtos' },
  FormaPagamento: { module: 'Cadastros', section: 'Financeiro' },
  Banco: { module: 'Cadastros', section: 'Financeiro' },
  CentroCusto: { module: 'Cadastros', section: 'Financeiro' },
};

const getEntityPermissionScope = (entityName) => {
  if (ENTITY_PERMISSION_SCOPE[entityName]) return ENTITY_PERMISSION_SCOPE[entityName];
  return { module: 'Cadastros', section: entityName };
};

const auditLocalPermissionDenied = (entityName, action, recordId = null) => {
  try {
    const db = loadDb();
    const audit = getEntityStore(db, 'AuditLog');
    const { user, groupId, empresaId } = getCurrentContext();
    audit.unshift({
      id: makeId('audit'),
      usuario: user?.full_name || user?.email || 'Administrador Local',
      usuario_id: user?.id || null,
      acao: 'Bloqueio',
      modulo: 'Sistema Local',
      tipo_auditoria: 'seguranca',
      entidade: entityName,
      registro_id: recordId,
      descricao: `Permissao negada para ${action} em ${entityName}`,
      empresa_id: empresaId || null,
      group_id: groupId || null,
      sucesso: false,
      local: true,
      created_date: now(),
      updated_date: now(),
      data_hora: now(),
    });
    saveDb(db);
    notify('AuditLog', 'create', audit[0]);
  } catch {}
};

export const assertLocalMutationAllowed = (entityName, action, recordId = null) => {
  if (entityName === 'AuditLog') return;
  const scope = getEntityPermissionScope(entityName);
  const result = evaluateLocalPermission({ ...scope, entityName, action });
  if (!result.allowed) {
    auditLocalPermissionDenied(entityName, action, recordId);
    throw new Error(`Permissao negada para ${action} em ${entityName}.`);
  }
};

export const auditLocalMutation = (entityName, action, { before = null, after = null, recordId = null } = {}) => {
  if (entityName === 'AuditLog') return;
  try {
    const db = loadDb();
    const audit = getEntityStore(db, 'AuditLog');
    const { user, groupId, empresaId } = getCurrentContext();
    audit.unshift({
      id: makeId('audit'),
      usuario: user?.full_name || user?.email || 'Administrador Local',
      usuario_id: user?.id || null,
      acao: action,
      modulo: 'Sistema Local',
      tipo_auditoria: 'entidade',
      entidade: entityName,
      registro_id: recordId || after?.id || before?.id || null,
      descricao: `${action} local em ${entityName}`,
      empresa_id: after?.empresa_id || after?.empresa_dona_id || after?.empresa_alocada_id || before?.empresa_id || empresaId || null,
      group_id: after?.group_id || after?.grupo_id || before?.group_id || groupId || null,
      dados_anteriores: before,
      dados_novos: after,
      sucesso: true,
      local: true,
      created_date: now(),
      updated_date: now(),
      data_hora: now(),
    });
    saveDb(db);
    notify('AuditLog', 'create', audit[0]);
  } catch {}
};