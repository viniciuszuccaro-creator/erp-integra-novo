// Ações sensíveis do Comercial — granularidade RBAC centralizada para a Central 360°
// Consulta o perfil de acesso (PerfilAcesso) pelo módulo Comercial / submódulo Pedidos.
import usePermissions from '@/components/lib/usePermissions';

export default function useAcoesComerciais() {
  const { hasPermission, isLoading } = usePermissions();

  return {
    carregando: isLoading,
    podeVisualizar: hasPermission('Comercial', 'Pedidos', 'visualizar'),
    podeEditar: hasPermission('Comercial', 'Pedidos', 'editar'),
    podeCriar: hasPermission('Comercial', 'Pedidos', 'criar'),
    // Aprovação de desconto acima do limite e aprovação de proposta
    podeAprovarDesconto: hasPermission('Comercial', 'Pedidos', 'aprovar')
      || hasPermission('Comercial', 'Pedidos', 'desconto')
      || hasPermission('Comercial', 'Pedidos', 'aprovar_desconto'),
    podeAprovar: hasPermission('Comercial', 'Pedidos', 'aprovar'),
    podeEmitir: hasPermission('Comercial', 'Pedidos', 'emitir'),
    podeExportar: hasPermission('Comercial', 'Pedidos', 'exportar'),
  };
}