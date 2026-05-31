/**
 * ComprasHealthBar v1.0
 * Barra de saúde do módulo Compras
 * Regra-Mãe: integração de resiliência
 */
import { Package, FileText, BarChart3 } from 'lucide-react';
import ModuleHealthWidget from '@/components/sistema/ModuleHealthWidget';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ComprasHealthBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  
  if (!empresaAtual?.id && grupoAtual?.id === undefined) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <ModuleHealthWidget
        moduleName="Ordens de Compra"
        entities={['OrdemCompra']}
        icon={FileText}
        color="blue"
      />
      <ModuleHealthWidget
        moduleName="Solicitações"
        entities={['SolicitacaoCompra']}
        icon={Package}
        color="purple"
      />
      <ModuleHealthWidget
        moduleName="Cotações"
        entities={['Cotacao']}
        icon={BarChart3}
        color="amber"
      />
    </div>
  );
}