import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, TrendingUp, CheckCircle } from 'lucide-react';

export default function ComplianceAndRiskPanel() {
  const riskTrendData = [
    { mes: 'Jan', score: 6.8, incidentes: 3, compliance: 98 },
    { mes: 'Fev', score: 6.5, incidentes: 2, compliance: 99 },
    { mes: 'Mar', score: 7.1, incidentes: 4, compliance: 97 },
    { mes: 'Abr', score: 7.4, incidentes: 5, compliance: 96 },
    { mes: 'Mai', score: 7.2, incidentes: 3, compliance: 98 },
    { mes: 'Jun', score: 7.2, incidentes: 2, compliance: 99 },
  ];

  const riscos = [
    { id: 1, tipo: 'Operacional', severidade: 'Alto', descricao: 'Falta de motoristas qualificados na zona leste', probabilidade: '65%', impacto: 'Atrasos >2h', mitigacao: 'Contratar 3 motoristas + bônus' },
    { id: 2, tipo: 'Regulatório', severidade: 'Crítico', descricao: 'Vencimento de documentações (RNTRC)', probabilidade: '15%', impacto: 'Multa + bloqueio', mitigacao: 'Renovar até 15/06' },
    { id: 3, tipo: 'Ambiental', severidade: 'Médio', descricao: 'Emissões acima do permitido em 3 rotas', probabilidade: '35%', impacto: 'Advertência + multa', mitigacao: 'Manutenção preventiva dos motores' },
    { id: 4, tipo: 'Segurança', severidade: 'Alto', descricao: '2 acidentes leves no mês anterior', probabilidade: '42%', impacto: 'Lesões + prejuízos', mitigacao: 'Treinamento defensivo para motoristas' },
  ];

  const certifications = [
    { name: 'ISO 9001:2015', status: 'Válido', vencimento: '2027-03-15', auditoriaProxima: '2026-09-01' },
    { name: 'ISO 14001:2015', status: 'Válido', vencimento: '2026-11-30', auditoriaProxima: '2026-08-15' },
    { name: 'SASSMAQ', status: 'Válido', vencimento: '2026-08-20', auditoriaProxima: '2026-07-01' },
    { name: 'Certificado Digital', status: 'Válido', vencimento: '2025-12-31', auditoriaProxima: 'N/A' },
  ];

  const incidentesRecentes = [
    { data: '2026-05-28', tipo: 'Menor', veiculo: 'CAM-045', local: 'Av. Paulista (SP)', descricao: 'Levantamento de rodas (dano mínimo)' },
    { data: '2026-05-25', tipo: 'Advertência', veiculo: 'VAN-012', local: 'Guarulhos', descricao: 'Ultrapassagem em faixa contínua' },
    { data: '2026-05-20', tipo: 'Menor', veiculo: 'MOTO-034', local: 'São Bernardo', descricao: 'Avaria de farol (reparado)' },
    { data: '2026-05-15', tipo: 'Médio', veiculo: 'CAM-001', local: 'Via Anchieta', descricao: 'Colisão traseira (3 vítimas leves)' },
  ];

  const severityColor = (severidade) => {
    switch (severidade) {
      case 'Crítico': return 'bg-red-900 text-red-200';
      case 'Alto': return 'bg-orange-900 text-orange-200';
      case 'Médio': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-green-900 text-green-200';
    }
  };

  const incidenteColor = (tipo) => {
    switch (tipo) {
      case 'Crítico': return 'bg-red-900/20 border-red-600/30';
      case 'Médio': return 'bg-orange-900/20 border-orange-600/30';
      case 'Menor': return 'bg-yellow-900/20 border-yellow-600/30';
      case 'Advertência': return 'bg-blue-900/20 border-blue-600/30';
      default: return 'bg-slate-700/50 border-slate-600';
    }
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Score de Risco</p>
            <p className="text-2xl font-bold text-cyan-400">7.2/10</p>
            <p className="text-xs text-green-400">↓ Controlado</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Compliance</p>
            <p className="text-2xl font-bold text-green-400">99%</p>
            <p className="text-xs text-green-400">Acima do esperado</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Riscos Identificados</p>
            <p className="text-2xl font-bold text-orange-400">4</p>
            <p className="text-xs text-orange-400">1 crítico</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Incidentes (Mês)</p>
            <p className="text-2xl font-bold text-yellow-400">2</p>
            <p className="text-xs text-green-400">↓ Redução 50%</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Evolução de Risco (6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} name="Score Risco" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Riscos Identificados */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Riscos Identificados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {riscos.map((risco) => (
              <div key={risco.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-semibold text-white text-sm">{risco.tipo}</p>
                    <p className="text-xs text-slate-400">{risco.descricao}</p>
                  </div>
                  <Badge className={severityColor(risco.severidade)}>
                    {risco.severidade}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-1">
                  <p>Prob: <span className="text-orange-400">{risco.probabilidade}</span></p>
                  <p>Impacto: {risco.impacto}</p>
                </div>
                <p className="text-xs text-green-400">→ {risco.mitigacao}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certificações */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Certificações & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {certifications.map((cert, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{cert.name}</p>
                  <Badge className="bg-green-900 text-green-200">{cert.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>Vencimento: {cert.vencimento}</p>
                  <p className="text-cyan-400">Auditoria: {cert.auditoriaProxima}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Incidentes Recentes */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            Incidentes Registrados (Últimos 30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {incidentesRecentes.map((incidente, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${incidenteColor(incidente.tipo)}`}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <p className="font-semibold text-white text-sm">{incidente.data} • {incidente.veiculo}</p>
                  <p className="text-xs text-slate-400">{incidente.local}</p>
                </div>
                <Badge className={incidente.tipo === 'Médio' ? 'bg-orange-900 text-orange-200' : 'bg-yellow-900 text-yellow-200'}>
                  {incidente.tipo}
                </Badge>
              </div>
              <p className="text-xs text-slate-300">{incidente.descricao}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}