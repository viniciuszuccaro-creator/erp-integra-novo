import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

export default function CicloXWhatsAppBotPanel() {
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const handleSendMessage = async () => {
    if (!message.trim() || !phone.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('whatsappBotOrchestrator', {
        message,
        phone_number: phone,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id
      });
      setResponses([...responses, { user: message, bot: res.data?.resposta, intent: res.data?.intent }]);
      setMessage('');
    } catch (error) {
      setResponses([...responses, { user: message, bot: `Erro: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-500" />
          WhatsApp Bot Orchestrator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Telefone (55 11 999...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="space-y-2 h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
          {responses.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhuma mensagem ainda...</p>
          ) : (
            responses.map((r, i) => (
              <div key={i} className="space-y-1 text-sm">
                <p className="text-right text-blue-600">👤 {r.user}</p>
                <p className="text-left text-green-600">🤖 {r.bot}</p>
                <span className="text-xs text-slate-400">Intent: {r.intent}</span>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}