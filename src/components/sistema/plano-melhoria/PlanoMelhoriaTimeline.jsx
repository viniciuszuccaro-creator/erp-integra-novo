import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GitBranch, CheckCircle2, Circle, Clock } from 'lucide-react';
import { melhoriaPlanPhases } from './melhoriaPlanData';

const statusIcon = (progress) => {
  if (progress >= 100) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (progress >= 70) return <Clock className="h-5 w-5 text-blue-500" />;
  return <Circle className="h-5 w-5 text-slate-300" />;
};

export default function PlanoMelhoriaTimeline() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-900">Timeline das fases</CardTitle>
            <p className="text-sm text-slate-500">Evolução cronológica de cada pilar do plano de melhoria.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-0">
          {melhoriaPlanPhases.map((phase, idx) => {
            const Icon = phase.icon;
            const isLast = idx === melhoriaPlanPhases.length - 1;
            return (
              <div key={phase.id} className="flex gap-4">
                {/* Connector */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${phase.color} text-white shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLast && <div className="my-1 w-0.5 flex-1 bg-slate-200" />}
                </div>
                {/* Content */}
                <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">{phase.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {statusIcon(phase.progress)}
                      <span className="ml-1">{phase.progress}%</span>
                    </Badge>
                    {phase.status === 'concluido' && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">Concluído ✅</Badge>
                    )}
                    {phase.status === 'permanente' && (
                      <Badge className="bg-violet-100 text-violet-700 text-xs">Permanente ♾️</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{phase.goal}</p>
                  <Progress value={phase.progress} className="h-1.5 mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {phase.items.map((item) => (
                      <Badge key={item} variant="outline" className="bg-white text-xs text-slate-600">{item}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}