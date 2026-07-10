import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Users } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { checkGlobalUniqueness } from '@/components/lib/sanitizeOnWrite';
import { toast } from "sonner";

export default function SegmentoClienteForm({ segmento, segmentoCliente, item, data, initialData, defaultValues, onSubmit, onSave, onClose, windowMode = false }) {
  const dadosIniciais = item || data || initialData || defaultValues || segmentoCliente || segmento;
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || dadosIniciais?.group_id || null;
  const [formData, setFormData] = useState(dadosIniciais || {
    nome_segmento: '',
    tipo_segmento: 'Comercial',
    ativo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, group_id: groupId || formData.group_id, nome: formData.nome_segmento || formData.nome || '' };
    const erroUnicidade = await checkGlobalUniqueness('SegmentoCliente', payload, { groupId, empresaId: empresaAtual?.id, currentId: dadosIniciais?.id, isEdit: !!dadosIniciais?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    if (onSubmit) {
      onSubmit(payload);
    } else {
      if (onSave) onSave();
      if (onClose) onClose();
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label>Nome do Segmento *</Label>
        <Input
          value={formData.nome_segmento}
          onChange={(e) => setFormData({ ...formData, nome_segmento: e.target.value })}
          placeholder="Metalúrgicas, Construtoras, Varejo..."
          required
        />
      </div>

      <div>
        <Label>Tipo de Segmento</Label>
        <Select value={formData.tipo_segmento} onValueChange={(v) => setFormData({ ...formData, tipo_segmento: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Industrial">Industrial</SelectItem>
            <SelectItem value="Comercial">Comercial</SelectItem>
            <SelectItem value="Construção Civil">Construção Civil</SelectItem>
            <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
            <SelectItem value="Governo">Governo</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao || ''}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
        <Label className="font-semibold">Segmento Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
        />
      </div>

      <Button type="submit" data-permission="Cadastros.Segmento.salvar" className="w-full bg-blue-600 hover:bg-blue-700">
        {dadosIniciais ? 'Atualizar Segmento' : 'Criar Segmento'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {dadosIniciais ? 'Editar Segmento' : 'Novo Segmento de Cliente'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}