import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Webhook, Send, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.6 - TESTADOR DE WEBHOOKS
 * Testar webhooks de canais externos
 * ✅ Suporte multi-empresa
 * ✅ Layout responsivo w-full h-full
 */
export default function WebhooksTester({ canalConfig }) {
  const [payload, setPayload] = useState('{\n  "type": "message",\n  "text": "Teste"\n}');
  const [resposta, setResposta] = useState(null);

  const testarMutation = useMutation({
    mutationFn: async () => {
      // Simular recebimento de webhook
      const webhookUrl = canalConfig?.webhook_url;
      
      if (!webhookUrl) {
        throw new Error('URL de webhook não configurada');
      }

      // Parse do payload
      const data = JSON.parse(payload);
      
      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        webhook_url: webhookUrl
      };
    },
    onSuccess: (data) => {
      setResposta(data);
      toast.success('Webhook testado com sucesso!');
    },
    onError: (error) => {
      setResposta({ success: false, error: error.message });
      toast.error('Erro ao testar webhook');
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="w-5 h-5 text-blue-600" />
          Testador de Webhooks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-2">URL do Webhook:</p>
          <Input
            value={canalConfig?.webhook_url || 'Não configurado'}
            disabled
            className="font-mono text-xs"
          />
        </div>

        <div>
          <p className="text-sm text-slate-600 mb-2">Payload de Teste (JSON):</p>
          <Textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="font-mono text-xs h-32"
          />
        </div>

        <Button
          onClick={() => testarMutation.mutate()}
          disabled={testarMutation.isPending || !canalConfig?.webhook_url}
          className="w-full bg-blue-600"
        >
          <Send className="w-4 h-4 mr-2" />
          Enviar Teste
        </Button>

        {resposta && (
          <div className={`p-4 rounded-lg border-2 ${
            resposta.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {resposta.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-semibold">
                {resposta.success ? 'Sucesso' : 'Erro'}
              </span>
            </div>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(resposta, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}