import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Badge } from "@/components/ui/badge";
import BadgeOrigemPedido from "../BadgeOrigemPedido";
import {
  Edit2, FileText, Truck, Factory, Eye, Trash2, ShieldCheck,
  CheckCircle2, Clock, XCircle, Printer
} from "lucide-react";
import { ImprimirPedido } from "@/components/lib/impressao";
import AutomacaoFluxoPedido from "../AutomacaoFluxoPedido";
import CentralAprovacoesManager from "../CentralAprovacoesManager";

/**
 * Constrói as colunas do ERPDataTable de PedidosTab.
 * Extraído para reduzir PedidosTab.jsx (Regra-Mãe).
 */
export default function usePedidosColumns({
  empresas, canApprove, queryClient, toast, onEditPedido, openWindow, updatePedido, confirm, deleteMutation
}) {
  return useMemo(() => ([
    { key: 'numero_pedido', label: 'N° Pedido', render: (r) => <span className="font-semibold">{r.numero_pedido}</span> },
    { key: 'cliente_nome', label: 'Cliente' },
    { key: 'data_pedido', label: 'Data', render: (r) => new Date(r.data_pedido).toLocaleDateString('pt-BR') },
    { key: 'origem_pedido', label: 'Origem', render: (r) => <BadgeOrigemPedido origemPedido={r.origem_pedido} showLock={true} /> },
    {
      key: 'valor_total', label: 'Valor', isNumeric: true,
      render: (r) => <span className="font-bold text-green-600">R$ {(r.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    },
    {
      key: 'status', label: 'Status', render: (r) => (
        <Badge className={
          r.status === 'Entregue' ? 'bg-green-600 text-white' :
          r.status === 'Em Trânsito' ? 'bg-purple-600 text-white' :
          r.status === 'Em Expedição' ? 'bg-orange-600 text-white' :
          r.status === 'Faturado' ? 'bg-blue-600 text-white' :
          r.status === 'Pronto para Faturar' ? 'bg-indigo-600 text-white' :
          r.status === 'Aprovado' ? 'bg-green-500 text-white' :
          r.status === 'Aguardando Aprovação' ? 'bg-yellow-500 text-white' :
          r.status === 'Cancelado' ? 'bg-red-600 text-white' :
          'bg-slate-500 text-white'
        }>{r.status}</Badge>
      )
    },
    {
      key: 'aprovacao', label: 'Aprovação', render: (r) => (
        r.status_aprovacao === 'pendente' ? (
          <Badge className="bg-orange-100 text-orange-700"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
        ) : r.status_aprovacao === 'aprovado' ? (
          <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</Badge>
        ) : r.status_aprovacao === 'negado' ? (
          <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" />Negado</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">-</Badge>
        )
      )
    },
    {
      key: 'actions', label: 'Ações Rápidas', render: (pedido) => (
        <div className="flex items-center gap-1">
          {pedido.status === 'Rascunho' && (
            <RBACButton module="Comercial" action="fechar" variant="ghost" size="sm"
              onClick={() => {
                openWindow(AutomacaoFluxoPedido, {
                  pedido, empresaId: pedido.empresa_id, windowMode: true,
                  onComplete: () => {
                    queryClient.invalidateQueries({ queryKey: ['pedidos'] });
                    queryClient.invalidateQueries({ queryKey: ['produtos'] });
                    queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
                    queryClient.invalidateQueries({ queryKey: ['contas-receber'] });
                    queryClient.invalidateQueries({ queryKey: ['entregas'] });
                    toast({ title: '✅ Pedido fechado com sucesso!' });
                  }
                }, { title: `🚀 Automação - Pedido ${pedido.numero_pedido}`, width: 1200, height: 700 });
              }}
              className="h-8 px-2 bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 font-semibold shadow-lg">
              <CheckCircle2 className="w-3 h-3 mr-1" /><span className="text-xs">🚀 Fechar Pedido</span>
            </RBACButton>
          )}

          <RBACButton module="Comercial" action="editar" variant="ghost" size="sm"
            disabled={pedido.status_aprovacao === 'pendente' && !(canApprove && canApprove('Comercial', 'Pedido'))}
            onClick={async () => {
              try { await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Abrir editor de pedido', data_hora: new Date().toISOString() }); } catch { }
              onEditPedido(pedido);
            }}
            title={pedido.status_aprovacao === 'pendente' ? 'Edição bloqueada até aprovação' : 'Editar Pedido'} className="h-8 px-2">
            <Edit2 className="w-3 h-3 mr-1" /><span className="text-xs">Editar</span>
          </RBACButton>

          {pedido.status === 'Aprovado' && (
            <>
              <RBACButton module="Comercial" action="marcarProntoFaturar" variant="ghost" size="sm"
                onClick={async () => {
                  try {
                    await updatePedido('Pedido', pedido.id, { status: 'Pronto para Faturar' });
                    toast({ title: '✅ Pedido fechado para entrega!' });
                    queryClient.invalidateQueries({ queryKey: ['Pedido'] });
                  } catch { toast({ title: '❌ Erro ao fechar pedido', variant: 'destructive' }); }
                }}
                className="h-8 px-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200">
                <Truck className="w-4 h-4 mr-1" /><span className="text-xs">🚚 Fechar p/ Entrega</span>
              </RBACButton>
              <RBACButton module="Comercial" action="gerarNFe" variant="ghost" size="sm"
                onClick={async () => {
                  toast({ title: '🚀 Gerando NF-e...' });
                  try { await base44.entities.AuditLog.create({ acao: 'Emissão NF-e', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Acionada geração de NF-e', data_hora: new Date().toISOString() }); } catch { }
                }}
                title="Gerar NF-e" className="h-8 px-2 text-green-600">
                <FileText className="w-3 h-3 mr-1" /><span className="text-xs">NF-e</span>
              </RBACButton>
            </>
          )}

          {pedido.status === 'Pronto para Faturar' && (
            <RBACButton module="Comercial" action="gerarNFe" variant="ghost" size="sm"
              onClick={async () => {
                toast({ title: '🚀 Gerando NF-e...' });
                try { await base44.entities.AuditLog.create({ acao: 'Emissão NF-e', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Acionada geração de NF-e', data_hora: new Date().toISOString() }); } catch { }
              }}
              title="Gerar NF-e" className="h-8 px-2 text-green-600">
              <FileText className="w-3 h-3 mr-1" /><span className="text-xs">NF-e</span>
            </RBACButton>
          )}

          {pedido.status === 'Faturado' && (
            <RBACButton module="Comercial" action="criarEntrega" variant="ghost" size="sm"
              onClick={async () => {
                toast({ title: '📦 Criando entrega...' });
                try { await base44.entities.AuditLog.create({ acao: 'Criação Entrega', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Acionada criação de entrega', data_hora: new Date().toISOString() }); } catch { }
              }}
              title="Criar Entrega" className="h-8 px-2 text-blue-600">
              <Truck className="w-3 h-3 mr-1" /><span className="text-xs">Entrega</span>
            </RBACButton>
          )}

          {(pedido.tipo_pedido === 'Produção Sob Medida' || pedido.itens_corte_dobra?.length > 0 || pedido.itens_armado_padrao?.length > 0) && pedido.status !== 'Cancelado' && (
            <RBACButton module="Comercial" action="gerarOP" variant="ghost" size="sm"
              onClick={async () => {
                toast({ title: '🏭 Criando OP...' });
                try { await base44.entities.AuditLog.create({ acao: 'Gerar OP', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Acionada geração de OP', data_hora: new Date().toISOString() }); } catch { }
              }}
              title="Gerar Ordem de Produção" className="h-8 px-2 text-purple-600">
              <Factory className="w-3 h-3 mr-1" /><span className="text-xs">OP</span>
            </RBACButton>
          )}

          <RBACButton module="Comercial" action="imprimir" variant="ghost" size="sm"
            onClick={async () => {
              const empresa = empresas?.find(e => e.id === pedido.empresa_id);
              try { await base44.entities.AuditLog.create({ acao: 'Impressão', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Imprimir pedido', data_hora: new Date().toISOString() }); } catch { }
              ImprimirPedido({ pedido, empresa });
            }}
            title="Imprimir Pedido" className="h-8 px-2 text-slate-600">
            <Printer className="w-3 h-3 mr-1" /><span className="text-xs">Imprimir</span>
          </RBACButton>

          <RBACButton module="Comercial" action="visualizar" variant="ghost" size="sm"
            onClick={async () => {
              try { await base44.entities.AuditLog.create({ acao: 'Visualização', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Abrir visualização do pedido', data_hora: new Date().toISOString() }); } catch { }
              onEditPedido(pedido);
            }}
            title="Visualizar" className="h-8 px-2">
            <Eye className="w-3 h-3 mr-1" /><span className="text-xs">Ver</span>
          </RBACButton>

          {pedido.status_aprovacao === 'pendente' && (
            <RBACButton module="Comercial" action="aprovar" variant="ghost" size="sm"
              onClick={() => openWindow(CentralAprovacoesManager, { windowMode: true, initialTab: 'descontos' }, { title: '🔐 Central de Aprovações', width: 1200, height: 700 })}
              title="Analisar Aprovação" className="h-8 px-2 text-orange-600 animate-pulse">
              <ShieldCheck className="w-3 h-3 mr-1" /><span className="text-xs">Analisar</span>
            </RBACButton>
          )}

          <RBACButton module="Comercial" action="excluir" variant="ghost" size="sm"
            onClick={async () => {
              const ok = await confirm({ title: "Excluir Pedido", description: "Deseja realmente excluir este pedido?", variant: "danger", confirmText: "Excluir" });
              if (ok) {
                try { await base44.entities.AuditLog.create({ acao: 'Exclusão', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Exclusão solicitada via UI', data_hora: new Date().toISOString() }); } catch { }
                deleteMutation.mutate(pedido.id);
              }
            }}
            title="Excluir" className="h-8 px-2 text-red-600">
            <Trash2 className="w-3 h-3 mr-1" /><span className="text-xs">Excluir</span>
          </RBACButton>
        </div>
      )
    }
  ]), [queryClient, toast, onEditPedido]);
}

export function buildMenuItems({ pedido, empresas, toast, confirm, onEditPedido, openWindow, deleteMutation }) {
  const items = [];
  items.push({ key: 'ver', label: 'Visualizar', action: async () => { try { await base44.entities.AuditLog.create({ acao: 'Visualização', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Abrir visualização do pedido', data_hora: new Date().toISOString() }); } catch { } onEditPedido(pedido); } });
  items.push({ key: 'imprimir', label: 'Imprimir', action: async () => { const empresa = empresas?.find(e => e.id === pedido.empresa_id); try { await base44.entities.AuditLog.create({ acao: 'Impressão', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Imprimir pedido', data_hora: new Date().toISOString() }); } catch { } ImprimirPedido({ pedido, empresa }); } });
  if (pedido.status === 'Aprovado' || pedido.status === 'Pronto para Faturar') {
    items.push({ key: 'nfe', label: 'Gerar NF-e', action: async () => { toast({ title: '🚀 Gerando NF-e...' }); try { await base44.entities.AuditLog.create({ acao: 'Emissão NF-e', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Acionada geração de NF-e', data_hora: new Date().toISOString() }); } catch { } } });
  }
  if (pedido.status === 'Faturado') {
    items.push({ key: 'entrega', label: 'Criar Entrega', action: async () => { toast({ title: '📦 Criando entrega...' }); try { await base44.entities.AuditLog.create({ acao: 'Criação Entrega', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Acionada criação de entrega', data_hora: new Date().toISOString() }); } catch { } } });
  }
  if ((pedido.tipo_pedido === 'Produção Sob Medida' || pedido.itens_corte_dobra?.length > 0 || pedido.itens_armado_padrao?.length > 0) && pedido.status !== 'Cancelado') {
    items.push({ key: 'op', label: 'Gerar OP', action: async () => { toast({ title: '🏭 Criando OP...' }); try { await base44.entities.AuditLog.create({ acao: 'Gerar OP', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Acionada geração de OP', data_hora: new Date().toISOString() }); } catch { } } });
  }
  items.push({ key: 'excluir', label: 'Excluir', action: async () => { const ok = await confirm({ title: "Excluir Pedido", description: "Deseja realmente excluir este pedido?", variant: "danger", confirmText: "Excluir" }); if (ok) { try { await base44.entities.AuditLog.create({ acao: 'Exclusão', modulo: 'Comercial', entidade: 'Pedido', registro_id: pedido.id, descricao: 'Exclusão solicitada via UI', data_hora: new Date().toISOString() }); } catch { } deleteMutation.mutate(pedido.id); } } });
  if (pedido.status_aprovacao === 'pendente') {
    items.push({ key: 'aprovar', label: 'Analisar Aprovação', action: () => openWindow(CentralAprovacoesManager, { windowMode: true, initialTab: 'descontos' }, { title: '🔐 Central de Aprovações', width: 1200, height: 700 }) });
  }
  return items;
}