import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import ConfiguracaoNFeForm from '@/components/cadastros/ConfiguracaoNFeForm';
import ConfiguracaoBoletosForm from '@/components/cadastros/ConfiguracaoBoletosForm';
import ConfiguracaoWhatsAppForm from '@/components/cadastros/ConfiguracaoWhatsAppForm';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

const ENTITY_MAP = {
  nfe: { form: ConfiguracaoNFeForm, key: 'integracao_nfe', queryKey: 'configs-integracoes', title: '⚙️ Configurar NF-e' },
  boleto: { form: ConfiguracaoBoletosForm, key: 'integracao_boletos', queryKey: 'configs-integracoes', title: '⚙️ Configurar Boletos & PIX' },
  whatsapp: { form: ConfiguracaoWhatsAppForm, key: 'integracao_whatsapp', queryKey: 'configs-integracoes', title: '⚙️ Configurar WhatsApp Business' },
};

export default function IntegrationConfigButtons({ integracao, empresaId, groupId }) {
  const { openWindow } = useWindow();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const scopeId = empresaId || groupId || null;
  const scope = empresaId ? { empresa_id: empresaId } : groupId ? { group_id: groupId } : {};

  const handleConfigurar = () => {
    const cfg = ENTITY_MAP[integracao.id];
    if (!cfg) return;

    const handleSubmit = async (data) => {
      try {
        if (!scopeId) throw new Error('Selecione um grupo ou empresa.');
        const chave = `integracoes_${scopeId}`;
        const existentes = await base44.entities.ConfiguracaoSistema.filter({ chave, ...scope }, undefined, 1);
        const payload = { chave, categoria: 'Integracoes', ...scope, [cfg.key]: data };
        if (existentes && existentes.length > 0) {
          await base44.entities.ConfiguracaoSistema.update(existentes[0].id, { ...existentes[0], ...payload });
          toast({ title: `✅ Integração atualizada!` });
        } else {
          await base44.entities.ConfiguracaoSistema.create(payload);
          toast({ title: `✅ Integração criada!` });
        }
        queryClient.invalidateQueries({ queryKey: [cfg.queryKey] });
        queryClient.invalidateQueries({ queryKey: ['status-integracoes', scopeId] });
      } catch (error) {
        toast({ title: `❌ Erro ao salvar`, description: error.message, variant: 'destructive' });
      }
    };

    openWindow(cfg.form, {
      windowMode: true,
      onSubmit: handleSubmit,
      empresaId: empresaId || null,
      groupId: groupId || null,
      scope,
    }, {
      title: cfg.title,
      width: 1000,
      height: 700,
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={integracao.onVerificar}
        disabled={integracao.verificando}
        className="flex-1"
        data-action={`IntegracoesStatus.${integracao.id}
      >
        {integracao.verificando ? 'Verificando...' : 'Verificar'}
      </Button>
      <Button
        size="sm"
        onClick={handleConfigurar}
        className="flex-1"
        data-action={`IntegracoesStatus.${integracao.id}
      >
        <Settings className="w-4 h-4 mr-1" />
        Configurar
      </Button>
    </div>
  );
}