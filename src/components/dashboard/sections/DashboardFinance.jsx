import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function DashboardFinance() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Visão Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Contas a receber, pagar e fluxo de caixa</p>
        </CardContent>
      </Card>
    </div>
  );
}