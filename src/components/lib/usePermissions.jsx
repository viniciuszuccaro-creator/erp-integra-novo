import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { UserContext } from "./UserContext";

export default function usePermissions() {
  // Tenta usar UserContext (layout completo); cai para AuthContext quando fora do UserProvider
  const userCtx = useContext(UserContext);
  const { user: authUser, isLoadingAuth } = useAuth();
  const user = userCtx?.user ?? authUser;
  const loadingUser = userCtx ? (userCtx.isLoading ?? false) : isLoadingAuth;

  // Buscar perfil de acesso completo
  const { data: perfilAcesso, isLoading: loadingPerfil } = useQuery({
    queryKey: ['perfil-acesso', user?.perfil_acesso_id],
    queryFn: async () => {
      if (!user?.perfil_acesso_id) return null;
      try {
        return await base44.entities.PerfilAcesso.get(user.perfil_acesso_id);
      } catch (err) {
        const status = err?.response?.status || err?.status;
        // Perfil órfão (404): limpa referência e para loop
        if (status === 404 || /not found/i.test(err?.message || '')) {
          try { await base44.auth.updateMe({ perfil_acesso_id: null }); } catch (_) { console.error('[lib] catch:', _); }
          return null;
        }
        // Qualquer outro erro: retorna null sem bloquear (fail-open)
        return null;
      }
    },
    enabled: !!(user?.perfil_acesso_id && user.perfil_acesso_id !== ""),
    staleTime: 150000,
    gcTime: 600000,
    retry: 0, // CRÍTICO: sem retry para evitar loop infinito de 404
    });

    // Normalização e aliases (HÍBRIDO: melhor opção sem quebrar legado)
    const normalizeSimple = (s) => {
      if (!s) return '';
      return String(s)
        .normalize('NFD').replace(/\p{Diacritic}/gu, '') // remove acentos
        .toLowerCase()
        .replace(/[^a-z0-9\.]/g, '');
    };

    const MODULE_ALIASES = {
      // principais variações de nomes de módulos
      'financeiro': 'Financeiro', 'financeiroecontabil': 'Financeiro',
      'compras': 'Compras', 'comprasesuprimentos': 'Compras',
      'comercial': 'Comercial', 'comercialevendas': 'Comercial',
      'estoque': 'Estoque', 'estoqueealmoxarifado': 'Estoque',
      'expedicao': 'Expedição', 'expedicaologistica': 'Expedição',
      'producao': 'Produção',
      'crm': 'CRM', 'crmrelacionamento': 'CRM',
      'fiscal': 'Fiscal',
      'rh': 'RH', 'recursoshumanos': 'RH',
      'dashboard': 'Dashboard', 'dashboardcorporativo': 'Dashboard',
      'relatorios': 'Relatórios', 'relatorioseanalises': 'Relatórios',
      'agenda': 'Agenda',
      'cadastros': 'Cadastros', 'cadastrosgerais': 'Cadastros',
      'contratos': 'Contratos', 'gestaodecontratos': 'Contratos',
      'hubatendimento': 'HubAtendimento', 'hubdeatendimento': 'HubAtendimento', 'hub': 'HubAtendimento',
      'administracao': 'Sistema', 'administracaosistema': 'Sistema', 'sistema': 'Sistema'
    };

    const SECTION_ALIASES = {
      controledeacesso: 'acessos',
      gestaoacessos: 'acessos',
      acessos: 'acessos',
      perfis: 'acessos',
      usuarios: 'acessos',
      integracoes: 'integracoes',
      ia: 'ia',
      iaeotimizacao: 'ia',
      configuracoesgerais: 'configuracoes',
      configuracoes: 'configuracoes',
      pessoas: 'pessoas',
      pessoasparceiros: 'pessoas',
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
    };

    const resolveModule = (mod) => {
      if (!mod) return mod;
      const norm = normalizeSimple(mod);
      return MODULE_ALIASES[norm] || mod;
    };

    const getNodeByPath = (root, pathArr) => {
      let cursor = root;
      for (let i = 0; i < pathArr.length; i++) {
        if (!cursor || typeof cursor !== 'object') return undefined;
        const rawKey = pathArr[i];
        const key = SECTION_ALIASES[normalizeSimple(rawKey)] || rawKey;
        const keys = Object.keys(cursor || {});
        const found = keys.find((k) => normalizeSimple(k) === normalizeSimple(key));
        cursor = found ? cursor[found] : undefined;
      }
      return cursor;
    };

    const getRootNode = (root, module) => {
      if (!root || typeof root !== 'object') return undefined;
      const candidates = [module, resolveModule(module)].filter(Boolean);
      const keys = Object.keys(root || {});
      for (const candidate of candidates) {
        const found = keys.find((k) => normalizeSimple(k) === normalizeSimple(candidate));
        if (found) return root[found];
      }
      return undefined;
    };

    const SYNONYM_GROUPS = {
      'visualizar': ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar'],
      'criar': ['criar', 'create', 'add', 'importar', 'gerar'],
      'emitir': ['emitir', 'emit'],
      'enviar': ['enviar', 'send'],
      'editar': ['editar', 'update', 'edit', 'corrigir', 'gerenciar', 'executar', 'registrar', 'atualizar', 'configurar', 'config'],
      'excluir': ['excluir', 'delete', 'remove', 'apagar', 'destroy'],
      // Vol 3.4 (Seção 3.4 do plano): aprovar e rejeitar são ações SEPARADAS — sem backward compat
      'aprovar': ['aprovar', 'approve', 'validar'],
      'rejeitar': ['rejeitar', 'reject'],
      'exportar': ['exportar', 'export', 'imprimir', 'print'],
      'cancelar': ['cancelar', 'cancel'],
      'configurar': ['configurar', 'config', 'editar', 'update'],
      'auditar': ['auditar', 'audit', 'visualizar'],
      'backup': ['backup', 'executar'],
      'seguranca': ['seguranca', 'segurança', 'configurar'],
      // Vol 3.4 (Seção 3.4 do plano): pagar, receber, conciliar, estornar são ações SEPARADAS — sem backward compat com liquidar
      'liquidar': ['liquidar'],
      'pagar': ['pagar'],
      'receber': ['receber'],
      'conciliar': ['conciliar'],
      'estornar': ['estornar'],
      'abrir': ['abrir'],
      'fechar': ['fechar'],
      'transferir': ['transferir', 'mover'],
      'rastrear': ['rastrear', 'track'],
      'roteirizar': ['roteirizar', 'otimizar'],
      'apontar': ['apontar', 'registrar'],
      'concluir': ['concluir', 'finalizar'],
      'inventario': ['inventario', 'contar', 'ajustar'],
      // Vol 3.4: desconto é ação separada — não herda aprovar automaticamente
      'desconto': ['desconto'],
      'assinar': ['assinar', 'assinatura'],
      'renovar': ['renovar', 'prorrogar'],
      'responder': ['responder', 'reply'],
      'duplicar': ['duplicar', 'clonar', 'copiar'],
      'testar': ['testar', 'test'],
      'desativar': ['desativar', 'bloquear'],
      'atualizar': ['atualizar', 'refresh', 'editar'],
    };

    const nodeHasAction = (node, desired) => {
      const synonyms = SYNONYM_GROUPS[desired] || [desired];
      const checkMatch = (arr) => arr.some(v => synonyms.includes(v));
      if (Array.isArray(node)) return checkMatch(node);
      if (!node || typeof node !== 'object') return false;
      const stack = [node];
      while (stack.length) {
        const current = stack.pop();
        if (Array.isArray(current)) {
          if (checkMatch(current)) return true;
        } else if (current && typeof current === 'object') {
          Object.values(current).forEach((value) => stack.push(value));
        }
      }
      return false;
    };

  // Verificação de permissão com suporte a múltiplos níveis: módulo.submódulo.aba.campo
  const parsePermissionKey = (permissionKey, fallbackAction = "visualizar") => {
    const parts = String(permissionKey || "").split(".").map((part) => part.trim()).filter(Boolean);
    if (parts.length === 0) return { module: null, section: null, action: fallbackAction };
    if (parts.length === 1) return { module: parts[0], section: null, action: fallbackAction };
    if (parts.length === 2) return { module: parts[0], section: null, action: parts[1] || fallbackAction };
    return {
      module: parts[0],
      section: parts.slice(1, -1),
      action: parts[parts.length - 1] || fallbackAction,
    };
  };

  const hasPermission = (module, section, action = "visualizar") => {
    if (!user) return false;
    if (user.role === "admin") return true;
    const perms = perfilAcesso?.permissoes;
    // Fail-open apenas para leitura ENQUANTO o perfil está carregando (isLoading=true).
    // Após carregar (isLoading=false) sem perfil → fail-closed para TODAS as ações.
    if (!perms) {
      if (loadingPerfil) {
        // Vol 3.4 (Seção 3.4 do plano): áreas sensíveis permanecem BLOQUEADAS durante carregamento
        const sensitiveActions = ['pagar', 'receber', 'liquidar', 'conciliar', 'estornar', 'abrir', 'fechar',
          'aprovar', 'rejeitar', 'desconto', 'excluir', 'cancelar', 'estornar', 'transferir', 'assinar', 'desativar'];
        const actionLower = String(action || '').toLowerCase();
        if (sensitiveActions.includes(actionLower)) return false;
        const readOnlyActions = ['ver', 'visualizar', 'view', 'read', 'listar', 'consultar', 'status'];
        return readOnlyActions.includes(actionLower);
      }
      return false; // Perfil carregou mas não existe — fail-closed
    }
    if (!section && typeof module === "string" && module.includes(".")) {
      const parsed = parsePermissionKey(module, action);
      module = parsed.module;
      section = parsed.section;
      action = parsed.action;
    }

    // normaliza alias (sinônimos → ação canônica)
    const normalize = (a) => {
      if (!a) return 'visualizar';
      const map = {
        // visualizar
        ver: 'visualizar', view: 'visualizar', read: 'visualizar', listar: 'visualizar', status: 'visualizar', consultar: 'visualizar', visualizar: 'visualizar',
        // excluir
        delete: 'excluir', remove: 'excluir', destroy: 'excluir', apagar: 'excluir', excluir: 'excluir',
        // cancelar
        cancel: 'cancelar', cancelar: 'cancelar',
        // criar
        create: 'criar', add: 'criar', importar: 'criar', gerar: 'criar', criar: 'criar',
        emitir: 'emitir', enviar: 'enviar',
        // editar
        update: 'editar', edit: 'editar', carta: 'editar', corrigir: 'editar', gerenciar: 'editar', executar: 'editar', editar: 'editar', registrar: 'editar', atualizar: 'editar',
        // aprovar — Vol 3.4: rejeitar é ação separada
        approve: 'aprovar', aprovar: 'aprovar', approvar: 'aprovar', validar: 'aprovar',
        rejeitar: 'rejeitar', reject: 'rejeitar',
        // exportar
        export: 'exportar', exportar: 'exportar', imprimir: 'exportar', print: 'exportar',
        // configurar (Sistema)
        configurar: 'configurar', config: 'configurar',
        // auditar (Sistema)
        auditar: 'auditar', audit: 'auditar',
        // backup (Sistema)
        backup: 'backup',
        // seguranca (Sistema)
        seguranca: 'seguranca', segurança: 'seguranca',
        // financeiro — Vol 3.4: ações SEPARADAS, não mapeadas para liquidar
        liquidar: 'liquidar', pagar: 'pagar', receber: 'receber', conciliar: 'conciliar', estornar: 'estornar',
        // especial
        transferir: 'transferir', rastrear: 'rastrear', roteirizar: 'roteirizar', apontar: 'apontar', concluir: 'concluir',
        inventario: 'inventario', desconto: 'desconto', assinar: 'assinar', renovar: 'renovar',
        responder: 'responder', duplicar: 'duplicar', testar: 'testar',
        rejeitar: 'rejeitar',
        // subsection actions
        separar: 'separar', conferir: 'conferir', expedir: 'expedir', entregar: 'entregar',
        contar: 'contar', ajustar: 'ajustar', parar: 'parar', inspecionar: 'inspecionar',
        solicitar: 'solicitar', desligar: 'desligar', fechar: 'fechar', abrir: 'abrir',
        administrar: 'administrar', calcular: 'calcular',
      };
      return map[a] || a;
    };
    const desired = normalize(action);

    const modNode = getRootNode(perms, module);
    if (!modNode) return false;

    // Se não houver seção especificada, verifica ação em qualquer subnível
    if (!section) {
      return nodeHasAction(modNode, desired);
    }

    // Suporta paths hierárquicos: "Pedidos.Financeiro.margens" ou ["Pedidos","Financeiro","margens"]
    const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
    const cursor = getNodeByPath(modNode, path);
    if (cursor == null) return false;
    return nodeHasAction(cursor, desired);
  };

  // Helpers específicos para granularidade
  const hasTabPermission = (module, submodule, tab, action = 'visualizar') => {
    const section = [submodule, tab].filter(Boolean);
    return hasPermission(module, section, action);
  };

  const hasFieldPermission = (module, submodule, tab, field, action = 'visualizar') => {
    const section = [submodule, tab, field].filter(Boolean);
    return hasPermission(module, section, action);
  };

  // Convenções sugeridas de chaves para Produtos/Precificação
  // Estoque -> Produto -> Precificacao -> (custo_aquisicao, margem_percentual)
  // Comercial -> Pedido -> Financeiro -> (emitir_nfe, aprovar_desconto)

  const hasGranularPermission = (module, section, action) => {
    return hasPermission(module, section, action);
  };

  const hasPermissionKey = (permissionKey, fallbackAction = "visualizar") => {
    const parsed = parsePermissionKey(permissionKey, fallbackAction);
    return hasPermission(parsed.module, parsed.section, parsed.action);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Expor resolvedor de módulo para uso externo (ex.: DataTableERP permission prop)
  const resolveModuleKey = resolveModule;

  const canApprove = (module, section = null) => {
    return hasPermission(module, section, 'aprovar');
  };

  const canDelete = (module, section = null) => {
    return hasPermission(module, section, 'excluir');
  };

  const canCancel = (module, section = null) => {
    return hasPermission(module, section, 'cancelar');
  };

  // Vol 3.4: helpers granulares para ações financeiras separadas
  const canPay = (module, section = null) => hasPermission(module, section, 'pagar');
  const canReceive = (module, section = null) => hasPermission(module, section, 'receber');
  const canLiquidate = (module, section = null) => hasPermission(module, section, 'liquidar');
  const canReconcile = (module, section = null) => hasPermission(module, section, 'conciliar');
  const canRefund = (module, section = null) => hasPermission(module, section, 'estornar');
  const canReject = (module, section = null) => hasPermission(module, section, 'rejeitar');
  const canDiscount = (module, section = null) => hasPermission(module, section, 'desconto');

  const canCreate = (module, section = null) => {
    return hasPermission(module, section, 'criar');
  };

  const canEdit = (module, section = null) => {
    return hasPermission(module, section, 'editar');
  };

  const canExport = (module, section = null) => {
    return hasPermission(module, section, 'exportar');
  };

  return {
    hasPermission,
    hasPermissionKey,
    parsePermissionKey,
    hasGranularPermission,
    hasTabPermission,
    hasFieldPermission,
    isAdmin,
    canApprove,
    canDelete,
    canCreate,
    canEdit,
    canExport,
    canCancel,
    // Vol 3.4: ações financeiras granulares
    canPay,
    canReceive,
    canLiquidate,
    canReconcile,
    canRefund,
    canReject,
    canDiscount,
    resolveModuleKey,
    isLoading: loadingUser || loadingPerfil,
    user,
    perfilAcesso
  };
}