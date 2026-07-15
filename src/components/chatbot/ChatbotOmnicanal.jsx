import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function ChatbotOmnicanal() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [canal, setCanal] = useState('web');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const enviar = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input, canal, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `[${canal}] Responda como um assistente omnicanal: ${input}`,
        model: 'gpt_5_4'
      });
      
      setMessages((prev) => [...prev, { role: 'assistant', content: res, canal, timestamp: new Date() }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Erro: ${err.message}`, canal, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const canalIcons = { web: MessageSquare, whatsapp: MessageCircle, email: Mail, telefone: Phone };
  const CanalIcon = canalIcons[canal];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 flex items-center gap-2">
        <CanalIcon className="w-5 h-5 text-white" />
        <h3 className="font-semibold text-white">Chatbot Omnicanal</h3>
      </div>

      <div className="flex gap-2 p-3 border-b bg-gray-50">
        {['web', 'whatsapp', 'email', 'telefone'].map((c) => (
          <Button key={c} size="sm" variant={canal === c ? 'default' : 'outline'} onClick={() => setCanal(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : msg.isError ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-900'}`}>
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1">{msg.timestamp?.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm">Digitando...</div>}
        <div ref={endRef} />
      </div>

      <div className="border-t p-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && enviar()} placeholder="Escreva sua mensagem..." className="flex-1 px-3 py-2 border rounded text-sm" />
        <Button onClick={enviar} disabled={loading || !input.trim()} className="gap-1">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}