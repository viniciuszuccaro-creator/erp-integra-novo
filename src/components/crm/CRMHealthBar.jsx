/**
 * CRMHealthBar v1.0
 * Barra de saúde do módulo CRM
 * Regra-Mãe: integração de resiliência
 */
import { Users, Target } from 'lucide-react';
import ModuleHealthWidget from '@/components/sistema/ModuleHealthWidget';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function CRMHealthBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  
  if (!empresaAtual?.id && grupoAtual?.id === undefined) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <ModuleHealthWidget
        moduleName="Clientes"
        entities={['Cliente']}
        icon={Users}
        color="blue"
      />
      <ModuleHealthWidget
        moduleName="Oportunidades"
        entities={['Oportunidade']}
        icon={Target}
        color="amber"
      />
    </div>
  );
}