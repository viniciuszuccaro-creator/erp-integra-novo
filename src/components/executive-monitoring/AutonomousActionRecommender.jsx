import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Zap, Play } from 'lucide-react';

export default function AutonomousActionRecommender() {
  const [actionFilter, setActionFilter] = useState('recomendadas');

  const acoes = [
    {
      id: 1,
      titulo: 'Iniciar Processo de Cobrança - Cliente X',
      descricao: 'R$ 280k em atraso 45+ dias. Recomendação: Contato formal + notificação de cobrança',
      area: 'Financeiro',
      impacto: 'R$ 280k',
      probabilidade: 87,
      risco: 'Baixo',
      status: 'Recomendada',
      tempo: 'Imediato',
      etapas: [
        '1. Enviar notificação de cobrança',
        '2. Contato telefônico com responsável',
        '3. Enviar documento de acerto',
        '4. Se necessário, encaminhar para advogado'
      ],
      autoexec: false
    },
    {
      id: 2,
      titulo: 'Renegociar SLA com Transportadora X',
      descricao: 'Taxa de atraso: 62.5% (5 em 8). Impacto: R$ 45k em multas potenciais.',
      area: 'Logística',
      impacto: 'R$ 45k',
      probabilidade: 89,
      risco: 'Baixo',
      status: 'Recomendada',
      tempo: 'Hoje',
      etapas: [
        '1. Compilar dados de performance',
        '2. Preparar proposta de multas acumuladas',
        '3. Agendar reunião com transportadora',
        '4. Definir novo SLA com penalidades'
      ],
      autoexec: true
    },
    {
      id: 3,
      titulo: 'Manutenção Preventiva - Máquina A',
      descricao: 'Índice de refugo +2.3%. Estimado: 4 horas de parada, R$ 8k em peças.',
      area: 'Produção',
      impacto: 'R$ 8k',
      probabilidade: 82,
      risco: 'Médio',
      status: 'Executada',
      tempo: '2 horas',
      etapas: [
        '1. Parar produção em Máquina A',
        '2. Revisar guarnições e vedação',
        '3. Substituir peças desgastadas',
        '4. Testes de qualidade'
      ],
      autoexec: true
    },
    {
      id: 4,
      titulo: 'Pesquisa de Clima - RH',
      descricao: 'Turnover +45%. Ação: Realizar pesquisa de satisfação + entrevistas de saída.',
      area: 'RH',
      impacto: 'Retenção',
      probabilidade: 91,
      risco: 'Médio',
      status: 'Pendente',
      tempo: '3 dias',
      etapas: [
        '1. Preparar questionário de satisfação',
        '2. Distribuir para 100% da equipe',
        '3. Análise de respostas com IA',
        '4. Reunião de ação com lideranças'
      ],
      autoexec: false
    },
    {
      id: 5,
      titulo: 'Aumentar Quantidade de Vendedores',
      descricao: 'Taxa de conversão caindo. Análise: Equipe sobrecarregada (45 clientes/vendedor vs 35 padrão).',
      area: 'Comercial',
      impacto: '+R$ 350k',
      probabilidade: 78,
      risco: 'Alto',
      status: 'Recomendada',
      tempo: '30 dias',
      etapas: [
        '1. Abrir 2 posições de vendedor',
        '2. Descrição de cargo e salário',
        '3. Processo seletivo (15 dias)',
        '4. Onboarding e treinamento (15 dias)'
      ],
      autoexec: false
    },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'Executada': return 'bg-emerald-900 text-emerald-200';
      case 'Recomendada': return 'bg-blue-900 text-blue-200';
      case 'Pendente': return 'bg-yellow-900 text-yellow-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const filteredAcoes = acoes.filter(a =>
    actionFilter === 'recomendadas'
      ? ['Recomendada', 'Pendente'].includes(a.status)
      : a.status === 'Executada'
  );

  const resumo = {
    impactoTotal: 'R$ 683k',
    acoesPendentes: acoes.filter(a => a.status === 'Recomendada').length,
    acoesConcluidas: acoes.filter(a => a.status === 'Executada').length,
    autoexecPossivel: acoes.filter(a => a.autoexec && a.status === 'Recomendada').length,
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Impacto Potencial</p>
            <p className="text-lg font-bold text-emerald-400">{resumo.impactoTotal}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Ações Pendentes</p>
            <p className="text-lg font-bold text-yellow-400">{resumo.acoesPendentes}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Ações Executadas</p>
            <p className="text-lg font-bold text-emerald-400">{resumo.acoesConcluidas}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Auto-Execução</p>
            <p className="text-lg font-bold text-blue-400">{resumo.autoexecPossivel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        <button
          onClick={() => setActionFilter('recomendadas')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            actionFilter === 'recomendadas'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Pendentes & Recomendadas ({resumo.acoesPendentes + 1})
        </button>
        <button
          onClick={() => setActionFilter('executadas')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            actionFilter === 'executadas'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Executadas ({resumo.acoesConcluidas})
        </button>
      </div>

      {/* Lista de Ações */}
      <div className="space-y-3">
        {filteredAcoes.map((acao) => (
          <Card key={acao.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-bold text-white text-sm mb-1">{acao.titulo}</p>
                  <p className="text-xs text-slate-400">{acao.descricao}</p>
                </div>
                <div className="flex gap-1 flex-col items-end ml-4">
                  <Badge className={statusColor(acao.status)}>
                    {acao.status === 'Executada' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                    {acao.status}
                  </Badge>
                  {acao.autoexec && (
                    <Badge className="bg-purple-900 text-purple-200 text-xs">Auto-exec</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                <div>
                  <p className="text-slate-400">Área</p>
                  <p className="text-white font-semibold">{acao.area}</p>
                </div>
                <div>
                  <p className="text-slate-400">Impacto</p>
                  <p className="text-emerald-400 font-semibold">{acao.impacto}</p>
                </div>
                <div>
                  <p className="text-slate-400">Probabilidade</p>
                  <p className="text-blue-400 font-semibold">{acao.probabilidade}%</p>
                </div>
                <div>
                  <p className="text-slate-400">Prazo</p>
                  <p className="text-cyan-400 font-semibold">{acao.tempo}</p>
                </div>
              </div>

              {/* Etapas */}
              <div className="bg-slate-700/50 p-2 rounded mb-3">
                <p className="text-xs text-slate-400 mb-1 font-semibold">Etapas</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {acao.etapas.map((etapa, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-slate-500 min-w-fit">{etapa.charAt(0)}</span>
                      <span>{etapa}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risco */}
              <div className="flex justify-between items-center">
                <Badge
                  className={
                    acao.risco === 'Baixo'
                      ? 'bg-emerald-900 text-emerald-200'
                      : acao.risco === 'Médio'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-red-900 text-red-200'
                  }
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Risco: {acao.risco}
                </Badge>
                {acao.status !== 'Executada' && (
                  <button className="px-3 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {acao.autoexec ? 'Auto-executar' : 'Executar'}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}