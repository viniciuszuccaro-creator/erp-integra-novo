import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, MessageCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { aplicarTemplateComunicacao } from "./comunicacao/comunicacaoTemplates";
import ComunicacaoWhatsAppTab from "./comunicacao/ComunicacaoWhatsAppTab";
import ComunicacaoEmailTab from "./comunicacao/ComunicacaoEmailTab";

/**
 * Modal de envio de comunicação (WhatsApp/E-mail)
 * Refatorado: templates + abas extraídos em sub-componentes (Regra-Mãe)
 */
export default function EnviarComunicacaoModal({ open, onClose, pedido, tipo = "manual" }) {
  const [canal, setCanal] = useState("whatsapp");
  const [template, setTemplate] = useState(tipo !== "manual" ? tipo : "pedido_confirmado");
  const [mensagem, setMensagem] = useState("");
  const [assunto, setAssunto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [anexos, setAnexos] = useState({ nfe: true, romaneio: false, boleto: false, contrato: false });

  const { toast } = useToast();

  useEffect(() => {
    if (pedido && template) {
      const { mensagem: msg, assunto: subj } = aplicarTemplateComunicacao(canal, template, pedido);
      setMensagem(msg);
      if (canal === "email") setAssunto(subj);
    }
  }, [template, pedido, canal]);

  const handleEnviar = async () => {
    if (!mensagem || (canal === "email" && !assunto)) {
      toast({ title: "❌ Erro", description: "Preencha a mensagem e assunto", variant: "destructive" });
      return;
    }

    setEnviando(true);
    try {
      if (canal === "email") {
        console.log('📧 Enviando EMAIL:', {
          para: pedido.contatos_cliente?.[0]?.valor || "cliente@email.com",
          assunto, corpo: mensagem,
          anexos: Object.entries(anexos).filter(([k, v]) => v).map(([k]) => k)
        });
        toast({ title: "✅ E-mail Enviado! (Simulado)", description: `Mensagem enviada para ${pedido.cliente_nome}` });
      } else {
        const telefone = pedido.contatos_cliente?.find(c => c.tipo === "WhatsApp")?.valor ||
                        pedido.contatos_cliente?.[0]?.valor || "11999999999";
        console.log('📱 Enviando WHATSAPP:', { para: telefone, mensagem });
        toast({ title: "✅ WhatsApp Enviado! (Simulado)", description: `Mensagem enviada para ${telefone}` });
      }

      setTimeout(() => { setEnviando(false); onClose(); }, 1500);
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({ title: "❌ Erro ao Enviar", description: error.message, variant: "destructive" });
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Enviar Comunicação - Pedido {pedido?.numero_pedido}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={canal} onValueChange={setCanal} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" /> E-mail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp">
            <ComunicacaoWhatsAppTab
              pedido={pedido} template={template} setTemplate={setTemplate}
              mensagem={mensagem} setMensagem={setMensagem}
            />
          </TabsContent>

          <TabsContent value="email">
            <ComunicacaoEmailTab
              pedido={pedido} template={template} setTemplate={setTemplate}
              assunto={assunto} setAssunto={setAssunto}
              mensagem={mensagem} setMensagem={setMensagem}
              anexos={anexos} setAnexos={setAnexos}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={enviando}>Cancelar</Button>
          <Button
            type="button"
            data-permission="Comercial.Comunicacao.enviar"
            onClick={handleEnviar}
            disabled={enviando}
            className={canal === "email" ? "bg-blue-600" : "bg-green-600"}
          >
            {enviando ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" />Enviar {canal === "email" ? "E-mail" : "WhatsApp"}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}