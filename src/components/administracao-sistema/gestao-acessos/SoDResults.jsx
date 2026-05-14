import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SoDResults({ resultados = [] }) {
  // Suporta array de resultados com estrutura: { perfil_id, nome, conflitos: [], severidadeMax }
  const results = Array.isArray(resultados) ? resultados : [];
  
  // Agrupa todos os conflitos por severidade
  const allConflitos = results.flatMap(r => 
    (r.conflitos || []).map(c => ({
      ...c,
      perfil: r.nome,
      perfil_id: r.perfil_id
    }))
  );

  if (allConflitos.length === 0) {
    return (
      <Card className="w-full border-green-200 bg-green-50">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-900">Nenhum conflito SoD detectado.</span>
        </CardContent>
      </Card>
    );
  }

  const severityOrder = { Baixa: 1, Média: 2, Alta: 3, Crítica: 4 };
  const maxSeverity = allConflitos.reduce((max, c) => 
    severityOrder[c.severidade] > severityOrder[max?.severidade] ? c : max, 
    allConflitos[0]
  );

  const getSeverityColor = (sev) => {
    switch(sev) {
      case 'Crítica': return 'bg-red-100 text-red-700 border-red-300';
      case 'Alta': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Média': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const getSeverityIcon = (sev) => {
    switch(sev) {
      case 'Crítica': return <AlertTriangle className="w-4 h-4" />;
      case 'Alta': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-900">
          {allConflitos.length} conflito(s) detectado(s)
        </div>
        <Badge className={`gap-1.5 ${getSeverityColor(maxSeverity.severidade)}`}>
          {getSeverityIcon(maxSeverity.severidade)}
          {maxSeverity.severidade}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {allConflitos.map((conflito, idx) => (
          <Card key={`${conflito.perfil_id}-${idx}`} className={`border-2 ${getSeverityColor(conflito.severidade)}`}>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{conflito.perfil}</p>
                  <p className="text-xs text-slate-600">{conflito.regra}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {conflito.severidade}
                </Badge>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {conflito.descricao}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}