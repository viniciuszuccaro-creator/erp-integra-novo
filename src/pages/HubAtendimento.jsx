import React, { useState, useEffect, useRef, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import SemEmpresaBanner from "@/components/common/SemEmpresaBanner";
import IAContextualModulo from "@/components/ia/IAContextualModulo";

import { useHubAtendimentoData } from "@/components/hub-atendimento/useHubAtendimentoData";
import HubAtendimentoTabs from "@/components/hub-atendimento/HubAtendimentoTabs";
import HubAtendimentoKPIs from "@/components/hub-atendimento/HubAtendimentoKPIs";
import HubAtendimentoFiltros from "@/components/hub-atendimento/HubAtendimentoFiltros";
import HubAtendimentoListaConversas from "@/components/hub-atendimento/HubAtendimentoListaConversas";
import HubAtendimentoChatPanel from "@/components/hub-atendimento/HubAtendimentoChatPanel";
import HubAtendimentoPainelLateral from "@/components/hub-atendimento/HubAtendimentoPainelLateral";

const ChatbotDashboard = React.lazy(() => import("@/components/chatbot/ChatbotDashboard"));
const ConfiguracaoCanais = React.lazy(() => import("@/components/chatbot/ConfiguracaoCanais"));
const GerenciadorTemplates = React.lazy(() => import("@/components/chatbot/GerenciadorTemplates"));
const AnalyticsAtendimento = React.lazy(() => import("@/components/chatbot/AnalyticsAtendimento"));
const MonitorSLA = React.lazy(() => import("@/components/chatbot/MonitorSLA"));
const ChatbotFilaEspera = React.lazy(() => import("@/components/chatbot/ChatbotFilaEspera"));
const RelatoriosAtendimento = React.lazy(() => import("@/components/chatbot/RelatoriosAtendimento"));
const ChatbotMulticanal = React.lazy(() => import("@/components/chatbot/ChatbotMulticanal"));
const BaseConhecimento = React.lazy(() => import("@/components/chatbot/BaseConhecimento"));
const ExportarConversas = React.lazy(() => import("@/components/chatbot/ExportarConversas"));
const DashboardAtendente = React.lazy(() => import("@/components/chatbot/DashboardAtendente"));
const TransferirConversa = React.lazy(() => import("@/components/chatbot/TransferirConversa"));

const SuspenseFallback = () => <div className="h-40 rounded-md bg-slate-100 animate-pulse" />;

/**
 * V21.5 - HUB DE ATENDIMENTO OMNICANAL
 * Central unificada de atendimento para todos os canais.
 * V22.1: Refatorado — queries, tabs, KPIs, filtros, lista, chat e painel extraídos.
 */
export default function HubAtendimento() {
  const [abaAtiva, setAbaAtiva] = useState("atendimento");
  const [filtroStatus, setFiltroStatus] = useState("Em Progresso");
  const [filtroCanal, setFiltroCanal] = useState("Todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("Todas");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagemAtendente, setMensagemAtendente] = useState("");
  const [exibirPainelLateral, setExibirPainelLateral] = useState(true);
  const [painelLateralConteudo, setPainelLateralConteudo] = useState("info");
  const [layoutExpandido, setLayoutExpandido] = useState(false);
  const [exibirTransferir, setExibirTransferir] = useState(false);
  const [arquivoAnexo, setArquivoAnexo] = useState(null);
  const messagesEndRef = useRef(null);

  const {
    user, podeAtenderTransbordo, conversasFiltradas, isLoading, mensagens,
    metricas, botSla, enviarMensagemMutation, assumirConversaMutation,
    resolverConversaMutation, queryClient,
  } = useHubAtendimentoData({
    filtroStatus, filtroCanal, filtroPrioridade, buscaTexto,
    conversaSelecionada, setConversaSelecionada, setMensagemAtendente,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversaSelecionada]);

  if (!podeAtenderTransbordo) {
    return (
      <div className="p-6">
        <Alert className="border-red-300 bg-red-50">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <AlertDescription className="text-red-900">
            Você não tem permissão para acessar o Hub de Atendimento. Entre em contato com o administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-6 overflow-auto">
      <SemEmpresaBanner modulo="Hub de Atendimento" />
      <div className={`${layoutExpandido ? "max-w-full" : "max-w-7xl"} mx-auto space-y-4`}>
        <ErrorBoundary>
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <MessageCircle className="w-7 h-7 lg:w-8 lg:h-8 text-blue-600" />
                  Hub de Atendimento Omnicanal
                </h1>
                <p className="text-slate-600 text-sm lg:text-base mt-1">
                  Central unificada • Multi-empresa • IA Avançada • V22.1
                </p>
              </div>
              <div className="mt-1"><IAContextualModulo modulo="Hub Atendimento" compact /></div>
            </div>
            <HubAtendimentoTabs abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} layoutExpandido={layoutExpandido} setLayoutExpandido={setLayoutExpandido} />
          </div>

          {/* Abas não-atendimento */}
          {abaAtiva === "meupainel" && (
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1"><Suspense fallback={<SuspenseFallback />}><DashboardAtendente /></Suspense></div>
              <div className="lg:col-span-3"><Suspense fallback={<SuspenseFallback />}><ChatbotDashboard /></Suspense></div>
            </div>
          )}
          {abaAtiva === "analytics" && (
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3"><Suspense fallback={<SuspenseFallback />}><ChatbotDashboard /></Suspense></div>
              <div className="lg:col-span-1 space-y-4">
                <Suspense fallback={<SuspenseFallback />}><ExportarConversas /></Suspense>
                <Suspense fallback={<SuspenseFallback />}><AnalyticsAtendimento /></Suspense>
              </div>
            </div>
          )}
          {abaAtiva === "templates" && <Suspense fallback={<SuspenseFallback />}><GerenciadorTemplates /></Suspense>}
          {abaAtiva === "config" && <Suspense fallback={<SuspenseFallback />}><ConfiguracaoCanais /></Suspense>}
          {abaAtiva === "sla" && <Suspense fallback={<SuspenseFallback />}><MonitorSLA /></Suspense>}
          {abaAtiva === "fila" && <Suspense fallback={<SuspenseFallback />}><ChatbotFilaEspera /></Suspense>}
          {abaAtiva === "relatorios" && <Suspense fallback={<SuspenseFallback />}><RelatoriosAtendimento /></Suspense>}
          {abaAtiva === "multicanal" && <Suspense fallback={<SuspenseFallback />}><ChatbotMulticanal /></Suspense>}
          {abaAtiva === "base" && <Suspense fallback={<SuspenseFallback />}><BaseConhecimento /></Suspense>}

          {/* Aba Atendimento */}
          {abaAtiva === "atendimento" && (
            <>
              <HubAtendimentoKPIs metricas={metricas} botSla={botSla} />
              <HubAtendimentoFiltros
                buscaTexto={buscaTexto} setBuscaTexto={setBuscaTexto}
                filtroStatus={filtroStatus} setFiltroStatus={setFiltroStatus}
                filtroCanal={filtroCanal} setFiltroCanal={setFiltroCanal}
                filtroPrioridade={filtroPrioridade} setFiltroPrioridade={setFiltroPrioridade}
                onRefresh={() => queryClient.invalidateQueries({ queryKey: ["conversas-omnicanal"] })}
              />

              <div className={`grid gap-4 lg:gap-6 ${exibirPainelLateral && conversaSelecionada ? "grid-cols-1 lg:grid-cols-4" : "grid-cols-1 lg:grid-cols-3"}`}>
                <HubAtendimentoListaConversas
                  conversasFiltradas={conversasFiltradas} isLoading={isLoading}
                  conversaSelecionada={conversaSelecionada} setConversaSelecionada={setConversaSelecionada}
                  metricas={metricas}
                />
                <HubAtendimentoChatPanel
                  conversaSelecionada={conversaSelecionada} mensagens={mensagens} user={user}
                  mensagemAtendente={mensagemAtendente} setMensagemAtendente={setMensagemAtendente}
                  arquivoAnexo={arquivoAnexo} setArquivoAnexo={setArquivoAnexo}
                  enviarMensagemMutation={enviarMensagemMutation}
                  assumirConversaMutation={assumirConversaMutation}
                  resolverConversaMutation={resolverConversaMutation}
                  exibirPainelLateral={exibirPainelLateral} setExibirPainelLateral={setExibirPainelLateral}
                  setPainelLateralConteudo={setPainelLateralConteudo}
                  setExibirTransferir={setExibirTransferir} messagesEndRef={messagesEndRef}
                />
                {exibirPainelLateral && conversaSelecionada && (
                  <HubAtendimentoPainelLateral
                    conversaSelecionada={conversaSelecionada} mensagens={mensagens}
                    painelLateralConteudo={painelLateralConteudo} setPainelLateralConteudo={setPainelLateralConteudo}
                    setMensagemAtendente={setMensagemAtendente} setConversaSelecionada={setConversaSelecionada}
                  />
                )}
              </div>

              {/* Modal de Transferência */}
              <AnimatePresence>
                {exibirTransferir && conversaSelecionada && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setExibirTransferir(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()} className="w-full max-w-md"
                    >
                      <TransferirConversa
                        conversa={conversaSelecionada}
                        onTransferido={() => { setExibirTransferir(false); setConversaSelecionada(null); queryClient.invalidateQueries({ queryKey: ["conversas-omnicanal"] }); }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}