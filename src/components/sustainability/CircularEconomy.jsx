/**
 * CircularEconomy v1.0
 * Economia Circular - Reutilização e Reciclagem
 * Passo 31: Rastreamento de resíduos reutilizáveis
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Recycle } from 'lucide-react';

const CIRCULAR_DATA = [
  { material: 'Aço Resíduo', quantidade: 1240, unidade: 'kg', reutilizacao: '94%', destino: 'Reciclagem' },
  { material: 'Plástico', quantidade: 340, unidade: 'kg', reutilizacao: '67%', destino: 'Reciclagem' },
  { material: 'Papelão', quantidade: 890, unidade: 'kg', reutilizacao: '100%', destino: 'Reutilização' },
  { material: 'Óleo Industrial', quantidade: 220, unidade: 'litros', reutilizacao: '85%', destino: 'Reciclagem' },
];

export default function CircularEconomy({ empresa }) {
  const [data] = useState(CIRCULAR_DATA);

  const totalResiduo = data.reduce((acc, d) => acc + d.quantidade, 0);
  const taxaCircular = Math.round(data.reduce((acc, d) => acc + parseInt(d.reutilizacao), 0) / data.length);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-green-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Recycle className="w-6 h-6 text-emerald-400 animate-spin" />
        Circular Economy
      </h2>

      {/* Score Circular */}
      <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/40 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Circularidade Média</p>
            <p className="text-4xl font-black text-emerald-400">{taxaCircular}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Total Resíduo</p>
            <p className="text-3xl font-bold text-white">{totalResiduo.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-400">kg/mês</p>
          </div>
        </div>
      </Card>

      {/* Materiais */}
      <div className="space-y-3">
        {data.map((item, idx) => (
          <Card key={idx} className="p-4 bg-white/5 border border-emerald-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-white">{item.material}</p>
                <p className="text-xs text-slate-400">{item.quantidade} {item.unidade} • {item.destino}</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300">{item.reutilizacao}</Badge>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                style={{ width: `${parseInt(item.reutilizacao)}%` }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Meta Circular */}
      <Card className="p-4 bg-emerald-500/10 border border-emerald-400/40 rounded-lg">
        <p className="text-sm text-emerald-300 font-semibold mb-1">♻️ Meta Circular 2026</p>
        <p className="text-xs text-slate-300">
          ✓ 95% circularidade média • ✓ Zero resíduos para aterro • ✓ 100% papelão reutilizado
        </p>
      </Card>
    </div>
  );
}