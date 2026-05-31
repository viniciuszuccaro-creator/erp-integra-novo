import React, { useState } from 'react';
import { Brain, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function AIDecisionEngine() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAIRequest = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const result = await base44.functions.invoke('iaGenerativeContextual', {
        prompt: prompt,
        context_entities: ['Pedido', 'Cliente', 'Financeiro', 'Estoque'],
        model: 'automatic',
        include_recommendations: true
      });

      const newMessage = { role: 'assistant', content: result.data?.response };
      setHistory(prev => [...prev, { role: 'user', content: prompt }, newMessage]);
      setResponse(newMessage);
      setPrompt('');
    } catch (error) {
      setResponse({ role: 'error', content: `Erro: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Chat History */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-4 h-96 overflow-y-auto space-y-3">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <Brain className="w-8 h-8 mr-2 opacity-50" />
            <span>Inicie uma conversa com a IA...</span>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'error'
                  ? 'bg-red-600/20 text-red-400'
                  : 'bg-slate-700 text-slate-100'
              }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-4 space-y-3">
        <Textarea
          placeholder="Solicite análises, recomendações ou automações (ex: 'Analise o churn de clientes nos últimos 30 dias')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          disabled={loading}
        />
        <Button
          onClick={handleAIRequest}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Solicitação
            </>
          )}
        </Button>
      </div>
    </div>
  );
}