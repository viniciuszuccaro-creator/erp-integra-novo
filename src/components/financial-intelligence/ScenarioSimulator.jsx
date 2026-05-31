import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Zap } from 'lucide-react';

export default function ScenarioSimulator() {
  const [selectedScenario, setSelectedScenario] = useState('base');

  const scenariosData = [
    {
      id: 'base',
      nome: 'Cenário Base',
      descricao: 'Continuar com operações atuais',
      receita: 4800000,
      custos: 2100000,
      lucro: 2700000,
      margem: 56.3,
      impacto: 0,
      probabilidade: 45
    },
    {
      id: 'otimista',
      nome: 'Cenário Otimista',
      descricao: 'Crescimento 20% + redução custos 8%',
      receita: 5760000,
      custos: 1932000,
      lucro: 3828000,
      margem: 66.5,
      impacto: 41.7,
      probabilidade: 30
    },
    {
      id: 'pessimista',
      nome: 'Cenário Pessimista',
      descricao: 'Queda 15% + aumento custos 12%',
      receita: 4080000,
      custos: 2352000,
      lucro: 1728000,
      margem: 42.4,
      impacto: -36.0,
      probabilidade: 20
    },
    {
      id: 'transformacao',
      nome: 'Cenário Transformação',
      descricao: 'Implementar IA + automação (-30% custos)',
      receita: 5200000,
      custos: 1470000,
      lucro: 3730000,
      margem: 71.7,
      impacto: 38.1,
      probabilidade: 5
    },
  ];

  const comparativoData = [
    { categoria: 'Receita', base: 4.8, otimista: 5.76, pessimista: 4.08, transformacao: 5.2 },
    { categoria: 'Custos', base: 2.1, otimista: 1.93, pessimista: 2.35, transformacao: 1.47 },
    { categoria: 'Lucro', base: 2.7, otimista: 3.83, pessimista: 1.73, transformacao: 3.73 },
  ];

  const acoesRecomendadas = {
    otimista: [
      { acao: 'Expandir capacidade produtiva', investimento: 500000, roi: '120%' },
      { acao: 'Aumentar equipe comercial', investimento: 180000, roi: '85%' },
      { acao: 'Abrir novo mercado regional', investimento: 350000, roi: '95%' },
    ],
    pessimista: [
      { acao: 'Reduzir despesas fixas urgente', economia: 300000, prazo: 'Imediato' },
      { acao: 'Renegociar contratos de fornecedores', economia: 150000, prazo: '30 dias' },
      { acao: 'Implementar freeze de contratações', economia: 80000, prazo: 'Imediato' },
    ],
    transformacao: [
      { acao: 'Implementar RPA nos processos', investimento: 400000, roi: '150%' },
      { acao: 'Deploy de IA para análise de custos', investimento: 250000, roi: '180%' },
      { acao: 'Automação de processos financeiros', investimento: 180000, roi: '110%' },
    ],
  };

  const cenarioSelecionado = scenariosData.find(s => s.id === selectedScenario);
  const acoes = acoesRecomendadas[selectedScenario] || [];

  return (
    <div className="w-full h-full space-y-4">
      {/* Seletor de Cenários */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenariosData.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setSelectedScenario(scenario.id)}
            className={`p-4 rounded-lg border transition-all text-left ${
              selectedScenario === scenario.id
                ? 'bg-emerald-900/30 border-emerald-600'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            <p className="font-semibold text-white text-sm">{scenario.nome}</p>
            <p className="text-xs text-slate-400 mt-1">{scenario.descricao}</p>
            <p className={`text-xs font-semibold mt-2 ${scenario.impacto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {scenario.impacto >= 0 ? '+' : ''}{scenario.impacto.toFixed(1)}%
            </p>
          </button>
        ))}
      </div>

      {/* Detalhes do Cenário Selecionado */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">{cenarioSelecionado?.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-slate-700/50 p-3 rounded">
              <p className="text-xs text-slate-400">Receita</p>
              <p className="text-lg font-bold text-green-400">R$ {(cenarioSelecionado?.receita / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded">
              <p className="text-xs text-slate-400">Custos</p>
              <p className="text-lg font-bold text-red-400">R$ {(cenarioSelecionado?.custos / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded">
              <p className="text-xs text-slate-400">Lucro</p>
              <p className="text-lg font-bold text-emerald-400">R$ {(cenarioSelecionado?.lucro / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded">
              <p className="text-xs text-slate-400">Margem</p>
              <p className="text-lg font-bold text-blue-400">{cenarioSelecionado?.margem.toFixed(1)}%</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded">
              <p className="text-xs text-slate-400">Probabilidade</p>
              <p className="text-lg font-bold text-cyan-400">{cenarioSelecionado?.probabilidade}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparativo */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Comparativo de Cenários (R$ Milhões)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparativoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="categoria" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                formatter={(value) => `R$ ${value.toFixed(1)}M`} />
              <Legend />
              <Bar dataKey="base" fill="#3b82f6" />
              <Bar dataKey="otimista" fill="#10b981" />
              <Bar dataKey="pessimista" fill="#ef4444" />
              <Bar dataKey="transformacao" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Ações Recomendadas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Ações Recomendadas para {cenarioSelecionado?.nome}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {acoes.length > 0 ? (
            acoes.map((acao, idx) => (
              <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <p className="font-semibold text-white text-sm mb-1">{acao.acao}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <p>
                    {acao.investimento ? `Investimento: ` : `Economia: `}
                    <span className="text-emerald-400">
                      R$ {((acao.investimento || acao.economia) / 1000).toFixed(0)}k
                    </span>
                  </p>
                  <p className="text-right">
                    {acao.roi ? `ROI: ${acao.roi}` : `Prazo: ${acao.prazo}`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-sm">Nenhuma ação específica para este cenário.</p>
          )}
        </CardContent>
      </Card>

      {/* Valor Esperado */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Análise de Valor Esperado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {scenariosData.map((scenario) => {
              const valorEsperado = (scenario.lucro * scenario.probabilidade) / 100;
              return (
                <div key={scenario.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-white font-semibold">{scenario.nome}</p>
                    <Badge className="bg-purple-900 text-purple-200">
                      Valor Esperado: R$ {(valorEsperado / 1000000).toFixed(2)}M
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Lucro: R$ {(scenario.lucro / 1000000).toFixed(1)}M × Probabilidade: {scenario.probabilidade}%
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}