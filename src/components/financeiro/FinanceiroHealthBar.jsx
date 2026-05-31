/**
 * FinanceiroHealthBar v1.0
 * Barra de saúde do módulo Financeiro
 * Regra-Mãe: integração de resiliência
 */
import { DollarSign, TrendingUp } from 'lucide-react';
import ModuleHealthWidget from '@/components/sistema/ModuleHealthWidget';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function FinanceiroHealthBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  
  // Mostrar apenas se há contexto
  if (!empresaAtual?.id && grupoAtual?.id === undefined) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <ModuleHealthWidget
        moduleName="Contas a Receber"
        entities={['ContaReceber']}
        icon={TrendingUp}
        color="green"
      />
      <ModuleHealthWidget
        moduleName="Contas a Pagar"
        entities={['ContaPagar']}
        icon={DollarSign}
        color="purple"
      />
    </div>
  );
}