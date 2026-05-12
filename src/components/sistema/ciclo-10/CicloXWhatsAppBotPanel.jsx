import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, TrendingUp, Brain } from 'lucide-react';

export default function CicloXWhatsAppBotPanel() {
  const [expanded, setExpanded] = useState(false);

  const intents = [
    { name: 'Criar pedido', accuracy: '94.2%', volume: '342/dia' },
    { name: 'Rastrear entrega', accuracy: '97.8%', volume: '218/dia' },
    { name: 'Gerar boleto', accuracy: '91.5%', volume: '127/dia' },
    { name: 'Suporte genérico', accuracy: '88.3%', volume: '156/dia' },
    { name: 'Consultar saldo', accuracy: '96.1%', volume: '89/dia' },
  ];

  return (
    <Card className="w-full h-full bg-gradient-to-br from-green-50 to-teal-50 border-green-200 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-green-600" />
            <CardTitle>WhatsApp Bot Autônomo</CardTitle>
          </div>
          <Badge className="bg-green-600">NLP Ready</Badge>
        </div>
        <p className="text-sm text-slate-600 mt-2">LLM + NLP para pedidos, rastreamento e suporte 24/7</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <p className="text-xs text-slate-500">Conversas/dia</p>
            <p className="text-lg font-bold text-green-600">932</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-teal-100">
            <p className="text-xs text-slate-500">Taxa resolução</p>
            <p className="text-lg font-bold text-teal-600">84.7%</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <p className="text-xs text-slate-500">Tempo resposta</p>
            <p className="text-lg font-bold text-green-600">2.3s</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-teal-100">
            <p className="text-xs text-slate-500">Satisfação</p>
            <p className="text-lg font-bold text-teal-600">4.6/5</p>
          </div>
        </div>

        {/* Intents */}
        <div className="space-y-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white transition"
          >
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Intenções (NLP)
            </h3>
            <span className="text-xs">{expanded ? '▼' : '▶'}</span>
          </button>

          {expanded && (
            <div className="space-y-2 mt-2">
              {intents.map((intent, i) => (
                <div key={i} className="bg-white p-2 rounded-lg border border-green-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{intent.name}</span>
                    <span className="text-green-600">{intent.accuracy}</span>
                  </div>
                  <p className="text-slate-600">{intent.volume}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Capabilities */}
        <div className="bg-white p-3 rounded-lg border border-green-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-green-600" />
            Capacidades
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>✓ Criar pedidos com validação de estoque</li>
            <li>✓ Rastrear entregas com ETA atualizada</li>
            <li>✓ Gerar boletos e links de pagamento</li>
            <li>✓ Responder FAQs com contexto</li>
            <li>✓ Escalar para atendente humano quando necessário</li>
            <li>✓ Multidioma (PT, EN, ES)</li>
          </ul>
        </div>

        {/* Business Impact */}
        <div className="bg-white p-3 rounded-lg border border-green-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Impacto
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Redução de atendimento humano: 60%</li>
            <li>• Pedidos gerados automaticamente: R$ 89K/mês</li>
            <li>• Satisfação do cliente: +23%</li>
            <li>• Disponibilidade: 24/7 sem custo fixo</li>
          </ul>
        </div>

        {/* Endpoint */}
        <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
          <p className="text-slate-400">POST /functions/whatsappBotOrchestrator</p>
          <p className="mt-1 text-green-400">✓ Ativo em produção</p>
        </div>
      </CardContent>
    </Card>
  );
}