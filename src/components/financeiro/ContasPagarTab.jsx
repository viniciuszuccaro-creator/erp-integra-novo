import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import BaixaContaPagarDialog from "./BaixaContaPagarDialog";
import { useToast } from "@/components/ui/use-toast";
import { ImprimirBoleto } from "@/components/lib/ImprimirBoleto";
import ContaPagarForm from "./ContaPagarForm";
import { useWindow } from "@/components/lib/useWindow";
// useContextoVisual removed — using useRLS for operations
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import { useUser } from "@/components/lib/UserContext";
import usePermissions from "@/components/lib/usePermissions";
import HeaderPagarCompacto from "./contas-pagar/HeaderPagarCompacto";
import KPIsPagar from "./contas-pagar/KPIsPagar";
import FiltrosPagar from "./contas-pagar/FiltrosPagar";
import TabelaPagar from "./contas-pagar/TabelaPagar";
import useBackendPagination from "@/components/lib/useBackendPagination";
import usePersistedSort from "@/components/lib/usePersistedSort";
import useRLS from "@/components/lib/useRLS";
import useRLSQuery from "@/components/lib/useRLSQuery";

export default function ContasPagarTab({ contas, windowMode = false }) {
  const { create: createRLS, update: updateRLS } = useRLS();
  const { page, setPage, pageSize, setPageSize } = useBackendPagination('ContaPagar', 20);
  const [sortField, setSortField, sortDirection, setSortDirection] = usePersistedSort('ContaPagar', 'data_vencimento', 'asc');

  const { data: contasBackend = [] } = useRLSQuery('ContaPagar', {}, 'data_vencimento', pageSize);
  const contasList = Array.isArray(contas) && contas.length ? contas : contasBackend;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { formasPagamento } = useFormasPagamento();
  const { user: authUser } = useUser();
  const { hasPermission } = usePermissions();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogBaixaOpen, setDialogBaixaOpen] = useState(false);
  const [contasSelecionadas, setContasSelecionadas] = useState([]);
  const [contaAtual, setContaAtual] = useState(null);
  const [dadosBaixa, setDadosBaixa] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_pago: 0,
    forma_pagamento: "PIX",
    juros: 0,
    multa: 0,
    desconto: 0,
    observacoes: ""
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list(),
  });

  const enviarParaCaixaMutation = useMutation({
    mutationFn: async (titulos) => {
      const ordens = await Promise.all(titulos.map(async (titulo) => {
        return await base44.entities.CaixaOrdemLiquidacao.create({
          empresa_id: titulo.empresa_id,
          tipo_operacao: 'Pagamento',
          origem: 'Contas a Pagar',
          valor_total: titulo.valor,
          forma_pagamento_pretendida: 'Transferência',
          status: 'Pendente',
          titulos_vinculados: [{
            titulo_id: titulo.id,
            tipo_titulo: 'ContaPagar',
            numero_titulo: titulo.numero_documento || titulo.descricao,
            cliente_fornecedor_nome: titulo.fornecedor,
            valor_titulo: titulo.valor
          }],
          data_ordem: new Date().toISOString()
        });
      }));
      return ordens;
    },
    onSuccess: async (ordens) => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast({ title: `✅ ${ordens.length} título(s) enviado(s) para o Caixa!` });
      try { await base44.entities.AuditLog.create({ acao: 'Criação', modulo: 'Financeiro', entidade: 'CaixaOrdemLiquidacao', descricao: `${ordens.length} título(s) do Pagar enviados para o Caixa`, data_hora: new Date().toISOString() }); } catch(_) {}
      setContasSelecionadas([]);
    }
  });

  const baixarTituloMutation = useMutation({
    mutationFn: async ({ id, dados }) => {
      const conta = contasList.find(c => c.id === id);
      const valorTotal = (conta?.valor || 0) + (dados.juros || 0) + (dados.multa || 0) - (dados.desconto || 0);
      
      await createRLS('CaixaMovimento', {
        empresa_id: conta.empresa_id,
        group_id: conta.group_id,
        tipo_movimento: 'Saída',
        categoria: 'Pagamento Fornecedor',
        subcategoria: conta.categoria,
        descricao: `Pagamento: ${conta.descricao}`,
        valor: valorTotal,
        forma_pagamento: dados.forma_pagamento,
        data_movimento: dados.data_pagamento,
        conta_pagar_id: id,
        favorecido: conta.fornecedor,
        documento_numero: conta.numero_documento,
        centro_custo_id: conta.centro_custo_id,
        observacoes: dados.observacoes,
        usuario_responsavel: authUser?.full_name || authUser?.email,
        usuario_responsavel_id: authUser?.id
      });

      return await updateRLS('ContaPagar', id, {
        status: "Pago",
        data_pagamento: dados.data_pagamento,
        valor_pago: valorTotal,
        forma_pagamento: dados.forma_pagamento,
        juros: dados.juros,
        multa: dados.multa,
        desconto: dados.desconto,
        observacoes: dados.observacoes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ContaPagar'] });
      queryClient.invalidateQueries({ queryKey: ['caixa-movimentos'] });
      setDialogBaixaOpen(false);
      setContaAtual(null);
      toast({ title: "✅ Título pago!" });
    }
  });

  const baixarMultiplaMutation = useMutation({
    mutationFn: async (dados) => {
      await Promise.all(contasSelecionadas.map(async (contaId) => {
       const conta = contasList.find(c => c.id === contaId);
        if (conta) {
          await baixarTituloMutation.mutateAsync({ id: contaId, dados });
        }
      }));
    },
    onSuccess: () => {
      setContasSelecionadas([]);
      setDialogBaixaOpen(false);
      toast({ title: `✅ ${contasSelecionadas.length} título(s) pago(s)!` });
    }
  });

  const aprovarPagamentoMutation = useMutation({
    mutationFn: async (contaId) => {
      return await updateRLS('ContaPagar', contaId, {
        status_pagamento: "Aprovado",
        aprovado_por: authUser?.full_name || authUser?.email,
        aprovado_por_id: authUser?.id,
        data_aprovacao: new Date().toISOString()
      });
    },
    onSuccess: async (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['ContaPagar'] });
      toast({ title: "✅ Pagamento aprovado!" });
      try { await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Financeiro', entidade: 'ContaPagar', registro_id: id, descricao: 'Aprovação de pagamento', data_hora: new Date().toISOString() }); } catch(_) {}
    }
  });

  const contasFiltradas = contasList
    .filter(c => statusFilter === "todos" || c.status === statusFilter)
    .filter(c => {
      const searchLower = searchTerm.toLowerCase();
      return c.fornecedor?.toLowerCase().includes(searchLower) ||
        c.descricao?.toLowerCase().includes(searchLower) ||
        c.numero_documento?.toLowerCase().includes(searchLower) ||
        c.favorecido_cpf_cnpj?.includes(searchLower) ||
        c.categoria?.toLowerCase().includes(searchLower) ||
        c.status?.toLowerCase().includes(searchLower) ||
        c.origem_tipo?.toLowerCase().includes(searchLower) ||
        c.canal_origem?.toLowerCase().includes(searchLower) ||
        c.centro_custo?.toLowerCase().includes(searchLower) ||
        c.projeto_obra?.toLowerCase().includes(searchLower) ||
        c.observacoes?.toLowerCase().includes(searchLower);
    });

  const totalSelecionado = contasList
    .filter(c => contasSelecionadas.includes(c.id))
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const totais = {
    total: contasFiltradas.reduce((sum, c) => sum + (c.valor || 0), 0),
    pendente: contasFiltradas.filter(c => c.status === 'Pendente').reduce((sum, c) => sum + (c.valor || 0), 0),
    pago: contasFiltradas.filter(c => c.status === 'Pago').reduce((sum, c) => sum + (c.valor || 0), 0),
    vencido: contasFiltradas.filter(c => c.status === 'Atrasado').reduce((sum, c) => sum + (c.valor || 0), 0)
  };

  const toggleSelecao = (contaId) => {
    setContasSelecionadas(prev =>
      prev.includes(contaId) ? prev.filter(id => id !== contaId) : [...prev, contaId]
    );
  };

  const handleBaixar = (conta) => {
    if (!hasPermission('Financeiro','ContaPagar','baixar') && !hasPermission('Financeiro','ContaPagar','liquidar')) {
      toast({ title: '⛔ Sem permissão para baixar', variant: 'destructive' });
      return;
    }
    setContaAtual(conta);
    setDadosBaixa({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: conta.valor,
      forma_pagamento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaOpen(true);
  };

  const handleBaixarMultipla = () => {
    if (!hasPermission('Financeiro','ContaPagar','baixar') && !hasPermission('Financeiro','ContaPagar','liquidar')) {
      toast({ title: '⛔ Sem permissão para baixa múltipla', variant: 'destructive' });
      return;
    }
    if (contasSelecionadas.length === 0) {
      toast({ title: "⚠️ Selecione pelo menos um título", variant: "destructive" });
      return;
    }
    setContaAtual(null);
    setDadosBaixa({
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: 0,
      forma_pagamento: "PIX",
      juros: 0,
      multa: 0,
      desconto: 0,
      observacoes: ""
    });
    setDialogBaixaOpen(true);
  };

  const handleSubmitBaixa = (e) => {
    e.preventDefault();
    if (contaAtual) {
      baixarTituloMutation.mutate({ id: contaAtual.id, dados: dadosBaixa });
    } else {
      baixarMultiplaMutation.mutate(dadosBaixa);
    }
  };

  const content = (
    <div className="space-y-1.5">
      <HeaderPagarCompacto />
      <KPIsPagar totais={totais} />
      <FiltrosPagar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        contasSelecionadas={contasSelecionadas}
        totalSelecionado={totalSelecionado}
        onExportar={() => {
          if (!hasPermission('Financeiro','ContaPagar','exportar')) { toast({ title: '⛔ Sem permissão para exportar', variant: 'destructive' }); return; }
          const itens = contasSelecionadas.length > 0
            ? contasList.filter(c => contasSelecionadas.includes(c.id))
            : contasFiltradas;
          const headers = ['fornecedor','descricao','empresa_id','data_vencimento','valor','status'];
          const csv = [headers.join(','), ...itens.map(c => headers.map(h => JSON.stringify(c[h] ?? '')).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `contas_pagar_${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
          try { base44.entities.AuditLog.create({ acao: 'Exportação', modulo: 'Financeiro', entidade: 'ContaPagar', descricao: `Exportados ${itens.length} títulos`, data_hora: new Date().toISOString() }); } catch(_) {}
        }}
        onBaixarMultipla={handleBaixarMultipla}
        onNovaConta={() => { if (!hasPermission('Financeiro','ContaPagar','criar')) { toast({ title: '⛔ Sem permissão para criar', variant: 'destructive' }); return; } openWindow(ContaPagarForm, {
          windowMode: true,
          onSubmit: async (data) => {
            await createRLS('ContaPagar', {
              ...data,
              criado_por: authUser?.full_name || authUser?.email,
              criado_por_id: authUser?.id
            });
            queryClient.invalidateQueries({ queryKey: ['ContaPagar'] });
            toast({ title: "✅ Conta criada!" });
          }
        }, { title: '💸 Nova Conta a Pagar', width: 900, height: 600 }) }}
        onEnviarCaixa={() => {
          const titulos = contasList.filter(c => contasSelecionadas.includes(c.id));
          if (!hasPermission('Financeiro','ContaPagar','enviar_caixa') && !hasPermission('Financeiro','ContaPagar','editar')) { toast({ title: '⛔ Sem permissão para enviar ao Caixa', variant: 'destructive' }); return; }
          enviarParaCaixaMutation.mutate(titulos);
        }}
        empresaId={empresas[0]?.id}
        baixarPending={baixarMultiplaMutation.isPending}
        enviarPending={enviarParaCaixaMutation.isPending}
      />
      
      <TabelaPagar
        contas={contasFiltradas}
        empresas={empresas}
        contasSelecionadas={contasSelecionadas}
        toggleSelecao={toggleSelecao}
        onPrint={(conta, empresa) => ImprimirBoleto({ conta, empresa, tipo: 'pagar' })}
        onEdit={(conta) => { if (!hasPermission('Financeiro','ContaPagar','editar')) { toast({ title: '⛔ Sem permissão para editar', variant: 'destructive' }); return; } openWindow(ContaPagarForm, {
          conta,
          windowMode: true,
          onSubmit: async (data) => {
            await updateRLS('ContaPagar', conta.id, data);
            queryClient.invalidateQueries({ queryKey: ['ContaPagar'] });
            toast({ title: "✅ Conta atualizada!" });
          }
        }, { title: `✏️ Editar: ${conta.fornecedor}`, width: 900, height: 600 })}}
        onAprovar={(contaId) => {
          if (!hasPermission('Financeiro','ContaPagar','aprovar')) { toast({ title: '⛔ Sem permissão para aprovar', variant: 'destructive' }); return; }
          aprovarPagamentoMutation.mutate(contaId);
        }}
        onBaixar={handleBaixar}
        aprovarPending={aprovarPagamentoMutation.isPending}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={(sf, sd) => { setSortField(sf); setSortDirection(sd); }}
      />

      {/* Paginação backend padronizada */}
      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
        <div className="text-slate-600">Página {page}</div>
        <div className="flex items-center gap-2">
          <select className="h-8 border rounded px-2" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
            {[10,20,50,100].map(n => (<option key={n} value={n}>{n}/página</option>))}
          </select>
          <Button variant="outline" size="sm" onClick={()=>setPage(p => Math.max(1, p-1))} disabled={page<=1}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={()=>setPage(p => p+1)} disabled={contasBackend.length < pageSize}>Próxima</Button>
        </div>
      </div>

      <BaixaContaPagarDialog
        open={dialogBaixaOpen}
        onOpenChange={setDialogBaixaOpen}
        contaAtual={contaAtual}
        contasSelecionadas={contasSelecionadas}
        dadosBaixa={dadosBaixa}
        setDadosBaixa={setDadosBaixa}
        formasPagamento={formasPagamento}
        onSubmit={handleSubmitBaixa}
        isPending={baixarTituloMutation.isPending || baixarMultiplaMutation.isPending}
      />
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-red-50 overflow-auto p-1.5">{content}</div>;
  }

  return content;
}