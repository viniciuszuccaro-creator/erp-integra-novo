import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function DashboardInsights() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Previsões, anomalias e oportunidades detectadas por IA</p>
        </CardContent>
      </Card>
    </div>
  );
}