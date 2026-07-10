import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Ruler } from 'lucide-react';
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";
import { toast } from "sonner";

export default function UnidadeMedidaForm({ unidade, unidadeMedida, item, data, initialData, defaultValues, onSubmit, windowMode = false }) {
  const dadosIniciais = item || data || initialData || defaultValues || unidadeMedida || unidade;
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contextoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || dadosIniciais?.group_id || null;
  const contextoValido = Boolean(empresaAtual?.id || groupId || dadosIniciais?.empresa_id || dadosIniciais?.group_id);
  const podeCriar = hasPermission?.("Cadastros.UnidadeMedida.criar") || hasPermission?.("Cadastros.Produto.criar");
  const podeEditar = hasPermission?.("Cadastros.UnidadeMedida.editar") || hasPermission?.("Cadastros.Produto.editar");
  const podeSalvar = dadosIniciais?.id ? podeEditar : podeCriar;
  const [formData, setFormData] = useState(dadosIniciais || {
    sigla: '',
    nome_completo: '',
    tipo_grandeza: 'Unidade',
    permite_conversao: true,
    fator_conversao_para_base: 1,
    usa_em_estoque: true,
    usa_em_compras: true,
    usa_em_vendas: true,
    ativo: true
  });

  const prevIdRef = useRef(dadosIniciais?.id);
  useEffect(() => {
    if (dadosIniciais?.id && dadosIniciais.id !== prevIdRef.current) {
      prevIdRef.current = dadosIniciais.id;
      setFormData({ ...dadosIniciais });
    }
  }, [dadosIniciais?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contextoValido) {
      toast.error('Selecione um grupo ou empresa antes de salvar.');
      return;
    }
    if (!podeSalvar) {
      toast.error('Sem permissão para salvar unidade de medida.');
      return;
    }
    const payload = {
      ...formData,
      group_id: groupId || formData.group_id,
      empresa_id: contextoAtual === "empresa" ? empresaAtual?.id : formData.empresa_id
    };
    const erroUnicidade = await checkGlobalUniqueness('UnidadeMedida', payload, { groupId, empresaId: empresaAtual?.id, currentId: dadosIniciais?.id, isEdit: !!dadosIniciais?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    try { await onSubmit(payload); }
    catch (e) { toast.error(e?.message || 'Erro ao salvar unidade de medida.'); }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Sigla *</Label>
          <Input
            value={formData.sigla}
            onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
            placeholder="KG, MT, UN..."
            required
          />
        </div>
        <div>
          <Label>Nome Completo *</Label>
          <Input
            value={formData.nome_completo}
            onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
            placeholder="Quilograma, Metro, Unidade..."
            required
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Grandeza</Label>
        <Select value={formData.tipo_grandeza} onValueChange={(v) => setFormData({ ...formData, tipo_grandeza: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Massa">Massa (kg, ton, g)</SelectItem>
            <SelectItem value="Comprimento">Comprimento (m, cm, km)</SelectItem>
            <SelectItem value="Volume">Volume (L, m³)</SelectItem>
            <SelectItem value="Área">Área (m², cm²)</SelectItem>
            <SelectItem value="Unidade">Unidade (un, pç)</SelectItem>
            <SelectItem value="Tempo">Tempo (h, min)</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Unidade Base para Conversão</Label>
          <Input
            value={formData.unidade_base_conversao || ''}
            onChange={(e) => setFormData({ ...formData, unidade_base_conversao: e.target.value })}
            placeholder="KG, MT..."
          />
        </div>
        <div>
          <Label>Fator de Conversão</Label>
          <Input
            type="number"
            step="0.0001"
            value={formData.fator_conversao_para_base}
            onChange={(e) => setFormData({ ...formData, fator_conversao_para_base: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Usa em Estoque</Label>
          <Switch
            checked={formData.usa_em_estoque}
            disabled={!podeSalvar}
            data-permission="Cadastros.UnidadeMedida.editar"
            data-sensitive="true"
            onCheckedChange={(v) => setFormData({ ...formData, usa_em_estoque: v })}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Usa em Compras</Label>
          <Switch
            checked={formData.usa_em_compras}
            disabled={!podeSalvar}
            data-permission="Cadastros.UnidadeMedida.editar"
            data-sensitive="true"
            onCheckedChange={(v) => setFormData({ ...formData, usa_em_compras: v })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded">
          <Label>Usa em Vendas</Label>
          <Switch
            checked={formData.usa_em_vendas}
            disabled={!podeSalvar}
            data-permission="Cadastros.UnidadeMedida.editar"
            data-sensitive="true"
            onCheckedChange={(v) => setFormData({ ...formData, usa_em_vendas: v })}
          />
        </div>
        <div className="flex items-center justify-between p-3 border rounded bg-slate-50">
          <Label className="font-semibold">Ativo</Label>
          <Switch
            checked={formData.ativo}
            disabled={!podeSalvar}
            data-permission="Cadastros.UnidadeMedida.alterarStatus"
            data-sensitive="true"
            onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={!contextoValido || !podeSalvar}
        data-permission="Cadastros.UnidadeMedida.salvar"
        data-sensitive="true"
      >
        {dadosIniciais ? 'Atualizar Unidade' : 'Criar Unidade de Medida'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-indigo-50 to-indigo-100">
          <Ruler className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {dadosIniciais ? 'Editar Unidade' : 'Nova Unidade de Medida'}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }

  return content;
}