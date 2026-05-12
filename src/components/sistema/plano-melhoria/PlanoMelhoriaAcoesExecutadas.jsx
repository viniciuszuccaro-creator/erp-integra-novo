import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';

const ACOES = [
  {
    categoria: 'Multiempresa',
    cor: 'blue',
    itens: [
      { acao: 'group_id e empresa_id em todas as entidades principais', feito: true },
      { acao: 'EmpresaSwitcher integrado ao layout global', feito: true },
      { acao: 'filterInContext aplicado em CRM, Comercial, Estoque, Financeiro, Compras', feito: true },
      { acao: 'carimbarContexto automático em todas as escritas', feito: true },
      { acao: 'Filtros globais de escopo com fallback seguro', feito: true },
      { acao: 'Dashboard corporativo consolidado multiempresa', feito: true },
      { acao: 'Relatórios com escopo por grupo/empresa', feito: true },
    ]
  },
  {
    categoria: 'Controle de acesso',
    cor: 'slate',
    itens: [
      { acao: 'RBAC granular com usePermissions em todos os módulos', feito: true },
      { acao: 'ProtectedSection envolvendo abas e seções críticas', feito: true },
      { acao: 'entityGuard backend em operações sensíveis', feito: true },
      { acao: 'Auditoria de bloqueios no AuditLog', feito: true },
      { acao: 'Perfis de acesso por módulo, aba e ação', feito: true },
      { acao: 'SoD Checker para verificação de segregação', feito: true },
      { acao: 'ControleAcessoResumo no painel de administração', feito: true },
    ]
  },
  {
    categoria: 'IA operacional',
    cor: 'purple',
    itens: [
      { acao: 'AgendaIAPanel — sugestões e otimização de agenda', feito: true },
      { acao: 'ComprasIAInsights — insights por fornecedor e ciclo', feito: true },
      { acao: 'ComprasPerformancePanel — KPIs de performance real', feito: true },
      { acao: 'IntegracoesSaudePanel — saúde de integrações em tempo real', feito: true },
      { acao: 'FinanceiroIAPanel — anomalias e fluxo de caixa IA', feito: true },
      { acao: 'CRMIAPanel — churn, leads e oportunidades IA', feito: true },
      { acao: 'ProducaoIAPanel — eficiência e diagnóstico de equipamentos', feito: true },
      { acao: 'ExpedicaoIAPanel — rotas otimizadas e ETA IA', feito: true },
      { acao: 'RelatoriosIAInsights — análise executiva IA', feito: true },
      { acao: 'FiscalIAPanel — validação e compliance fiscal IA', feito: true },
      { acao: 'RHIAPanel — produtividade e turnover IA', feito: true },
      { acao: 'ContratosIAPanel — renovação e risco de contratos IA', feito: true },
    ]
  },
  {
    categoria: 'Performance e cache',
    cor: 'emerald',
    itens: [
      { acao: 'entityListSorted com ordenação server-side', feito: true },
      { acao: 'countEntitiesOptimized substituindo list() para contagens', feito: true },
      { acao: 'Prefetch seletivo de módulos no hover do menu', feito: true },
      { acao: 'Cache seletivo por empresa/grupo no QueryClient', feito: true },
      { acao: 'usePredictivePrefetch com histórico de navegação', feito: true },
      { acao: 'useInvalidationBus para invalidação granular', feito: true },
      { acao: 'IDB offline cache com TTL automático', feito: true },
      { acao: 'PerformanceDashboard de monitoramento técnico', feito: true },
    ]
  },
  {
    categoria: 'Modularização',
    cor: 'violet',
    itens: [
      { acao: 'OportunidadesListagem extraída como componente próprio (CRM)', feito: true },
      { acao: 'InteracoesListagem extraída como componente próprio (CRM)', feito: true },
      { acao: 'OrdensProducaoListagem como componente real (Produção)', feito: true },
      { acao: 'Launchpads com Header, KPIs e ModulosGrid separados por módulo', feito: true },
      { acao: 'Hooks dedicados por módulo (useCRMDerivedData, useComercialDerivedData, etc.)', feito: true },
      { acao: 'Configs de query por módulo (crmQueryConfig, comercialQueryConfig, etc.)', feito: true },
      { acao: 'Componentes de layout reutilizáveis (ModuleLayout, ModuleTabs, ModuleKPIs)', feito: true },
    ]
  },
  {
    categoria: 'Governança e auditoria',
    cor: 'rose',
    itens: [
      { acao: 'AuditLog central com tipo_auditoria, modulo e entidade', feito: true },
      { acao: 'Auditoria de navegação por rota', feito: true },
      { acao: 'Auditoria de mutações de entidade via subscribe', feito: true },
      { acao: 'piiEncryptor para dados sensíveis de Cliente/Colaborador', feito: true },
      { acao: 'deployAudit rastreando versões e carregamentos', feito: true },
      { acao: 'LGPD com autorizações explícitas no cadastro de clientes', feito: true },
      { acao: 'sodValidator para segregação de funções', feito: true },
      { acao: 'BackupAutomático configurável por empresa', feito: true },
    ]
  },
  {
    categoria: 'Integrações',
    cor: 'cyan',
    itens: [
      { acao: 'NF-e via eNotas com validação pré-emissão por IA', feito: true },
      { acao: 'Boletos/PIX via gateway configurável por empresa', feito: true },
      { acao: 'WhatsApp Business com templates e automação', feito: true },
      { acao: 'Google Maps para roteirização e rastreamento', feito: true },
      { acao: 'IntegracoesSaudePanel monitorando status em tempo real', feito: true },
      { acao: 'Marketplaces (Mercado Livre, Shopee, Amazon) mapeados', feito: true },
      { acao: 'CNPJ Receita Federal via ConsultarCNPJ', feito: true },
    ]
  },
  {
    categoria: 'UX responsiva',
    cor: 'amber',
    itens: [
      { acao: 'Layout w-full/h-full em todos os módulos', feito: true },
      { acao: 'WindowManager para multitarefa com janelas flutuantes', feito: true },
      { acao: 'MinimizedWindowsBar para janelas minimizadas', feito: true },
      { acao: 'Mobile-first em Comercial, Expedição e Produção', feito: true },
      { acao: 'Sidebar responsiva com collapse automático', feito: true },
      { acao: 'Modo escuro global (Ctrl+M)', feito: true },
      { acao: 'Atalhos de teclado documentados (Ctrl+K, Ctrl+Shift+D/C)', feito: true },
      { acao: 'ModuleImprovementBar em todos os módulos com score', feito: true },
    ]
  },
  {
    categoria: 'Automações e backend',
    cor: 'cyan',
    itens: [
      { acao: 'orderFlowAuditor — auditoria de fluxo de pedido ponta a ponta', feito: true },
      { acao: 'autoBackup — backup automático com criptografia', feito: true },
      { acao: 'groupConsolidation — consolidação de KPIs por grupo empresarial', feito: true },
      { acao: 'optimizerOrchestrator — orquestrador de otimizações IA', feito: true },
      { acao: 'syncGroupCompany — sincronização descendente grupo → empresa', feito: true },
      { acao: 'propagateGroupConfigs — propagação de configurações para filiais', feito: true },
      { acao: 'onPedidoCreated, onPedidoApprovalRequested, onPedidoReadyToInvoice — fluxo automático', feito: true },
      { acao: 'deployAudit — auditoria de versões e deploy do sistema', feito: true },
      { acao: 'whatsappSend + templates — notificações automáticas multicanal', feito: true },
    ]
  },
];

const corMap = {
  blue: 'bg-blue-100 text-blue-700',
  slate: 'bg-slate-100 text-slate-700',
  purple: 'bg-purple-100 text-purple-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  violet: 'bg-violet-100 text-violet-700',
  rose: 'bg-rose-100 text-rose-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  amber: 'bg-amber-100 text-amber-700',
};

export default function PlanoMelhoriaAcoesExecutadas() {
  const [expandidos, setExpandidos] = useState({});
  const total = ACOES.reduce((s, c) => s + c.itens.length, 0);
  const feitos = ACOES.reduce((s, c) => s + c.itens.filter(i => i.feito).length, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Ações executadas do Plano de Melhoria
          </CardTitle>
          <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">
            {feitos}/{total} concluídas
          </Badge>
        </div>
        <p className="text-sm text-slate-500">Registro completo de tudo que foi implementado, organizado por categoria da Regra-Mãe.</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {ACOES.map((cat) => {
            const aberto = expandidos[cat.categoria] !== false; // default aberto
            const feitosNaCategoria = cat.itens.filter(i => i.feito).length;
            return (
              <div key={cat.categoria} className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-3 p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  onClick={() => setExpandidos(prev => ({ ...prev, [cat.categoria]: !aberto }))}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={corMap[cat.cor]}>{cat.categoria}</Badge>
                    <span className="text-sm font-medium text-slate-700">{feitosNaCategoria}/{cat.itens.length} itens</span>
                  </div>
                  {aberto ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>
                {aberto && (
                  <div className="grid gap-1 p-3 bg-white md:grid-cols-2">
                    {cat.itens.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg p-2 hover:bg-slate-50">
                        {item.feito
                          ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                          : <Circle className="h-4 w-4 mt-0.5 text-slate-300 shrink-0" />}
                        <span className={`text-sm ${item.feito ? 'text-slate-700' : 'text-slate-400'}`}>{item.acao}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}