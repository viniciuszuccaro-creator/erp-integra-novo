import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  MessageCircle, 
  FileText, 
  Send, 
  Loader2,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

const TEMPLATES_EMAIL = {
  pedido_confirmado: {
    assunto: "Pedido Confirmado - #{numero_pedido}",
    corpo: `Olá {cliente},

Seu pedido #{numero_pedido} foi confirmado com sucesso!

Valor Total: R$ {valor_total}
Previsão de Entrega: {data_entrega}

Qualquer dúvida, estamos à disposição.

Atenciosamente,
{empresa}`
  },
  saida_caminhao: {
    assunto: "Seu pedido saiu para entrega - #{numero_pedido}",
    corpo: `Olá {cliente},

Seu pedido #{numero_pedido} saiu para entrega!

🚚 Transportadora: {transportadora}
📦 Volumes: {volumes}
🔢 Código de Rastreamento: {codigo_rastreamento}

Rastreie em: {link_rastreamento}

Atenciosamente,
{empresa}`
  },
  entregue: {
    assunto: "Pedido Entregue - #{numero_pedido}",
    corpo: `Olá {cliente},

Seu pedido #{numero_pedido} foi entregue com sucesso!

Esperamos que esteja satisfeito com sua compra.
Avalie nosso atendimento: {link_avaliacao}

Atenciosamente,
{empresa}`
  },
  nfe_emitida: {
    assunto: "Nota Fiscal - #{numero_pedido}",
    corpo: `Olá {cliente},

Segue em anexo a Nota Fiscal Eletrônica referente ao pedido #{numero_pedido}.

Chave de Acesso: {chave_nfe}

Atenciosamente,
{empresa}`
  }
};

const TEMPLATES_WHATSAPP = {
  pedido_confirmado: `✅ *Pedido Confirmado*

Olá {cliente}! Seu pedido *#{numero_pedido}* foi confirmado.

💰 Valor: R$ {valor_total}
📅 Previsão: {data_entrega}`,

  saida_caminhao: `🚚 *Pedido em Trânsito*

Olá {cliente}! Seu pedido *#{numero_pedido}* saiu para entrega!

📦 Volumes: {volumes}
🔢 Rastreio: {codigo_rastreamento}
🚛 Transportadora: {transportadora}

Rastreie: {link_rastreamento}`,

  entregue: `✅ *Pedido Entregue*

Olá {cliente}! Seu pedido *#{numero_pedido}* foi entregue!

Obrigado pela preferência! 🎉`,

  producao_iniciada: `⚙️ *Produção Iniciada*

Olá {cliente}! Seu pedido *#{numero_pedido}* entrou em produção.

Status: {status}
Previsão: {data_entrega}`,

  aguardando_retirada: `📦 *Pronto para Retirada*

Olá {cliente}! Seu pedido *#{numero_pedido}* está pronto para retirada!

📍 Endereço: {endereco_retirada}
🕐 Horário: {horario_retirada}`
};

export default function EnviarComunicacaoModal({ open, onClose, pedido, tipo = "manual" }) {
  const [canal, setCanal] = useState("whatsapp");
  const [template, setTemplate] = useState(tipo !== "manual" ? tipo : "pedido_confirmado");
  const [mensagem, setMensagem] = useState("");
  const [assunto, setAssunto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [anexos, setAnexos] = useState({
    nfe: true,
    romaneio: false,
    boleto: false,
    contrato: false
  });

  const { toast } = useToast();

  React.useEffect(() => {
    if (pedido && template) {
      aplicarTemplate();
    }
  }, [template, pedido, canal]);

  const aplicarTemplate = () => {
    if (!pedido) return;

    const templateData = canal === "email" ? TEMPLATES_EMAIL[template] : TEMPLATES_WHATSAPP[template];
    if (!templateData) return;

    let texto = canal === "email" ? templateData.corpo : templateData;
    let assuntoEmail = canal === "email" ? templateData.assunto : "";

    // Substituir variáveis
    const variaveis = {
      cliente: pedido.cliente_nome || "Cliente",
      numero_pedido: pedido.numero_pedido || "",
      valor_total: (pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      data_entrega: pedido.data_prevista_entrega ? new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR') : "A confirmar",
      transportadora: pedido.transportadora || "A definir",
      volumes: pedido.volumes || 1,
      codigo_rastreamento: pedido.codigo_rastreamento || "Será informado",
      link_rastreamento: pedido.codigo_rastreamento ? `https://rastreamento.com.br/${pedido.codigo_rastreamento}` : "#",
      chave_nfe: pedido.nfe_chave_acesso || "Será informado",
      empresa: "ERP Integra",
      status: pedido.status || "Em processamento",
      endereco_retirada: "Rua Principal, 123 - Centro",
      horario_retirada: "8h às 18h",
      link_avaliacao: "https://avaliacao.com.br"
    };

    Object.keys(variaveis).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      texto = texto.replace(regex, variaveis[key]);
      assuntoEmail = assuntoEmail.replace(regex, variaveis[key]);
    });

    setMensagem(texto);
    if (canal === "email") {
      setAssunto(assuntoEmail);
    }
  };

  const handleEnviar = async () => {
    if (!mensagem || (canal === "email" && !assunto)) {
      toast({
        title: "❌ Erro",
        description: "Preencha a mensagem e assunto",
        variant: "destructive"
      });
      return;
    }

    setEnviando(true);

    try {
      if (canal === "email") {
        // Simulação de envio de email
        console.log('📧 Enviando EMAIL:', {
          para: pedido.contatos_cliente?.[0]?.valor || "cliente@email.com",
          assunto,
          corpo: mensagem,
          anexos: Object.entries(anexos).filter(([k, v]) => v).map(([k]) => k)
        });

        // Aqui você pode integrar com a API de email real
        // await base44.integrations.Core.SendEmail({
        //   to: pedido.contatos_cliente?.[0]?.valor,
        //   subject: assunto,
        //   body: mensagem
        // });

        toast({
          title: "✅ E-mail Enviado! (Simulado)",
          description: `Mensagem enviada para ${pedido.cliente_nome}`
        });
      } else {
        // Simulação de envio de WhatsApp
        const telefone = pedido.contatos_cliente?.find(c => c.tipo === "WhatsApp")?.valor || 
                        pedido.contatos_cliente?.[0]?.valor || 
                        "11999999999";

        console.log('📱 Enviando WHATSAPP:', {
          para: telefone,
          mensagem
        });

        // Aqui você pode integrar com API de WhatsApp
        // await base44.integrations.WhatsApp.sendMessage({
        //   to: telefone,
        //   message: mensagem
        // });

        toast({
          title: "✅ WhatsApp Enviado! (Simulado)",
          description: `Mensagem enviada para ${telefone}`
        });
      }

      // Registrar no histórico do pedido
      const novoHistorico = {
        data: new Date().toISOString(),
        usuario: "Sistema",
        acao: `Enviou ${canal === "email" ? "e-mail" : "WhatsApp"}: ${template}`,
        observacao: mensagem.substring(0, 100)
      };

      // Aqui você atualizaria o pedido com o novo histórico
      // await base44.entities.Pedido.update(pedido.id, {
      //   historico: [...(pedido.historico || []), novoHistorico]
      // });

      setTimeout(() => {
        setEnviando(false);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast({
        title: "❌ Erro ao Enviar",
        description: error.message,
        variant: "destructive"
      });
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
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              E-mail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp" className="space-y-4">
            <Alert className="bg-green-50 border-green-300">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <AlertDescription>
                <strong>📱 Destinatário:</strong> {pedido?.contatos_cliente?.find(c => c.tipo === "WhatsApp")?.valor || "Não cadastrado"}
              </AlertDescription>
            </Alert>

            <div>
              <Label>Template</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.keys(TEMPLATES_WHATSAPP).map(key => (
                  <Card
                    key={key}
                    className={`cursor-pointer border-2 transition-all ${template === key ? 'border-green-600 bg-green-50' : 'border-slate-200'}`}
                    onClick={() => setTemplate(key)}
                  >
                    <CardContent className="p-3 text-sm">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                {mensagem.length} caracteres
              </p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Alert className="bg-blue-50 border-blue-300">
              <Mail className="w-5 h-5 text-blue-600" />
              <AlertDescription>
                <strong>📧 Destinatário:</strong> {pedido?.contatos_cliente?.find(c => c.tipo === "E-mail")?.valor || pedido?.contatos_cliente?.[0]?.valor || "Não cadastrado"}
              </AlertDescription>
            </Alert>

            <div>
              <Label>Template</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.keys(TEMPLATES_EMAIL).map(key => (
                  <Card
                    key={key}
                    className={`cursor-pointer border-2 transition-all ${template === key ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}
                    onClick={() => setTemplate(key)}
                  >
                    <CardContent className="p-3 text-sm">
                      {key.replace(/_/g, ' ').toUpperCase()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label>Assunto</Label>
              <input
                type="text"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={10}
              />
            </div>

            <div>
              <Label className="mb-3 block">Anexos</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={anexos.nfe}
                    onCheckedChange={(checked) => setAnexos({ ...anexos, nfe: checked })}
                  />
                  <Label className="cursor-pointer flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Nota Fiscal (NF-e)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={anexos.romaneio}
                    onCheckedChange={(checked) => setAnexos({ ...anexos, romaneio: checked })}
                  />
                  <Label className="cursor-pointer flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Romaneio de Carga
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={anexos.boleto}
                    onCheckedChange={(checked) => setAnexos({ ...anexos, boleto: checked })}
                  />
                  <Label className="cursor-pointer flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Boleto Bancário
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={anexos.contrato}
                    onCheckedChange={(checked) => setAnexos({ ...anexos, contrato: checked })}
                  />
                  <Label className="cursor-pointer flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Contrato
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={enviando}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            data-permission="Comercial.Comunicacao.enviar"
            onClick={handleEnviar} 
            disabled={enviando}
            className={canal === "email" ? "bg-blue-600" : "bg-green-600"}
          >
            {enviando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar {canal === "email" ? "E-mail" : "WhatsApp"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}