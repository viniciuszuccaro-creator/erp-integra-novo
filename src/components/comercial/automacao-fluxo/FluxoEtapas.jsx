import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Package, DollarSign, Truck, FileText } from "lucide-react";

const ETAPAS = [
  { id: 'estoque', label: 'Baixa de Estoque', icon: Package },
  { id: 'financeiro', label: 'Gerar Financeiro', icon: DollarSign },
  { id: 'logistica', label: 'Criar Logística', icon: Truck },
  { id: 'status', label: 'Atualizar Status', icon: FileText }
];

export default function FluxoEtapas({ etapaConcluida, executando }) {
  const concluidasCount = Object.values(etapaConcluida).filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {ETAPAS.map((etapa, index) => {
        const Icon = etapa.icon;
        const concluida = etapaConcluida[etapa.id];
        const emAndamento = executando && index === concluidasCount;
        return (
          <Card key={etapa.id} className={`${
            concluida ? 'border-green-400 bg-green-50'
            : emAndamento ? 'border-blue-400 bg-blue-50 animate-pulse'
            : 'border-slate-200'
          }`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${concluida ? 'bg-green-600' : 'bg-slate-200'}`}>
                {concluida ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Icon className="w-6 h-6 text-slate-500" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{etapa.label}</p>
                <p className="text-xs text-slate-500">{concluida ? 'Concluído' : 'Pendente'}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}