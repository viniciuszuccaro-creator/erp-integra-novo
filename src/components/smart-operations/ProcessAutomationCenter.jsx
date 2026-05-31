import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, CheckCircle, Clock, Zap, RefreshCw } from 'lucide-react';

const automacoes = [
  {
    id: 'AUTO001',
    nome: 'Reposição Automática Estoque',
    descricao: 'Cria OC automaticamente quando produto abaixo do mínimo',
    status: 'Ativo',
    execucoes: 48,
    ultima: '2min',
    economia: 'R$ 12k/mês',
    modulo: 'Estoque',
    triggers: ['Abaixo do mínimo', 'Previsão 7 dias'],
    acoes: ['Gerar OC', 'Notificar comprador', 'Atualizar forecast'],
  },
  {
    id: 'AUTO002',
    nome: 'Cobrança Automática Inadimplentes',
    descricao: 'Envia boleto + WhatsApp para títulos vencidos',
    status: 'Ativo',
    execucoes: 23,
    ultima: '35min',
    economia: 'R$ 28k/mês',
    modulo: 'Financeiro',
    triggers: ['Vencimento D+1', 'D+5', 'D+15'],
    acoes: ['Enviar boleto', 'WhatsApp', 'Notificar gerente'],
  },
  {
    id: 'AUTO003',
    nome: 'Roteamento Inteligente Entregas',
    descricao: 'IA otimiza rotas em tempo real com trânsito e clima',
    status: 'Ativo',
    execucoes: 156,
    ultima: '8min',
    economia: 'R$ 8k/mês',
    modulo: 'Logística',
    triggers: ['Nova entrega', 'Atualização trânsito', 'Reagendamento'],
    acoes: ['Calcular rota', 'Atribuir veículo', 'Notificar motorista'],
  },
  {
    id: 'AUTO004',
    nome: 'Aprovação Pedidos Automática',
    descricao: 'Aprova pedidos dentro do limite de desconto sem intervenção',
    status: 'Pausado',
    execucoes: 92,
    ultima: '2h',
    economia: 'R$ 5k/mês',
    modulo: 'Comercial',
    triggers: ['Desconto < 10%', 'Cliente A/B', 'Valor < R$ 50k'],
    acoes: ['Aprovar pedido', 'Reservar estoque', 'Gerar NF-e'],
  },
  {
    id: 'AUTO005',
    nome: 'Alertas de Performance Produção',
    descricao: 'Detecta desvios na linha de produção e aciona manutenção',
    status: 'Ativo',
    execucoes: 34,
    ultima: '15min',
    economia: 'R$ 18k/mês',
    modulo: 'Produção',
    triggers: ['OEE < 80%', 'Temperatura anômala', 'Parada > 5min'],
    acoes: ['Alertar supervisor', 'Acionar manutenção', 'Atualizar OP'],
  },
];

const statusColor = (s) => s === 'Ativo' ? 'bg-emerald-900 text-emerald-200' : 'bg-yellow-900 text-yellow-200';
const moduloColor = (m) => {
  const map = { Estoque: 'bg-purple-900 text-purple-200', Financeiro: 'bg-blue-900 text-blue-200', Logística: 'bg-cyan-900 text-cyan-200', Comercial: 'bg-orange-900 text-orange-200', Produção: 'bg-red-900 text-red-200' };
  return map[m] || 'bg-slate-700 text-slate-200';
};

export default function ProcessAutomationCenter() {
  const [filter, setFilter] = useState('todos');
  const [expanded, setExpanded] = useState(null);

  const filtered = automacoes.filter(a => filter === 'todos' || a.status === filter);
  const totalEcon = 'R$ 71k';
  const totalExec = automacoes.reduce((a, b) => a + b.execucoes, 0);
  const ativos = automacoes.filter(a => a.status === 'Ativo').length;

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Automações Ativas</p>
            <p className="text-xl font-bold text-emerald-400">{ativos}/{automacoes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Execuções Hoje</p>
            <p className="text-xl font-bold text-blue-400">{totalExec}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Economia/Mês</p>
            <p className="text-xl font-bold text-purple-400">{totalEcon}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {['todos', 'Ativo', 'Pausado'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {f === 'todos' ? `Todos (${automacoes.length})` : f === 'Ativo' ? `Ativos (${ativos})` : `Pausados (${automacoes.length - ativos})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map((aut) => (
          <Card key={aut.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white text-sm">{aut.nome}</p>
                    <Badge className={moduloColor(aut.modulo)}>{aut.modulo}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{aut.descricao}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-3">
                  <Badge className={statusColor(aut.status)}>
                    {aut.status === 'Ativo' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                    {aut.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div>
                  <p className="text-slate-400">Execuções</p>
                  <p className="text-white font-semibold flex items-center gap-1"><RefreshCw className="w-3 h-3" />{aut.execucoes}</p>
                </div>
                <div>
                  <p className="text-slate-400">Última</p>
                  <p className="text-white font-semibold flex items-center gap-1"><Clock className="w-3 h-3" />{aut.ultima}</p>
                </div>
                <div>
                  <p className="text-slate-400">Economia</p>
                  <p className="text-emerald-400 font-semibold">{aut.economia}</p>
                </div>
              </div>

              {expanded === aut.id && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-700/50 p-2 rounded">
                    <p className="text-xs text-slate-400 font-semibold mb-1">Gatilhos</p>
                    {aut.triggers.map((t, i) => <p key={i} className="text-xs text-cyan-300">• {t}</p>)}
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded">
                    <p className="text-xs text-slate-400 font-semibold mb-1">Ações</p>
                    {aut.acoes.map((a, i) => <p key={i} className="text-xs text-emerald-300">→ {a}</p>)}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setExpanded(expanded === aut.id ? null : aut.id)}
                  className="px-3 py-1 text-xs rounded bg-slate-700 text-slate-300 hover:bg-slate-600">
                  {expanded === aut.id ? 'Ocultar' : 'Detalhes'}
                </button>
                <button className={`px-3 py-1 text-xs rounded font-semibold ${aut.status === 'Ativo' ? 'bg-yellow-700 text-yellow-100 hover:bg-yellow-600' : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'}`}>
                  {aut.status === 'Ativo' ? <><Pause className="w-3 h-3 inline mr-1" />Pausar</> : <><Play className="w-3 h-3 inline mr-1" />Ativar</>}
                </button>
                <button className="ml-auto px-3 py-1 text-xs rounded bg-blue-700 text-blue-100 hover:bg-blue-600">
                  <Zap className="w-3 h-3 inline mr-1" />Executar
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}