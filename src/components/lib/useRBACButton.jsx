/**
 * Hook para validação RBAC em botões sensíveis
 * Padrão: Módulo.Entidade.Ação
 * Exemplo: Comercial.Pedido.aprovar
 */
import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import usePermissions from '@/components/lib/usePermissions';
import { useUser } from '@/components/lib/UserContext';
import { toast } from 'sonner';

export const useRBACButton = (permissionKey, isSensitive = false) => {
  const { hasPermission, isAdmin, isLoading } = usePermissions();
  const { user } = useUser();

  // Parse permission key: "Modulo.Entidad.Acao"
  const [module, entity, action] = permissionKey?.split('.') || [null, null, null];

  // Check if user has permission — fail-closed durante carregamento
  const isAllowed = isAdmin || hasPermission(module, entity, action);

  // Wrapper para ação com auditoria obrigatória se sensível
  const executeWithAudit = useCallback(async (actionFn, auditData = {}) => {
    if (isLoading) {
      toast.info('Verificando permissões...');
      return null;
    }
    if (!isAllowed) {
      toast.error('Permissão negada: ' + permissionKey);
      return null;
    }

    try {
      // Executar ação
      const result = await actionFn();

      // Auditoria se for sensível
      if (isSensitive && user?.id) {
        try {
          await base44.entities.AuditLog.create({
            usuario: user.full_name || user.email,
            usuario_id: user.id,
            acao: action?.charAt(0).toUpperCase() + action?.slice(1),
            modulo: module,
            entidade: entity,
            tipo_auditoria: 'acao_sensivel',
            descricao: `Ação sensível: ${permissionKey}`,
            dados_novos: auditData,
            data_hora: new Date().toISOString()
          });
        } catch (auditErr) {
          console.warn('Auditoria falhou:', auditErr);
        }
      }

      return result;
    } catch (err) {
      toast.error('Erro ao executar ação: ' + err.message);
      throw err;
    }
  }, [isAllowed, isLoading, permissionKey, isSensitive, user?.id, module, entity, action]);

  return {
    isAllowed,
    isLoading,
    permissionKey,
    executeWithAudit
  };
};

export default useRBACButton;