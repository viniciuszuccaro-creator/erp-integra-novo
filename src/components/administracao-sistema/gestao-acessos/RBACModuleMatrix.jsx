// Matriz visual de módulos x permissões RBAC
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Lock } from 'lucide-react';
import { RBAC_MODULES } from '@/lib/rbacModuleMap';
import usePermissions from '@/components/lib/usePermissions';

export default function RBACModuleMatrix({ perfil = null, usuario = null }) {
  const { hasPermission } = usePermissions();

  const modules = useMemo(() => {
    return Object.entries(RBAC_MODULES)
      .filter(([_, m]) => !m.section || m.section !== 'Sistema' || hasPermission('Sistema', null, 'ver'))
      .map(([name, config]) => ({
        name,
        ...config
      }));
  }, [hasPermission]);

  const actions = useMemo(() => {
    const allActions = new Set();
    modules.forEach(m => {
      (m.actions || []).forEach(a => allActions.add(a));
    });
    return Array.from(allActions).sort();
  }, [modules]);

  // Renderiza matriz de permissões
  const renderMatrix = () => {
    if (!perfil?.permissoes) {
      return (
        <div className="p-4 text-center text-slate-600">
          Nenhum perfil selecionado
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 bg-slate-50 px-3 py-2 text-left font-semibold">Módulo</th>
              {actions.map(action => (
                <th key={action} className="px-2 py-2 text-center font-semibold">
                  <span className="text-xs capitalize">{action}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(module => {
              const perms = perfil.permissoes[module.name] || [];
              return (
                <tr key={module.name} className="border-b border-slate-100 hover:bg-blue-50">
                  <td className="sticky left-0 bg-white px-3 py-2 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{module.label}</span>
                      {module.section && (
                        <Badge variant="outline" className="text-xs">
                          {module.section}
                        </Badge>
                      )}
                    </div>
                  </td>
                  {actions.map(action => {
                    const hasAction = Array.isArray(perms) && perms.includes(action);
                    return (
                      <td key={`${module.name}-${action}`} className="px-2 py-2 text-center">
                        {hasAction ? (
                          <Check className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Matriz de Módulos x Permissões
          {perfil && <span className="text-sm font-normal text-slate-600 ml-auto">{perfil.nome_perfil}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {renderMatrix()}
      </CardContent>
    </Card>
  );
}