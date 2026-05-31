import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShieldCheck, AlertCircle, TrendingDown } from 'lucide-react';

export default function QualityControlPanel() {
  const [tab, setTab] = useState('spc');

  const spcData = [
    { ponto: 1, valor: 8.2, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 2, valor: 8.1, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 3, valor: 8.5, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 4, valor: 8.9, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 5, valor: 8.3, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 6, valor: 7.4, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 7, valor: 8.0, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 8, valor: 8.2, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 9, valor: 8.6, ucl: 8.8, lcl: 7.6, media: 8.2 },
    { ponto: 10, valor: 8.3, ucl: 8.8, lcl: 7.6, media: 8.2 },
  ];

  const causasRefugo = [
    { name: 'Desvio dimensional', value: 38, cor: '#ef4444' },
    { name: 'Acabamento', value: 24, cor: '#f59e0b' },
    { name: 'Trinca/Falha', value: 18, cor: '#8b5cf6' },
    { name: 'Contaminação', value: 12, cor: '#3b82f6' },
    { name: 'Outros', value: 8, cor: '#6b7280' },
  ];

  const inspecoes = [
    { lote: 'L2024-05-001', produto: 'Bitola CA-50 10mm', amostras: 50, aprovados: 49, reprovados: 1, status: 'Aprovado', inspetor: 'Carlos M.', data: '31/05' },
    { lote: 'L2024-05-002', produto: 'Tubo Galvanizado', amostras: 30, aprovados: 28, reprovados: 2, status: 'Aprovado c/ ressalvas', inspetor: 'Ana P.', data: '31/05' },
    { lote: 'L2024-05-003', produto: 'Parafuso M12', amostras: 100, aprovados: 87, reprovados: 13, status: 'Reprovado', inspetor: 'João S.', data: '30/05' },
    { lote: 'L2024-05-004', produto: 'Chapa 3mm', amostras: 40, aprovados: 40, reprovados: 0, status: 'Aprovado', inspetor: 'Carlos M.', data: '30/05' },
  ];

  const kpiQualidade = [
    { label: 'Taxa de Aprovação', valor: '96.2%', cor: 'text-emerald-400' },
    { label: 'Refugo Acumulado', valor: '2.1%', cor: 'text-yellow-400' },
    { label: 'Lotes Reprovados', valor: '1', cor: 'text-red-400' },
    { label: 'Cpk Processo', valor: '1.34', cor: 'text-blue-400' },
  ];

  const statusInspColor = (status) => {
    if (status === 'Aprovado') return 'bg-emerald-900 text-emerald-200';
    if (status === 'Reprovado') return 'bg-red-900 text-red-200';
    return 'bg-yellow-900 text-yellow-200';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* KPIs Qualidade */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiQualidade.map((k, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <p className="text-xs text-slate-400">{k.label}</p>
              <p className={`text-xl font-bold ${k.cor}`}>{k.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de Análise */}
      <div className="flex gap-2">
        {['spc', 'refugo', 'inspecoes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {t === 'spc' ? 'Carta SPC' : t === 'refugo' ? 'Causas Refugo' : 'Inspeções'}
          </button>
        ))}
      </div>

      {/* Carta SPC */}
      {tab === 'spc' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Carta de Controle SPC — Bitola 10mm (mm)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spcData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="ponto" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[7, 9.2]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Line type="monotone" dataKey="ucl" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="UCL" />
                <Line type="monotone" dataKey="lcl" stroke="#ef4444" strokeDasharray="5 5" dot={false} name="LCL" />
                <Line type="monotone" dataKey="media" stroke="#6b7280" strokeDasharray="3 3" dot={false} name="Média" />
                <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Valor" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Causas de Refugo */}
      {tab === 'refugo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">Diagrama de Pareto — Causas de Refugo</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={causasRefugo} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {causasRefugo.map((e, i) => <Cell key={i} fill={e.cor} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">Detalhamento por Causa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {causasRefugo.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: c.cor }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white">{c.name}</span>
                      <span className="font-bold" style={{ color: c.cor }}>{c.value}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${c.value}%`, background: c.cor }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inspeções */}
      {tab === 'inspecoes' && (
        <div className="space-y-3">
          {inspecoes.map((ins) => (
            <Card key={ins.lote} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-white text-sm">{ins.produto}</p>
                    <p className="text-xs text-slate-400">{ins.lote} · {ins.data} · {ins.inspetor}</p>
                  </div>
                  <Badge className={statusInspColor(ins.status)}>
                    {ins.status === 'Aprovado' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {ins.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-700/50 p-2 rounded">
                    <p className="text-slate-400">Amostras</p>
                    <p className="text-white font-bold">{ins.amostras}</p>
                  </div>
                  <div className="bg-emerald-900/30 p-2 rounded">
                    <p className="text-emerald-400">Aprovados</p>
                    <p className="text-emerald-400 font-bold">{ins.aprovados}</p>
                  </div>
                  <div className="bg-red-900/30 p-2 rounded">
                    <p className="text-red-400">Reprovados</p>
                    <p className="text-red-400 font-bold">{ins.reprovados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}