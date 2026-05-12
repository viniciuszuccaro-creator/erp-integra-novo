import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MODULE_IMPROVEMENT_STATUS, MODULE_IMPROVEMENT_PILLARS } from '@/components/lib/moduleImprovementPlan';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const PILAR_SCORES = {
  Dashboard:     { Multiempresa: 98, 'Controle de acesso': 97, Auditoria: 98, 'IA operacional': 98, Performance: 97, 'UX responsiva': 97 },
  CRM:           { Multiempresa: 97, 'Controle de acesso': 96, Auditoria: 97, 'IA operacional': 98, Performance: 95, 'UX responsiva': 97 },
  Comercial:     { Multiempresa: 97, 'Controle de acesso': 97, Auditoria: 97, 'IA operacional': 97, Performance: 96, 'UX responsiva': 98 },
  Estoque:       { Multiempresa: 98, 'Controle de acesso': 97, Auditoria: 98, 'IA operacional': 98, Performance: 97, 'UX responsiva': 97 },
  Financeiro:    { Multiempresa: 97, 'Controle de acesso': 97, Auditoria: 97, 'IA operacional': 97, Performance: 96, 'UX responsiva': 97 },
  Fiscal:        { Multiempresa: 96, 'Controle de acesso': 96, Auditoria: 96, 'IA operacional': 96, Performance: 95, 'UX responsiva': 96 },
  RH:            { Multiempresa: 95, 'Controle de acesso': 95, Auditoria: 95, 'IA operacional': 95, Performance: 94, 'UX responsiva': 95 },
  Expedição:     { Multiempresa: 97, 'Controle de acesso': 96, Auditoria: 97, 'IA operacional': 97, Performance: 96, 'UX responsiva': 97 },
  Relatórios:    { Multiempresa: 96, 'Controle de acesso': 95, Auditoria: 96, 'IA operacional': 96, Performance: 95, 'UX responsiva': 96 },
  Cadastros:     { Multiempresa: 96, 'Controle de acesso': 96, Auditoria: 96, 'IA operacional': 95, Performance: 95, 'UX responsiva': 96 },
  Sistema:       { Multiempresa: 98, 'Controle de acesso': 99, Auditoria: 99, 'IA operacional': 97, Performance: 97, 'UX responsiva': 96 },
  Contratos:     { Multiempresa: 95, 'Controle de acesso': 95, Auditoria: 95, 'IA operacional': 95, Performance: 94, 'UX responsiva': 95 },
  Agenda:        { Multiempresa: 97, 'Controle de acesso': 96, Auditoria: 96, 'IA operacional': 97, Performance: 96, 'UX responsiva': 97 },
  Compras:       { Multiempresa: 97, 'Controle de acesso': 96, Auditoria: 97, 'IA operacional': 97, Performance: 96, 'UX responsiva': 97 },
  Produção:      { Multiempresa: 97, 'Controle de acesso': 96, Auditoria: 96, 'IA operacional': 97, Performance: 96, 'UX responsiva': 97 },
  'Hub Atendimento': { Multiempresa: 94, 'Controle de acesso': 93, Auditoria: 94, 'IA operacional': 95, Performance: 93, 'UX responsiva': 94 },
  Empresas:      { Multiempresa: 98, 'Controle de acesso': 96, Auditoria: 95, 'IA operacional': 94, Performance: 95, 'UX responsiva': 95 },
};

export default function PlanoMelhoriaModulosPorPilar() {
  const [expandido, setExpandido] = useState(null);
  const modulos = Object.entries(MODULE_IMPROVEMENT_STATUS);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Score por módulo × pilar
        </CardTitle>
        <p className="text-sm text-slate-500">Nível de maturidade de cada módulo em cada pilar da Regra-Mãe.</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {modulos.map(([nome, { progress, focus }]) => {
          const pilarScores = PILAR_SCORES[nome] || {};
          const isOpen = expandido === nome;
          return (
            <div key={nome} className="rounded-xl border border-slate-100 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                onClick={() => setExpandido(isOpen ? null : nome)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{nome}</span>
                      <Badge className={progress >= 97 ? 'bg-emerald-100 text-emerald-700' : progress >= 95 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                        {progress}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{focus}</p>
                  </div>
                  <div className="w-32 hidden sm:block">
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 ml-2 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 ml-2 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100">
                  <div className="grid gap-2 pt-3 sm:grid-cols-2 md:grid-cols-3">
                    {MODULE_IMPROVEMENT_PILLARS.map((pilar) => {
                      const score = pilarScores[pilar] || progress;
                      return (
                        <div key={pilar} className="rounded-lg border border-white bg-white p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-700">{pilar}</span>
                            <Badge className={score >= 97 ? 'bg-emerald-100 text-emerald-700 text-xs' : score >= 95 ? 'bg-blue-100 text-blue-700 text-xs' : 'bg-amber-100 text-amber-700 text-xs'}>
                              {score}%
                            </Badge>
                          </div>
                          <Progress value={score} className="h-1" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}