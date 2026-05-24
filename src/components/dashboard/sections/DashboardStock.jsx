import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function DashboardStock() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Situação do Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Produtos críticos, giros e previsões</p>
        </CardContent>
      </Card>
    </div>
  );
}