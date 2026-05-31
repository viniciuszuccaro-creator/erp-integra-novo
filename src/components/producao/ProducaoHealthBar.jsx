/**
 * ProducaoHealthBar v1.0
 * Barra de saúde do módulo Produção
 * Regra-Mãe: integração de resiliência
 */
import { Factory, Wrench, CheckCircle2 } from 'lucide-react';
import ModuleHealthWidget from '@/components/sistema/ModuleHealthWidget';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ProducaoHealthBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  
  if (!empresaAtual?.id && grupoAtual?.id === undefined) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <ModuleHealthWidget
        moduleName="Ordens de Produção"
        entities={['OrdemProducao']}
        icon={Factory}
        color="blue"
      />
      <ModuleHealthWidget
        moduleName="Apontamentos"
        entities={['ApontamentoProducao']}
        icon={CheckCircle2}
        color="green"
      />
    </div>
  );
}