import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Send
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import WhatsAppBusinessEngine from '../sistema/WhatsAppBusinessEngine';

/**
 * Configuração WhatsApp Business
 */
export default function ConfigWhatsAppBusiness({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { grupoAtual, empresaAtual } = useContextoVisual();

  const [config, setConfig] = useState({
    ativo: false,
    api_url: 'https://api.whatsapp.com/send',
    api_token: '',
    numero_whatsapp: '',
    enviar_pedido_aprovado: true,
    enviar_saida_entrega: true,
    enviar_entrega_concluida: true,
    enviar_cobranca: true,
    enviar_cobranca_dias_antes: 3
  });

  const [testando, setTestando] = useState(false);

  const salvarMutation = useMutation({
    mutationFn: async (dados) => {
      await base44.entities.ConfiguracaoSistema.create({
        chave: `whatsapp_business_${empresaId}`,
        categoria: 'Integracoes',
        empresa_id: empresaId || empresaAtual?.id,
        group_id: grupoAtual?.id,
        integracao_whatsapp: dados
      });
    },
    onSuccess: () => {
      toast({ title: '✅ Configuração salva!' });
      queryClient.invalidateQueries({ queryKey: ['config-whatsapp'] });
    }
  });

  const testarEnvio = async () => {
    setTestando(true);

    try {
      const resultado = await WhatsAppBusinessEngine.enviarMensagem(
        config.numero_whatsapp,
        `🎉 *Teste de Integração WhatsApp Business*\n\nOlá!\n\nEste é um teste de envio automático do ERP Zuccaro.\n\nSe você recebeu esta mensagem, a integração está funcionando perfeitamente! ✅`,
        { tipo: 'teste', empresa_id: empresaId }
      );

      if (resultado.sucesso) {
        toast({ 
          title: '✅ Teste enviado!',
          description: 'Mensagem de teste enviada com sucesso'
        });
      } else {
        toast({ 
          title: '❌ Erro no teste',
          description: resultado.erro,
          variant: 'destructive'
        });
      }

    } catch (error) {
      toast({ 
        title: '❌ Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTestando(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="bg-white/80 border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            WhatsApp Business - Mensagens Automáticas
            {config.ativo && (
              <Badge className="bg-green-600 text-white ml-auto">
                <Zap className="w-3 h-3 mr-1" />
                ATIVO
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Status da Integração */}
          <Alert className={config.ativo ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}>
            {config.ativo ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <AlertDescription>
                  <p className="font-semibold text-green-900">✅ Integração Ativa</p>
                  <p className="text-sm text-green-700 mt-1">
                    Mensagens automáticas estão sendo enviadas
                  </p>
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <AlertDescription>
                  <p className="font-semibold text-orange-900">⚠️ Integração Inativa</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Configure e ative para enviar mensagens automáticas
                  </p>
                </AlertDescription>
              </>
            )}
          </Alert>

          {/* Configurações */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Ativar Integração</p>
                <p className="text-sm text-slate-600">Habilitar envios automáticos</p>
              </div>
              <Switch
                checked={config.ativo}
                onCheckedChange={(checked) => setConfig({ ...config, ativo: checked })}
              />
            </div>

            <div>
              <Label>Número WhatsApp da Empresa</Label>
              <Input
                value={config.numero_whatsapp}
                onChange={(e) => setConfig({ ...config, numero_whatsapp: e.target.value })}
                placeholder="(11) 98765-4321"
              />
              <p className="text-xs text-slate-500 mt-1">
                Formato: (DDD) 9XXXX-XXXX
              </p>
            </div>

            <div>
              <Label>API Token (Opcional)</Label>
              <Input
                type="password"
                value={config.api_token}
                onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
                placeholder="Token da API WhatsApp Business"
              />
            </div>

            <div className="border-t pt-4">
              <p className="font-semibold mb-3">Eventos Automáticos</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium">Pedido Aprovado</p>
                    <p className="text-xs text-slate-600">Notificar cliente quando pedido for aprovado</p>
                  </div>
                  <Switch
                    checked={config.enviar_pedido_aprovado}
                    onCheckedChange={(checked) => setConfig({ ...config, enviar_pedido_aprovado: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium">Saída para Entrega</p>
                    <p className="text-xs text-slate-600">Enviar rastreamento quando sair para entrega</p>
                  </div>
                  <Switch
                    checked={config.enviar_saida_entrega}
                    onCheckedChange={(checked) => setConfig({ ...config, enviar_saida_entrega: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium">Entrega Concluída</p>
                    <p className="text-xs text-slate-600">Confirmar entrega realizada</p>
                  </div>
                  <Switch
                    checked={config.enviar_entrega_concluida}
                    onCheckedChange={(checked) => setConfig({ ...config, enviar_entrega_concluida: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="text-sm font-medium">Cobrança (Boleto/PIX)</p>
                    <p className="text-xs text-slate-600">Enviar cobrança automaticamente</p>
                  </div>
                  <Switch
                    checked={config.enviar_cobranca}
                    onCheckedChange={(checked) => setConfig({ ...config, enviar_cobranca: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={testarEnvio}
              disabled={testando || !config.numero_whatsapp}
              variant="outline"
              className="flex-1"
            >
              {testando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Testar Envio
                </>
              )}
            </Button>

            <Button
              onClick={() => salvarMutation.mutate(config)}
              disabled={salvarMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}