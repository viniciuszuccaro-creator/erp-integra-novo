/**
 * CopilotChat v1.0 — Passo 37
 * Chat interativo com IA CoPilot contextual e histórico por empresa
 * Regra-Mãe: w-full h-full, IA generativa, adaptativo
 */
import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Send, Zap, TrendingUp, Package, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const QUICK_ACTIONS = [
  { label: 'Resumo financeiro hoje', icon: DollarSign },
  { label: 'Produtos com estoque crítico', icon: Package },
  { label: 'Pedidos pendentes urgentes', icon: Zap },
  { label: 'Previsão de vendas 30 dias', icon: TrendingUp },
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content: '👋 Olá! Sou o **IA CoPilot** do ERP Zuccaro.\n\nEstou conectado em tempo real a todos os módulos — Financeiro, Estoque, Comercial, Produção e muito mais.\n\nComo posso ajudar você hoje?',
    ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  },
];

export default function CopilotChat({ empresa }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text.trim(), ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o IA CoPilot do ERP Zuccaro — um assistente de gestão empresarial especialista em: financeiro, estoque, comercial, produção, logística, RH e fiscal.
Empresa atual: ${empresa}.
Responda de forma precisa, profissional e objetiva em português brasileiro.
Use emojis relevantes quando útil. Formate com **negrito** onde importante.
Pergunta do usuário: ${text}`,
      });
      const reply = typeof res === 'string' ? res : res?.response || res?.text || JSON.stringify(res);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply, ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Não consegui processar sua mensagem. Tente novamente.', ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-violet-950">
      {/* Context badge */}
      <div className="px-4 pt-3 flex-shrink-0">
        <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30">🏢 {empresa}</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white rounded-br-sm'
                : 'bg-white/10 text-slate-100 rounded-bl-sm border border-white/10'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className="text-xs opacity-50 mt-1 text-right">{msg.ts}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map(({ label, icon: ActionIcon }) => (
            <button
              key={label}
              onClick={() => sendMessage(label)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-slate-300 whitespace-nowrap transition-all border border-white/10 flex-shrink-0"
            >
              <ActionIcon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Pergunte qualquer coisa sobre o ERP..."
            disabled={loading}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-xl transition-all"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}