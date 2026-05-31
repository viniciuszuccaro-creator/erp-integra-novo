import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Zap, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ThreatDetectionPanel() {
  const [ameacas] = useState([
    {
      id: 'THR-001',
      nome: 'Tentativa de Brute Force - API',
      severidade: 'alta',
      status: 'bloqueado',
      origem: '203.45.67.89 (Vietnã)',
      tentativas: 847,
      tempo_deteccao_min: 2,
      acao: 'IP blocklist + Rate limiting automático',
      data_deteccao: '2026-05-31 14:32'
    },
    {
      id: 'THR-002',
      nome: 'Anomalia de Acesso - Usuário Administrativo',
      severidade: 'crítica',
      status: 'investigacao',
      origem: 'Acesso fora de horário em GeoPosição diferente',
      tentativas: 3,
      tempo_deteccao_min: 1,
      acao: 'Revogação de sessão + Autenticação MFA reforçada',
      data_deteccao: '2026-05-31 16:15'
    },
    {
      id: 'THR-003',
      nome: 'Injeção SQL Detectada',
      severidade: 'crítica',
      status: 'contido',
      origem: 'POST request - Parâmetro "search"',
      tentativas: 12,
      tempo_deteccao_min: 0.5,
      acao: 'WAF automático bloqueou + Patch deploy em 15min',
      data_deteccao: '2026-05-31 09:42'
    },
    {
      id: 'THR-004',
      nome: 'Exfiltração de Dados - Dados Sensíveis',
      severidade: 'alta',
      status: 'prevenido',
      origem: 'Usuário departamento RH - exportação de base',
      tentativas: 1,
      tempo_deteccao_min: 3,
      acao: 'Acesso revogado + Dados criptografados + Auditoria',
      data_deteccao: '2026-05-30 17:23'
    }
  ]);

  const getSeveridadeColor = (sev) => {
    switch(sev) {
      case 'crítica':
        return 'bg-red-600';
      case 'alta':
        return 'bg-orange-600';
      case 'média':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'bloqueado':
        return 'bg-red-50 border-red-300';
      case 'investigacao':
        return 'bg-yellow-50 border-yellow-300';
      case 'contido':
        return 'bg-orange-50 border-orange-300';
      case 'prevenido':
        return 'bg-emerald-50 border-emerald-300';
      default:
        return 'bg-slate-50 border-slate-300';
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {/* Resumo */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Detecção de Ameaças - Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-red-100 p-3 rounded">
              <p className="text-slate-700 text-xs font-semibold mb-1">Críticas</p>
              <p className="text-2xl font-bold text-red-700">2</p>
            </div>
            <div className="bg-orange-100 p-3 rounded">
              <p className="text-slate-700 text-xs font-semibold mb-1">Altas</p>
              <p className="text-2xl font-bold text-orange-700">2</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded">
              <p className="text-slate-700 text-xs font-semibold mb-1">Prevenidas</p>
              <p className="text-2xl font-bold text-emerald-700">3</p>
            </div>
            <div className="bg-blue-100 p-3 rounded">
              <p className="text-slate-700 text-xs font-semibold mb-1">MTTR Médio</p>
              <p className="text-2xl font-bold text-blue-700">1.4m</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ameaças */}
      {ameacas.map((ameaca) => (
        <Card key={ameaca.id} className={`border-2 ${getStatusColor(ameaca.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{ameaca.nome}</CardTitle>
                  <Badge className={getSeveridadeColor(ameaca.severidade)}>
                    {ameaca.severidade.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Detectada em: {ameaca.data_deteccao}
                </p>
              </div>
              <Badge variant="outline">
                {ameaca.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Origem */}
            <div className="bg-slate-50 p-3 rounded border-l-2 border-slate-400">
              <p className="text-xs text-slate-600 font-semibold mb-1">Origem / Detalhe</p>
              <p className="text-sm text-slate-900">{ameaca.origem}</p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Tentativas</p>
                <p className="text-lg font-bold text-slate-900">{ameaca.tentativas}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Tempo Detecção</p>
                <p className="text-lg font-bold text-blue-700">{ameaca.tempo_deteccao_min}m</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Status</p>
                <p className="text-sm font-bold text-emerald-700 capitalize">
                  {ameaca.status}
                </p>
              </div>
            </div>

            {/* Ação Tomada */}
            <div className="bg-emerald-50 p-3 rounded border-l-2 border-emerald-600">
              <p className="text-xs text-slate-600 font-semibold mb-1">Ação Automática</p>
              <p className="text-sm text-slate-900">{ameaca.acao}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Intelligence */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300">
        <CardContent className="pt-6 text-sm space-y-2">
          <p className="text-slate-700">
            <span className="font-semibold">MTTR (Mean Time to Respond):</span> 1.4 minutos (média)
          </p>
          <p className="text-slate-700">
            <span className="font-semibold">Taxa de Bloqueio Automático:</span> 96% sem intervenção humana
          </p>
          <p className="text-slate-700">
            <span className="font-semibold">Inteligência Coletiva:</span> Correlação em tempo real com threat feeds globais
          </p>
        </CardContent>
      </Card>
    </div>
  );
}