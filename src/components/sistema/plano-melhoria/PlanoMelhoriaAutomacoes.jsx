import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, PlayCircle, Zap, ShieldCheck, Bot, Route, WalletCards, PackageSearch, Bell, RefreshCw, FileText, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AUTOMACOES = [
  { name: 'IA Financeira', fn: 'iaFinanceAnomalyScan', icon: WalletCards, area: 'Financeiro', desc: 'Anomalias, fluxo de caixa e previsão IA' },
  { name: 'Preço Inteligente', fn: 'productPriceOptimizer', icon: Bot, area: 'Comercial', desc: 'Otimiza preços por margem, giro e concorrência' },
  { name: 'Rota Otimizada', fn: 'optimizeDeliveryRoute', icon: Route, area: 'Expedição', desc: 'Roteirização IA com ETA e custo mínimo' },
  { name: 'Inventário/Estoque', fn: 'applyInventoryAdjustments', icon: PackageSearch, area: 'Estoque', desc: 'Ajustes automáticos e alertas de reposição' },
  { name: 'IA Churn CRM', fn: 'iaChurnAnalyzer', icon: Users, area: 'CRM', desc: 'Detecta risco de churn e sugere ações' },
  { name: 'Guard de Segurança', fn: 'entityGuard', icon: ShieldCheck, area: 'Sistema', desc: 'Valida RBAC em tempo real' },
  { name: 'Fluxo de Pedido', fn: 'orderFlowAuditor', icon: FileText, area: 'Comercial', desc: 'Auditoria e rastreabilidade de pedidos' },
  { name: 'Backup Automático', fn: 'autoBackup', icon: RefreshCw, area: 'Sistema', desc: 'Backup criptografado por empresa' },
  { name: 'Alertas Segurança', fn: 'securityAlerts', icon: Bell, area: 'Sistema', desc: 'Alertas de acesso suspeito e anomalias' },
  { name: 'Orquestrador IA', fn: 'optimizerOrchestrator', icon: Zap, area: 'Sistema', desc: 'Coordena todas as otimizações IA' },
  { name: 'Consolidação Grupo', fn: 'groupConsolidation', icon: WalletCards, area: 'Dashboard', desc: 'Consolida dados de todas as empresas' },
  { name: 'Notif. WhatsApp', fn: 'onEntityWhatsappNotify', icon: Bell, area: 'Notificações', desc: 'Notificações automáticas via WhatsApp' },
];

const areaColors = {
  Financeiro: 'bg-emerald-100 text-emerald-700',
  Comercial: 'bg-blue-100 text-blue-700',
  Expedição: 'bg-orange-100 text-orange-700',
  Estoque: 'bg-violet-100 text-violet-700',
  CRM: 'bg-pink-100 text-pink-700',
  Sistema: 'bg-slate-100 text-slate-700',
  Dashboard: 'bg-cyan-100 text-cyan-700',
  Notificações: 'bg-amber-100 text-amber-700',
};

export default function PlanoMelhoriaAutomacoes() {
  const [estados, setEstados] = useState({});

  const executar = async (auto) => {
    setEstados(e => ({ ...e, [auto.fn]: 'running' }));
    try {
      await base44.functions.invoke(auto.fn, { plano_melhoria: true });
      setEstados(e => ({ ...e, [auto.fn]: 'ok' }));
    } catch {
      setEstados(e => ({ ...e, [auto.fn]: 'error' }));
    }
  };

  const executarTodas = () => AUTOMACOES.forEach(executar);
  const ok = Object.values(estados).filter(s => s === 'ok').length;

  return (
    <Card className="w-full border-purple-100 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-xl text-slate-900">Automações e funções ativas</CardTitle>
            <p className="text-sm text-slate-500 mt-1">{AUTOMACOES.length} automações conectadas ao plano de melhoria.</p>
          </div>
          <div className="flex items-center gap-2">
            {ok > 0 && <Badge className="bg-emerald-100 text-emerald-700">{ok} executadas</Badge>}
            <Button onClick={executarTodas} className="bg-purple-600 hover:bg-purple-700 text-white">
              <PlayCircle className="h-4 w-4" /> Executar todas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {AUTOMACOES.map((auto) => {
          const Icon = auto.icon;
          const estado = estados[auto.fn];
          return (
            <div key={auto.fn} className="rounded-xl border border-white bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                    <Icon className="h-4 w-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{auto.name}</p>
                    <Badge className={`text-xs mt-0.5 ${areaColors[auto.area] || 'bg-slate-100 text-slate-700'}`}>{auto.area}</Badge>
                  </div>
                </div>
                {estado === 'ok' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                {estado === 'running' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-4">{auto.desc}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-slate-400 truncate flex-1">{auto.fn}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => executar(auto)}
                  disabled={estado === 'running'}
                  className="h-6 text-xs ml-2 shrink-0"
                >
                  {estado === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}