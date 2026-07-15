import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Save } from "lucide-react";

export default function ConfiguracaoWhatsAppForm({ config, onSubmit, isSubmitting, windowMode = false }) {
  const [formData, setFormData] = useState(config || {
    provedor: "Evolution API",
    api_url: "",
    api_key: "",
    instance_id: "",
    numero_whatsapp: "",
    status_conexao: "Desconectado",
    enviar_pedido_aprovado: true,
    enviar_saida_entrega: true,
    enviar_entrega_concluida: true,
    enviar_cobranca: true,
    enviar_cobranca_dias_antes: 3,
    template_pedido_aprovado: "",
    template_saida_entrega: "",
    template_entrega_concluida: "",
    template_cobranca: "",
    ativo: true,
    observacoes: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Configuração WhatsApp Business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Provedor *</Label>
              <Select value={formData.provedor} onValueChange={(val) => setFormData({ ...formData, provedor: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Evolution API">Evolution API</SelectItem>
                  <SelectItem value="Baileys">Baileys</SelectItem>
                  <SelectItem value="WPPCONNECT">WPPCONNECT</SelectItem>
                  <SelectItem value="Twilio">Twilio</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Número WhatsApp *</Label>
              <Input
                value={formData.numero_whatsapp}
                onChange={(e) => setFormData({ ...formData, numero_whatsapp: e.target.value })}
                placeholder="(11) 98765-4321"
              />
            </div>
          </div>

          <div>
            <Label>URL da API</Label>
            <Input
              value={formData.api_url}
              onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
              placeholder="https://evolution-api.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Token de autenticação"
              />
            </div>

            <div>
              <Label>Instance ID</Label>
              <Input
                value={formData.instance_id}
                onChange={(e) => setFormData({ ...formData, instance_id: e.target.value })}
                placeholder="ID da instância"
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="font-semibold text-slate-900">Eventos Automáticos</p>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Pedido Aprovado</Label>
              <Switch
                checked={formData.enviar_pedido_aprovado}
                onCheckedChange={(val) => setFormData({ ...formData, enviar_pedido_aprovado: val })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Saída para Entrega</Label>
              <Switch
                checked={formData.enviar_saida_entrega}
                onCheckedChange={(val) => setFormData({ ...formData, enviar_saida_entrega: val })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Entrega Concluída</Label>
              <Switch
                checked={formData.enviar_entrega_concluida}
                onCheckedChange={(val) => setFormData({ ...formData, enviar_entrega_concluida: val })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Enviar Cobrança</Label>
              <Switch
                checked={formData.enviar_cobranca}
                onCheckedChange={(val) => setFormData({ ...formData, enviar_cobranca: val })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <Label>Configuração Ativa</Label>
              <Switch
                checked={formData.ativo}
                onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
              />
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Salvando...' : config ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <MessageCircle className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {config ? 'Editar WhatsApp Business' : 'Nova Configuração WhatsApp'}
            </h2>
          </div>
          {form}
        </div>
      </div>
    );
  }

  return form;
}