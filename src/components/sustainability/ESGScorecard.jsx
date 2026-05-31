/**
 * ESGScorecard v1.0
 * Scorecard ESG (Environmental, Social, Governance)
 * Passo 31: Compliance com standards internacionais
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle2 } from 'lucide-react';

const ESG_METRICS = [
  { categoria: 'Environmental', score: 87, items: ['Carbon Neutral', 'Renewable 60%', 'Zero Waste'] },
  { categoria: 'Social', score: 82, items: ['Fair Wages', 'Diversity 45%', 'Health&Safety'] },
  { categoria: 'Governance', score: 91, items: ['Ethics Code', 'RBAC', 'Audit Trail'] },
];

export default function ESGScorecard({ empresa }) {
  const [esg] = useState(ESG_METRICS);

  const mediaESG = Math.round(esg.reduce((acc, e) => acc + e.score, 0) / esg.length);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-green-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-green-400" />
        ESG Scorecard
      </h2>

      {/* Overall ESG */}
      <Card className="p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-400/40 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">ESG Overall Score</p>
            <p className="text-5xl font-black text-green-400">{mediaESG}</p>
            <p className="text-sm text-slate-300 mt-2">Muito Bom (&gt;80)</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-4 border-green-500/30 flex items-center justify-center">
              <p className="text-3xl font-bold text-green-400">{mediaESG}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pillars */}
      <div className="space-y-3">
        {esg.map((pillar, idx) => (
          <Card key={idx} className="p-4 bg-white/5 border border-green-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <p className="font-bold text-white">{pillar.categoria}</p>
              <Badge className="bg-green-500/20 text-green-300 text-lg">{pillar.score}</Badge>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
              <span className="text-sm font-bold text-white">{pillar.score}%</span>
            </div>

            {/* Items */}
            <div className="flex flex-wrap gap-2">
              {pillar.items.map((item, i) => (
                <Badge key={i} className="bg-white/10 text-slate-200 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  {item}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Compliance */}
      <Card className="p-4 bg-green-500/10 border border-green-400/40 rounded-lg">
        <p className="text-sm text-green-300 font-semibold mb-2">✓ Compliant com</p>
        <div className="flex flex-wrap gap-2">
          {['GRI Standards', 'SASB', 'TCFD', 'B-Corp', 'ISO 26000'].map((std) => (
            <Badge key={std} className="bg-green-500/20 text-green-300 text-xs">
              {std}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}