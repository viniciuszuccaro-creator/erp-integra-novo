/**
 * HubAtendimentoPainelLateral — painel contextual com info, respostas rápidas, ações e IA.
 */
import React, { Suspense } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RespostasRapidas = React.lazy(() => import("@/components/chatbot/RespostasRapidas"));
const TagsCategorizacao = React.lazy(() => import("@/components/chatbot/TagsCategorizacao"));
const SugestoesIA = React.lazy(() => import("@/components/chatbot/SugestoesIA"));
const HistoricoClienteChat = React.lazy(() => import("@/components/chatbot/HistoricoClienteChat"));
const CriarPedidoChat = React.lazy(() => import("@/components/chatbot/CriarPedidoChat"));
const GerarBoletoChat = React.lazy(() => import("@/components/chatbot/GerarBoletoChat"));
const ConsultarEntregaChat = React.lazy(() => import("@/components/chatbot/ConsultarEntregaChat"));
const IAConversacional = React.lazy(() => import("@/components/chatbot/IAConversacional"));
const TransferirConversa = React.lazy(() => import("@/components/chatbot/TransferirConversa"));

const TABS = [
  { id: "info", label: "Info" },
  { id: "respostas", label: "Rápidas" },
  { id: "acoes", label: "Ações" },
  { id: "ia", label: "IA" },
];

export default function HubAtendimentoPainelLateral({
  conversaSelecionada, mensagens, painelLateralConteudo, setPainelLateralConteudo,
  setMensagemAtendente, setConversaSelecionada,
}) {
  const c = conversaSelecionada;

  return (
    <Card className="lg:col-span-1 flex flex-col">
      <CardHeader className="border-b p-2 lg:p-3">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <Button key={tab.id} size="sm" variant={painelLateralConteudo === tab.id ? "default" : "outline"} onClick={() => setPainelLateralConteudo(tab.id)}>
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-3 lg:p-4 h-[400px] lg:h-[600px] overflow-y-auto flex-1">
        {painelLateralConteudo === "info" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-900 mb-2">Dados do Cliente</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-600">Email:</span><p className="font-medium">{c.cliente_email || "-"}</p></div>
                <div><span className="text-slate-600">Telefone:</span><p className="font-medium">{c.cliente_telefone || "-"}</p></div>
                <div><span className="text-slate-600">Canal Origem:</span><p className="font-medium">{c.canal_id_externo || "-"}</p></div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm text-slate-900 mb-2">Métricas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Total Mensagens:</span><span className="font-bold">{c.total_mensagens || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Bot:</span><span className="font-bold text-purple-600">{c.mensagens_bot || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Cliente:</span><span className="font-bold text-blue-600">{c.mensagens_cliente || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Sentimento:</span>
                  <Badge className={c.sentimento_geral === "Positivo" ? "bg-green-600" : c.sentimento_geral === "Negativo" ? "bg-red-600" : "bg-slate-600"}>
                    {c.sentimento_geral || "Neutro"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="border-t pt-4"><Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><TagsCategorizacao conversa={c} /></Suspense></div>
            <div className="border-t pt-4"><Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><SugestoesIA conversa={c} mensagens={mensagens} /></Suspense></div>
            {c.cliente_id && (
              <div className="border-t pt-4"><Suspense fallback={<div className="h-32 rounded-md bg-slate-100 animate-pulse" />}><HistoricoClienteChat clienteId={c.cliente_id} /></Suspense></div>
            )}
          </div>
        )}

        {painelLateralConteudo === "respostas" && (
          <Suspense fallback={<div className="h-32 rounded-md bg-slate-100 animate-pulse" />}>
            <RespostasRapidas
              onSelecionarResposta={(texto) => { setMensagemAtendente(texto); setPainelLateralConteudo("info"); }}
              contextoConversa={{ pedido: c.pedido_gerado_id || "PED-XXX", status: "Em Processamento", data_entrega: "DD/MM/AAAA", endereco: "Endereço do cliente", link: "#", linha_digitavel: "XXXXX.XXXXX", vencimento: "DD/MM/AAAA", quantidade: "3", valor_total: "R$ 5.000,00", valor: "R$ 5.000,00", prazo: "5", forma_pagamento: "Boleto" }}
            />
          </Suspense>
        )}

        {painelLateralConteudo === "acoes" && (
          <div className="space-y-4">
            <Suspense fallback={<div className="h-32 rounded-md bg-slate-100 animate-pulse" />}>
              <CriarPedidoChat conversa={c} clienteId={c.cliente_id}
                onPedidoCriado={(pedido) => { setMensagemAtendente(`✅ Pedido ${pedido.numero_pedido} criado com sucesso! Valor: R$ ${pedido.valor_total?.toLocaleString("pt-BR")}`); setPainelLateralConteudo("info"); }}
              />
            </Suspense>
            <Suspense fallback={<div className="h-32 rounded-md bg-slate-100 animate-pulse" />}>
              <GerarBoletoChat conversa={c} clienteId={c.cliente_id}
                onBoletoEnviado={(boleto) => { setMensagemAtendente(`📄 Boleto gerado!\n\nValor: R$ ${boleto.valor?.toLocaleString("pt-BR")}\nVencimento: ${new Date(boleto.data_vencimento).toLocaleDateString("pt-BR")}\n\nLinha digitável:\n${boleto.linha_digitavel || "Disponível no link"}`); setPainelLateralConteudo("info"); }}
              />
            </Suspense>
            <Suspense fallback={<div className="h-32 rounded-md bg-slate-100 animate-pulse" />}>
              <ConsultarEntregaChat clienteId={c.cliente_id} conversa={c} />
            </Suspense>
          </div>
        )}

        {painelLateralConteudo === "ia" && (
          <div className="space-y-4">
            <Suspense fallback={<div className="h-32 rounded-md bg-slate-100 animate-pulse" />}><IAConversacional conversa={c} mensagens={mensagens} clienteId={c.cliente_id} /></Suspense>
            <Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><SugestoesIA conversa={c} mensagens={mensagens} /></Suspense>
          </div>
        )}

        {painelLateralConteudo === "transferir" && (
          <TransferirConversa conversa={c} onTransferido={() => { setPainelLateralConteudo("info"); setConversaSelecionada(null); }} />
        )}
      </CardContent>
    </Card>
  );
}