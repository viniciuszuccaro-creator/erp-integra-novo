import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Cpu, ShieldCheck } from 'lucide-react';

export default function CriticalModuleExecutionCard({ item }) {
  return (
    <Card className="h-full w-full border-slate-200 bg-white/90 shadow-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-slate-900">{item.module}</CardTitle>
            <p className="mt-1 text-sm text-slate-600">{item.objective}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50">{item.priority}</Badge>
            <Badge className={item.status === 'Concluído' ? 'bg-emerald-600 text-white' : item.status === 'Validando' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
              {item.status === 'Concluído' ? '✓ ' : ''}{item.status}
            </Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{item.status}</span>
            <span className="font-semibold text-slate-700">{item.progress}%</span>
          </div>
          <Progress value={item.progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Guardas
          </div>
          <div className="flex flex-wrap gap-2">
            {item.safeguards.map((guard) => (
              <Badge key={guard} variant="outline" className="bg-slate-50 text-slate-700">{guard}</Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Cpu className="h-4 w-4 text-purple-600" /> Funções conectadas
          </div>
          <div className="space-y-1">
            {item.functions.map((fn) => (
              <div key={fn} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-xs text-slate-600">{fn}</div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Próximas ações
          </div>
          <ul className="space-y-1 text-sm text-slate-600">
            {item.nextActions.map((action) => (
              <li key={action} className="flex gap-2"><span className="text-emerald-600">•</span>{action}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}