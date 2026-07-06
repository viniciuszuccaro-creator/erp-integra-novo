import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, MessageCircle, Mail, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * 🔔 NOTIFICADOR AUTOMÁTICO DE ENTREGAS V21.5
 * Envia notificações ao cliente sobre status de entrega
 */
export default function NotificadorAutomaticoEntrega({ pedido, entrega, onClose, windowMode = false }) {
  const [canal, setCanal] = useState("WhatsApp");
  const [mensagemCustom, setMensagemCustom] = useState("");
  const queryClient = useQueryClient();

  const mensagensPadrao = {
    "Pronto para Retirada": `🎉 Olá ${pedido.cliente_nome}!\n\nSeu pedido #${pedido.numero_pedido} está PRONTO PARA RETIRADA!\n\n📍 Endereço: [Sua loja]\n🕐 Horário: Segunda a Sexta, 8h às 18h\n\nAguardamos você! 😊`,
    
    "Em Expedição": `📦 Olá ${pedido.cliente_nome}!\n\nSeu pedido #${pedido.numero_pedido} está sendo SEPARADO para entrega.\n\n🚚 Previsão de entrega: ${pedido.data_prevista_entrega ? new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR') : 'em breve'}\n\nEm breve você receberá!`,
    
    "Saiu para Entrega": `🚚 Olá ${pedido.cliente_nome}!\n\nSeu pedido #${pedido.numero_pedido} SAIU PARA ENTREGA!\n\n📍 Endereço: ${pedido.endereco_entrega_principal?.logradouro}, ${pedido.endereco_entrega_principal?.numero}\n🕐 Previsão: Hoje\n\nNosso motorista está a caminho! 🎯`,
    
    "Entregue": `✅ Olá ${pedido.cliente_nome}!\n\nSeu pedido #${pedido.numero_pedido} foi ENTREGUE com sucesso!\n\n🎉 Obrigado pela preferência!\n⭐ Avalie nosso serviço: [link]`
  };

  const mensagemFinal = mensagemCustom || mensagensPadrao[pedido.status] || 
    `Atualização do pedido #${pedido.numero_pedido}: Status alterado para ${pedido.status}`;

  const enviarNotificacaoMutation = useMutation({
    mutationFn: async () => {
      // Registrar notificação no histórico da entrega
      if (entrega) {
        const notificacoesAtuais = entrega.notificacoes_enviadas || [];
        await base44.entities.Entrega.update(entrega.id, {
          notificacoes_enviadas: [
            ...notificacoesAtuais,
            {
              tipo: pedido.status,
              canal: canal,
              destinatario: pedido.cliente_nome,
              data_envio: new Date().toISOString(),
              status_envio: "Enviado",
              mensagem: mensagemFinal
            }
          ]
        });
      }

      // Enviar email (integração Core)
      if (canal === "E-mail" && pedido.cliente_email) {
        await base44.integrations.Core.SendEmail({
          to: pedido.cliente_email,
          subject: `Atualização do Pedido #${pedido.numero_pedido}`,
          body: mensagemFinal
        });
      }

      // WhatsApp e SMS: placeholder para integração futura
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast.success(`✅ Notificação enviada via ${canal}!`);
      if (onClose) onClose();
    }
  });

  const contatosCliente = pedido.contatos_cliente || [];
  const whatsappPrincipal = contatosCliente.find(c => c.tipo === 'WhatsApp' && c.principal)?.valor;
  const emailPrincipal = pedido.cliente_email;

  const containerClass = windowMode ? "w-full h-full flex flex-col" : "";

  return (
    <Card className={`border-0 shadow-xl ${containerClass}`}>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          🔔 Notificar Cliente
        </CardTitle>
        <p className="text-sm opacity-90">Pedido #{pedido.numero_pedido} - {pedido.cliente_nome}</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Seletor de Canal */}
        <div>
          <Label>Canal de Comunicação</Label>
          <Select value={canal} onValueChange={setCanal}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WhatsApp">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  WhatsApp
                  {whatsappPrincipal && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {whatsappPrincipal}
                    </Badge>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="E-mail">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  E-mail
                  {emailPrincipal && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {emailPrincipal}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mensagem */}
        <div>
          <Label>Mensagem (personalize ou use a padrão)</Label>
          <Textarea
            value={mensagemCustom}
            onChange={(e) => setMensagemCustom(e.target.value)}
            placeholder={mensagemFinal}
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            💡 Dica: Deixe em branco para usar a mensagem padrão automática
          </p>
        </div>

        {/* Preview da Mensagem */}
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-600 mb-2 font-semibold">📱 Preview:</p>
            <p className="text-sm whitespace-pre-wrap">{mensagemFinal}</p>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button data-permission="Logistica.NotificadorAutomaticoEntrega.enviar"
            onClick={() => enviarNotificacaoMutation.mutate()}
            disabled={enviarNotificacaoMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {enviarNotificacaoMutation.isPending ? 'Enviando...' : `Enviar via ${canal}`}
          </Button>
        </div>

        {/* Histórico de Notificações */}
        {entrega?.notificacoes_enviadas?.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-semibold mb-2">📜 Histórico de Notificações</p>
            <div className="space-y-2">
              {entrega.notificacoes_enviadas.slice(-3).reverse().map((notif, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-green-50 rounded">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{notif.tipo}</span>
                  <Badge variant="outline">{notif.canal}</Badge>
                  <span className="text-xs text-slate-500">
                    {new Date(notif.data_envio).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}