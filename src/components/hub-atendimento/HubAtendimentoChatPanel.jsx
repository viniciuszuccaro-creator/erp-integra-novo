/**
 * HubAtendimentoChatPanel — painel de chat com mensagens e input de envio.
 */
import { useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, Bot, Paperclip, Send, UserPlus, ArrowRightLeft, CheckCircle, MoreVertical, Tag } from "lucide-react";
import { toast } from "sonner";

export default function HubAtendimentoChatPanel({
  conversaSelecionada, mensagens, user,
  mensagemAtendente, setMensagemAtendente,
  arquivoAnexo, setArquivoAnexo,
  enviarMensagemMutation, assumirConversaMutation, resolverConversaMutation,
  exibirPainelLateral, setExibirPainelLateral, setPainelLateralConteudo,
  setExibirTransferir, messagesEndRef,
}) {
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (mensagemAtendente.trim() || arquivoAnexo) {
      enviarMensagemMutation.mutate({ mensagem: mensagemAtendente, arquivo: arquivoAnexo });
      setArquivoAnexo(null);
    }
  };

  if (!conversaSelecionada) {
    return (
      <Card className="lg:col-span-2 flex flex-col h-[500px] lg:h-[700px]">
        <CardContent className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Selecione uma conversa para iniciar o atendimento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 flex flex-col h-[500px] lg:h-[700px]">
      {/* Header da Conversa */}
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {conversaSelecionada.cliente_nome || "Cliente Anônimo"}
              <Badge className="ml-2 bg-blue-600">{conversaSelecionada.canal}</Badge>
              {conversaSelecionada.prioridade === "Urgente" && <Badge className="bg-red-600">Urgente</Badge>}
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-xs text-slate-600">Sessão: {conversaSelecionada.sessao_id?.substring(0, 16)}...</p>
              {conversaSelecionada.intent_principal && <Badge variant="outline" className="text-xs">{conversaSelecionada.intent_principal}</Badge>}
            </div>
            {conversaSelecionada.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {conversaSelecionada.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs"><Tag className="w-3 h-3 mr-1" />{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            {conversaSelecionada.atendente_id !== user.id && (
              <Button size="sm" data-permission="Chatbot.Atendimento.assumir" onClick={() => assumirConversaMutation.mutate(conversaSelecionada.id)} disabled={assumirConversaMutation.isPending} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4 lg:mr-2" /><span className="hidden lg:inline">Assumir</span>
              </Button>
            )}
            <Button size="sm" variant="outline" data-permission="Chatbot.Atendimento.transferir" onClick={() => setExibirTransferir(true)} title="Transferir">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" data-permission="Chatbot.Atendimento.resolver" onClick={() => resolverConversaMutation.mutate(conversaSelecionada.id)} disabled={resolverConversaMutation.isPending} className="text-green-600 hover:text-green-700">
              <CheckCircle className="w-4 h-4 lg:mr-2" /><span className="hidden lg:inline">Resolver</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setExibirPainelLateral(!exibirPainelLateral)}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Mensagens */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {mensagens.map((msg) => {
          const isCliente = msg.tipo_remetente === "Cliente";
          return (
            <div key={msg.id} className={`flex ${isCliente ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${
                isCliente ? "bg-white border" :
                msg.tipo_remetente === "Bot" ? "bg-purple-100 border border-purple-200" : "bg-blue-600 text-white"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {msg.tipo_remetente === "Bot" ? <Bot className="w-4 h-4 text-purple-600" /> :
                   isCliente ? <User className="w-4 h-4 text-slate-600" /> : <User className="w-4 h-4" />}
                  <span className="text-xs font-semibold">{msg.remetente_nome}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.mensagem}</p>
                {msg.midia_url && (
                  <a href={msg.midia_url} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 text-xs underline">
                    <Paperclip className="w-3 h-3" />Arquivo
                  </a>
                )}
                <p className="text-xs opacity-60 mt-1">{new Date(msg.data_envio).toLocaleTimeString("pt-BR")}</p>
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Input de Mensagem */}
      <div className="border-t p-3 lg:p-4 bg-slate-50">
        {arquivoAnexo && (
          <div className="mb-2 flex items-center gap-2 text-sm bg-blue-50 border border-blue-200 p-2 rounded-lg">
            <Paperclip className="w-4 h-4 text-blue-600" />
            <span className="flex-1 truncate">{arquivoAnexo.name}</span>
            <button onClick={() => setArquivoAnexo(null)} className="text-red-600 hover:text-red-700">×</button>
          </div>
        )}
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setArquivoAnexo(f); toast.success("Arquivo anexado!"); } }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Anexar arquivo">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input value={mensagemAtendente} onChange={(e) => setMensagemAtendente(e.target.value)}
            onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Digite sua mensagem... (Enter para enviar)" disabled={enviarMensagemMutation.isPending} className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={() => { setExibirPainelLateral(true); setPainelLateralConteudo("respostas"); }} title="Respostas Rápidas">
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button onClick={handleSend} data-permission="HubAtendimento.Atendimento.criar"
            disabled={(!mensagemAtendente.trim() && !arquivoAnexo) || enviarMensagemMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </Card>
  );
}