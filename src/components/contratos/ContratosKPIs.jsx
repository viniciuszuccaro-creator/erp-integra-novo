import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, DollarSign, Clock, AlertCircle, TrendingUp, FileText } from "lucide-react";

export default function ContratosKPIs({ contratos = [] }) {
  const vigentes = contratos.filter(c => c.status === 'Vigente');
  const aguardando = contratos.filter(c => c.status === 'Aguardando Assinatura');
  const vencidos = contratos.filter(c => c.status === 'Vencido');
  const valorMRR = vigentes.reduce((s, c) => s + (c.valor_mensal || 0), 0);

  const hoje = new Date();
  const proximosVencer = vigentes.filter(c => {
    if (!c.data_fim) return false;
    const dias = Math.floor((new Date(c.data_fim) - hoje) / (1000 * 60 * 60 * 24));
    return dias > 0 && dias <= 60;
  });

  const kpis = [
    { label: "Vigentes", value: vigentes.length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "MRR", value: `R$ ${(valorMRR / 1000).toFixed(1)}k`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Próx. Vencer (60d)", value: proximosVencer.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Aguard. Assinatura", value: aguardando.length, icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Vencidos", value: vencidos.length, icon: TrendingUp, color: "text-red-600", bg: "bg-red-100" },
    { label: "Total", value: contratos.length, icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {kpis.map((k) => (
        <Card key={k.label} className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">{k.label}</span>
              <div className={`p-1.5 rounded-lg ${k.bg}`}>
                <k.icon className={`w-3.5 h-3.5 ${k.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}