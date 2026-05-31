import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Cpu, Truck, Package, Users, DollarSign } from 'lucide-react';

const kpis = [
  { label: 'OEE Geral', valor: '87.4%', icone: Cpu, cor: 'text-emerald-400', meta: '90%', status: 'Bom' },
  { label: 'Entregas no Prazo', valor: '91.2%', icone: Truck, cor: 'text-blue-400', meta: '95%', status: 'Atenção' },
  { label: 'Giro Estoque', valor: '4.8x', icone: Package, cor: 'text-purple-400', meta: '5x', status: 'Bom' },
  { label: 'Eficiência RH', valor: '83%', icone: Users, cor: 'text-cyan-400', meta: '88%', status: 'Atenção' },
  { label: 'Custo Operacional', valor: 'R$ 218k', icone: DollarSign, cor: 'text-yellow-400', meta: '<R$ 200k', status: 'Crítico' },
  { label: 'SLA Atendimento', valor: '97.8%', icone: Activity, cor: 'text-emerald-400', meta: '98%', status: 'Bom' },
];

const statusBadge = (s) => {
  switch (s) {
    case 'Bom': return 'bg-emerald-900 text-emerald-200';
    case 'Atenção': return 'bg-yellow-900 text-yellow-200';
    case 'Crítico': return 'bg-red-900 text-red-200';
    default: return 'bg-slate-700 text-slate-200';
  }
};

export default function OperationsKPIBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icone;
        return (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${kpi.cor}`} />
                <p className="text-xs text-slate-400 truncate">{kpi.label}</p>
              </div>
              <p className={`text-lg font-bold ${kpi.cor}`}>{kpi.valor}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-slate-500">Meta: {kpi.meta}</p>
                <Badge className={`text-xs py-0 ${statusBadge(kpi.status)}`}>{kpi.status}</Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}