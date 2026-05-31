import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Activity, Zap } from 'lucide-react';

export default function DataVisualizationEngine() {
  const [selectedView, setSelectedView] = useState('correlacao');

  const correlationData = [
    { x: 82, y: 3.2, name: 'RH - Produtividade vs Turnover', tamanho: 400 },
    { x: 94, y: 0.8, name: 'Logística - On-time vs Avarias', tamanho: 600 },
    { x: 98.5, y: 1.2, name: 'Produção - Qualidade vs Refugo', tamanho: 500 },
    { x: 87, y: 18500, name: 'Comercial - Utilização vs Ticket', tamanho: 550 },
    { x: 78, y: 2100, name: 'RH - Satisfação vs Custos', tamanho: 450 },
  ];

  const radarMetrics = [
    { metric: 'Financeiro', A: 91, B: 85, C: 88 },
    { metric: 'RH', A: 82, B: 75, C: 80 },
    { metric: 'Logística', A: 94, B: 88, C: 92 },
    { metric: 'Produção', A: 98, B: 92, C: 95 },
    { metric: 'Comercial', A: 88, B: 82, C: 86 },
  ];

  const heatmapData = [
    { periodo: 'Jan-Mai', RH: 78, Logistica: 90, Producao: 95, Comercial: 85, Financeiro: 88 },
    { periodo: 'Feb-Jun (projecao)', RH: 80, Logistica: 92, Producao: 97, Comercial: 87, Financeiro: 89 },
    { periodo: 'Mar-Jul (projecao)', RH: 82, Logistica: 94, Producao: 98, Comercial: 89, Financeiro: 91 },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Seletor de Visualizações */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedView('correlacao')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedView === 'correlacao'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Matriz de Correlação
        </button>
        <button
          onClick={() => setSelectedView('radar')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedView === 'radar'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Análise Radar
        </button>
        <button
          onClick={() => setSelectedView('heatmap')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedView === 'heatmap'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Mapa de Calor
        </button>
      </div>

      {/* Matriz de Correlação */}
      {selectedView === 'correlacao' && (
        <div className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Matriz de Correlação: Indicadores vs Resultados
              </CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    stroke="#94a3b8"
                    label={{ value: 'Indicador de Eficiência (%)', position: 'right', offset: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    stroke="#94a3b8"
                    label={{ value: 'Resultado de Negócio (k)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload?.[0]) {
                        return (
                          <div className="bg-slate-900 p-2 rounded border border-slate-600 text-xs text-slate-200">
                            <p className="font-semibold">{payload[0].payload.name}</p>
                            <p>Eficiência: {payload[0].payload.x}%</p>
                            <p>Resultado: {payload[0].payload.y}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    name="Correlação"
                    data={correlationData}
                    fill="#3b82f6"
                    fillOpacity={0.7}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">Insights de Correlação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { insight: 'Logística On-time tem maior correlação com satisfação do cliente (0.94)', impacto: 'Alto' },
                { insight: 'Produção Qualidade inversamente correlacionada com custos de garantia (-0.88)', impacto: 'Alto' },
                { insight: 'RH Satisfação fraca correlação com turnover (0.62) - investigar fatores externos', impacto: 'Médio' },
                { insight: 'Comercial Ticket médio cresce com utilização de RH (+0.71)', impacto: 'Médio' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <p className="text-sm text-white mb-1">{item.insight}</p>
                  <Badge className={item.impacto === 'Alto' ? 'bg-red-900 text-red-200' : 'bg-yellow-900 text-yellow-200'}>
                    Impacto {item.impacto}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Análise Radar */}
      {selectedView === 'radar' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Análise Radar: Comparativo de Departamentos vs Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarMetrics}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#94a3b8" angle={90} domain={[0, 100]} />
                <Radar name="Empresa A" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Radar name="Empresa B" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                <Radar name="Empresa C" dataKey="C" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Mapa de Calor */}
      {selectedView === 'heatmap' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Mapa de Calor: Performance Temporal (Atual vs Projeções)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {heatmapData.map((row, idx) => (
                <div key={idx} className="border-b border-slate-600 pb-3 last:border-b-0">
                  <p className="text-sm font-semibold text-white mb-2">{row.periodo}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'RH', value: row.RH },
                      { label: 'Logística', value: row.Logistica },
                      { label: 'Produção', value: row.Producao },
                      { label: 'Comercial', value: row.Comercial },
                      { label: 'Financeiro', value: row.Financeiro },
                    ].map((dept, didx) => {
                      const intensity = dept.value / 100;
                      return (
                        <div
                          key={didx}
                          className="p-4 rounded-lg text-center cursor-pointer hover:scale-105 transition-transform"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8})`,
                            borderColor: `rgba(59, 130, 246, 1)`,
                            borderWidth: '1px',
                          }}
                        >
                          <p className="text-xs text-slate-200 font-semibold mb-1">{dept.label}</p>
                          <p className="text-lg font-bold text-white">{dept.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}