/**
 * EstoqueHealthBar v1.0
 * Barra de saúde do módulo Estoque
 * Regra-Mãe: integração de resiliência
 */
import { Box, Package } from 'lucide-react';
import ModuleHealthWidget from '@/components/sistema/ModuleHealthWidget';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function EstoqueHealthBar() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  
  if (!empresaAtual?.id && grupoAtual?.id === undefined) return null;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <ModuleHealthWidget
        moduleName="Produtos"
        entities={['Produto']}
        icon={Package}
        color="blue"
      />
      <ModuleHealthWidget
        moduleName="Movimentações"
        entities={['MovimentacaoEstoque']}
        icon={Box}
        color="green"
      />
    </div>
  );
}