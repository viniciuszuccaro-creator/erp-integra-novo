import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Route, WalletCards, PackageSearch, CheckCircle2 } from 'lucide-react';

const automations = [
  { name: 'IA Financeira', fn: 'iaFinanceAnomalyScan', icon: WalletCards, area: 'Financeiro', status: 'Ativo' },
  { name: 'Preço Inteligente', fn: 'productPriceOptimizer', icon: Bot, area: 'Comercial/Estoque', status: 'Ativo' },
  { name: 'Rota Otimizada', fn: 'optimizeDeliveryRoute', icon: Route, area: 'Expedição', status: 'Ativo' },
  { name: 'Estoque e Inventário', fn: 'applyInventoryAdjustments', icon: PackageSearch, area: 'Estoque', status: 'Ativo' },
  { name: 'IA Churn CRM', fn: 'iaChurnAnalyzer', icon: Bot, area: 'CRM', status: 'Ativo' },
  { name: 'Guard de Segurança', fn: 'entityGuard', icon: Bot, area: 'Sistema', status: 'Ativo' },
  { name: 'Fluxo de Pedido', fn: 'orderFlowAuditor', icon: PackageSearch, area: 'Comercial', status: 'Ativo' },
  { name: 'Backup Automático', fn: 'autoBackup', icon: PackageSearch, area: 'Sistema', status: 'Ativo' },
];

export default function PlanoMelhoriaAutomationPanel() {
  return (
    <Card className="w-full border-purple-100 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">IA e automações conectadas</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {automations.map((automation) => {
          const Icon = automation.icon;
          return (
            <div key={automation.fn} className="rounded-xl border border-white bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Icon className="h-6 w-6 text-purple-600" />
                <Badge className="bg-emerald-100 text-emerald-700 text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {automation.status}
                </Badge>
              </div>
              <p className="font-semibold text-slate-900">{automation.name}</p>
              <p className="mt-1 text-xs text-slate-500 font-mono">{automation.fn}</p>
              <Badge className="mt-3 bg-purple-100 text-purple-700 hover:bg-purple-100">{automation.area}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}