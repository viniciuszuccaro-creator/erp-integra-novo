import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { checkGlobalUniqueness } from '@/components/lib/sanitizeOnWrite';
import { toast } from "sonner";

export default function PlanoContasForm({ conta, item, data, onSubmit, onSave, onClose, windowMode = false }) {
  const dadosIniciais = item || data || conta;
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || dadosIniciais?.group_id || null;
  const { canCreate, canEdit } = usePermissions();
  const podeCriar = canCreate("Cadastros", "PlanoDeContas") || canCreate("Financeiro", "PlanoDeContas") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "PlanoDeContas") || canEdit("Financeiro", "PlanoDeContas") || canEdit("Cadastros", null);
  const [formData, setFormData] = useState(dadosIniciais || {
    codigo_conta: '',
    nome_conta: '',
    tipo_conta: 'Despesa',
    natureza: 'Devedora',
    eh_analitica: true,
    eh_sintetica: false,
    nivel_hierarquico: 1,
    aceita_lancamento_manual: true,
    usa_em_sped: false,
    usa_apenas_gerencial: false,
    ativo: true
  });

  const prevIdRef = React.useRef(dadosIniciais?.id);
  useEffect(() => {
    if (dadosIniciais?.id && dadosIniciais.id !== prevIdRef.current) {
      prevIdRef.current = dadosIniciais.id;
      setFormData({ ...dadosIniciais });
    }
  }, [dadosIniciais?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dadosIniciais?.id && !podeEditar) {
      toast.error("Sem permissão para editar plano de contas.");
      return;
    }
    if (!dadosIniciais?.id && !podeCriar) {
      toast.error("Sem permissão para criar plano de contas.");
      return;
    }
    const payload = {
      ...formData,
      group_id: groupId || formData.group_id,
      nome: formData.nome_conta || formData.nome || '',
      codigo: formData.codigo_conta || formData.codigo || '',
      descricao: formData.descricao || formData.nome_conta || '',
    };
    const erroUnicidade = await checkGlobalUniqueness('PlanoDeContas', payload, { groupId, empresaId: empresaAtual?.id, currentId: dadosIniciais?.id, isEdit: !!dadosIniciais?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    if (onSubmit) {
      try { await onSubmit(payload); }
      catch (e) { toast.error(e?.message || 'Erro ao salvar plano de contas.'); }
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código da Conta *</Label>
          <Input
            value={formData.codigo_conta}
            onChange={(e) => setFormData({ ...formData, codigo_conta: e.target.value })}
            placeholder="1.1.1.01"
            required
          />
        </div>
        <div>
          <Label>Nome da Conta *</Label>
          <Input
            value={formData.nome_conta}
            onChange={(e) => setFormData({ ...formData, nome_conta: e.target.value })}
            placeholder="Caixa Geral"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Tipo de Conta *</Label>
          <Select value={formData.tipo_conta} onValueChange={(v) => setFormData({ ...formData, tipo_conta: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Despesa">Despesa</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Passivo">Passivo</SelectItem>
              <SelectItem value="Patrimônio Líquido">Patrimônio Líquido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Natureza</Label>
          <Select value={formData.natureza} onValueChange={(v) => setFormData({ ...formData, natureza: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Devedora">Devedora</SelectItem>
              <SelectItem value="Credora">Credora</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Nível Hierárquico</Label>
          <Input type="number" value={formData.nivel_hierarquico}
            onChange={(e) => setFormData({ ...formData, nivel_hierarquico: parseInt(e.target.value) || 1 })} min="1" />
        </div>
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea value={formData.descricao || ''} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Conta Analítica</Label>
          <Switch checked={!!formData.eh_analitica} onCheckedChange={(v) => setFormData({ ...formData, eh_analitica: v })} />
        </div>
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Conta Sintética</Label>
          <Switch checked={!!formData.eh_sintetica} onCheckedChange={(v) => setFormData({ ...formData, eh_sintetica: v })} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Lançamento Manual</Label>
          <Switch checked={!!formData.aceita_lancamento_manual} onCheckedChange={(v) => setFormData({ ...formData, aceita_lancamento_manual: v })} />
        </div>
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Usa em SPED</Label>
          <Switch checked={!!formData.usa_em_sped} onCheckedChange={(v) => setFormData({ ...formData, usa_em_sped: v })} />
        </div>
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Apenas Gerencial</Label>
          <Switch checked={!!formData.usa_apenas_gerencial} onCheckedChange={(v) => setFormData({ ...formData, usa_apenas_gerencial: v })} />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
        <Label className="font-semibold">Conta Ativa</Label>
        <Switch checked={!!formData.ativo} onCheckedChange={(v) => setFormData({ ...formData, ativo: v })} />
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={dadosIniciais?.id ? !podeEditar : !podeCriar}
        data-permission="Cadastros.PlanoDeContas.salvar"
        data-sensitive
      >
        {dadosIniciais ? 'Atualizar Conta' : 'Criar Conta'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-green-50 to-green-100">
          <FileText className="w-6 h-6 text-green-600" />
          <h2 className="text-lg font-bold text-slate-900">{dadosIniciais ? 'Editar Conta Contábil' : 'Nova Conta Contábil'}</h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }
  return content;
}