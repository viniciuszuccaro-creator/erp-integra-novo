// Hook para verificação RBAC em rotas
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/components/lib/UserContext';
import usePermissions from '@/components/lib/usePermissions';

export function useRBACRoute(moduleName, requiredAction = 'ver') {
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useUser();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (isLoadingAuth) return; // Esperando autenticação

    // Se não autenticado, redireciona ao login
    if (!user) {
      navigate('/');
      return;
    }

    // Admin sempre tem acesso
    if (user.role === 'admin') {
      return;
    }

    // Verifica permissão específica
    const allowed = hasPermission(moduleName, null, requiredAction);
    if (!allowed) {
      console.warn(`[RBAC] Acesso negado: ${user.full_name} tentou acessar ${moduleName}/${requiredAction}`);
      navigate('/'); // Redireciona ao dashboard
      return;
    }
  }, [user, isLoadingAuth, moduleName, requiredAction, navigate, hasPermission]);

  return {
    isAuthorized: user?.role === 'admin' || hasPermission(moduleName, null, requiredAction),
    isLoading: isLoadingAuth,
    user
  };
}