import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Clock, Smartphone, Lock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';
import { DEFAULT_SECURITY_CONFIG, normalizeSecurityConfig } from './seguranca/securityConfigDefaults';
import SegurancaJWTTab from './seguranca/SegurancaJWTTab';
import SegurancaSessoesTab from './seguranca/SegurancaSessoesTab';
import SegurancaMFATab from './seguranca/SegurancaMFATab';
import SegurancaSenhasTab from './seguranca/SegurancaSenhasTab';

/**
 * Configuração de Segurança e Sessões — Orchestrator
 * Refatorado: abas extraídas para seguranca/Seguranca*Tab.jsx
 */
export default function ConfiguracaoSeguranca({ empresaId, grupoId }) {
  const [salvando, setSalvando] = useState(false);
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { isAdmin, hasPermission } = usePermissions();
  const grupoAtivoId = grupoId || grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || (() => {
    try { return localStorage.getItem('group_atual_id'); } catch { return null; }
  })();
  const empresaAtivaId = empresaId || empresaAtual?.id || null;
  const scopeId = empresaAtivaId || grupoAtivoId || 'sem-contexto';
  const scope = empresaAtivaId ? { empresa_id: empresaAtivaId } : grupoAtivoId ? { group_id: grupoAtivoId } : {};
  const contextoValido = scopeId !== 'sem-contexto';
  const podeEditarSeguranca = isAdmin() || hasPermission('Sistema', 'Segurança', 'editar') || hasPermission('Sistema', 'Seguranca', 'editar');
  const controlesDesabilitados = !contextoValido || !podeEditarSeguranca;

  const { data: config, isLoading } = useQuery({
    queryKey: ['config-seguranca', scopeId],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoSeguranca.filter(scope);
      if (configs.length > 0) {
        return normalizeSecurityConfig(configs[0]);
      }
      return normalizeSecurityConfig({
        empresa_id: empresaAtivaId || null,
        group_id: grupoAtivoId || null,
        ...DEFAULT_SECURITY_CONFIG
      });
    },
    enabled: contextoValido,
  });

  const [formData, setFormData] = useState(normalizeSecurityConfig(config || {}));

  useEffect(() => {
    if (config) {
      setFormData(normalizeSecurityConfig(config));
    }
  }, [config]);

  const syncSecurityMirrorConfigs = async (data) => {
    const mirrorConfigs = [
      ['cc_exigir_mfa', data.exigir_mfa],
      ['seg_login_duplo_fator', data.exigir_mfa],
      ['cc_bloquear_ips_suspeitos', data.bloqueio_ip_suspeito],
      ['seg_bloquear_ip_suspeito', data.bloqueio_ip_suspeito],
      ['cc_ia_seguranca_ativa', data.detectar_anomalias_ia],
      ['seg_sessao_unica', data.sessao_unica],
      ['seg_notif_novo_dispositivo', data.notificar_novo_dispositivo],
      ['seg_auditoria_detalhada', true],
    ];

    await Promise.all(mirrorConfigs.map(([chave, ativa]) => base44.functions.invoke('upsertConfig', {
      chave,
      data: { chave, categoria: 'Seguranca', ativa: Boolean(ativa), origem: 'ConfiguracaoSeguranca' },
      scope,
    })));
  };

  const salvarMutation = useMutation({
    mutationFn: async (data) => {
      const clean = normalizeSecurityConfig(data);
      const stamped = {
        ...clean,
        empresa_id: empresaAtivaId || null,
        group_id: grupoAtivoId || null,
        origem_configuracao: empresaAtivaId ? 'empresa' : 'grupo',
      };
      const result = config?.id
        ? await base44.entities.ConfiguracaoSeguranca.update(config.id, stamped)
        : await base44.entities.ConfiguracaoSeguranca.create(stamped);
      await syncSecurityMirrorConfigs(stamped);
      try {
        const me = await base44.auth.me();
        await base44.entities.AuditLog.create({
          usuario: me?.full_name || me?.email || 'Usuario',
          usuario_id: me?.id || null,
          acao: config?.id ? 'Edicao' : 'Criacao',
          modulo: 'Seguranca',
          entidade: 'ConfiguracaoSeguranca',
          registro_id: result?.id || config?.id,
          empresa_id: empresaAtivaId || null,
          group_id: grupoAtivoId || null,
          descricao: 'Configuracao de seguranca atualizada',
          dados_novos: stamped,
          sucesso: true,
          data_hora: new Date().toISOString()
        });
      } catch {}
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-seguranca', scopeId] });
      queryClient.invalidateQueries({ queryKey: ['config-center-v2'] });
      queryClient.invalidateQueries({ queryKey: ['config-global'] });
      toast.success('✅ Configuração salva com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast.error('❌ Erro ao salvar configuração');
    },
    onSettled: () => setSalvando(false)
  });

  const handleSalvar = () => {
    if (!contextoValido) {
      toast.error('Selecione um grupo ou empresa antes de salvar.');
      return;
    }
    if (!podeEditarSeguranca) {
      toast.error('Sem permissao para editar configuracoes de seguranca.');
      return;
    }
    setSalvando(true);
    salvarMutation.mutate(normalizeSecurityConfig(formData));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-6">
      <Alert className={formData.jwt_ativo ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}>
        <Shield className={`w-5 h-5 ${formData.jwt_ativo ? 'text-green-600' : 'text-orange-600'}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${formData.jwt_ativo ? 'text-green-900' : 'text-orange-900'}`}>
                {formData.jwt_ativo ? '✅ JWT e Controle de Sessões Ativo' : '⚠️ Autenticação JWT Desativada'}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                {formData.jwt_ativo
                  ? `Access: ${formData.jwt_validade_access_minutos}min • Refresh: ${formData.jwt_validade_refresh_dias}dias • Max: ${formData.sessoes_simultaneas_max} sessões`
                  : 'Ative JWT para maior segurança'
                }
              </p>
            </div>
            <div className="flex gap-2">
              {formData.exigir_mfa && <Badge className="bg-purple-600">MFA Ativo</Badge>}
              {formData.detectar_anomalias_ia && <Badge className="bg-blue-600">IA Segurança</Badge>}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="jwt" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jwt"><Key className="w-4 h-4 mr-2" />JWT</TabsTrigger>
          <TabsTrigger value="sessoes"><Clock className="w-4 h-4 mr-2" />Sessões</TabsTrigger>
          <TabsTrigger value="mfa"><Smartphone className="w-4 h-4 mr-2" />MFA</TabsTrigger>
          <TabsTrigger value="senhas"><Lock className="w-4 h-4 mr-2" />Senhas</TabsTrigger>
        </TabsList>

        <TabsContent value="jwt" className="space-y-6 mt-6">
          <SegurancaJWTTab formData={formData} setFormData={setFormData} controlesDesabilitados={controlesDesabilitados} />
        </TabsContent>

        <TabsContent value="sessoes" className="space-y-6 mt-6">
          <SegurancaSessoesTab formData={formData} setFormData={setFormData} controlesDesabilitados={controlesDesabilitados} />
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6 mt-6">
          <SegurancaMFATab formData={formData} setFormData={setFormData} controlesDesabilitados={controlesDesabilitados} />
        </TabsContent>

        <TabsContent value="senhas" className="space-y-6 mt-6">
          <SegurancaSenhasTab formData={formData} setFormData={setFormData} controlesDesabilitados={controlesDesabilitados} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSalvar}
          disabled={salvando || salvarMutation.isPending || controlesDesabilitados}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {salvando || salvarMutation.isPending ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Salvando...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Salvar Configuração</>
          )}
        </Button>
      </div>

      {config?.estatisticas && (
        <div className="grid grid-cols-4 gap-4 p-6 rounded-xl shadow-md bg-gradient-to-br from-slate-50 to-purple-50">
          <div>
            <p className="text-xs text-slate-600 mb-1">Sessões Ativas</p>
            <p className="text-2xl font-bold text-green-600">{config.estatisticas.total_sessoes_ativas || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Tentativas Falhas</p>
            <p className="text-2xl font-bold text-orange-600">{config.estatisticas.total_tentativas_falhas || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Bloqueios</p>
            <p className="text-2xl font-bold text-red-600">{config.estatisticas.total_bloqueios || 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">MFA Validados</p>
            <p className="text-2xl font-bold text-purple-600">{config.estatisticas.total_mfa_validados || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}