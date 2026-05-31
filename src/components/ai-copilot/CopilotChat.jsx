import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader, Lightbulb, History, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CopilotChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const messagesEndRef = useRef(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detectar contexto da página atual
  useEffect(() => {
    const pathname = window.location.pathname;
    let ctx = 'geral';
    if (pathname.includes('comercial')) ctx = 'comercial';
    else if (pathname.includes('estoque')) ctx = 'estoque';
    else if (pathname.includes('financeiro')) ctx = 'financeiro';
    else if (pathname.includes('producao')) ctx = 'producao';
    else if (pathname.includes('crm')) ctx = 'crm';
    setContext(ctx);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Simular resposta IA com recomendações contextuais
      const mockResponse = await generateCopilotResponse(input, context);
      setMessages(prev => [...prev, { role: 'assistant', content: mockResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  const generateCopilotResponse = async (prompt, ctx) => {
    // Integração futura com InvokeLLM
    const responses = {
      comercial: `Recomendação para ${ctx}: Verifique os pedidos com desconto > 15% aprovados hoje. 3 pedidos com margem abaixo de 12% detectados.`,
      estoque: `Status ${ctx}: Estoque crítico em CA-50 10mm (2 toneladas). Reposição automática sugerida. Giro: 4.2 dias.`,
      financeiro: `Análise ${ctx}: R$180k em contas a receber vencidas. 12 clientes em atraso. Sugerir contato? Taxa de cobrança: 91%.`,
      producao: `Operacional ${ctx}: OEE na linha A subiu para 94%. Linha C-Solda parada (manutenção). ETA: 2h30.`,
      crm: `Insights ${ctx}: 5 clientes em risco de churn detectados. NPS: 4.6/5. Próxima ação: follow-up em 2 clientes segmentados.`,
      geral: `Resumo ERP: Dashboard saudável. 12 KPIs no verde. 2 alertas operacionais. OEE médio: 83%.`,
    };
    return responses[ctx] || responses['geral'];
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      {/* Chat Window */}
      {open && (
        <Card className="bg-slate-800 border-slate-700 w-80 h-96 shadow-2xl">
          <CardHeader className="pb-2 border-b border-slate-700 flex flex-row items-center justify-between">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              IA Copilot
            </CardTitle>
            <div className="flex gap-1">
              <button onClick={() => setShowHistory(!showHistory)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200">
                <History className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          
          {showHistory ? (
            <CardContent className="p-3 h-80 overflow-y-auto flex flex-col">
              <p className="text-xs text-slate-400 mb-2">Histórico de Conversas</p>
              {messages.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma conversa ainda</p>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`text-xs mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-900/30 text-blue-200' : 'bg-slate-700/30 text-slate-300'}`}>
                    {msg.content}
                  </div>
                ))
              )}
            </CardContent>
          ) : (
            <>
              <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 max-h-72">
                {messages.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-6">
                    <p className="mb-2">Olá! Sou seu assistente IA.</p>
                    <p>Faça perguntas sobre {context} ou solicite recomendações.</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs text-xs p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2 items-center text-slate-400">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Gerando resposta...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-3 border-t border-slate-700 flex gap-2">
                <Input
                  placeholder="Faça uma pergunta..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 text-xs h-8"
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 h-8 px-3" size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
          title="Abrir IA Copilot"
        >
          <Lightbulb className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}