import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ImprimirBoleto } from "@/components/lib/ImprimirBoleto";
import GerarCobrancaModal from "./GerarCobrancaModal";
import SimularPagamentoModal from "./SimularPagamentoModal";
import GerarLinkPagamentoModal from "./GerarLinkPagamentoModal";
import ContaReceberForm from "./ContaReceberForm";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import HeaderReceberCompacto from "./contas-receber/HeaderReceberCompacto";
import KPIsReceber from "./contas-receber/KPIsReceber";
import FiltrosReceber from "./contas-receber/FiltrosReceber";
import TabelaReceber from "./contas-receber/TabelaReceber";
import BaixaTituloDialog from "./contas-receber/BaixaTituloDialog";
import useContasReceber from "./contas-receber/useContasReceber";
import useBackendPagination from "@/components/lib/useBackendPagination";
import usePersistedSort from "@/components/lib/usePersistedSort";
import useRLS from "@/components/lib/useRLS";
import useRLSQuery from "@/components/lib/useRLSQuery";

const statusColors = {
  'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Recebido': 'bg-green-100 text-green-800 border-green-300',
  'Atrasado': 'bg-red-100 text-red-800 border-red-300',
  'Cancelado': 'bg-gray-100 text-gray-800 border-gray-300',
  'Parcial': 'bg-blue-100 text-blue-800 border-blue-300'
};

/**
 * REFACTORED (Regra-Mãe): 472 → ~120 linhas
 * Lógica em useContasReceber, dialog em BaixaTituloDialog, tabelas em sub-componentes.
 * Multi-tenant: useRLS/useRLSQuery + filterInContext. RBAC: hasPermission + data-permission.
 */
export default function ContasReceberTab({ contas, empresas = [], windowMode = false }) {
  const { create: createRLS, update: updateRLS } = useRLS();
  const { page, setPage, pageSize, setPageSize } = useBackendPagination('ContaReceber', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('ContaReceber', 'data_vencimento', 'asc');
  const { data: contasBackend = [] } = useRLSQuery('ContaReceber', {}, 'data_vencimento', pageSize);
  const contasList = Array.isArray(contas) && contas.length ? contas : contasBackend;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { openWindow } = useWindow();
  const { formasPagamento } = useFormasPagamento();
  const { user: authUser } = useUser();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const { filterInContext: filterEmpresas, empresaAtual: empCtx, grupoAtual: grpCtx, contexto: ctxEmp } = useContextoVisual();
  const contextoKeyEmp = `${grpCtx?.id || 'sem-grupo'}-${empCtx?.id || 'sem-empresa'}`;

  const { data: empresasQuery = [] } = useQuery({ queryKey: ['empresas', contextoKeyEmp], queryFn: () => filterEmpresas('Empresa', {}, 'nome_fantasia', 999), enabled: !!ctxEmp });
  const { data: configsCobranca = [] } = useQuery({ queryKey: ['configs-cobranca', contextoKeyEmp], queryFn: () => filterEmpresas('ConfiguracaoCobrancaEmpresa', {}, '-created_date', 999), enabled: !!ctxEmp });
  const empresasData = empresas.length > 0 ? empresas : empresasQuery;

  const {
    gerarCobrancaDialogOpen, setGerarCobrancaDialogOpen, simularPagamentoDialogOpen, setSimularPagamentoDialogOpen,
    gerarLinkDialogOpen, setGerarLinkDialogOpen, contaParaCobranca, setContaParaCobranca, contaParaSimulacao, setContaParaSimulacao,
    contaParaLink, setContaParaLink, dialogBaixaOpen, setDialogBaixaOpen, contasSelecionadas, setContasSelecionadas,
    contaAtual, dadosBaixa, setDadosBaixa,
    enviarParaCaixaMutation, baixarTituloMutation, baixarMultiplaMutation, enviarWhatsAppMutation,
    toggleSelecao, handleBaixar, handleBaixarMultipla, handleSubmitBaixa
  } = useContasReceber({ contasList, queryClient });

  const filteredContas = contasList
    .filter(c => statusFilter === "todas" || c.status === statusFilter)
    .filter(c => {
      const s = searchTerm.toLowerCase();
      return c.cliente?.toLowerCase().includes(s) || c.descricao?.toLowerCase().includes(s) ||
        c.numero_documento?.toLowerCase().includes(s) || c.forma_cobranca?.toLowerCase().includes(s) ||
        c.status?.toLowerCase().includes(s) || c.origem_tipo?.toLowerCase().includes(s) ||
        c.canal_origem?.toLowerCase().includes(s) || c.marketplace_origem?.toLowerCase().includes(s) ||
        c.centro_custo?.toLowerCase().includes(s) || c.projeto_obra?.toLowerCase().includes(s) ||
        c.observacoes?.toLowerCase().includes(s);
    });

  const totalSelecionado = contasList.filter(c => contasSelecionadas.includes(c.id)).reduce((sum, c) => sum + (c.valor || 0), 0);
  const totais = {
    total: filteredContas.reduce((s, c) => s + (c.valor || 0), 0),
    pendente: filteredContas.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor || 0), 0),
    pago: filteredContas.filter(c => c.status === 'Recebido').reduce((s, c) => s + (c.valor || 0), 0),
    vencido: filteredContas.filter(c => c.status === 'Atrasado').reduce((s, c) => s + (c.valor || 0), 0)
  };

  const content = (
    <div className="w-full h-full flex flex-col space-y-1.5 overflow-hidden">
      <HeaderReceberCompacto />
      <KPIsReceber totais={totais} />
      <FiltrosReceber
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        contasSelecionadas={contasSelecionadas} totalSelecionado={totalSelecionado}
        onExportar={() => {
          if (!hasPermission('Financeiro', 'ContaReceber', 'exportar')) { toast({ title: '⛔ Sem permissão para exportar', variant: 'destructive' }); return; }
          const itens = contasSelecionadas.length > 0 ? contasList.filter(c => contasSelecionadas.includes(c.id)) : filteredContas;
          const headers = ['cliente', 'descricao', 'numero_documento', 'empresa_id', 'data_vencimento', 'valor', 'status'];
          const csv = [headers.join(','), ...itens.map(c => headers.map(h => JSON.stringify(c[h] ?? '')).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob); const a = document.createElement('a');
          a.href = url; a.download = `contas_receber_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
          URL.revokeObjectURL(url);
          try { base44.entities.AuditLog.create({ acao: 'Exportação', modulo: 'Financeiro', entidade: 'ContaReceber', descricao: `Exportados ${itens.length} títulos`, data_hora: new Date().toISOString() }); } catch (e) { console.error('[ContasReceber] Falha ao auditar exportação:', e?.message || e); }
        }}
        onBaixarMultipla={handleBaixarMultipla}
        onNovaConta={() => {
          if (!hasPermission('Financeiro', 'ContaReceber', 'criar')) { toast({ title: '⛔ Sem permissão para criar', variant: 'destructive' }); return; }
          openWindow(ContaReceberForm, { windowMode: true, onSubmit: async (data) => { await createRLS('ContaReceber', { ...data, criado_por: authUser?.full_name || authUser?.email, criado_por_id: authUser?.id }); queryClient.invalidateQueries({ queryKey: ['ContaReceber'] }); toast({ title: "✅ Conta criada!" }); } }, { title: '💰 Nova Conta a Receber', width: 900, height: 600 });
        }}
        onEnviarCaixa={() => {
          if (!hasPermission('Financeiro', 'ContaReceber', 'enviar_caixa') && !hasPermission('Financeiro', 'ContaReceber', 'editar')) { toast({ title: '⛔ Sem permissão para enviar ao Caixa', variant: 'destructive' }); return; }
          enviarParaCaixaMutation.mutate(contasList.filter(c => contasSelecionadas.includes(c.id)));
        }}
        baixarPending={baixarMultiplaMutation.isPending} enviarPending={enviarParaCaixaMutation.isPending}
      />

      <TabelaReceber
        contas={filteredContas} empresas={empresasData} statusColors={statusColors}
        contasSelecionadas={contasSelecionadas} toggleSelecao={toggleSelecao}
        onPrint={(conta, empresa) => ImprimirBoleto({ conta, empresa, tipo: 'receber' })}
        onEdit={(conta, editar = false) => {
          if (editar && !hasPermission('Financeiro', 'ContaReceber', 'editar')) { toast({ title: '⛔ Sem permissão para editar', variant: 'destructive' }); return; }
          openWindow(ContaReceberForm, { conta: editar ? conta : null, windowMode: true, readonly: !editar, onSubmit: async (data) => { if (editar) { await updateRLS('ContaReceber', conta.id, data); queryClient.invalidateQueries({ queryKey: ['ContaReceber'] }); toast({ title: "✅ Conta atualizada!" }); } } }, { title: editar ? `✏️ Editar: ${conta.cliente}` : `👁️ Detalhes: ${conta.cliente}`, width: 900, height: 600 });
        }}
        onGerarCobranca={(conta) => { setContaParaCobranca(conta); setGerarCobrancaDialogOpen(true); }}
        onGerarLink={(conta) => { setContaParaLink(conta); setGerarLinkDialogOpen(true); }}
        onVerBoleto={(conta) => window.open(conta.boleto_url, '_blank')}
        onCopiarPix={(conta) => { navigator.clipboard.writeText(conta.pix_copia_cola); toast({ title: "📋 PIX copiado!" }); }}
        onEnviarWhatsApp={(conta) => enviarWhatsAppMutation.mutate(conta.id)}
        onSimularPagamento={(conta) => { setContaParaSimulacao(conta); setSimularPagamentoDialogOpen(true); }}
        onBaixar={handleBaixar} configsCobranca={configsCobranca}
      />

      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
        <div className="text-slate-600">Página {page}</div>
        <div className="flex items-center gap-2">
          <select className="h-8 border rounded px-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[10, 20, 50, 100].map(n => (<option key={n} value={n}>{n}/página</option>))}
          </select>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={contasBackend.length < pageSize}>Próxima</Button>
        </div>
      </div>

      <BaixaTituloDialog
        open={dialogBaixaOpen} onOpenChange={setDialogBaixaOpen}
        contaAtual={contaAtual} contasSelecionadas={contasSelecionadas}
        dadosBaixa={dadosBaixa} setDadosBaixa={setDadosBaixa}
        formasPagamento={formasPagamento} onSubmit={handleSubmitBaixa}
        isPending={baixarTituloMutation.isPending || baixarMultiplaMutation.isPending}
      />

      {gerarCobrancaDialogOpen && <GerarCobrancaModal isOpen={gerarCobrancaDialogOpen} onClose={() => { setGerarCobrancaDialogOpen(false); setContaParaCobranca(null); }} contaReceber={contaParaCobranca} />}
      {gerarLinkDialogOpen && <GerarLinkPagamentoModal isOpen={gerarLinkDialogOpen} onClose={() => { setGerarLinkDialogOpen(false); setContaParaLink(null); }} contaReceber={contaParaLink} />}
      {simularPagamentoDialogOpen && <SimularPagamentoModal isOpen={simularPagamentoDialogOpen} onClose={() => { setSimularPagamentoDialogOpen(false); setContaParaSimulacao(null); }} contaReceber={contaParaSimulacao} />}
    </div>
  );

  if (windowMode) return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-green-50 overflow-auto p-1.5">{content}</div>;
  return content;
}