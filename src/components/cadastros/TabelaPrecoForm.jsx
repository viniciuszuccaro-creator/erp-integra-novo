import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";

export default function TabelaPrecoForm({ tabela, onSubmit, isSubmitting, codigo }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [formData, setFormData] = useState(tabela || {
    nome: '',
    descricao: '',
    tipo: 'Padrão',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    ativo: true,
    codigo: codigo || '',
  });
  const [localSaving, setLocalSaving] = useState(false);

  // Sincroniza codigo auto-gerado do visualizador para novos registros
  useEffect(() => {
    if (!tabela && codigo && !formData.codigo) {
      setFormData(prev => ({ ...prev, codigo }));
    }
  }, [codigo, tabela]); // eslint-disable-line

  const saving = localSaving || isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // guard contra duplo-clique
    if (!formData.nome || !formData.tipo || !formData.data_inicio) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
    const erroUnicidade = await checkGlobalUniqueness('TabelaPreco', formData, { groupId, empresaId: empresaAtual?.id, currentId: tabela?.id, isEdit: !!tabela?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    setLocalSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      toast.error(err?.message || 'Erro ao salvar tabela.');
    } finally {
      setLocalSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Código</Label>
        <Input
          value={formData.codigo || ''}
          onChange={(e) => setFormData({...formData, codigo: e.target.value})}
          placeholder="Auto-gerado (ex: 001)"
          readOnly={!tabela}
          className={tabela ? '' : 'bg-slate-50 text-slate-500'}
        />
        {!tabela && <p className="text-xs text-slate-400 mt-1">Gerado automaticamente</p>}
      </div>

      <div>
        <Label>Nome da Tabela *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Atacado SP, Varejo Nacional"
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Input
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Descrição interna"
        />
      </div>

      <div>
        <Label>Tipo de Tabela *</Label>
        <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Padrão">Padrão</SelectItem>
            <SelectItem value="Atacado">Atacado</SelectItem>
            <SelectItem value="Varejo">Varejo</SelectItem>
            <SelectItem value="Obra">Obra</SelectItem>
            <SelectItem value="Marketplace">Marketplace</SelectItem>
            <SelectItem value="Promocional">Promocional</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data Início *</Label>
          <Input
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
          />
        </div>

        <div>
          <Label>Data Fim</Label>
          <Input
            type="date"
            value={formData.data_fim}
            onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Tabela Ativa</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" data-permission="Comercial.TabelaPreco.salvar" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {tabela ? 'Atualizar Tabela' : 'Criar Tabela'}
        </Button>
      </div>
    </form>
  );
}