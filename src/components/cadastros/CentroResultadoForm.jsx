import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Target } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { checkGlobalUniqueness } from '@/components/lib/sanitizeOnWrite';
import { toast } from "sonner";

export default function CentroResultadoForm({ centro, centroResultado, item, data, onSubmit, onSave, onClose, windowMode = false }) {
  const dadosIniciais = item || data || centroResultado || centro;
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || dadosIniciais?.group_id || null;
  const { canCreate, canEdit } = usePermissions();
  const podeCriar = canCreate("Cadastros", "CentroResultado") || canCreate("Financeiro", "CentroResultado") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "CentroResultado") || canEdit("Financeiro", "CentroResultado") || canEdit("Cadastros", null);
  const [formData, setFormData] = useState(dadosIniciais || {
    codigo: '', nome: '', descricao: '', ativo: true
  });

  useEffect(() => {
    if (dadosIniciais?.id) setFormData({ ...dadosIniciais });
  }, [dadosIniciais?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dadosIniciais?.id && !podeEditar) {
      toast.error("Sem permissão para editar centros de resultado.");
      return;
    }
    if (!dadosIniciais?.id && !podeCriar) {
      toast.error("Sem permissão para criar centros de resultado.");
      return;
    }
    const payload = { ...formData, group_id: groupId || formData.group_id };
    const erroUnicidade = await checkGlobalUniqueness('CentroResultado', payload, { groupId, empresaId: empresaAtual?.id, currentId: dadosIniciais?.id, isEdit: !!dadosIniciais?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    if (onSubmit) {
      try { await onSubmit(payload); }
      catch (e) { toast.error(e?.message || 'Erro ao salvar centro de resultado.'); }
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código *</Label>
          <Input value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} required />
        </div>
        <div>
          <Label>Nome *</Label>
          <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea value={formData.descricao || ''} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={2} />
      </div>

      <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
        <Label className="font-semibold">Centro Ativo</Label>
        <Switch checked={!!formData.ativo} onCheckedChange={(v) => setFormData({ ...formData, ativo: v })} />
      </div>

      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700"
        disabled={dadosIniciais?.id ? !podeEditar : !podeCriar}
      >
        {dadosIniciais ? 'Atualizar' : 'Criar Centro de Resultado'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-teal-50 to-teal-100">
          <Target className="w-6 h-6 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900">{dadosIniciais ? 'Editar Centro' : 'Novo Centro de Resultado'}</h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }
  return content;
}