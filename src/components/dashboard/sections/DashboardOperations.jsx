import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function DashboardOperations() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Operações em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Pedidos, entregas e produção</p>
        </CardContent>
      </Card>
    </div>
  );
}