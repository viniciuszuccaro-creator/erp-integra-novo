import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { roadmap2026 } from './melhoriaPlanData';
import { Calendar, Rocket, Target, TrendingUp, Zap, Bot } from 'lucide-react';

const ICONS = [Calendar, Rocket, TrendingUp, Bot];
const COLORS = [
  'from-blue-600 to-indigo-600',
  'from-purple-600 to-violet-600',
  'from-emerald-600 to-teal-600',
  'from-amber-500 to-orange-500',
];
const BG = [
  'border-blue-200 bg-blue-50',
  'border-purple-200 bg-purple-50',
  'border-emerald-200 bg-emerald-50',
  'border-amber-200 bg-amber-50',
];

export default function PlanoMelhoriaRoadmapView() {
  return (
    <div className="w-full space-y-5">
      {/* Banner */}
      <Card className="border-0 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Rocket className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Roadmap de Inovação 2026–2027</h2>
              <p className="text-blue-200 text-sm">ERP Zuccaro V21.5+ — Visão futura por trimestre</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {roadmap2026.map((t, i) => (
              <div key={i} className="rounded-xl bg-white/10 p-3 text-center">
                <p className="font-bold text-sm">{t.trimestre}</p>
                <p className="text-xs text-blue-200">{t.itens.length} iniciativas</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cards por trimestre */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roadmap2026.map((trimestre, i) => {
          const Icon = ICONS[i];
          return (
            <Card key={i} className={`${BG[i]} border`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${COLORS[i]} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{trimestre.trimestre}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {trimestre.itens.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-2 w-2 rounded-full bg-current flex-shrink-0 opacity-60" />
                    <span className="text-slate-700 leading-snug">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Regra-Mãe */}
      <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-7 w-7" />
            <h3 className="text-xl font-black">Regra-Mãe do Sistema</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {[
              { icon: '🏢', title: 'Multiempresa em Tudo', desc: 'group_id + empresa_id em toda entidade, consulta e função' },
              { icon: '🔒', title: 'Controle de Acesso', desc: 'RBAC granular por módulo, seção, ação e campo' },
              { icon: '🤖', title: 'IA Integrada', desc: 'Inteligência artificial em fluxos reais, não decorativa' },
              { icon: '📊', title: 'Auditabilidade', desc: 'AuditLog em toda ação sensível, rastreabilidade total' },
              { icon: '📱', title: 'UX Responsiva', desc: 'w-full h-full, mobile-first, redimensionável e acessível' },
              { icon: '🔄', title: 'Melhoria Contínua', desc: 'Ciclos regulares: corrigir → modularizar → conectar → inovar' },
            ].map((r, i) => (
              <div key={i} className="rounded-xl bg-white/10 p-3">
                <p className="font-bold mb-1">{r.icon} {r.title}</p>
                <p className="text-blue-100 text-xs leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}