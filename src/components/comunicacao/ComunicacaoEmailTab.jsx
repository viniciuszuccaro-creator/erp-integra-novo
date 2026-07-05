import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, FileText, Package } from "lucide-react";
import { TEMPLATES_EMAIL } from "./comunicacaoTemplates";

/**
 * Aba de E-mail do modal de comunicação
 * Extraído de EnviarComunicacaoModal.jsx
 */
export default function ComunicacaoEmailTab({
  pedido, template, setTemplate, assunto, setAssunto,
  mensagem, setMensagem, anexos, setAnexos
}) {
  return (
    <div className="space-y-4">
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
        <Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={10} />
      </div>

      <div>
        <Label className="mb-3 block">Anexos</Label>
        <div className="space-y-2">
          {[
            { key: 'nfe', label: 'Nota Fiscal (NF-e)', icon: FileText },
            { key: 'romaneio', label: 'Romaneio de Carga', icon: Package },
            { key: 'boleto', label: 'Boleto Bancário', icon: FileText },
            { key: 'contrato', label: 'Contrato', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
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
    </div>
  );
}