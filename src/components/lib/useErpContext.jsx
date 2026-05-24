/**
 * useErpContext v1.0 — Hook unificado de contexto ERP
 * Combina: contexto visual (empresa/grupo) + permissões + propagação
 * Simplifica importações nos componentes: um único hook para tudo
 */

import { useContextoVisual } from './useContextoVisual';
import usePermissions from './usePermissions';
import useRBACGranular from './useRBACGranular';
import { useAuth } from '@/lib/AuthContext';

export default function useErpContext() {
  const visual = useContextoVisual();
  const { hasPermission, hasPermissionKey, isAdmin } = usePermissions();
  const { hasFieldPermission, isFieldReadOnly, filterVisibleFields } = useRBACGranular();
  const { user } = useAuth();

  /**
   * Retorna o scope atual para filtros e criações
   * Sempre inclui group_id e empresa_id conforme o contexto
   */
  const getScope = () => {
    const scope = {};
    if (visual.grupoAtual?.id) scope.group_id = visual.grupoAtual.id;
    if (visual.contexto !== 'grupo' && visual.empresaAtual?.id) {
      scope.empresa_id = visual.empresaAtual.id;
    }
    return scope;
  };

  /**
   * Enriquece dados com o contexto atual antes de salvar
   */
  const stampData = (data = {}) => ({
    ...data,
    ...getScope(),
  });

  /**
   * Verifica se o contexto atual está pronto para operar
   * (grupo selecionado OU empresa selecionada)
   */
  const hasActiveContext = () => {
    return !!(visual.grupoAtual?.id || visual.empresaAtual?.id);
  };

  /**
   * Retorna texto amigável do contexto atual
   */
  const getContextLabel = () => {
    if (visual.contexto === 'grupo') {
      return visual.grupoAtual?.nome_do_grupo || 'Grupo';
    }
    return visual.empresaAtual?.nome_fantasia || visual.empresaAtual?.razao_social || 'Empresa';
  };

  /**
   * Verifica permissão simplificada para uma ação no módulo atual
   */
  const can = (module, action = 'ver') => {
    try {
      return hasPermission(module, null, action);
    } catch {
      return isAdmin;
    }
  };

  return {
    // Contexto visual
    empresaAtual: visual.empresaAtual,
    grupoAtual: visual.grupoAtual,
    contexto: visual.contexto,
    isGroup: visual.contexto === 'grupo',
    filterInContext: visual.filterInContext,

    // Helpers de contexto
    getScope,
    stampData,
    hasActiveContext,
    getContextLabel,

    // Permissões
    hasPermission,
    hasPermissionKey,
    hasFieldPermission,
    isFieldReadOnly,
    filterVisibleFields,
    isAdmin,
    can,

    // Usuário atual
    user,
  };
}