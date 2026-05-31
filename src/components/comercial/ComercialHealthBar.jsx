/**
 * ComercialHealthBar v1.0
 * Barra de saúde do módulo Comercial
 * Regra-Mãe: integração de resiliência
 */
import { ShoppingCart, FileText } from 'lucide-react';
import ModuleHealthWidget from '@/components/sistema/ModuleHealthWidget';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ComercialHealthBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  
  if (!empresaAtual?.id && grupoAtual?.id === undefined) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <ModuleHealthWidget
        moduleName="Pedidos"
        entities={['Pedido']}
        icon={ShoppingCart}
        color="blue"
      />
      <ModuleHealthWidget
        moduleName="Notas Fiscais"
        entities={['NotaFiscal']}
        icon={FileText}
        color="purple"
      />
    </div>
  );
}