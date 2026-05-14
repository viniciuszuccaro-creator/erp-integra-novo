// Componente para envolver rotas protegidas por RBAC
import React from 'react';
import { useRBACRoute } from '@/components/lib/useRBACRoute';
import { Loader2 } from 'lucide-react';

export default function RBACRoute({ module, action = 'ver', children, fallback = null }) {
  const { isAuthorized, isLoading } = useRBACRoute(module, action);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Acesso Negado</h1>
            <p className="text-slate-600 mb-6">Você não tem permissão para acessar este módulo.</p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Dashboard
            </a>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}