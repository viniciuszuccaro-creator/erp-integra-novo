/**
 * DecisionEngine v1.0
 * Motor de decisão inteligente para executivos
 * Passo 33: IA sugere decisão + análise de risco + impacto
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';

const PENDING_DECISIONS = [
  {
    id: 1,
    titulo: 'Expansão Zuccaro MG — Nova linha CNC',
    tipo: 'investimento',
    impacto: 'alto',
    recomendacao: 'APROVAR',
    confianca: 91,
    payback: '14 meses',
    roi: '+34%',
    risco: 'Baixo',
    fatores: ['Demanda crescente MG +28%', 'Concorrência aumentando', 'Payback < 18 meses'],
  },
  {
    id: 2,
    titulo: 'Parceria Distribuidora Nordeste',
    tipo: 'parceria',
    impacto: 'alto',
    recomendacao: 'AGUARDAR',
    confianca: 74,
    payback: '24 meses',
    roi: '+18%',
    risco: 'Médio',
    fatores: ['Margem menor que threshold', 'Mercado regional incerto', 'Aguardar Q3 dados'],
  },
  {
    id: 3,
    titulo: 'Contratação 3 Operadores CNC',
    tipo: 'rh',
    impacto: 'medio',
    recomendacao: 'APROVAR',
    confianca: 96,
    payback: '6 meses',
    roi: '+22%',
    risco: 'Baixo',
    fatores: ['OEE limitado por mão de obra', 'Custo < ganho produção', 'Demanda garantida'],
  },
];

const REC_CONFIG = {
  APROVAR: { color: 'bg-green-500/20 text-green-300', border: 'border-green-500/40' },
  AGUARDAR: { color: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/40' },
  REJEITAR: { color: 'bg-red-500/20 text-red-300', border: 'border-red-500/40' },
};

export default function DecisionEngine({ role, empresa }) {
  const [decisions] = useState(PENDING_DECISIONS);
  const [selected, setSelected] = useState(null);

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-6 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      {/* Lista de Decisões */}
      <div className="flex-1 space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-violet-400" />
          Decisões Pendentes
        </h2>
        {decisions.map((dec) => {
          const cfg = REC_CONFIG[dec.recomendacao];
          return (
            <Card
              key={dec.id}
              onClick={() => setSelected(dec)}
              className={`p-4 bg-white/5 border rounded-lg cursor-pointer hover:bg-white/10 transition-all ${
                selected?.id === dec.id ? 'border-violet-400 bg-white/10' : 'border-violet-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-white">{dec.titulo}</p>
                  <p className="text-xs text-slate-400 mt-1">{dec.tipo} • Impacto: {dec.impacto}</p>
                </div>
                <Badge className={cfg.color}>{dec.recomendacao}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>ROI: <strong className="text-white">{dec.roi}</strong></span>
                <span>Payback: <strong className="text-white">{dec.payback}</strong></span>
                <span>Confiança IA: <strong className="text-violet-300">{dec.confianca}%</strong></span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detalhe da Decisão */}
      <div className="w-full md:w-80 flex flex-col gap-3">
        {selected ? (
          <>
            <Card className="p-4 bg-violet-500/10 border border-violet-400/40 rounded-lg">
              <p className="font-bold text-white mb-2">{selected.titulo}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recomendação IA</span>
                  <Badge className={REC_CONFIG[selected.recomendacao].color}>{selected.recomendacao}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Confiança</span>
                  <span className="text-violet-300 font-bold">{selected.confianca}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ROI Projetado</span>
                  <span className="text-green-400 font-bold">{selected.roi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risco</span>
                  <span className="text-white font-bold">{selected.risco}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-slate-400 mb-2 font-semibold">Fatores IA</p>
              {selected.fatores.map((f, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <p className="text-xs text-slate-300">{f}</p>
                </div>
              ))}
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <button className="p-3 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-all">
                ✓ Aprovar
              </button>
              <button className="p-3 bg-red-600/40 text-red-300 rounded-lg font-semibold text-sm hover:bg-red-600/60 transition-all">
                ✗ Rejeitar
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-slate-400 text-sm">Selecione uma decisão para ver análise IA detalhada</p>
          </div>
        )}
      </div>
    </div>
  );
}