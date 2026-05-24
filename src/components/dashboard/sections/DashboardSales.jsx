import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function DashboardSales() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Análise de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Dados agregados por período</p>
        </CardContent>
      </Card>
    </div>
  );
}