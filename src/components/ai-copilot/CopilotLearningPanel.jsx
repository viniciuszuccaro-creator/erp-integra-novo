/**
 * CopilotLearningPanel v1.0 — Passo 37
 * Painel de aprendizado adaptativo da IA por perfil de usuário
 * Regra-Mãe: w-full h-full, IA que evolui, personalização contínua
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, User, TrendingUp, Star, Zap } from 'lucide-react';

const USER_PROFILES = [
  {
    perfil: 'Diretor Comercial',
    usuario: 'Carlos M.',
    precisao: 96,
    interacoes: 1247,
    topicos: ['Pedidos', 'Clientes', 'Comissões'],
    adaptacoes: ['Prioriza alertas de churn', 'Resume métricas em 3 linhas', 'Foca no funil de vendas'],
    nivel: 'Expert',
  },
  {
    perfil: 'CFO',
    usuario: 'Ana S.',
    precisao: 94,
    interacoes: 876,
    topicos: ['DRE', 'Fluxo de Caixa', 'Inadimplência'],
    adaptacoes: ['Exibe análise de desvio orçamentário', 'Alerta EBITDA em tempo real', 'Foca em cenários pessimistas'],
    nivel: 'Expert',
  },
  {
    perfil: 'Gerente de Estoque',
    usuario: 'Paulo R.',
    precisao: 89,
    interacoes: 532,
    topicos: ['Reposição', 'Giro', 'Inventário'],
    adaptacoes: ['Agrupa alertas por almoxarifado', 'Sugere OC automática', 'Monitora validade de lotes'],
    nivel: 'Avançado',
  },
];

const MODEL_METRICS = [
  { label: 'Total de Interações', value: '2.655', icon: Zap, color: 'text-violet-400' },
  { label: 'Precisão Média', value: '93.0%', icon: Star, color: 'text-yellow-400' },
  { label: 'Perfis Aprendidos', value: '3', icon: User, color: 'text-blue-400' },
  { label: 'Melhoria Contínua', value: '+1.2%/sem', icon: TrendingUp, color: 'text-green-400' },
];

const NIVEL_CONFIG = {
  Expert: 'bg-yellow-500/20 text-yellow-300',
  Avançado: 'bg-blue-500/20 text-blue-300',
  Iniciante: 'bg-slate-500/20 text-slate-300',
};

export default function CopilotLearningPanel({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-shrink-0">
        <Brain className="w-5 h-5 text-violet-400 animate-pulse" />
        Aprendizado Adaptativo — {empresa}
      </h2>

      {/* Model Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        {MODEL_METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <Icon className={`w-5 h-5 mb-2 ${m.color}`} />
              <p className="text-xl font-black text-white">{m.value}</p>
              <p className="text-xs text-slate-400 mt-1">{m.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Evolution bar */}
      <Card className="p-4 bg-violet-500/10 border border-violet-400/30 rounded-xl flex-shrink-0">
        <div className="flex justify-between mb-2">
          <p className="text-sm font-semibold text-violet-300">Evolução do Modelo (últimas 4 semanas)</p>
          <span className="text-sm font-bold text-white">93.0%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full" style={{ width: '93%' }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">Modelo atualizado diariamente com novos padrões de uso</p>
      </Card>

      {/* User Profiles */}
      <div className="space-y-3">
        {USER_PROFILES.map((profile) => (
          <Card key={profile.perfil} className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/40 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{profile.usuario}</p>
                  <p className="text-xs text-slate-400">{profile.perfil}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className={NIVEL_CONFIG[profile.nivel]}>{profile.nivel}</Badge>
                <p className="text-xs text-slate-400 mt-1">{profile.interacoes} interações</p>
              </div>
            </div>

            {/* Precisão */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">Precisão personalizada</span>
                <span className="text-xs font-bold text-white">{profile.precisao}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full" style={{ width: `${profile.precisao}%` }} />
              </div>
            </div>

            {/* Tópicos */}
            <div className="flex gap-1 flex-wrap mb-2">
              {profile.topicos.map((t) => (
                <Badge key={t} className="bg-white/10 text-slate-300 text-xs">{t}</Badge>
              ))}
            </div>

            {/* Adaptações */}
            <div className="space-y-1">
              {profile.adaptacoes.map((a) => (
                <p key={a} className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  {a}
                </p>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}