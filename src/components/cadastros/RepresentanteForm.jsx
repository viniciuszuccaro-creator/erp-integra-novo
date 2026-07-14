import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function RepresentanteForm({ representante, onSubmit, isSubmitting, windowMode = false }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { canCreate, canEdit } = usePermissions();
  const podeSalvar = representante?.id ? (canEdit("Cadastros", "Representante") || canEdit("Cadastros", null)) : (canCreate("Cadastros", "Representante") || canCreate("Cadastros", null));
  const [formData, setFormData] = useState(representante || {
    nome: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    whatsapp: '',
    comissao_percentual: 0,
    tipo_contrato: 'Autônomo',
    data_contratacao: '',
    ativo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) {
      toast.error('Preencha o nome do representante');
      return;
    }
    if (!podeSalvar) {
      toast.error('Sem permissão para salvar representante.');
      return;
    }
    const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
    const erroUnicidade = await checkGlobalUniqueness('Representante', formData, { groupId, empresaId: empresaAtual?.id, currentId: representante?.id, isEdit: !!representante?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    try { await onSubmit(formData); }
    catch (e) { toast.error(e?.message || 'Erro ao salvar representante.'); }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Nome do representante"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CPF/CNPJ</Label>
          <Input
            value={formData.cpf_cnpj}
            onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
          />
        </div>
        <div>
          <Label>Tipo de Contrato</Label>
          <Select value={formData.tipo_contrato} onValueChange={(v) => setFormData({...formData, tipo_contrato: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PJ">PJ - Pessoa Jurídica</SelectItem>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="Autônomo">Autônomo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>E-mail</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <Label>WhatsApp</Label>
          <Input
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Comissão Padrão (%)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.comissao_percentual}
          onChange={(e) => setFormData({...formData, comissao_percentual: parseFloat(e.target.value)})}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Representante Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting || !podeSalvar}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {representante ? 'Atualizar' : 'Criar Representante'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            {representante ? 'Editar Representante' : 'Novo Representante'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}