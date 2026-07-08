/**
 * Hook RBAC Granular v2.0
 * Suporte a permissões por CAMPO (ex: pricing.margem_minima, cliente.email)
 */

import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { UserContext } from './UserContext';

// PerfilAcesso IDs conhecidos como órfãos/deletados — evita refetch desnecessário
const ORPHANED_PERFIL_IDS = new Set(['692316b82206c99d5778f10c']);

export default function useRBACGranular() {
  const userCtx = useContext(UserContext);
  const { user: authUser } = useAuth();
  const user = userCtx?.user ?? authUser;

  const { data: perfilAcesso } = useQuery({
    queryKey: ['perfil-acesso', user?.perfil_acesso_id],
    queryFn: async () => {
      if (!user?.perfil_acesso_id) return null;
      // Skip se é conhecido como órfão (evita 404 repetido)
      if (ORPHANED_PERFIL_IDS.has(user.perfil_acesso_id)) return null;
      return await base44.entities.PerfilAcesso.get(user.perfil_acesso_id).catch(() => null);
    },
    enabled: !!user?.perfil_acesso_id && !ORPHANED_PERFIL_IDS.has(user?.perfil_acesso_id),
    staleTime: 300000,
  });

  /**
   * Verifica se usuário pode acessar um CAMPO específico
   * Ex: hasFieldPermission('Pedido.Financeiro.desconto_geral', 'editar')
   */
  const READ_ONLY_ACTIONS = ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar', 'status'];

  const hasFieldPermission = (fieldPath, action = 'visualizar') => {
    if (user?.role === 'admin') return true;
    const isReadOnly = READ_ONLY_ACTIONS.includes(String(action || '').toLowerCase());
    // Fail-open para leitura enquanto perfil carrega; fail-closed para escrita
    if (!perfilAcesso?.permissoes) return isReadOnly;

    // Parse: "Pedido.Financeiro.desconto_geral" → [Pedido, Financeiro, desconto_geral]
    const parts = String(fieldPath).split('.').map(p => p.trim());
    const [module, ...sectionAndField] = parts;

    let cursor = perfilAcesso.permissoes?.[module];
    if (!cursor) return false;

    // Navega até campo
    for (let i = 0; i < sectionAndField.length; i++) {
      const part = sectionAndField[i];
      if (typeof cursor === 'object' && cursor[part]) {
        cursor = cursor[part];
      } else {
        return false;
      }
    }

    // Verifica ação no nó final
    if (Array.isArray(cursor)) {
      return cursor.includes(action) || (action === 'visualizar' && cursor.includes('ver'));
    }

    return false;
  };

  /**
   * Filtra campos visíveis baseado em RBAC
   * Ex: filterFields(Pedido schema, user permissions)
   */
  const filterVisibleFields = (schema, moduleContext) => {
    if (user?.role === 'admin') return schema;

    const filtered = { ...schema };
    Object.keys(filtered).forEach(fieldName => {
      const allowed = hasFieldPermission(`${moduleContext}.${fieldName}`, 'visualizar');
      if (!allowed) delete filtered[fieldName];
    });
    return filtered;
  };

  /**
   * Bloqueia edição de campo específico
   */
  const isFieldReadOnly = (fieldPath) => {
    return !hasFieldPermission(fieldPath, 'editar');
  };

  return {
    hasFieldPermission,
    filterVisibleFields,
    isFieldReadOnly,
    isLoading: userCtx?.isLoading,
    perfilAcesso
  };
}