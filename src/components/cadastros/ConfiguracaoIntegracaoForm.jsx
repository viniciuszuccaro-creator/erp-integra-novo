import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracaoIntegracaoForm({ config, onSubmit, isSubmitting, windowMode = false }) {
  const [formData, setFormData] = useState(config || {
    marketplace: "",
    nome_integracao: "",
    tipo_integracao: "API REST",
    descricao: "",
    url_base: "",
    api_key: "",
    headers_customizados: {},
    timeout_segundos: 30,
    max_tentativas_retry: 3,
    ativo: true,
    observacoes: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.marketplace && !formData.nome_integracao) {
      toast.error('Nome da integração ou marketplace é obrigatório');
      return;
    }
    await onSubmit(formData);
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Configuração de Integração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Marketplace *</Label>
              <Input
                value={formData.marketplace}
                onChange={(e) => setFormData({ ...formData, marketplace: e.target.value })}
                placeholder="Ex: Mercado Livre, Amazon, Magalu"
              />
            </div>
            <div>
              <Label>Nome da Integração</Label>
              <Input
                value={formData.nome_integracao}
                onChange={(e) => setFormData({ ...formData, nome_integracao: e.target.value })}
                placeholder="Ex: ML Produção"
              />
            </div>
          </div>

          <div>
            <Label>Tipo de Integração</Label>
            <Select value={formData.tipo_integracao} onValueChange={(val) => setFormData({ ...formData, tipo_integracao: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="API REST">API REST</SelectItem>
                <SelectItem value="SOAP">SOAP</SelectItem>
                <SelectItem value="GraphQL">GraphQL</SelectItem>
                <SelectItem value="Webhook">Webhook</SelectItem>
                <SelectItem value="FTP">FTP</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>URL Base</Label>
            <Input
              value={formData.url_base}
              onChange={(e) => setFormData({ ...formData, url_base: e.target.value })}
              placeholder="https://api.exemplo.com/v1"
            />
          </div>

          <div>
            <Label>API Key / Token</Label>
            <Input
              type="password"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              placeholder="Insira o token de autenticação"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o propósito desta integração"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Timeout (segundos)</Label>
              <Input
                type="number"
                value={formData.timeout_segundos}
                onChange={(e) => setFormData({ ...formData, timeout_segundos: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Máx. Tentativas Retry</Label>
              <Input
                type="number"
                value={formData.max_tentativas_retry}
                onChange={(e) => setFormData({ ...formData, max_tentativas_retry: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <Label>Integração Ativa</Label>
            <Switch
              checked={formData.ativo}
              onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
            />
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
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting} data-permission="Cadastros.ConfiguracaoIntegracao.salvar">
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
            <Link2 className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">
              {config ? 'Editar Integração' : 'Nova Integração'}
            </h2>
          </div>
          {form}
        </div>
      </div>
    );
  }

  return form;
}