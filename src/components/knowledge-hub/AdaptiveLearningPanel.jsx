import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle2, Clock, Trophy, Target } from 'lucide-react';

export default function AdaptiveLearningPanel() {
  const trilhas = [
    { id: 'T001', titulo: 'Mestre em Fiscal & NF-e', nivel: 'Avançado', progresso: 78, modulos: 12, concluidos: 9, tempo_restante: '2h 40min', cor: 'bg-orange-500' },
    { id: 'T002', titulo: 'Gestão Financeira Completa', nivel: 'Intermediário', progresso: 45, modulos: 8, concluidos: 4, tempo_restante: '4h 10min', cor: 'bg-emerald-500' },
    { id: 'T003', titulo: 'Operações de Estoque e WMS', nivel: 'Básico', progresso: 92, modulos: 6, concluidos: 6, tempo_restante: '20min', cor: 'bg-blue-500' },
    { id: 'T004', titulo: 'Administrador do Sistema (RBAC)', nivel: 'Expert', progresso: 30, modulos: 15, concluidos: 5, tempo_restante: '8h 30min', cor: 'bg-purple-500' },
  ];

  const conquistas = [
    { titulo: 'Primeiro Artigo Lido', icone: '📖', desbloqueado: true },
    { titulo: 'Trilha Fiscal Concluída', icone: '🏆', desbloqueado: true },
    { titulo: 'Colaborador do Mês', icone: '⭐', desbloqueado: true },
    { titulo: 'Mestre RBAC', icone: '🔐', desbloqueado: false },
    { titulo: 'Expert em NF-e', icone: '📋', desbloqueado: false },
    { titulo: 'Top 10 da Empresa', icone: '🥇', desbloqueado: false },
  ];

  const recomendacoes = [
    { titulo: 'Contas a Receber Avançado', motivo: 'Baseado no seu histórico fiscal', duracao: '45 min', relevancia: 96 },
    { titulo: 'Roteirização com IA', motivo: 'Popular na sua empresa', duracao: '30 min', relevancia: 88 },
    { titulo: 'Conciliação Bancária Automática', motivo: 'Próximo na trilha financeira', duracao: '60 min', relevancia: 84 },
  ];

  const getNivelColor = (nivel) => {
    const m = { 'Básico': 'bg-green-900 text-green-200', 'Intermediário': 'bg-blue-900 text-blue-200', 'Avançado': 'bg-orange-900 text-orange-200', 'Expert': 'bg-purple-900 text-purple-200' };
    return m[nivel] || 'bg-slate-700 text-slate-200';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* XP Score */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-slate-800 border-purple-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Nível de Aprendizado</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">Nível 7</p>
              <p className="text-xs text-slate-400 mt-1">2.840 / 3.500 XP para Nível 8</p>
            </div>
            <div className="text-right">
              <Trophy className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-amber-400 mt-1">Top 5%</p>
            </div>
          </div>
          <Progress value={81} className="h-2 bg-slate-700 mt-3" />
        </CardContent>
      </Card>

      {/* Trilhas de Aprendizado */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Trilhas em Andamento</h3>
        {trilhas.map(t => (
          <Card key={t.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{t.titulo}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" /> {t.tempo_restante} restantes
                    <span>• {t.concluidos}/{t.modulos} módulos</span>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge className={`text-xs ${getNivelColor(t.nivel)}`}>{t.nivel}</Badge>
                  <span className="text-sm font-bold text-white">{t.progresso}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${t.cor}`} style={{ width: `${t.progresso}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recomendações IA */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Recomendações da IA</h3>
        {recomendacoes.map((r, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 border-l-4 border-l-indigo-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white text-sm">{r.titulo}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.motivo} • {r.duracao}</p>
                </div>
                <span className="text-sm font-bold text-indigo-400 shrink-0">{r.relevancia}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conquistas */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Conquistas ({conquistas.filter(c => c.desbloqueado).length}/{conquistas.length})</h3>
        <div className="grid grid-cols-3 gap-2">
          {conquistas.map((c, i) => (
            <Card key={i} className={`${c.desbloqueado ? 'bg-amber-900/30 border-amber-700' : 'bg-slate-800/50 border-slate-700 opacity-50'} border`}>
              <CardContent className="p-3 text-center">
                <p className="text-2xl mb-1">{c.icone}</p>
                <p className="text-xs text-slate-300 font-medium leading-tight">{c.titulo}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}