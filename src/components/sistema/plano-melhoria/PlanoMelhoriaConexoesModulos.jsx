import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const CONEXOES = [
  {
    origem: 'Comercial → Pedido',
    destinos: ['Estoque (reserva)', 'Produção (OP)', 'Financeiro (parcelas)', 'Fiscal (NF-e)', 'Expedição (entrega)'],
    funcoes: ['applyOrderStockMovements', 'onPedidoCreated', 'orderFlowAuditor'],
    status: 'Conectado',
    cor: 'emerald',
  },
  {
    origem: 'Compras → OC',
    destinos: ['Estoque (entrada)', 'Financeiro (contas a pagar)', 'Fornecedor (avaliação)'],
    funcoes: ['applyInventoryAdjustments', 'paymentStatusManager'],
    status: 'Conectado',
    cor: 'emerald',
  },
  {
    origem: 'Financeiro → Liquidação',
    destinos: ['Conciliação bancária', 'Caixa central', 'Relatórios DRE', 'Gateway (boleto/PIX)'],
    funcoes: ['emitirBoleto', 'paymentStatusManager', 'reconcileLogisticaCosts'],
    status: 'Conectado',
    cor: 'emerald',
  },
  {
    origem: 'Expedição → Entrega',
    destinos: ['Rastreio GPS', 'Notificação WhatsApp', 'Comprovante digital', 'Logística reversa'],
    funcoes: ['optimizeDeliveryRoute', 'onEntregaUpdated', 'notifyProximity'],
    status: 'Conectado',
    cor: 'emerald',
  },
  {
    origem: 'Produção → OP',
    destinos: ['Estoque (matéria-prima)', 'Pedido (progresso)', 'Apontamentos', 'Kanban'],
    funcoes: ['applyInventoryAdjustments', 'applyOrderStockMovements'],
    status: 'Em execução',
    cor: 'blue',
  },
  {
    origem: 'CRM → Oportunidade',
    destinos: ['Pedido (conversão)', 'Interações', 'Score churn IA', 'Campanha'],
    funcoes: ['oportunidadeScorer', 'iaChurnAnalyzer', 'onOportunidadeStageChanged'],
    status: 'Conectado',
    cor: 'emerald',
  },
  {
    origem: 'Fiscal → NF-e',
    destinos: ['SEFAZ (autorização)', 'Pedido (status)', 'Financeiro (duplicatas)', 'XML/DANFE'],
    funcoes: ['nfeActions', 'fiscalValidation', 'onNotaFiscalAuthorized'],
    status: 'Conectado',
    cor: 'emerald',
  },
  {
    origem: 'RH → Ponto/Férias',
    destinos: ['Financeiro (folha)', 'Colaborador (histórico)', 'Monitoramento IA'],
    funcoes: ['auditEntityEvents'],
    status: 'Em execução',
    cor: 'blue',
  },
];

export default function PlanoMelhoriaConexoesModulos() {
  const conectados = CONEXOES.filter(c => c.status === 'Conectado').length;

  return (
    <Card className="w-full border-emerald-100">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Conexões entre módulos (Regra-Mãe)
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-emerald-100 text-emerald-700">{conectados} Conectados</Badge>
            <Badge className="bg-blue-100 text-blue-700">{CONEXOES.length - conectados} Em execução</Badge>
          </div>
        </div>
        <p className="text-sm text-slate-500">Fluxos de dados entre módulos com funções backend ativas.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {CONEXOES.map((conexao) => (
            <div key={conexao.origem} className={`rounded-xl border p-4 ${conexao.cor === 'emerald' ? 'border-emerald-100 bg-emerald-50/50' : 'border-blue-100 bg-blue-50/50'}`}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900 text-sm">{conexao.origem}</p>
                <Badge className={conexao.cor === 'emerald' ? 'bg-emerald-100 text-emerald-700 text-xs' : 'bg-blue-100 text-blue-700 text-xs'}>
                  {conexao.status}
                </Badge>
              </div>
              <div className="space-y-1 mb-3">
                {conexao.destinos.map((d) => (
                  <div key={d} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />{d}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/60">
                {conexao.funcoes.map((f) => (
                  <span key={f} className="rounded bg-white/80 px-1.5 py-0.5 text-xs font-mono text-slate-600">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}