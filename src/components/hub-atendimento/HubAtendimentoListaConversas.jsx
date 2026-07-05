/**
 * HubAtendimentoListaConversas — lista de conversas filtradas.
 */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

export default function HubAtendimentoListaConversas({
  conversasFiltradas, isLoading, conversaSelecionada, setConversaSelecionada, metricas,
}) {
  return (
    <Card className="lg:col-span-1 flex flex-col">
      <CardHeader className="border-b p-3 lg:p-4">
        <CardTitle className="text-base lg:text-lg flex items-center justify-between">
          <span>Conversas ({conversasFiltradas.length})</span>
          <Badge variant="outline" className="text-xs">{metricas?.naoAtribuidas || 0} novas</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="h-[500px] lg:h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">Carregando...</div>
          ) : conversasFiltradas.length === 0 ? (
            <div className="p-4 text-center text-slate-500">Nenhuma conversa encontrada</div>
          ) : (
            conversasFiltradas.map((conversa) => (
              <motion.button
                key={conversa.id}
                onClick={() => setConversaSelecionada(conversa)}
                whileHover={{ scale: 1.02 }}
                className={`w-full text-left p-4 border-b hover:bg-slate-50 transition-colors ${
                  conversaSelecionada?.id === conversa.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{conversa.cliente_nome || "Cliente Anônimo"}</p>
                      <Badge className={`text-xs ${
                        conversa.canal === "WhatsApp" ? "bg-green-600" :
                        conversa.canal === "Instagram" ? "bg-pink-600" :
                        conversa.canal === "Telegram" ? "bg-blue-600" : "bg-slate-600"
                      }`}>{conversa.canal}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 truncate mb-2">{conversa.intent_principal || "Sem assunto"}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{conversa.status}</Badge>
                      {conversa.tipo_atendimento && (
                        <Badge variant="outline" className="text-xs">
                          {conversa.tipo_atendimento === "Bot" ? <Bot className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                          {conversa.tipo_atendimento}
                        </Badge>
                      )}
                      {conversa.prioridade === "Urgente" && <Badge className="bg-red-600 text-xs">Urgente</Badge>}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(conversa.data_ultima_mensagem).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}