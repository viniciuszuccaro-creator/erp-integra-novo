import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle } from "lucide-react";
import { TEMPLATES_WHATSAPP } from "./comunicacaoTemplates";

/**
 * Aba de WhatsApp do modal de comunicação
 * Extraído de EnviarComunicacaoModal.jsx
 */
export default function ComunicacaoWhatsAppTab({ pedido, template, setTemplate, mensagem, setMensagem }) {
  return (
    <div className="space-y-4">
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
        <p className="text-xs text-slate-500 mt-1">{mensagem.length} caracteres</p>
      </div>
    </div>
  );
}