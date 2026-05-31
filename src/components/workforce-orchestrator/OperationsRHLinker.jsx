import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Link2, AlertTriangle } from 'lucide-react';

export default function OperationsRHLinker() {
  const operacoes = [
    { operacao: 'Produção SP', pessoal_alocado: 8, pessoal_necessario: 10, utilizacao: 80, status: 'crítico' },
    { operacao: 'Logística MG', pessoal_alocado: 5, pessoal_necessario: 5, utilizacao: 100, status: 'ok' },
    { operacao: 'TI (Cloud)', pessoal_alocado: 3, pessoal_necessario: 4, utilizacao: 75, status: 'aviso' },
    { operacao: 'Comercial', pessoal_alocado: 4, pessoal_necessario: 4, utilizacao: 85, status: 'ok' },
    { operacao: 'Financeiro', pessoal_alocado: 2, pessoal_necessario: 3, utilizacao: 67, status: 'aviso' },
  ];

  const syncData = [
    { operacao: 'Produção SP', rh_dados: 95, op_dados: 88, gap: 7 },
    { operacao: 'Logística MG', rh_dados: 92, op_dados: 92, gap: 0 },
    { operacao: 'TI (Cloud)', rh_dados: 85, op_dados: 78, gap: 7 },
    { operacao: 'Comercial', rh_dados: 90, op_dados: 85, gap: 5 },
    { operacao: 'Financeiro', rh_dados: 88, op_dados: 82, gap: 6 },
  ];

  const statusConfig = {
    ok: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    aviso: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    crítico: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* KPIs */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Operações Sincronizadas</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">5</div>
          <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-0">Real-time</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Pessoal Total Alocado</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">22</div>
          <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-0">Ativo</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Déficit Pessoal</div>
          <div className="text-2xl font-bold text-red-400 mt-1">3</div>
          <Badge className="mt-2 bg-red-500/20 text-red-400 border-0">Crítico</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Sincronização Média</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">90%</div>
          <Badge className="mt-2 bg-cyan-500/20 text-cyan-400 border-0">Excelente</Badge>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Operações */}
        <Card className="bg-white/10 border-white/20 p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            Alocação de Pessoal por Operação
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={operacoes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="operacao" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-15} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="pessoal_alocado" fill="#3b82f6" name="Alocado" />
              <Bar dataKey="pessoal_necessario" fill="#10b981" name="Necessário" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Sincronização */}
        <Card className="bg-white/10 border-white/20 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Sincronização RH ↔ Operações (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis type="number" dataKey="rh_dados" label={{ value: 'Dados RH (%)', position: 'insideBottomRight', offset: -5 }} tick={{ fill: '#94a3b8' }} />
              <YAxis type="number" dataKey="op_dados" label={{ value: 'Dados Operações (%)', angle: -90, position: 'insideLeft' }} tick={{ fill: '#94a3b8' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }} />
              <Scatter name="Sincronização" data={syncData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        {/* Detalhes */}
        <Card className="bg-white/10 border-white/20 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Status Operacional Detalhado</h3>
          <div className="space-y-3">
            {operacoes.map((op, idx) => (
              <div key={idx} className={`border border-white/10 rounded-lg p-3 ${op.status === 'crítico' ? 'bg-red-500/5' : op.status === 'aviso' ? 'bg-amber-500/5' : 'bg-emerald-500/5'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{op.operacao}</h4>
                      <Badge className={`text-xs border ${statusConfig[op.status]}`}>
                        {op.status === 'crítico' && <AlertTriangle className="w-2.5 h-2.5 mr-1" />}
                        {op.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Alocado: <span className="text-blue-400 font-semibold">{op.pessoal_alocado}</span> / 
                      Necessário: <span className="text-emerald-400 font-semibold">{op.pessoal_necessario}</span> • 
                      Utilização: <span className="text-cyan-400 font-semibold">{op.utilizacao}%</span>
                    </p>
                  </div>
                  {op.status === 'crítico' && (
                    <div className="text-right ml-4">
                      <p className="text-xs text-red-400 font-semibold">Falta: {op.pessoal_necessario - op.pessoal_alocado}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Realoque recomendado</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">🔗 Integração RH↔Operações</h4>
          <ul className="text-xs text-slate-300 space-y-2">
            <li>• <strong>Produção SP está crítica</strong>: faltam 2 pessoas. IA recomenda realoque de Carlos Mendes (MG) ou contratação urgente.</li>
            <li>• <strong>Sincronização 90%</strong>: dados RH vs Operações com gap mínimo. Real-time updates ativadas.</li>
            <li>• <strong>Logística MG perfeita</strong>: 100% sincronizada, utilização ideal. Modelo para outras operações.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}