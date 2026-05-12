import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MODULE_IMPROVEMENT_STATUS, MODULE_IMPROVEMENT_PILLARS } from '@/components/lib/moduleImprovementPlan';
import { CheckCircle2, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

const PILLAR_SCORES = {
  Dashboard:   [97, 96, 95, 97, 95, 96],
  CRM:         [95, 94, 94, 96, 93, 94],
  Comercial:   [95, 95, 95, 95, 92, 93],
  Estoque:     [97, 96, 96, 97, 95, 95],
  Financeiro:  [93, 93, 93, 94, 91, 92],
  Fiscal:      [93, 93, 93, 93, 91, 92],
  RH:          [92, 91, 92, 93, 90, 91],
  Expedição:   [94, 93, 93, 94, 92, 93],
  Relatórios:  [93, 92, 93, 94, 92, 93],
  Cadastros:   [93, 93, 93, 93, 92, 93],
  Sistema:     [96, 97, 97, 96, 96, 97],
  Contratos:   [92, 91, 91, 93, 90, 92],
  Agenda:      [94, 93, 93, 95, 92, 94],
  Compras:     [95, 94, 94, 96, 93, 95],
  Produção:    [95, 94, 94, 96, 93, 94],
};

export default function PlanoMelhoriaModulosDashboard() {
  const [selected, setSelected] = useState(null);
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgGlobal = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const top = moduleEntries.filter(([, v]) => v.progress >= 95).length;
  const gap = moduleEntries.filter(([, v]) => v.progress < 93).length;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-emerald-100 bg-emerald-50">
          <CardContent className="p-4 text-center">
            <BarChart3 className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-3xl font-black text-emerald-700">{avgGlobal}%</p>
            <p className="text-xs text-emerald-600">Média geral</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-blue-600" />
            <p className="text-3xl font-black text-blue-700">{moduleEntries.length}</p>
            <p className="text-xs text-blue-600">Módulos ativos</p>
          </CardContent>
        </Card>
        <Card className="border-violet-100 bg-violet-50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-5 w-5 text-violet-600" />
            <p className="text-3xl font-black text-violet-700">{top}</p>
            <p className="text-xs text-violet-600">Módulos ≥ 95%</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-amber-50">
          <CardContent className="p-4 text-center">
            <AlertCircle className="mx-auto mb-2 h-5 w-5 text-amber-600" />
            <p className="text-3xl font-black text-amber-700">{gap}</p>
            <p className="text-xs text-amber-600">Gap prioritário</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de módulos clicáveis */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Maturidade por módulo × {MODULE_IMPROVEMENT_PILLARS.length} pilares</CardTitle>
          <p className="text-sm text-slate-500">Clique em um módulo para ver o score detalhado por pilar.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {moduleEntries.map(([name, { progress, focus }]) => {
              const isSelected = selected === name;
              const pillarScores = PILLAR_SCORES[name] || MODULE_IMPROVEMENT_PILLARS.map(() => progress);
              return (
                <div
                  key={name}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${isSelected ? 'border-blue-300 bg-blue-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-white'}`}
                  onClick={() => setSelected(isSelected ? null : name)}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{name}</span>
                    <Badge className={progress >= 95 ? 'bg-emerald-100 text-emerald-700' : progress >= 92 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                      {progress}%
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-1.5 mb-2" />
                  <p className="text-xs text-slate-500 leading-4 line-clamp-2">{focus}</p>

                  {isSelected && (
                    <div className="mt-4 grid gap-2">
                      {MODULE_IMPROVEMENT_PILLARS.map((pillar, i) => (
                        <div key={pillar} className="flex items-center gap-2">
                          <span className="w-36 text-xs text-slate-600 truncate">{pillar}</span>
                          <Progress value={pillarScores[i] || progress} className="h-1.5 flex-1" />
                          <span className="text-xs font-bold text-slate-700 w-8 text-right">{pillarScores[i] || progress}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}