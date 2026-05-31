import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Clock, Send } from 'lucide-react';

export default function AlertOrchestration() {
  const [alertFilter, setAlertFilter] = useState('ativas');

  const alertas = [
    {
      id: 1,
      titulo: 'CRÍTICO: Turnover RH acima do esperado',
      descricao: 'Rotatividade subiu 45% em 48h. Possível problema retenção ou insatisfação.',
      area: 'RH',
      severidade: 'Crítico',
      status: 'Não lida',
      tempo: 'Agora',
      destinatarios: ['Diretor RH', 'CEO'],
      canais: ['Email', 'SMS', 'Notificação'],
      acaoSugerida: 'Revisar políticas de retenção e fazer pesquisa de satisfação'
    },
    {
      id: 2,
      titulo: 'ALTO: Atrasos em entregas - 4x acima do normal',
      descricao: '8 ocorrências vs 2 esperadas. Transportadora X com 5 atrasos.',
      area: 'Logística',
      severidade: 'Alto',
      status: 'Lida',
      tempo: '15min',
      destinatarios: ['Gerente Logística', 'CEO'],
      canais: ['Email', 'Notificação'],
      acaoSugerida: 'Contatar transportadora e renegociar SLA'
    },
    {
      id: 3,
      titulo: 'ALTO: Fluxo de caixa 12% abaixo',
      descricao: 'Possível inadimplência cliente X (R$ 280k em atraso 45+ dias).',
      area: 'Financeiro',
      severidade: 'Alto',
      status: 'Não lida',
      tempo: '32min',
      destinatarios: ['CFO', 'Gerente Financeiro'],
      canais: ['Email', 'SMS'],
      acaoSugerida: 'Iniciar processo de cobrança legal'
    },
    {
      id: 4,
      titulo: 'MÉDIO: Índice de refugo aumentou 2.3%',
      descricao: 'Máquina A suspeita. Qualidade decaindo em último lote.',
      area: 'Produção',
      severidade: 'Médio',
      status: 'Lida',
      tempo: '45min',
      destinatarios: ['Gerente Produção'],
      canais: ['Notificação'],
      acaoSugerida: 'Realizar manutenção preventiva em Máquina A'
    },
  ];

  const estatisticas = [
    { label: 'Alertas Críticos', valor: 1, cor: 'text-red-400', bg: 'bg-red-900/30' },
    { label: 'Alertas Altos', valor: 2, cor: 'text-orange-400', bg: 'bg-orange-900/30' },
    { label: 'Tempo Médio Resposta', valor: '12 min', cor: 'text-blue-400', bg: 'bg-blue-900/30' },
    { label: 'Taxa Resolução', valor: '87%', cor: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  ];

  const severityColor = (sev) => {
    switch (sev) {
      case 'Crítico': return 'bg-red-900 text-red-200';
      case 'Alto': return 'bg-orange-900 text-orange-200';
      case 'Médio': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const statusColor = (status) => {
    return status === 'Lida' ? 'bg-emerald-900/30 border-emerald-600' : 'bg-red-900/30 border-red-600';
  };

  const filteredAlertas = alertas.filter(a =>
    alertFilter === 'ativas' ? a.status === 'Não lida' : a.status === 'Lida'
  );

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {estatisticas.map((stat, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className={`p-3 ${stat.bg}`}>
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.cor}`}>{stat.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        <button
          onClick={() => setAlertFilter('ativas')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            alertFilter === 'ativas'
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Não Lidas ({alertas.filter(a => a.status === 'Não lida').length})
        </button>
        <button
          onClick={() => setAlertFilter('resolvidas')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            alertFilter === 'resolvidas'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Lidas ({alertas.filter(a => a.status === 'Lida').length})
        </button>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlertas.map((alerta) => (
          <Card key={alerta.id} className={`bg-slate-800 border-2 ${statusColor(alerta.status)}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-white text-sm mb-1">{alerta.titulo}</p>
                  <p className="text-xs text-slate-400">{alerta.descricao}</p>
                </div>
                <div className="flex gap-1 flex-col items-end">
                  <Badge className={severityColor(alerta.severidade)}>
                    {alerta.severidade}
                  </Badge>
                  <Badge className={alerta.status === 'Lida' ? 'bg-emerald-900 text-emerald-200' : 'bg-red-900 text-red-200'}>
                    {alerta.status === 'Lida' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Bell className="w-3 h-3 mr-1" />}
                    {alerta.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-xs">
                <div>
                  <p className="text-slate-400">Área</p>
                  <p className="text-white font-semibold">{alerta.area}</p>
                </div>
                <div>
                  <p className="text-slate-400">Detectado</p>
                  <p className="text-white font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alerta.tempo}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Destinatários</p>
                  <p className="text-cyan-400 font-semibold">{alerta.destinatarios.join(', ')}</p>
                </div>
              </div>

              <div className="bg-slate-700/50 p-2 rounded mb-3">
                <p className="text-xs text-slate-400 mb-1">Ação Sugerida</p>
                <p className="text-xs text-white">{alerta.acaoSugerida}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {alerta.canais.map((canal, idx) => (
                  <Badge key={idx} className="bg-slate-700 text-slate-200 text-xs">
                    {canal}
                  </Badge>
                ))}
                <button className="ml-auto px-3 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  {alerta.status === 'Não lida' ? 'Marcar como lido' : 'Reabrir'}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlertas.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-semibold">Nenhum alerta {alertFilter === 'ativas' ? 'não lido' : 'lido'}</p>
            <p className="text-slate-400 text-sm mt-1">
              {alertFilter === 'ativas' ? 'Ótimo! Todos os alertas foram resolvidos.' : 'Comece a monitorar alertas críticos.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}