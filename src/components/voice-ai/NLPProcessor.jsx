/**
 * NLPProcessor v1.0
 * Processamento de Linguagem Natural
 * Passo 32: Intenção + Contexto + Entidades extraídas
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';

const NLP_ANALYSIS = [
  {
    input: 'Criar novo pedido para cliente XYZ',
    intencao: 'create_order',
    confianca_intencao: 99,
    entidades: [
      { tipo: 'action', valor: 'criar', confidence: 100 },
      { tipo: 'entity_type', valor: 'pedido', confidence: 98 },
      { tipo: 'client_name', valor: 'XYZ', confidence: 96 },
    ],
  },
  {
    input: 'Qual é o OEE da produção?',
    intencao: 'query_metric',
    confianca_intencao: 97,
    entidades: [
      { tipo: 'metric', valor: 'OEE', confidence: 100 },
      { tipo: 'department', valor: 'produção', confidence: 95 },
      { tipo: 'query_type', valor: 'question', confidence: 99 },
    ],
  },
];

export default function NLPProcessor({ empresa }) {
  const [analyses] = useState(NLP_ANALYSIS);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-blue-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Brain className="w-6 h-6 text-purple-400" />
        NLP Analysis
      </h2>

      <div className="space-y-4">
        {analyses.map((analysis, idx) => (
          <Card key={idx} className="p-4 bg-white/5 border border-purple-500/30 rounded-lg">
            <div className="mb-3">
              <p className="text-sm text-slate-400 mb-1">Input</p>
              <p className="text-white font-semibold italic">"{analysis.input}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-white/5 rounded border border-white/10">
                <p className="text-xs text-slate-400">Intenção Detectada</p>
                <p className="text-white font-bold mt-1">{analysis.intencao}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${analysis.confianca_intencao}%` }} />
                  </div>
                  <span className="text-xs text-purple-400">{analysis.confianca_intencao}%</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded border border-white/10">
                <p className="text-xs text-slate-400">Entidades Extraídas</p>
                <p className="text-white font-bold mt-1">{analysis.entidades.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              {analysis.entidades.map((ent, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                  <div>
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs mb-1">{ent.tipo}</Badge>
                    <p className="text-white text-sm font-semibold">{ent.valor}</p>
                  </div>
                  <span className="text-xs text-slate-400">{ent.confidence}%</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}