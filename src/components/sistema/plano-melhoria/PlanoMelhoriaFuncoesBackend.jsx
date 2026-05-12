import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, ChevronDown, ChevronUp, Zap, Shield, Bot, Network } from 'lucide-react';

const FUNCOES = [
  { nome: 'onPedidoCreated', categoria: 'Fluxo', descricao: 'Reserva estoque, audita e inicia fluxo do pedido', status: 'Ativo', modulo: 'Comercial' },
  { nome: 'onPedidoApprovalRequested', categoria: 'Fluxo', descricao: 'Notifica aprovador de desconto e bloqueia pedido', status: 'Ativo', modulo: 'Comercial' },
  { nome: 'onPedidoReadyToInvoice', categoria: 'Fluxo', descricao: 'Dispara geração de NF-e e atualiza status', status: 'Ativo', modulo: 'Comercial' },
  { nome: 'applyOrderStockMovements', categoria: 'Estoque', descricao: 'Aplica movimentações de estoque do pedido', status: 'Ativo', modulo: 'Estoque' },
  { nome: 'applyInventoryAdjustments', categoria: 'Estoque', descricao: 'Aplica ajustes de inventário com auditoria', status: 'Ativo', modulo: 'Estoque' },
  { nome: 'iaFinanceAnomalyScan', categoria: 'IA', descricao: 'Detecta anomalias financeiras e previsões', status: 'Ativo', modulo: 'Financeiro' },
  { nome: 'iaChurnAnalyzer', categoria: 'IA', descricao: 'Calcula risco de churn por cliente', status: 'Ativo', modulo: 'CRM' },
  { nome: 'productPriceOptimizer', categoria: 'IA', descricao: 'Otimiza preços com base em margem e mercado', status: 'Ativo', modulo: 'Estoque' },
  { nome: 'optimizeDeliveryRoute', categoria: 'Logística', descricao: 'Roteiriza entregas com IA e Google Maps', status: 'Ativo', modulo: 'Expedição' },
  { nome: 'notifyProximity', categoria: 'Logística', descricao: 'Notifica cliente quando entrega se aproxima', status: 'Ativo', modulo: 'Expedição' },
  { nome: 'nfeActions', categoria: 'Fiscal', descricao: 'Emite, cancela e busca NF-e via SEFAZ', status: 'Ativo', modulo: 'Fiscal' },
  { nome: 'fiscalValidation', categoria: 'Fiscal', descricao: 'Valida NF-e pré-emissão com IA fiscal', status: 'Ativo', modulo: 'Fiscal' },
  { nome: 'emitirBoleto', categoria: 'Financeiro', descricao: 'Gera boleto/PIX via gateway de pagamento', status: 'Ativo', modulo: 'Financeiro' },
  { nome: 'paymentStatusManager', categoria: 'Financeiro', descricao: 'Gerencia status de pagamentos e webhooks', status: 'Ativo', modulo: 'Financeiro' },
  { nome: 'entityGuard', categoria: 'Segurança', descricao: 'RBAC: valida ação por módulo, seção e usuário', status: 'Ativo', modulo: 'Sistema' },
  { nome: 'sodValidator', categoria: 'Segurança', descricao: 'Valida Segregação de Funções (SoD)', status: 'Ativo', modulo: 'Sistema' },
  { nome: 'piiEncryptor', categoria: 'Segurança', descricao: 'Encripta/desencripta PII (LGPD)', status: 'Ativo', modulo: 'Sistema' },
  { nome: 'groupConsolidation', categoria: 'Multiempresa', descricao: 'Consolida KPIs de todas empresas do grupo', status: 'Ativo', modulo: 'Dashboard' },
  { nome: 'syncGroupCompany', categoria: 'Multiempresa', descricao: 'Sincroniza configurações grupo → empresa', status: 'Ativo', modulo: 'Sistema' },
  { nome: 'propagateGroupConfigs', categoria: 'Multiempresa', descricao: 'Propaga entidades criadas no grupo para filiais', status: 'Ativo', modulo: 'Sistema' },
  { nome: 'autoBackup', categoria: 'Governança', descricao: 'Backup automático criptografado por empresa', status: 'Ativo', modulo: 'Sistema' },
  { nome: 'deployAudit', categoria: 'Governança', descricao: 'Rastreia versões, deploys e eventos do sistema', status: 'Ativo', modulo: 'Sistema' },
  { nome: 'orderFlowAuditor', categoria: 'Auditoria', descricao: 'Auditoria ponta a ponta do fluxo de pedido', status: 'Ativo', modulo: 'Comercial' },
  { nome: 'whatsappSend', categoria: 'Integrações', descricao: 'Envia mensagem WhatsApp com templates', status: 'Ativo', modulo: 'Todos' },
  { nome: 'optimizerOrchestrator', categoria: 'IA', descricao: 'Orquestra otimizações IA em todos os módulos', status: 'Ativo', modulo: 'Sistema' },
];

const categoriaCor = {
  Fluxo: 'bg-blue-100 text-blue-700',
  Estoque: 'bg-emerald-100 text-emerald-700',
  IA: 'bg-purple-100 text-purple-700',
  Logística: 'bg-cyan-100 text-cyan-700',
  Fiscal: 'bg-amber-100 text-amber-700',
  Financeiro: 'bg-green-100 text-green-700',
  Segurança: 'bg-red-100 text-red-700',
  Multiempresa: 'bg-indigo-100 text-indigo-700',
  Governança: 'bg-slate-100 text-slate-700',
  Auditoria: 'bg-rose-100 text-rose-700',
  Integrações: 'bg-teal-100 text-teal-700',
};

const CATEGORIAS = [...new Set(FUNCOES.map(f => f.categoria))];

export default function PlanoMelhoriaFuncoesBackend() {
  const [filtro, setFiltro] = useState('Todos');
  const [busca, setBusca] = useState('');

  const filtered = FUNCOES.filter(f => {
    const matchCat = filtro === 'Todos' || f.categoria === filtro;
    const matchBusca = !busca || f.nome.toLowerCase().includes(busca.toLowerCase()) || f.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <Code2 className="h-5 w-5 text-blue-600" />
          Funções backend ativas ({FUNCOES.length})
        </CardTitle>
        <p className="text-sm text-slate-500">Todas as funções Deno em produção que executam a lógica do plano de melhoria.</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <input
            type="text"
            placeholder="Buscar função..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-400 w-48"
          />
          <button
            onClick={() => setFiltro('Todos')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${filtro === 'Todos' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            Todos
          </button>
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${filtro === cat ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((f) => (
            <div key={f.nome} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <code className="text-sm font-bold text-slate-900 font-mono">{f.nome}</code>
                <Badge className={categoriaCor[f.categoria] || 'bg-slate-100 text-slate-600'}>{f.categoria}</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-2">{f.descricao}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{f.modulo}</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">✅ Ativo</Badge>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-slate-400 py-8">Nenhuma função encontrada.</p>
        )}
      </CardContent>
    </Card>
  );
}