import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

export default function ChurnRiskPanel() {
  const [riskFilter, setRiskFilter] = useState('todos');

  const riskData = [
    {
      id: 'CLI045',
      nome: 'Construção Beta Ltd',
      risco: 92,
      motivo: 'Sem compra há 78 dias (padrão: 28d)',
      sinais: ['Queda 60% em volume', 'Contato frequente ignorado', 'Última compra: Mar 15'],
      ltv: 45000,
      valor_anual: 18000,
      acao: 'Contato VIP + Renegociar SLA',
      probabilidade: 'Crítica',
    },
    {
      id: 'CLI112',
      nome: 'Pequena Indústria Y',
      risco: 78,
      motivo: 'Ticket médio caindo, margem reclamação',
      sinais: ['Queda 35% em compras', '3 reclamações qualidade', 'Avaliação NPS: 2/10'],
      ltv: 32000,
      valor_anual: 12000,
      acao: 'Auditoria qualidade + Desconto retenção',
      probabilidade: 'Alta',
    },
    {
      id: 'CLI203',
      nome: 'Varejo Regional Z',
      risco: 65,
      motivo: 'Aumentou compras com concorrente',
      sinais: ['Frequência reduzida 40%', 'Teste com competitor detectado', 'Busca por alternativas'],
      ltv: 78000,
      valor_anual: 35000,
      acao: 'Reunião estratégica + Bundle exclusivo',
      probabilidade: 'Média',
    },
    {
      id: 'CLI089',
      nome: 'Logística Nordeste',
      risco: 54,
      motivo: 'Pequeno aumento em atrasos',
      sinais: ['2 atrasos em 6 compras', 'Relacionamento estável', 'Satisfação: 4.2/5'],
      ltv: 56000,
      valor_anual: 22000,
      acao: 'Melhorar SLA + Account review',
      probabilidade: 'Baixa',
    },
    {
      id: 'CLI267',
      nome: 'Metalúrgica Central',
      risco: 88,
      motivo: 'Transição para novo fornecedor detectada',
      sinais: ['Volume -75% em 60 dias', 'Contato reduzido 90%', 'CEO mudou responsabilidade'],
      ltv: 125000,
      valor_anual: 52000,
      acao: 'Reunião C-level + Proposta retenção customizada',
      probabilidade: 'Crítica',
    },
  ];

  const riskColor = (risco) => {
    if (risco >= 80) return { bg: 'bg-red-900/30', border: 'border-red-600', text: 'text-red-400' };
    if (risco >= 65) return { bg: 'bg-orange-900/30', border: 'border-orange-600', text: 'text-orange-400' };
    if (risco >= 50) return { bg: 'bg-yellow-900/30', border: 'border-yellow-600', text: 'text-yellow-400' };
    return { bg: 'bg-slate-700/30', border: 'border-slate-600', text: 'text-slate-400' };
  };

  const probColor = (prob) => {
    switch (prob) {
      case 'Crítica': return 'bg-red-900 text-red-200';
      case 'Alta': return 'bg-orange-900 text-orange-200';
      case 'Média': return 'bg-yellow-900 text-yellow-200';
      case 'Baixa': return 'bg-emerald-900 text-emerald-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  const filteredData = riskData.filter(r => {
    if (riskFilter === 'criticos') return r.risco >= 80;
    if (riskFilter === 'altos') return r.risco >= 65 && r.risco < 80;
    if (riskFilter === 'medios') return r.risco >= 50 && r.risco < 65;
    return true;
  });

  const resumo = {
    em_risco: riskData.filter(r => r.risco >= 65).length,
    valor_ameacado: riskData.filter(r => r.risco >= 65).reduce((acc, r) => acc + r.valor_anual, 0),
    taxa_medio: Math.round(riskData.reduce((acc, r) => acc + r.risco, 0) / riskData.length),
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Alertas Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-red-900/30 border-red-600">
          <CardContent className="p-3">
            <p className="text-xs text-red-400">Em Risco Crítico/Alto</p>
            <p className="text-2xl font-bold text-red-400">{resumo.em_risco}</p>
            <p className="text-xs text-red-300 mt-1">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {resumo.valor_ameacado > 0 ? `R$ ${(resumo.valor_ameacado / 1000).toFixed(0)}k/ano` : 'Nenhum'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Risco Médio</p>
            <p className="text-2xl font-bold text-yellow-400">{resumo.taxa_medio}%</p>
            <p className="text-xs text-slate-400 mt-1">Score carteira</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Ação Recomendada</p>
            <p className="text-sm font-bold text-blue-400">5 intervenções</p>
            <p className="text-xs text-slate-400 mt-1">Automática/manual</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setRiskFilter('todos')}
          className={`px-3 py-2 text-sm rounded-lg font-semibold ${
            riskFilter === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Todos ({riskData.length})
        </button>
        <button
          onClick={() => setRiskFilter('criticos')}
          className={`px-3 py-2 text-sm rounded-lg font-semibold ${
            riskFilter === 'criticos' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Crítico ({riskData.filter(r => r.risco >= 80).length})
        </button>
        <button
          onClick={() => setRiskFilter('altos')}
          className={`px-3 py-2 text-sm rounded-lg font-semibold ${
            riskFilter === 'altos' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Alto ({riskData.filter(r => r.risco >= 65 && r.risco < 80).length})
        </button>
        <button
          onClick={() => setRiskFilter('medios')}
          className={`px-3 py-2 text-sm rounded-lg font-semibold ${
            riskFilter === 'medios' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Médio ({riskData.filter(r => r.risco >= 50 && r.risco < 65).length})
        </button>
      </div>

      {/* Lista de Riscos */}
      <div className="space-y-3">
        {filteredData.map((cliente) => {
          const colors = riskColor(cliente.risco);
          return (
            <Card key={cliente.id} className={`bg-slate-800 border-2 ${colors.bg} ${colors.border}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-white text-sm">{cliente.nome}</p>
                    <p className="text-xs text-slate-400">{cliente.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${colors.text}`}>{cliente.risco}%</p>
                      <p className="text-xs text-slate-400">Risco</p>
                    </div>
                    <Badge className={probColor(cliente.probabilidade)}>
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {cliente.probabilidade}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {cliente.motivo}
                </p>

                {/* Sinais */}
                <div className="bg-slate-700/50 p-2 rounded mb-3">
                  <p className="text-xs text-slate-400 mb-1 font-semibold">Sinais de Churn</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {cliente.sinais.map((sinal, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-red-400">•</span>
                        <span>{sinal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <p className="text-slate-400">LTV Ameaçado</p>
                    <p className="text-red-400 font-bold">R$ {(cliente.ltv / 1000).toFixed(0)}k</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Receita Anual</p>
                    <p className="text-orange-400 font-bold">R$ {(cliente.valor_anual / 1000).toFixed(0)}k</p>
                  </div>
                </div>

                {/* Ação */}
                <div className="bg-blue-900/30 p-2 rounded border border-blue-600 mb-2">
                  <p className="text-xs text-blue-200 font-semibold">{cliente.acao}</p>
                </div>

                <button className="w-full px-3 py-2 rounded text-xs bg-red-600 text-white hover:bg-red-700 font-semibold">
                  Iniciar Ação de Retenção
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}