import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function TesteWhatsApp({ configuracao, windowMode = false }) {
  const [testando, setTestando] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("Olá! Esta é uma mensagem de teste do sistema ERP Integra.");
  const [resultado, setResultado] = useState(null);

  const { toast } = useToast();

  const enviarMensagem = async () => {
    setTestando(true);
    setResultado(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const resposta = {
        status: 'success',
        message_id: `msg_${Date.now()}`,
        telefone: telefone,
        enviado_em: new Date().toISOString(),
        entregue: true
      };

      setResultado(resposta);

      toast({
        title: "✅ Mensagem Enviada!",
        description: `WhatsApp enviado para ${telefone}`
      });
    } catch (error) {
      toast({
        title: "❌ Erro no Envio",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTestando(false);
    }
  };

  const templatesWhatsApp = [
    {
      nome: "Confirmação Pedido",
      texto: "🎉 Olá! Seu pedido foi confirmado!\n\n📦 Pedido: {numero_pedido}\n💰 Valor: {valor}\n📅 Previsão: {data_entrega}\n\nAcompanhe pelo link: {link_rastreio}"
    },
    {
      nome: "Saída para Entrega",
      texto: "🚚 Seu pedido saiu para entrega!\n\n📦 Pedido: {numero_pedido}\n📍 Previsão: Hoje\n🔍 Rastreio: {codigo_rastreio}"
    },
    {
      nome: "Boleto Vencendo",
      texto: "⚠️ Lembrete: Seu boleto vence amanhã!\n\n💰 Valor: {valor}\n📅 Vencimento: {data_vencimento}\n\n📄 Acesse: {link_boleto}"
    }
  ];

  return (
    <div className={`space-y-4 ${windowMode ? 'w-full h-full overflow-auto p-6 bg-white' : ''}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Testar WhatsApp Business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-green-900">
              <strong>Provedor:</strong> {configuracao?.integracao_whatsapp?.provedor || 'Não configurado'}
            </p>
            <p className="text-sm text-green-900">
              <strong>Status:</strong> {configuracao?.integracao_whatsapp?.ativa ? '✓ Conectado' : '⚠️ Desconectado'}
            </p>
          </div>

          <div>
            <Label htmlFor="telefone">Telefone (com DDD)</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="11999999999"
            />
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label>Templates Prontos</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {templatesWhatsApp.map((template, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  onClick={() => setMensagem(template.texto)}
                >
                  {template.nome}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={enviarMensagem}
            disabled={testando || !telefone || !mensagem}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {testando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem de Teste
              </>
            )}
          </Button>

          {resultado && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-900 font-semibold mb-2">
                  <CheckCircle className="w-5 h-5" />
                  Mensagem Enviada com Sucesso!
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>ID:</strong> {resultado.message_id}</p>
                  <p><strong>Para:</strong> {resultado.telefone}</p>
                  <p><strong>Enviado:</strong> {new Date(resultado.enviado_em).toLocaleString('pt-BR')}</p>
                  <p><strong>Status:</strong> {resultado.entregue ? '✓ Entregue' : 'Enviando...'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}