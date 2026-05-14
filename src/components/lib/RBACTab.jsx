// Componente Tab com RBAC integrado (NÃO redimensionável, conforme Regra-Mãe)
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import usePermissions from '@/components/lib/usePermissions';
import { AlertCircle } from 'lucide-react';

export default function RBACTabs({ tabs = [], defaultValue, className = '' }) {
  const { hasPermission } = usePermissions();

  // Filtra apenas abas que o usuário tem permissão
  const allowedTabs = tabs.filter((tab) => {
    if (!tab.module) return true; // Se não tem módulo, permite sempre
    return hasPermission(tab.module, null, tab.action || 'ver');
  });

  if (allowedTabs.length === 0) {
    return (
      <div className="w-full p-6 rounded-lg border border-amber-300 bg-amber-50 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">Você não tem permissão para acessar nenhuma aba.</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultValue || allowedTabs[0]?.value} className={className}>
      <TabsList className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(allowedTabs.length, 6)}, 1fr)` }}>
        {allowedTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {allowedTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="w-full">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}