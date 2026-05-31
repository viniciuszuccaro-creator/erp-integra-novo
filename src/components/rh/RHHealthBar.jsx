/**
 * RHHealthBar v1.0
 * Barra de saúde do módulo RH
 * Regra-Mãe: integração de resiliência
 */
import { Users, Clock, Calendar } from 'lucide-react';
import ModuleHealthWidget from '@/components/sistema/ModuleHealthWidget';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function RHHealthBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  
  if (!empresaAtual?.id && grupoAtual?.id === undefined) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <ModuleHealthWidget
        moduleName="Colaboradores"
        entities={['Colaborador']}
        icon={Users}
        color="blue"
      />
      <ModuleHealthWidget
        moduleName="Ponto Eletrônico"
        entities={['Ponto']}
        icon={Clock}
        color="purple"
      />
      <ModuleHealthWidget
        moduleName="Férias"
        entities={['Ferias']}
        icon={Calendar}
        color="green"
      />
    </div>
  );
}