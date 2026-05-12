import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { criticalValidationRings } from './criticalPriorityData';

export default function CriticalValidationRail() {
  return (
    <Card className="h-full w-full border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-900">Anéis obrigatórios da prioridade crítica</CardTitle>
        <p className="text-sm text-slate-600">Toda melhoria crítica passa por estes controles antes de ser considerada concluída.</p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {criticalValidationRings.map((ring) => (
          <div key={ring.label} className={`rounded-xl border p-4 ${ring.tone}`}>
            <p className="text-sm font-bold">{ring.label}</p>
            <p className="mt-2 text-xs leading-relaxed opacity-90">{ring.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}