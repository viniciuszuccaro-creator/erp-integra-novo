import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";

export default function TabelaPrecoForm({ tabela, onSubmit, isSubmitting }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [formData, setFormData] = useState(tabela || {
    nome: '',
    descricao: '',
    tipo: 'Padrão',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: '',
    ativo: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.tipo || !formData.data_inicio) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
    const erroUnicidade = await checkGlobalUniqueness('TabelaPreco', formData, { groupId, empresaId: empresaAtual?.id, currentId: tabela?.id, isEdit: !!tabela?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            <SelectItem value="Especial">Especial</SelectItem>
            <SelectItem value="Promocional">Promocional</SelectItem>
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
        <Button type="submit" data-permission="Comercial.TabelaPreco.salvar" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {tabela ? 'Atualizar' : 'Criar Tabela'}
        </Button>
      </div>
    </form>
  );
}