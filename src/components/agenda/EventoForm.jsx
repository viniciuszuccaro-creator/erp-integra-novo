import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";
import { Save, Calendar, Video, Bell, Mail, MessageSquare } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";

/**
 * V21.1.2: Evento Form - Adaptado para Window Mode
 */
export default function EventoForm({ evento, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(evento || {
    titulo: '',
    descricao: '',
    tipo: 'Reunião',
    data_inicio: '',
    hora_inicio: '',
    data_fim: '',
    hora_fim: '',
    dia_inteiro: false,
    local: '',
    participantes: [],
    cliente_nome: '',
    pedido_id: '',
    status: 'Agendado',
    prioridade: 'Normal',
    lembrete: true,
    tempo_lembrete: 30,
    link_reuniao: '',
    observacoes: '',
    cor: '#3b82f6',
    notificar_email: false,
    notificar_whatsapp: false
  });

  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();

  const { data: clientes = [] } = useRLSQuery('Cliente', {}, '-created_date', 9999);
  const { data: pedidos = [] } = useRLSQuery('Pedido', {}, '-created_date', 9999);

  const schema = z.object({
    titulo: z.string().min(1, 'Título é obrigatório'),
    data_inicio: z.string().min(4, 'Data início é obrigatória'),
    data_fim: z.string().min(4, 'Data fim é obrigatória'),
  }).refine((d) => !d.data_inicio || !d.data_fim || d.data_fim >= d.data_inicio, {
    message: 'Data fim deve ser maior ou igual à data início',
  });

  const handleSubmit = async () => {
    onSubmit(formData);
  };

  const coresDisponiveis = [
    { cor: '#3b82f6', nome: 'Azul' },
    { cor: '#10b981', nome: 'Verde' },
    { cor: '#f59e0b', nome: 'Laranja' },
    { cor: '#ef4444', nome: 'Vermelho' },
    { cor: '#8b5cf6', nome: 'Roxo' },
    { cor: '#ec4899', nome: 'Rosa' },
    { cor: '#06b6d4', nome: 'Ciano' },
    { cor: '#64748b', nome: 'Cinza' }
  ];

  const content = (
    <FormWrapper schema={schema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Dados do Evento
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reunião">Reunião</SelectItem>
                  <SelectItem value="Ligação">Ligação</SelectItem>
                  <SelectItem value="Visita">Visita</SelectItem>
                  <SelectItem value="Tarefa">Tarefa</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Lembrete">Lembrete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(v) => setFormData({ ...formData, prioridade: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Início *</Label>
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Hora Início</Label>
              <Input
                type="time"
                value={formData.hora_inicio}
                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                disabled={formData.dia_inteiro}
              />
            </div>

            <div>
              <Label>Data Fim *</Label>
              <Input
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Hora Fim</Label>
              <Input
                type="time"
                value={formData.hora_fim}
                onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                disabled={formData.dia_inteiro}
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Checkbox
                checked={formData.dia_inteiro}
                onCheckedChange={(v) => setFormData({ ...formData, dia_inteiro: v })}
                id="dia_inteiro"
              />
              <Label htmlFor="dia_inteiro" className="font-normal cursor-pointer">
                Dia inteiro
              </Label>
            </div>

            <div>
              <Label>Cliente/Relacionado</Label>
              <Input
                value={formData.cliente_nome}
                onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                list="clientes-list"
              />
              <datalist id="clientes-list">
                {clientes.map(c => (
                  <option key={c.id} value={c.nome || c.razao_social} />
                ))}
              </datalist>
            </div>

            <div>
              <Label>Pedido Relacionado</Label>
              <Select
                value={formData.pedido_id}
                onValueChange={(v) => setFormData({ ...formData, pedido_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Nenhum</SelectItem>
                  {pedidos.slice(0, 20).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.numero_pedido} - {p.cliente_nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Local</Label>
              <Input
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                placeholder="Endereço ou sala"
              />
            </div>

            <div>
              <Label>Link da Reunião</Label>
              <Input
                value={formData.link_reuniao}
                onChange={(e) => setFormData({ ...formData, link_reuniao: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
            </div>

            <div>
              <Label>Cor no Calendário</Label>
              <div className="flex gap-2 mt-2">
                {coresDisponiveis.map(({ cor, nome }) => (
                  <button
                    key={cor}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.cor === cor ? 'border-slate-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: cor }}
                    onClick={() => setFormData({ ...formData, cor })}
                    title={nome}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Confirmado">Confirmado</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Adiado">Adiado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-3 border-t pt-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Lembretes e Notificações
              </h4>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.lembrete}
                  onCheckedChange={(v) => setFormData({ ...formData, lembrete: v })}
                  id="lembrete"
                />
                <Label htmlFor="lembrete" className="font-normal cursor-pointer">
                  Ativar lembrete automático
                </Label>
              </div>

              {formData.lembrete && (
                <div>
                  <Label>Lembrar com (minutos de antecedência)</Label>
                  <Input
                    type="number"
                    value={formData.tempo_lembrete}
                    onChange={(e) => setFormData({ ...formData, tempo_lembrete: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.notificar_email}
                  onCheckedChange={(v) => setFormData({ ...formData, notificar_email: v })}
                  id="notificar_email"
                />
                <Label htmlFor="notificar_email" className="font-normal cursor-pointer flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar lembrete por e-mail
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.notificar_whatsapp}
                  onCheckedChange={(v) => setFormData({ ...formData, notificar_whatsapp: v })}
                  id="notificar_whatsapp"
                />
                <Label htmlFor="notificar_whatsapp" className="font-normal cursor-pointer flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Enviar lembrete por WhatsApp
                </Label>
              </div>
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {evento ? 'Atualizar' : 'Criar'} Evento
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}