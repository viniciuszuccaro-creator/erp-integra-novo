import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Network, Zap } from 'lucide-react';

const CONEXOES_AVANCADAS = [
  {
    fluxo: 'Pedido → NF-e → Cobrança → Liquidação → DRE',
    modulos: ['Comercial', 'Fiscal', 'Financeiro', 'Relatórios'],
    funcoes: ['onPedidoReadyToInvoice', 'nfeActions', 'onNotaFiscalAuthorized', 'emitirBoleto', 'paymentStatusManager'],
    status: 'Ativo', cor: 'emerald',
  },
  {
    fluxo: 'Compra → Recebimento NF-e → Estoque → Contas a Pagar',
    modulos: ['Compras', 'Fiscal', 'Estoque', 'Financeiro'],
    funcoes: ['applyInventoryAdjustments', 'paymentStatusManager', 'fiscalValidation'],
    status: 'Ativo', cor: 'emerald',
  },
  {
    fluxo: 'OP → Apontamento → Estoque → Pedido (status)',
    modulos: ['Produção', 'Estoque', 'Comercial'],
    funcoes: ['applyOrderStockMovements', 'applyInventoryAdjustments', 'orderFlowAuditor'],
    status: 'Ativo', cor: 'emerald',
  },
  {
    fluxo: 'Oportunidade → Pedido → Comissão → Financeiro',
    modulos: ['CRM', 'Comercial', 'Financeiro', 'RH'],
    funcoes: ['onOportunidadeStageChanged', 'onOrcamentoConfirmed', 'auditEntityEvents'],
    status: 'Ativo', cor: 'emerald',
  },
  {
    fluxo: 'Entrega → GPS → WhatsApp → Comprovante → Logística',
    modulos: ['Expedição', 'Logística', 'CRM'],
    funcoes: ['onEntregaUpdated', 'notifyProximity', 'updateGpsFromSms', 'whatsappSend'],
    status: 'Ativo', cor: 'emerald',
  },
  {
    fluxo: 'IA Churn → Alerta → CRM → Campanha → WhatsApp',
    modulos: ['IA', 'CRM', 'Hub Atendimento'],
    funcoes: ['iaChurnAnalyzer', 'onEntityWhatsappNotify', 'securityAlerts'],
    status: 'Ativo', cor: 'emerald',
  },
  {
    fluxo: 'Grupo → Config → Empresa → Filial (herança)',
    modulos: ['Sistema', 'Empresas', 'Cadastros'],
    funcoes: ['propagateGroupConfigs', 'syncGroupCompany', 'upsertConfig', 'conflictPolicy'],
    status: 'Ativo', cor: 'emerald',
  },
  {
    fluxo: 'Atendimento → Ticket → Histórico → CRM → Pedido',
    modulos: ['Hub Atendimento', 'CRM', 'Comercial'],
    funcoes: ['onEntityWhatsappNotify', 'oportunidadeScorer', 'whatsappSend'],
    status: 'Em expansão', cor: 'blue',
  },
];

export default function PlanoMelhoriaConexoesAvancadas() {
  const ativos = CONEXOES_AVANCADAS.filter(c => c.status === 'Ativo').length;

  return (
    <Card className="w-full border-cyan-100">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Fluxos ponta a ponta ativos</CardTitle>
              <p className="text-xs text-slate-500">Conexões completas entre módulos com funções backend rastreáveis</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-100 text-emerald-700">{ativos} fluxos ativos</Badge>
            <Badge className="bg-blue-100 text-blue-700">{CONEXOES_AVANCADAS.length - ativos} em expansão</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {CONEXOES_AVANCADAS.map((c) => (
            <div key={c.fluxo} className={`rounded-xl border p-4 ${c.cor === 'emerald' ? 'border-emerald-100 bg-emerald-50/40' : 'border-blue-100 bg-blue-50/40'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${c.cor === 'emerald' ? 'text-emerald-600' : 'text-blue-600'}`} />
                  <p className="font-semibold text-slate-900 text-sm leading-5">{c.fluxo}</p>
                </div>
                <Badge className={c.cor === 'emerald' ? 'bg-emerald-100 text-emerald-700 text-xs shrink-0' : 'bg-blue-100 text-blue-700 text-xs shrink-0'}>
                  {c.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 mb-2 ml-6">
                {c.modulos.map((m) => (
                  <span key={m} className="rounded bg-white px-1.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">{m}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 ml-6">
                {c.funcoes.map((f) => (
                  <span key={f} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-500">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}