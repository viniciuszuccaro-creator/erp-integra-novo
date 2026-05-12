import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, BookOpen, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function CicloXIAGenerativaPanel() {
  const [expanded, setExpanded] = useState(false);

  const features = [
    { name: 'Contexto de Empresa', status: '✅ Ready', desc: 'RAG com histórico real da empresa' },
    { name: 'LLM Integrado', status: '✅ Ready', desc: 'Claude/GPT-4 com fallback inteligente' },
    { name: 'Prompts Modulares', status: '✅ Ready', desc: 'Templates por módulo (Comercial, Financeiro, etc)' },
    { name: 'Auditoria IA', status: '✅ Ready', desc: 'Log de todas as sugestões e decisões' },
    { name: 'Feedback Loop', status: '🔄 In Progress', desc: 'Aprendizado contínuo com user feedback' },
    { name: 'Multi-idioma', status: '🔄 Planned', desc: 'Suporte a PT, EN, ES automático' },
  ];

  return (
    <Card className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <CardTitle>IA Generativa Contextual</CardTitle>
          </div>
          <Badge className="bg-blue-600">Core Ready</Badge>
        </div>
        <p className="text-sm text-slate-600 mt-2">LLM + RAG com conhecimento de empresa + auditoria inteligente</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-slate-500">Requisições/dia</p>
            <p className="text-lg font-bold text-blue-600">2.4K</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-cyan-100">
            <p className="text-xs text-slate-500">Latência med.</p>
            <p className="text-lg font-bold text-cyan-600">840ms</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-slate-500">Taxa acerto</p>
            <p className="text-lg font-bold text-blue-600">94.3%</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-cyan-100">
            <p className="text-xs text-slate-500">Custos/mês</p>
            <p className="text-lg font-bold text-cyan-600">R$ 2.8K</p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white transition"
          >
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Funcionalidades
            </h3>
            <span className="text-xs">{expanded ? '▼' : '▶'}</span>
          </button>

          {expanded && (
            <div className="space-y-2 mt-2">
              {features.map((f, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-blue-100 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900">{f.name}</span>
                    <span className="text-xs">{f.status}</span>
                  </div>
                  <p className="text-xs text-slate-600">{f.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Use Cases */}
        <div className="bg-white p-3 rounded-lg border border-blue-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Casos de uso
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Análise automática de documentos fiscais</li>
            <li>• Sugestão de preços e descontos inteligentes</li>
            <li>• Diagnóstico de anomalias financeiras</li>
            <li>• Respostas a perguntas de clientes (chat)</li>
            <li>• Recomendações de produtos cross-sell</li>
          </ul>
        </div>

        {/* Endpoint */}
        <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
          <p className="text-slate-400">POST /functions/iaGenerativeContextual</p>
          <p className="mt-1 text-green-400">✓ Ativo em produção</p>
        </div>
      </CardContent>
    </Card>
  );
}