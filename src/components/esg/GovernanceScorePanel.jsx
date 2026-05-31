import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function GovernanceScorePanel() {
  const radarData = [
    { indicador: 'Conselho', valor: 88, meta: 90 },
    { indicador: 'Transparência', valor: 82, meta: 85 },
    { indicador: 'Anticorrupção', valor: 95, meta: 95 },
    { indicador: 'LGPD', valor: 94, meta: 90 },
    { indicador: 'Auditoria', valor: 79, meta: 85 },
    { indicador: 'SoD/Controles', valor: 72, meta: 80 },
  ];

  const indicadoresGov = [
    { titulo: 'Score ESG Geral', valor: 'B+', descricao: 'Meta: A até 2027', ok: true },
    { titulo: 'Conselho Independente', valor: '60%', descricao: 'Membro independentes: 3/5', ok: true },
    { titulo: 'Whistleblowing Ativo', valor: 'Sim', descricao: 'Canal anônimo disponível', ok: true },
    { titulo: 'Conflito de Interesses', valor: '2 pendentes', descricao: 'Revisão necessária', ok: false },
    { titulo: 'Divulgação ESG', valor: 'Trimestral', descricao: 'Próximo relatório: Jul 2026', ok: true },
    { titulo: 'Multas/Penalidades', valor: 'Nenhuma', descricao: 'Últimos 12 meses', ok: true },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Radar de Governança */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Radar de Governança Corporativa</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="indicador" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Atual" dataKey="valor" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <Radar name="Meta" dataKey="meta" stroke="#10b981" fill="none" strokeDasharray="5 5" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Indicadores */}
      <div className="grid grid-cols-1 gap-2">
        {indicadoresGov.map((ind, idx) => (
          <Card key={idx} className={`bg-slate-800 border ${ind.ok ? 'border-slate-700' : 'border-red-700'}`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                {ind.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-white">{ind.titulo}</p>
                    <p className={`text-sm font-bold ${ind.ok ? 'text-emerald-400' : 'text-red-400'}`}>{ind.valor}</p>
                  </div>
                  <p className="text-xs text-slate-400">{ind.descricao}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}