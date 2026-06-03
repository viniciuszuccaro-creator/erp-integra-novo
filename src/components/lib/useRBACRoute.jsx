// Hook para verificação RBAC em rotas
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import usePermissions from '@/components/lib/usePermissions';

export function useRBACRoute(moduleName, requiredAction = 'ver') {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();
  const { hasPermission, isLoading: loadingPermissions } = usePermissions();

  useEffect(() => {
    if (isLoadingAuth || loadingPermissions) return; // Esperando auth + perfil carregar

    // Se não autenticado, redireciona ao login
    if (!user) {
      navigate('/');
      return;
    }

    // Admin sempre tem acesso
    if (user.role === 'admin') return;

    // Verifica permissão específica — só redireciona se tiver certeza que não tem acesso
    const allowed = hasPermission(moduleName, null, requiredAction);
    if (!allowed) {
      console.warn(`[RBAC] Acesso negado: ${user?.full_name} tentou acessar ${moduleName}/${requiredAction}`);
      navigate('/');
    }
  }, [user, isLoadingAuth, loadingPermissions, moduleName, requiredAction, navigate, hasPermission]);

  return {
    isAuthorized: user?.role === 'admin' || hasPermission(moduleName, null, requiredAction),
    isLoading: isLoadingAuth || loadingPermissions,
    user
  };
}