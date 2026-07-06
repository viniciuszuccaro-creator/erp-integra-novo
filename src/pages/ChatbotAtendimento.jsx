import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, Send, Loader2, User } from "lucide-react";
import useChatbotAtendimento from "@/components/chatbot/atendimento/useChatbotAtendimento";
import usePermissions from "@/components/lib/usePermissions";
import { ChatMessages, ChatTransbordoAlert, ChatIntentsConfig } from "@/components/chatbot/atendimento/ChatbotComponents";

/**
 * V21.6 - Chatbot ERP-Cêntrico
 * Refatorado: lógica em useChatbotAtendimento, UI em ChatbotComponents
 * P2: Multi-tenant via empresaAtual
 * P3: RBAC via hasPermission('CRM')
 * P4: Layout w-full h-full
 */
export default function ChatbotAtendimento() {
  const h = useChatbotAtendimento();
  const { hasPermission } = usePermissions();

  if (!hasPermission('CRM', null, 'ver')) {
    return (
      <div className="p-6 w-full h-full">
        <div className="max-w-2xl mx-auto w-full">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Acesso restrito</h2>
            <p className="text-slate-600 mt-1">Você não possui permissão para acessar este módulo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">🤖 Chatbot ERP-Cêntrico</h1>
            <p className="text-slate-600">Intent Engine + IA + Transbordo com Verificação de Permissão</p>
          </div>
          <Badge className="bg-indigo-600 text-white px-4 py-2">
            <Bot className="w-4 h-4 mr-2" />
            V21.6
          </Badge>
        </div>

        <ChatTransbordoAlert vendedorAtendendo={h.vendedorAtendendo} />

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-900">
            🧠 <strong>IA de Sentimento:</strong> Detecta frustração/urgência e escala automaticamente para vendedor responsável (com verificação de permissão)
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Teste o Chatbot</CardTitle>
              {h.clienteAutenticado && (
                <Badge className="bg-green-600">
                  <User className="w-3 h-3 mr-1" />
                  {h.clienteAutenticado.nome}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ChatMessages interacoes={h.interacoes} clienteAutenticado={h.clienteAutenticado} />

            <div className="flex gap-2">
              <Input
                value={h.mensagem}
                onChange={(e) => h.setMensagem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && h.handleEnviar()}
                placeholder="Digite sua mensagem..."
                disabled={h.enviarMensagemMutation.isPending}
              />
              <Button data-permission="Sistema.ChatbotAtendimento.enviar"
                onClick={h.handleEnviar}
                disabled={!h.mensagem.trim() || h.enviarMensagemMutation.isPending}
              >
                {h.enviarMensagemMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => h.setMensagem('Preciso da 2ª via do boleto')}>💳 2ª via boleto</Button>
              <Button size="sm" variant="outline" onClick={() => h.setMensagem('Onde está minha entrega?')}>📦 Rastrear</Button>
              <Button size="sm" variant="outline" onClick={() => h.setMensagem('Quero fazer um orçamento')}>📋 Orçamento</Button>
              <Button size="sm" variant="outline" onClick={() => h.setMensagem('Preciso falar com um vendedor URGENTE')}>🚨 Urgente</Button>
            </div>
          </CardContent>
        </Card>

        <ChatIntentsConfig intentsConfig={h.intentsConfig} />
      </div>
    </div>
  );
}