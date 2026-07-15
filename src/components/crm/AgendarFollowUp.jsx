import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Mail, MessageCircle, Phone } from "lucide-react";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function AgendarFollowUp({ oportunidade, open, onClose, onSalvar, windowMode = false }) {
  const [followUp, setFollowUp] = useState({
    data: "",
    tipo: "E-mail",
    mensagem: ""
  });

  const schema = z.object({
    data: z.string().min(4, 'Data é obrigatória'),
    tipo: z.string().min(1, 'Tipo é obrigatório'),
    mensagem: z.string().min(1, 'Mensagem é obrigatória')
  });

  const handleSubmit = async () => {
    const followUps = [
      ...(oportunidade.follow_ups_agendados || []),
      {
        ...followUp,
        data: new Date(followUp.data).toISOString(),
        enviado: false
      }
    ];

    onSalvar({
      ...oportunidade,
      follow_ups_agendados: followUps
    });
  };

  const templatesMensagens = {
    "E-mail": `Olá ${oportunidade?.cliente_nome},

Gostaria de acompanhar nossa conversa sobre ${oportunidade?.titulo}.

Você teve tempo de avaliar nossa proposta?

Fico à disposição para esclarecer qualquer dúvida.

Atenciosamente,
${oportunidade?.responsavel}`,

    "WhatsApp": `Olá ${oportunidade?.cliente_nome}! 👋

Passando aqui para saber se você já teve tempo de avaliar nossa proposta sobre ${oportunidade?.titulo}.

Posso ajudar em algo? 😊`,

    "Ligação": `Roteiro de ligação:
- Cumprimentar cliente
- Perguntar sobre análise da proposta
- Esclarecer dúvidas
- Agendar próximos passos`,

    "Reunião": `Pauta da reunião:
- Revisar proposta
- Alinhamento de expectativas
- Próximos passos`
  };

  const handleSelecionarTemplate = (tipo) => {
    setFollowUp({
      ...followUp,
      tipo: tipo,
      mensagem: templatesMensagens[tipo]
    });
  };

  const formContent = (
    <FormWrapper schema={schema} defaultValues={followUp} onSubmit={handleSubmit} externalData={followUp} className="space-y-4">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>📌 Automação:</strong> O follow-up será enviado automaticamente na data agendada
            </p>
          </div>

          <div>
            <Label>Oportunidade</Label>
            <p className="font-semibold">{oportunidade?.titulo}</p>
            <p className="text-sm text-slate-600">{oportunidade?.cliente_nome}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data/Hora do Follow-up *</Label>
              <Input
                type="datetime-local"
                value={followUp.data}
                onChange={(e) => setFollowUp({ ...followUp, data: e.target.value })}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <Label>Tipo *</Label>
              <Select
                value={followUp.tipo}
                onValueChange={(value) => handleSelecionarTemplate(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-mail">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </div>
                  </SelectItem>
                  <SelectItem value="WhatsApp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="Ligação">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Ligação
                    </div>
                  </SelectItem>
                  <SelectItem value="Reunião">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Reunião
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Mensagem/Roteiro *</Label>
            <Textarea
              value={followUp.mensagem}
              onChange={(e) => setFollowUp({ ...followUp, mensagem: e.target.value })}
              rows={10}
              required
              placeholder="Digite a mensagem ou roteiro do follow-up..."
            />
            <p className="text-xs text-slate-500 mt-1">
              A mensagem será enviada automaticamente na data agendada
            </p>
          </div>

          {oportunidade?.follow_ups_agendados?.length > 0 && (
            <div className="p-3 bg-slate-50 rounded">
              <h4 className="text-sm font-semibold mb-2">Follow-ups Agendados:</h4>
              <div className="space-y-1">
                {oportunidade.follow_ups_agendados.map((fu, idx) => (
                  <div key={idx} className="text-xs flex items-center justify-between">
                    <span>
                      {fu.tipo} - {new Date(fu.data).toLocaleString('pt-BR')}
                    </span>
                    <span className={fu.enviado ? "text-green-600" : "text-orange-600"}>
                      {fu.enviado ? "✓ Enviado" : "⏳ Agendado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Follow-up
            </Button>
          </div>
        </FormWrapper>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        {formContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar Follow-up Automático</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}