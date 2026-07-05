import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bot, AlertTriangle, User, Timer, Phone, Shield } from "lucide-react";

export default function ChatMessages({ interacoes, clienteAutenticado }) {
  return (
    <div className="space-y-4 mb-4 h-96 overflow-y-auto border rounded-lg p-4 bg-slate-50">
      {interacoes.map((inter) => (
        <div key={inter.id} className="space-y-2">
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white p-3 rounded-lg max-w-md">
              <p className="text-sm">{inter.mensagem_usuario}</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-lg max-w-md">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Bot className="w-4 h-4 text-indigo-600" />
                <Badge variant="outline" className="text-xs">{inter.intent_detectado}</Badge>
                {inter.sentimento_detectado === 'Frustrado' && (
                  <Badge className="bg-red-100 text-red-700 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Frustrado</Badge>
                )}
                {inter.sentimento_detectado === 'Urgente' && (
                  <Badge className="bg-orange-100 text-orange-700 text-xs"><Timer className="w-3 h-3 mr-1" />Urgente</Badge>
                )}
                {inter.transferido_atendente && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs"><Phone className="w-3 h-3 mr-1" />Transferido</Badge>
                )}
              </div>
              <p className="text-sm whitespace-pre-line">{inter.resposta_bot}</p>
            </div>
          </div>
        </div>
      ))}
      {interacoes.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Bot className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p>Inicie a conversa enviando uma mensagem</p>
        </div>
      )}
    </div>
  );
}

export function ChatTransbordoAlert({ vendedorAtendendo }) {
  if (!vendedorAtendendo) return null;
  return (
    <Alert className="border-red-300 bg-red-50">
      <AlertTriangle className="w-5 h-5 text-red-600" />
      <AlertDescription>
        <p className="font-semibold text-red-900 flex items-center gap-2">
          🚨 Conversação Transferida
          <Badge className="bg-purple-600 text-xs"><Shield className="w-3 h-3 mr-1" />Permissão Verificada</Badge>
        </p>
        <p className="text-sm text-red-700 mt-1">
          Vendedor <strong>{vendedorAtendendo}</strong> foi notificado e assumirá o atendimento
        </p>
        <p className="text-xs text-red-600 mt-2">
          ✅ Sistema validou permissão <code>pode_atender_transbordo</code> no PerfilAcesso
        </p>
      </AlertDescription>
    </Alert>
  );
}

export function ChatIntentsConfig({ intentsConfig }) {
  const autenticadas = intentsConfig.filter(i => i.requer_autenticacao);
  const publicas = intentsConfig.filter(i => !i.requer_autenticacao);
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl border bg-green-50 p-4">
        <p className="text-sm font-semibold flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-green-600" />
          Intents Autenticadas
        </p>
        <div className="space-y-2">
          {autenticadas.map(intent => (
            <div key={intent.id} className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs">{intent.nome_intent}</span>
              <Badge variant="outline" className="text-xs">{intent.tipo_intent}</Badge>
            </div>
          ))}
          {autenticadas.length === 0 && <p className="text-xs text-slate-500">Nenhum intent configurado</p>}
        </div>
      </div>
      <div className="rounded-xl border bg-blue-50 p-4">
        <p className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-blue-600" />
          Intents Públicas
        </p>
        <div className="space-y-2">
          {publicas.map(intent => (
            <div key={intent.id} className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs">{intent.nome_intent}</span>
              {intent.escalar_vendedor && (
                <Badge className="bg-orange-100 text-orange-700 text-xs"><Phone className="w-3 h-3 mr-1" />Escala</Badge>
              )}
            </div>
          ))}
          {publicas.length === 0 && <p className="text-xs text-slate-500">Nenhum intent configurado</p>}
        </div>
      </div>
    </div>
  );
}