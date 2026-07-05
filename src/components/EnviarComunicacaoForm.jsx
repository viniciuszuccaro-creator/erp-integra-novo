import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, MessageCircle, FileText, Send, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const TEMPLATES_EMAIL = {
  pedido_confirmado: {
    assunto: "Pedido Confirmado - #{numero_pedido}",
    corpo: `Olá {cliente},\n\nSeu pedido #{numero_pedido} foi confirmado com sucesso!\n\nValor Total: R$ {valor_total}\nPrevisão de Entrega: {data_entrega}\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\n{empresa}`
  },
  saida_caminhao: {
    assunto: "Seu pedido saiu para entrega - #{numero_pedido}",
    corpo: `Olá {cliente},\n\nSeu pedido #{numero_pedido} saiu para entrega!\n\n🚚 Transportadora: {transportadora}\n📦 Volumes: {volumes}\n🔢 Código de Rastreamento: {codigo_rastreamento}\n\nRastreie em: {link_rastreamento}\n\nAtenciosamente,\n{empresa}`
  },
  entregue: {
    assunto: "Pedido Entregue - #{numero_pedido}",
    corpo: `Olá {cliente},\n\nSeu pedido #{numero_pedido} foi entregue com sucesso!\n\nEsperamos que esteja satisfeito com sua compra.\nAvalie nosso atendimento: {link_avaliacao}\n\nAtenciosamente,\n{empresa}`
  },
  nfe_emitida: {
    assunto: "Nota Fiscal - #{numero_pedido}",
    corpo: `Olá {cliente},\n\nSegue em anexo a Nota Fiscal Eletrônica referente ao pedido #{numero_pedido}.\n\nChave de Acesso: {chave_nfe}\n\nAtenciosamente,\n{empresa}`
  }
};

const TEMPLATES_WHATSAPP = {
  pedido_confirmado: `✅ *Pedido Confirmado*\n\nOlá {cliente}! Seu pedido *#{numero_pedido}* foi confirmado.\n\n💰 Valor: R$ {valor_total}\n📅 Previsão: {data_entrega}`,
  saida_caminhao: `🚚 *Pedido em Trânsito*\n\nOlá {cliente}! Seu pedido *#{numero_pedido}* saiu para entrega!\n\n📦 Volumes: {volumes}\n🔢 Rastreio: {codigo_rastreamento}\n🚛 Transportadora: {transportadora}\n\nRastreie: {link_rastreamento}`,
  entregue: `✅ *Pedido Entregue*\n\nOlá {cliente}! Seu pedido *#{numero_pedido}* foi entregue!\n\nObrigado pela preferência! 🎉`,
  producao_iniciada: `⚙️ *Produção Iniciada*\n\nOlá {cliente}! Seu pedido *#{numero_pedido}* entrou em produção.\n\nStatus: {status}\nPrevisão: {data_entrega}`,
  aguardando_retirada: `📦 *Pronto para Retirada*\n\nOlá {cliente}! Seu pedido *#{numero_pedido}* está pronto para retirada!\n\n📍 Endereço: {endereco_retirada}\n🕐 Horário: {horario_retirada}`
};

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function EnviarComunicacaoForm({ pedido, tipo = "manual", onEnviado, windowMode = false }) {
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
        console.log('📧 Enviando EMAIL:', {
          para: pedido.contatos_cliente?.[0]?.valor || "cliente@email.com",
          assunto,
          corpo: mensagem,
          anexos: Object.entries(anexos).filter(([k, v]) => v).map(([k]) => k)
        });

        toast({
          title: "✅ E-mail Enviado! (Simulado)",
          description: `Mensagem enviada para ${pedido.cliente_nome}`
        });
      } else {
        const telefone = pedido.contatos_cliente?.find(c => c.tipo === "WhatsApp")?.valor || 
                        pedido.contatos_cliente?.[0]?.valor || 
                        "11999999999";

        console.log('📱 Enviando WHATSAPP:', { para: telefone, mensagem });

        toast({
          title: "✅ WhatsApp Enviado! (Simulado)",
          description: `Mensagem enviada para ${telefone}`
        });
      }

      setTimeout(() => {
        setEnviando(false);
        if (onEnviado) onEnviado();
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

  const content = (
    <div className={`space-y-4 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
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
              className="font-mono text-sm mt-2"
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
              className="w-full px-3 py-2 border rounded mt-2"
            />
          </div>

          <div>
            <Label>Mensagem</Label>
            <Textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={10}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="mb-3 block">Anexos</Label>
            <div className="space-y-2">
              {[
                { key: 'nfe', icon: FileText, label: 'Nota Fiscal (NF-e)' },
                { key: 'romaneio', icon: FileText, label: 'Romaneio de Carga' },
                { key: 'boleto', icon: FileText, label: 'Boleto Bancário' },
                { key: 'contrato', icon: FileText, label: 'Contrato' }
              ].map(({ key, icon: Icon, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    checked={anexos[key]}
                    onCheckedChange={(checked) => setAnexos({ ...anexos, [key]: checked })}
                  />
                  <Label className="cursor-pointer flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
        <Button
          type="button"
          onClick={handleEnviar}
          disabled={enviando}
          data-permission="Comercial.Comunicacao.enviar"
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
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}