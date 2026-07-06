import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { 
  MessageCircle, Send, User, Headphones, 
  CheckCheck, Clock, Loader2, Phone, Mail 
} from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

/**
 * V21.5 - Chat Direto Cliente → Vendedor COMPLETO
 * P2: Multi-tenant — usa filterInContext
 */
export default function ChatVendedor({ clienteId }) {
  const { user } = useUser();
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [mensagem, setMensagem] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { data: cliente } = useQuery({
    queryKey: ['cliente', clienteId, contextoKey],
    queryFn: () => filterInContext('Cliente', { id: clienteId }).then(r => r[0]),
    enabled: !!clienteId && !!contextoKey
  });

  const { data: conversas = [], isLoading } = useQuery({
    queryKey: ['chat-cliente', clienteId, contextoKey],
    queryFn: async () => {
      const interacoes = await filterInContext('ChatbotInteracao', {
        cliente_id: clienteId,
        canal: 'Portal'
      }, '-created_date');
      return interacoes;
    },
    enabled: !!clienteId && !!contextoKey,
    refetchInterval: 5000
  });

  const enviarMensagemMutation = useMutation({
    mutationFn: async (mensagemTexto) => {
      // 1. Criar interação de chat
      const interacao = await base44.entities.ChatbotInteracao.create({
        cliente_id: clienteId,
        cliente_nome: cliente?.nome,
        group_id: grupoAtual?.id,
        empresa_id: empresaAtual?.id,
        canal: 'Portal',
        mensagem_cliente: mensagemTexto,
        sentimento: 'neutro',
        intent_detectado: 'chat_vendedor',
        status: 'aguardando_atendente',
        criado_por: user?.email,
        metadata: {
          origem: 'Portal do Cliente',
          usuario_nome: user?.full_name
        }
      });

      // 2. Notificar vendedor responsável
      if (cliente?.vendedor_responsavel_id) {
        await base44.entities.Notificacao.create({
          usuario_id: cliente.vendedor_responsavel_id,
          group_id: grupoAtual?.id,
          empresa_id: empresaAtual?.id,
          tipo: 'chat_cliente',
          titulo: `💬 Nova mensagem de ${cliente.nome}`,
          mensagem: mensagemTexto.substring(0, 100),
          link: `/chatbot?cliente_id=${clienteId}`,
          prioridade: 'alta'
        });
      }

      return interacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-cliente', clienteId]);
      setMensagem('');
      toast.success('Mensagem enviada! Vendedor será notificado.');
    }
  });

  const responderMutation = useMutation({
    mutationFn: async ({ interacaoId, resposta }) => {
      await base44.entities.ChatbotInteracao.update(interacaoId, {
        resposta_agente: resposta,
        status: 'respondido',
        respondido_em: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-cliente', clienteId]);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversas]);

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    enviarMensagemMutation.mutate(mensagem);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col shadow-lg border-2 border-blue-200">
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
        <CardTitle className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6" />
          <div className="flex-1">
            <p className="text-lg">Chat com Vendedor</p>
            {cliente?.vendedor_responsavel && (
              <p className="text-sm text-blue-100 font-normal">
                {cliente.vendedor_responsavel}
              </p>
            )}
          </div>
          <Badge className="bg-white/20 text-white">
            Online
          </Badge>
        </CardTitle>
      </CardHeader>

      {/* Área de Mensagens */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {/* Mensagem de boas-vindas */}
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow">
              <p className="text-sm text-slate-900 mb-2">
                Olá! 👋 Eu sou {cliente?.vendedor_responsavel || 'seu vendedor'}.
              </p>
              <p className="text-sm text-slate-600">
                Estou aqui para ajudar com dúvidas sobre pedidos, entregas e orçamentos.
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Agora</p>
          </div>
        </div>

        {/* Mensagens do histórico */}
        {conversas.map((conversa) => {
          const isCliente = conversa.mensagem_cliente && !conversa.resposta_agente;
          const isVendedor = !!conversa.resposta_agente;

          return (
            <div key={conversa.id} className="space-y-3">
              {/* Mensagem do Cliente */}
              {conversa.mensagem_cliente && (
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 max-w-[70%]">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none p-4 shadow">
                      <p className="text-sm">{conversa.mensagem_cliente}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <p className="text-xs text-slate-400">
                        {format(new Date(conversa.created_date), 'HH:mm')}
                      </p>
                      <CheckCheck className="w-3 h-3 text-blue-600" />
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
              )}

              {/* Resposta do Vendedor */}
              {conversa.resposta_agente && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-[70%]">
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow">
                      <p className="text-sm text-slate-900">{conversa.resposta_agente}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(conversa.respondido_em || conversa.created_date), 'HH:mm')}
                    </p>
                  </div>
                </div>
              )}

              {/* Aguardando resposta */}
              {conversa.status === 'aguardando_atendente' && !conversa.resposta_agente && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl rounded-tl-none p-3">
                      <p className="text-xs text-orange-700">
                        Aguardando resposta do vendedor...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Indicador de digitação */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input de Mensagem */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={handleEnviar} className="flex gap-2">
          <Input
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={enviarMensagemMutation.isPending}
          />
          <Button data-permission="Portal.ChatVendedor.salvar"
            type="submit"
            disabled={!mensagem.trim() || enviarMensagemMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {enviarMensagemMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>

        {/* Contatos alternativos */}
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          {cliente?.contatos && cliente.contatos.filter(c => c.principal).map((contato, idx) => (
            <div key={idx} className="flex items-center gap-1">
              {contato.tipo === 'WhatsApp' && <Phone className="w-3 h-3" />}
              {contato.tipo === 'E-mail' && <Mail className="w-3 h-3" />}
              <span>{contato.valor}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}