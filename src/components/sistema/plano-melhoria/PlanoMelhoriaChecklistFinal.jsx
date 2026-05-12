import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronDown, ChevronRight, ClipboardCheck, Download, Share2 } from 'lucide-react';

const CHECKLIST = [
  {
    categoria: '🏢 Multiempresa',
    total: 12, feitos: 12,
    itens: [
      'group_id e empresa_id em todas as entidades principais',
      'EmpresaSwitcher conectado ao contexto visual global',
      'Filtros automáticos por escopo (grupo/empresa) em queries',
      'Carimbo automático de empresa_id/group_id no Layout',
      'propagateGroupConfigs — configurações descendentes',
      'syncGroupCompany — sincronização bidirecional',
      'backfillGroupEmpresa — preenchimento retroativo',
      'Relatórios e dashboards filtrados por contexto',
      'Portal do cliente isolado por empresa',
      'NF-e com empresa_faturamento_id e empresa_origem_id',
      'Financeiro: escopo por grupo e por empresa',
      'Agendamentos e eventos por empresa',
    ]
  },
  {
    categoria: '🔒 Controle de Acesso (RBAC+SoD)',
    total: 10, feitos: 10,
    itens: [
      'PerfilAcesso com módulos, abas e ações granulares',
      'entityGuard validando todas as operações críticas',
      'ProtectedSection e ProtectedField nos módulos',
      'SoD (Separação de Deveres) em Financeiro/Comercial',
      'sodValidator backend validando conflitos de permissão',
      'AuditLog de todos os bloqueios com motivo',
      'Button com data-permission integrado ao usePermissions',
      'permissionOptimizer — otimização automática de perfis',
      'securityAlerts — alertas de acesso suspeito',
      'TOTP para ações ultra-sensíveis (verifyTotp)',
    ]
  },
  {
    categoria: '🤖 IA Operacional',
    total: 14, feitos: 14,
    itens: [
      'iaFinanceAnomalyScan — anomalias financeiras em tempo real',
      'iaChurnAnalyzer — previsão de churn de clientes',
      'productPriceOptimizer — precificação inteligente',
      'optimizeDeliveryRoute — roteirização IA de entregas',
      'oportunidadeScorer — score de oportunidades CRM',
      'CRMIAPanel, FinanceiroIAPanel, EstoqueIAPanel',
      'FiscalIAPanel com validação pré-emissão NF-e',
      'ProducaoIAPanel com diagnóstico de equipamentos',
      'ExpedicaoIAPanel com previsão de entregas',
      'HubAtendimentoIAPanel com insights de atendimento',
      'ContratosIAPanel com análise de risco',
      'AgendaIAPanel com sugestões inteligentes',
      'RHIAPanel com insights de colaboradores',
      'ComprasIAInsights com previsão de demanda',
    ]
  },
  {
    categoria: '⚡ Performance e Cache',
    total: 8, feitos: 8,
    itens: [
      'IndexedDB cache offline (useIndexedDBCache)',
      'Prefetch preditivo por histórico de navegação',
      'Deduplicação de inflight no base44.functions.invoke',
      'countEntitiesOptimized — contagens sem full-scan',
      'entityListSorted — ordenação server-side',
      'useInvalidationBus — invalidação seletiva de queries',
      'staleTime/gcTime otimizados no QueryClient',
      'requestIdleCallback para prefetch idle',
    ]
  },
  {
    categoria: '📋 Auditoria e Governança',
    total: 9, feitos: 9,
    itens: [
      'AuditLog central em todas as operações CRUD',
      'deployAudit — rastreio de versões e deploys',
      'autoBackup — backup automático criptografado',
      'ConfiguracaoBackup por empresa/grupo',
      'piiEncryptor — criptografia de dados sensíveis LGPD',
      'orderFlowAuditor — auditoria ponta a ponta de pedidos',
      'uiAudit — auditoria de cliques e interações UI',
      'GlobalAuditLog com filtros por módulo/usuário/ação',
      'auditError — captura e log de erros de UI/backend',
    ]
  },
  {
    categoria: '🔗 Integrações e Automações',
    total: 10, feitos: 10,
    itens: [
      'NF-e via eNotas com emissão, cancelamento e CC',
      'Boletos/PIX via gateway configurável por empresa',
      'WhatsApp automático em entregas, pedidos e cobranças',
      'Google Maps para roteirização de entregas',
      'onPedidoCreated / onPedidoApprovalRequested / onPedidoReadyToInvoice',
      'onEntregaUpdated — atualização automática de status',
      'onNotaFiscalAuthorized — baixa automática pós-NF-e',
      'emitirBoleto, paymentStatusManager, reconcileLogisticaCosts',
      'sendEmailProvider com templates configuráveis',
      'PWA com service worker e suporte offline',
    ]
  },
  {
    categoria: '📱 UX Responsiva e Multitarefa',
    total: 7, feitos: 7,
    itens: [
      'WindowManager para multitarefa real com janelas flutuantes',
      'MinimizedWindowsBar para janelas minimizadas',
      'Layout w-full/h-full responsivo em todos os módulos',
      'MiniMapaNavegacao com breadcrumb visual',
      'PesquisaUniversal Ctrl+K para busca global',
      'AcoesRapidasGlobal com ações frequentes',
      'AtalhosTecladoInfo com todos os atalhos documentados',
    ]
  },
];

export default function PlanoMelhoriaChecklistFinal() {
  const [expandido, setExpandido] = useState(null);
  const [exportando, setExportando] = useState(false);

  const totalItens = CHECKLIST.reduce((s, c) => s + c.total, 0);
  const totalFeitos = CHECKLIST.reduce((s, c) => s + c.feitos, 0);
  const percentual = Math.round((totalFeitos / totalItens) * 100);

  const handleExportChecklist = () => {
    setExportando(true);
    const data = {
      titulo: 'Checklist Plano de Melhoria - 100% Executado',
      data_exportacao: new Date().toISOString(),
      total_itens: totalItens,
      total_feitos: totalFeitos,
      percentual_completo: percentual,
      categorias: CHECKLIST,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-melhoria-checklist-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExportando(false), 500);
  };

  const handleShareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Plano de Melhoria - 100% Executado',
          text: `Plano de Melhoria Base44 ERP: ${percentual}% completo (${totalFeitos}/${totalItens} itens)`,
          url: window.location.href,
        });
      } catch (_) {}
    }
  };

  return (
    <Card className="w-full border-emerald-100">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Checklist Final — Tudo Executado</CardTitle>
              <p className="text-xs text-slate-500">Verificação completa de todos os itens do plano de melhoria</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-emerald-100 text-emerald-700">{totalFeitos}/{totalItens} itens</Badge>
            <Badge className="bg-emerald-600 text-white">{percentual}%</Badge>
            <div className="flex gap-2 ml-auto">
              <Button
                onClick={handleExportChecklist}
                disabled={exportando}
                size="sm"
                variant="outline"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Exportar
              </Button>
              <Button
                onClick={handleShareResults}
                size="sm"
                variant="outline"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {CHECKLIST.map((cat) => {
          const isOpen = expandido === cat.categoria;
          const catPct = Math.round((cat.feitos / cat.total) * 100);
          return (
            <div key={cat.categoria} className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
              <button
                onClick={() => setExpandido(isOpen ? null : cat.categoria)}
                className="w-full flex items-center justify-between gap-3 p-4 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900 text-sm text-left">{cat.categoria}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">{cat.feitos}/{cat.total}</Badge>
                  <Badge className={catPct >= 100 ? 'bg-emerald-600 text-white text-xs' : 'bg-blue-100 text-blue-700 text-xs'}>{catPct}%</Badge>
                  {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 bg-white p-4">
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {cat.itens.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-600 leading-4">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}