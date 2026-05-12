import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

const PILLARS = ['Multiempresa', 'Acesso', 'Performance', 'UX', 'IA', 'Auditoria'];

// Score simulado por pilar por módulo (baseado no foco real de cada módulo)
const PILLAR_SCORES = {
  Dashboard:   { Multiempresa: 96, Acesso: 94, Performance: 97, UX: 95, IA: 95, Auditoria: 96 },
  CRM:         { Multiempresa: 95, Acesso: 93, Performance: 92, UX: 93, IA: 96, Auditoria: 94 },
  Comercial:   { Multiempresa: 95, Acesso: 94, Performance: 93, UX: 94, IA: 93, Auditoria: 95 },
  Estoque:     { Multiempresa: 97, Acesso: 95, Performance: 96, UX: 94, IA: 95, Auditoria: 97 },
  Compras:     { Multiempresa: 95, Acesso: 94, Performance: 93, UX: 94, IA: 96, Auditoria: 94 },
  Financeiro:  { Multiempresa: 94, Acesso: 93, Performance: 92, UX: 92, IA: 94, Auditoria: 96 },
  Expedição:   { Multiempresa: 94, Acesso: 92, Performance: 92, UX: 93, IA: 94, Auditoria: 93 },
  Produção:    { Multiempresa: 95, Acesso: 93, Performance: 93, UX: 94, IA: 96, Auditoria: 94 },
  Fiscal:      { Multiempresa: 94, Acesso: 93, Performance: 92, UX: 91, IA: 95, Auditoria: 95 },
  RH:          { Multiempresa: 92, Acesso: 92, Performance: 90, UX: 92, IA: 93, Auditoria: 92 },
  Cadastros:   { Multiempresa: 94, Acesso: 93, Performance: 92, UX: 93, IA: 92, Auditoria: 94 },
  Sistema:     { Multiempresa: 96, Acesso: 97, Performance: 95, UX: 94, IA: 96, Auditoria: 98 },
  Agenda:      { Multiempresa: 93, Acesso: 92, Performance: 92, UX: 95, IA: 95, Auditoria: 92 },
  Contratos:   { Multiempresa: 92, Acesso: 92, Performance: 91, UX: 92, IA: 93, Auditoria: 93 },
  Relatórios:  { Multiempresa: 94, Acesso: 93, Performance: 93, UX: 93, IA: 93, Auditoria: 93 },
};

const scoreColor = (v) => {
  if (v >= 95) return 'bg-emerald-100 text-emerald-700';
  if (v >= 90) return 'bg-blue-100 text-blue-700';
  if (v >= 80) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

export default function PlanoMelhoriaModuleMatrix() {
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Matriz de maturidade por módulo × pilar</CardTitle>
        <p className="text-sm text-slate-500">Score de cobertura real para cada dimensão da Regra-Mãe por módulo.</p>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className={`grid bg-slate-900 text-sm font-semibold text-white`}
            style={{ gridTemplateColumns: `1fr repeat(${PILLARS.length + 1}, auto)` }}>
            <div className="p-3">Módulo</div>
            {PILLARS.map(p => (
              <div key={p} className="p-3 text-center min-w-[90px]">{p}</div>
            ))}
            <div className="p-3 text-center min-w-[70px]">Geral</div>
          </div>

          {/* Rows */}
          {moduleEntries.map(([name, { progress }], index) => {
            const scores = PILLAR_SCORES[name] || {};
            return (
              <div
                key={name}
                className={`grid text-sm ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                style={{ gridTemplateColumns: `1fr repeat(${PILLARS.length + 1}, auto)` }}
              >
                <div className="p-3 font-medium text-slate-800 flex items-center">{name}</div>
                {PILLARS.map(pillar => {
                  const v = scores[pillar] || progress;
                  return (
                    <div key={`${name}-${pillar}`} className="flex justify-center items-center p-2 min-w-[90px]">
                      <Badge variant="outline" className={scoreColor(v)}>{v}%</Badge>
                    </div>
                  );
                })}
                <div className="flex justify-center items-center p-2 min-w-[70px]">
                  <Badge className={progress >= 95 ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}>
                    {progress}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}