import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Webhook as WebhookIcon } from 'lucide-react';
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";
import { toast } from "sonner";

export default function WebhookForm({ webhook, onSubmit, windowMode = false }) {
  const dadosIniciais = webhook;
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [formData, setFormData] = useState(dadosIniciais || {
    nome_webhook: '',
    evento_gatilho: 'pedido_aprovado',
    url_destino: '',
    metodo_http: 'POST',
    formato_payload: 'JSON',
    ativo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, nome: formData.nome_webhook || formData.nome || '' };
    const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
    const erroUnicidade = await checkGlobalUniqueness('Webhook', payload, { groupId, empresaId: empresaAtual?.id, currentId: dadosIniciais?.id, isEdit: !!dadosIniciais?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    try { await onSubmit(payload); }
    catch (e) { toast.error(e?.message || 'Erro ao salvar webhook.'); }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label>Nome do Webhook *</Label>
        <Input
          value={formData.nome_webhook}
          onChange={(e) => setFormData({ ...formData, nome_webhook: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Evento Gatilho *</Label>
          <Select value={formData.evento_gatilho} onValueChange={(v) => setFormData({ ...formData, evento_gatilho: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pagamento_recebido">Pagamento Recebido</SelectItem>
              <SelectItem value="pedido_aprovado">Pedido Aprovado</SelectItem>
              <SelectItem value="pedido_faturado">Pedido Faturado</SelectItem>
              <SelectItem value="entrega_enviada">Entrega Enviada</SelectItem>
              <SelectItem value="entrega_concluida">Entrega Concluída</SelectItem>
              <SelectItem value="nfe_autorizada">NF-e Autorizada</SelectItem>
              <SelectItem value="estoque_baixo">Estoque Baixo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Método HTTP</Label>
          <Select value={formData.metodo_http} onValueChange={(v) => setFormData({ ...formData, metodo_http: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>URL de Destino *</Label>
        <Input
          value={formData.url_destino}
          onChange={(e) => setFormData({ ...formData, url_destino: e.target.value })}
          placeholder="https://api.example.com/webhook"
          required
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
        <Label className="font-semibold">Webhook Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
        />
      </div>

      <Button type="submit" data-permission="Sistema.Webhook.salvar" className="w-full bg-indigo-600 hover:bg-indigo-700">
        {dadosIniciais ? 'Atualizar' : 'Criar Webhook'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-indigo-50 to-indigo-100">
          <WebhookIcon className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {dadosIniciais ? 'Editar Webhook' : 'Novo Webhook'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}