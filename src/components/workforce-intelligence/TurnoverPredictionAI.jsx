/**
 * TurnoverPredictionAI v1.0 — Passo 38
 * Previsão de rotatividade com IA + sinais de risco
 * Regra-Mãe: w-full h-full, IA generativa, prevenção proativa
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Zap, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const AT_RISK = [
  {
    id: 1,
    nome: 'Roberto Alves',
    cargo: 'Analista Financeiro',
    riscoDeSaida: 76,
    motivos: ['Sem promoção 2 anos', 'Salário abaixo mercado', 'Absenteísmo crescente'],
    ultimasInteracoes: 'Evita reuniões',
    acao: '🎯 Oferecer desenvolvimento',
  },
  {
    id: 2,
    nome: 'Fernanda Lopes',
    cargo: 'Desenvolvedora',
    riscoDeSaida: 64,
    motivos: ['Possível oferta externa detectada', 'Baixo engagement', 'Muda frequente de projetos'],
    ultimasInteracoes: 'Atualizando LinkedIn',
    acao: '💰 Rever compensação',
  },
  {
    id: 3,
    nome: 'Lucas Martins',
    cargo: 'Operador Produção',
    riscoDeSaida: 58,
    motivos: ['Conforme chegar perto', 'Falta de reconhecimento', 'Possível mudança de cidade'],
    ultimasInteracoes: 'Procurando moradia fora',
    acao: '🤝 Conversa 1:1 urgente',
  },
];

export default function TurnoverPredictionAI({ empresa }) {
  const [acoesRecomendadas, setAcoesRecomendadas] = useState('');
  const [loading, setLoading] = useState(false);

  const gerarAcoes = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é especialista em retenção de talentos. Baseado em 3 colaboradores em risco (Roberto 76% risco, Fernanda 64%, Lucas 58%), gere 4 ações táticas imediatas para a empresa ${empresa} reter esses profissionais. Seja específico e acionável. Responda em 2-3 linhas com emojis.`,
      });
      setAcoesRecomendadas(typeof res === 'string' ? res : res?.response || JSON.stringify(res));
    } catch {
      setAcoesRecomendadas('⚠️ Erro ao gerar recomendações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 to-emerald-950 overflow-auto">
      <div className="flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-emerald-400" />
          Previsão de Rotatividade — IA
        </h2>
        <button
          onClick={gerarAcoes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-white text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Gerar Ações
        </button>
      </div>

      {/* IA Recomendations */}
      {acoesRecomendadas && (
        <Card className="p-4 bg-emerald-500/10 border border-emerald-400/40 rounded-xl flex-shrink-0">
          <Badge className="bg-emerald-500/30 text-emerald-200 mb-2">🤖 Ações Recomendadas pela IA</Badge>
          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{acoesRecomendadas}</p>
        </Card>
      )}

      {/* At Risk Employees */}
      <div className="space-y-3">
        {AT_RISK.map((emp) => (
          <Card key={emp.id} className="p-4 bg-white/5 border border-red-500/30 rounded-xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{emp.nome}</p>
                <p className="text-xs text-slate-400">{emp.cargo}</p>
              </div>
              <Badge className={`${
                emp.riscoDeSaida >= 70 ? 'bg-red-500/20 text-red-300' :
                emp.riscoDeSaida >= 60 ? 'bg-orange-500/20 text-orange-300' :
                'bg-amber-500/20 text-amber-300'
              }`}>
                🚨 {emp.riscoDeSaida}% risco
              </Badge>
            </div>

            {/* Risk Score */}
            <div className="mb-3">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    emp.riscoDeSaida >= 70 ? 'bg-red-500' :
                    emp.riscoDeSaida >= 60 ? 'bg-orange-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${emp.riscoDeSaida}%` }}
                />
              </div>
            </div>

            {/* Sinais */}
            <div className="bg-white/10 rounded-lg p-3 mb-3 text-xs space-y-1">
              <p className="text-slate-400 font-semibold">🚩 Sinais de Risco:</p>
              {emp.motivos.map((m) => (
                <p key={m} className="text-slate-300">• {m}</p>
              ))}
              <p className="text-emerald-400 font-semibold mt-2">👀 {emp.ultimasInteracoes}</p>
            </div>

            {/* Ação */}
            <button className="w-full px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 rounded-lg text-emerald-200 text-sm font-semibold transition-colors border border-emerald-500/30">
              {emp.acao}
            </button>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-emerald-300">📊 Risco Agregado</p>
        <p className="text-xs text-slate-300 mt-2">3 colaboradores em risco direto. Custo estimado de reposição: R$ 180k. Ação imediata recomendada em 48h.</p>
      </Card>
    </div>
  );
}