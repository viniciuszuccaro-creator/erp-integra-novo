import React, { useState } from 'react';
import { Sparkles, Send, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function IAGenerativaAvancadaPanel({ modulo, contexto }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState('analise');

  const gerar = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `[${modulo}] ${tipo === 'analise' ? 'Analise e recomende' : tipo === 'relatorio' ? 'Gere um relatório executivo sobre' : 'Crie uma estratégia para'}: ${input}. Contexto: ${JSON.stringify(contexto || {})}`,
        add_context_from_internet: true,
        model: 'claude_opus_4_6'
      });
      setOutput(res);
    } catch (err) {
      setOutput(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-4 space-y-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-purple-900">IA Generativa — {modulo}</h3>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tipo:</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-3 py-2 border rounded">
          <option value="analise">Análise & Recomendação</option>
          <option value="relatorio">Relatório Executivo</option>
          <option value="estrategia">Estratégia</option>
        </select>
      </div>

      <div className="space-y-2">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Descreva o que você precisa..." className="w-full h-20 p-2 border rounded text-sm" />
        <Button onClick={gerar} disabled={loading || !input} className="w-full gap-2">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? 'Gerando...' : 'Gerar'}
        </Button>
      </div>

      {output && (
        <div className="bg-white rounded p-3 max-h-48 overflow-auto text-sm space-y-2">
          <pre className="text-xs whitespace-pre-wrap font-sans">{output}</pre>
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(output)} className="gap-1">
            <Copy className="w-3 h-3" /> Copiar
          </Button>
        </div>
      )}
    </div>
  );
}