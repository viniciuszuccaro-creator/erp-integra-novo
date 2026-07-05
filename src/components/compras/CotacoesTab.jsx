import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, CheckCircle2, FileText, Package, TrendingUp } from "lucide-react";
import CotacaoForm from "./CotacaoForm";
import { useWindow } from "@/components/lib/useWindow";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast as sonnerToast } from "sonner";
import useCotacoesTab from "./cotacoes/useCotacoesTab";
import CotacaoFormDialog from "./cotacoes/CotacaoFormDialog";
import CotacaoComparativoDialog from "./cotacoes/CotacaoComparativoDialog";

export default function CotacoesTab({ windowMode = false }) {
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || "sem-grupo"}-${empresaAtual?.id || "sem-empresa"}`;
  const { toast } = useToastSafe();

  const [cotacoes, setCotacoes] = useState([{
    id: "1", numero_cotacao: "COT-001", descricao: "Cotação de Bitolas - Lote Janeiro",
    data_criacao: "2025-01-15", data_limite: "2025-01-20", status: "Aguardando Propostas",
    fornecedores_convidados: 3, propostas_recebidas: 2,
    itens: [{ produto_descricao: "Barra 12.5mm CA-50", quantidade: 500, unidade: "KG" }, { produto_descricao: "Barra 10.0mm CA-50", quantidade: 300, unidade: "KG" }],
    propostas: [
      { fornecedor_id: "f1", fornecedor_nome: "Aços Fortes Ltda", data_proposta: "2025-01-16", valor_total: 15500.00, prazo_entrega: 7, forma_pagamento: "30 dias", itens: [{ produto_descricao: "Barra 12.5mm CA-50", preco_unitario: 25.00, valor_total: 12500.00 }, { produto_descricao: "Barra 10.0mm CA-50", preco_unitario: 10.00, valor_total: 3000.00 }], observacoes: "Entrega em 3 lotes" },
      { fornecedor_id: "f2", fornecedor_nome: "Metalúrgica São Paulo", data_proposta: "2025-01-17", valor_total: 14800.00, prazo_entrega: 10, forma_pagamento: "À Vista", itens: [{ produto_descricao: "Barra 12.5mm CA-50", preco_unitario: 24.00, valor_total: 12000.00 }, { produto_descricao: "Barra 10.0mm CA-50", preco_unitario: 9.33, valor_total: 2800.00 }], observacoes: "Entrega única, frete incluso" },
    ],
  }]);

  const { data: fornecedores = [] } = useQuery({ queryKey: ["fornecedores", contextoKey], queryFn: () => filterInContext("Fornecedor", {}, "nome_fantasia", 999), enabled: !!contexto });
  const { data: produtos = [] } = useQuery({ queryKey: ["produtos", contextoKey], queryFn: () => filterInContext("Produto", {}, "descricao", 999), enabled: !!contexto });

  const {
    dialogOpen, setDialogOpen, comparativoModal, setComparativoModal,
    formCotacao, setFormCotacao, criarCotacaoMutation, gerarOrdemCompraMutation,
    adicionarItem, removerItem, toggleFornecedor, handleSubmit, getStatusColor,
  } = useCotacoesTab({ cotacoes, setCotacoes });

  const content = (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Cotações</h2>
          <p className="text-sm text-slate-600">Cote com múltiplos fornecedores e escolha a melhor proposta</p>
        </div>
        {hasPermission("Compras", "Cotacao", "criar") && (
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={() => openWindow(CotacaoForm, {
            windowMode: true,
            onSubmit: async (data) => {
              try { await criarCotacaoMutation.mutateAsync(data); sonnerToast.success("✅ Cotação criada e enviada!"); }
              catch (error) { sonnerToast.error("Erro ao criar cotação"); }
            },
          }, { title: "📊 Nova Cotação de Compras", width: 1100, height: 700 })}>
            <Plus className="w-4 h-4 mr-2" />Nova Cotação
          </Button>
        )}
      </div>

      <div className="grid gap-2">
        {cotacoes.map((cotacao) => (
          <Card key={cotacao.id} className="border-0 shadow-sm">
            <CardHeader className="bg-slate-50 border-b py-2 px-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-cyan-600" />{cotacao.numero_cotacao} - {cotacao.descricao}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(cotacao.status)}>{cotacao.status}</Badge>
                    <span className="text-xs text-slate-600">Criada: {new Date(cotacao.data_criacao).toLocaleDateString("pt-BR")}</span>
                    <span className="text-xs text-slate-600">Limite: {new Date(cotacao.data_limite).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" data-permission="Compras.Cotacao.visualizar" onClick={() => setComparativoModal(cotacao)}>
                  <Eye className="w-4 h-4 mr-2" />Ver Propostas ({cotacao.propostas_recebidas}/{cotacao.fornecedores_convidados})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">Itens Cotados:</p>
                  <ul className="space-y-1">
                    {cotacao.itens.slice(0, 3).map((item, idx) => (<li key={idx} className="text-sm flex items-center gap-2"><Package className="w-3 h-3 text-slate-400" />{item.quantidade} {item.unidade} - {item.produto_descricao}</li>))}
                    {cotacao.itens.length > 3 && <li className="text-xs text-slate-500">+ {cotacao.itens.length - 3} itens...</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-2">Status das Propostas:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div className="bg-cyan-600 h-2 rounded-full transition-all" style={{ width: `${(cotacao.propostas_recebidas / cotacao.fornecedores_convidados) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold">{cotacao.propostas_recebidas}/{cotacao.fornecedores_convidados}</span>
                  </div>
                  {cotacao.propostas_recebidas === cotacao.fornecedores_convidados && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Todas as propostas recebidas</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {cotacoes.length === 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700 mb-2">Nenhuma Cotação</h3>
              <p className="text-xs text-slate-500 mb-3">Compare propostas de fornecedores</p>
              <Button size="sm" data-permission="Compras.Cotacao.criar" onClick={() => setDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="w-3 h-3 mr-1" />Criar Cotação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CotacaoFormDialog
        dialogOpen={dialogOpen} setDialogOpen={setDialogOpen}
        formCotacao={formCotacao} setFormCotacao={setFormCotacao}
        handleSubmit={handleSubmit} adicionarItem={adicionarItem} removerItem={removerItem}
        toggleFornecedor={toggleFornecedor} produtos={produtos} fornecedores={fornecedores}
        criarCotacaoMutation={criarCotacaoMutation}
      />
      <CotacaoComparativoDialog
        comparativoModal={comparativoModal} setComparativoModal={setComparativoModal}
        gerarOrdemCompraMutation={gerarOrdemCompraMutation} hasPermission={hasPermission} toast={toast}
      />
    </div>
  );

  if (windowMode) return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50 overflow-auto p-1.5">{content}</div>;
  return content;
}

// Helper local para evitar import circular
import { useToast } from "@/components/ui/use-toast";
function useToastSafe() { return useToast(); }