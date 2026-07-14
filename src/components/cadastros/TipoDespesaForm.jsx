import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Receipt } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { checkGlobalUniqueness } from '@/components/lib/sanitizeOnWrite';
import useRLSQuery from "@/components/lib/useRLSQuery";

export default function TipoDespesaForm({ tipo, tipoDespesa, item, data, onSubmit, onSave, onClose, windowMode = false }) {
  const dadosIniciais = item || data || tipoDespesa || tipo;
  const { canCreate, canEdit } = usePermissions();
  const podeCriar = canCreate("Cadastros", "TipoDespesa") || canCreate("Financeiro", "TipoDespesa") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "TipoDespesa") || canEdit("Financeiro", "TipoDespesa") || canEdit("Cadastros", null);
  const [formData, setFormData] = useState(dadosIniciais || {
    codigo: '', nome: '', categoria: 'Operacional',
    conta_contabil_padrao_id: '', conta_contabil_padrao_nome: '',
    centro_resultado_padrao_id: '', centro_resultado_padrao_nome: '',
    exige_aprovacao: false, limite_aprovacao_automatica: 0,
    pode_ser_recorrente: false, ativo: true
  });

  // Garante sincronização quando o mesmo componente é reutilizado (ex: abrir outro registro sem desmontar)
  const prevIdRef = React.useRef(dadosIniciais?.id);
  useEffect(() => {
    if (dadosIniciais?.id && dadosIniciais.id !== prevIdRef.current) {
      prevIdRef.current = dadosIniciais.id;
      setFormData({ ...dadosIniciais });
    }
  }, [dadosIniciais?.id]);

  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: contasContabeis = [] } = useRLSQuery('PlanoDeContas', {}, 'codigo', 999, { staleTime: 300000, enabled: !!contexto });
  const { data: centrosResultado = [] } = useRLSQuery('CentroResultado', {}, 'codigo', 999, { staleTime: 300000, enabled: !!contexto });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dadosIniciais?.id && !podeEditar) {
      toast.error("Sem permissão para editar tipos de despesa.");
      return;
    }
    if (!dadosIniciais?.id && !podeCriar) {
      toast.error("Sem permissão para criar tipos de despesa.");
      return;
    }
    const groupId = grupoAtual?.id || empresaAtual?.group_id || dadosIniciais?.group_id || null;
    const payload = { ...formData, group_id: groupId || formData.group_id };
    const erroUnicidade = await checkGlobalUniqueness('TipoDespesa', payload, { groupId, empresaId: empresaAtual?.id, currentId: dadosIniciais?.id, isEdit: !!dadosIniciais?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    if (onSubmit) {
      try { await onSubmit(payload); }
      catch (e) { toast.error(e?.message || 'Erro ao salvar tipo de despesa.'); }
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className={windowMode ? "space-y-4 p-4 h-full overflow-auto" : "space-y-4 p-4"}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} placeholder="DESP001" />
        </div>
        <div>
          <Label>Nome *</Label>
          <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Energia Elétrica" required />
        </div>
      </div>

      <div>
        <Label>Categoria</Label>
        <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Fixa','Variável','Operacional','Administrativa','Comercial','Fiscal','Investimento','Utilidades','Outros'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Conta Contábil Padrão</Label>
        <Select value={formData.conta_contabil_padrao_id || ''} onValueChange={(v) => {
          const conta = contasContabeis.find(c => c.id === v);
          setFormData({ ...formData, conta_contabil_padrao_id: v, conta_contabil_padrao_nome: conta?.nome || '' });
        }}>
          <SelectTrigger><SelectValue placeholder="Selecione a conta..." /></SelectTrigger>
          <SelectContent>
            {contasContabeis.map(c => <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Centro de Resultado Padrão</Label>
        <Select value={formData.centro_resultado_padrao_id || ''} onValueChange={(v) => {
          const centro = centrosResultado.find(c => c.id === v);
          setFormData({ ...formData, centro_resultado_padrao_id: v, centro_resultado_padrao_nome: centro?.nome || '' });
        }}>
          <SelectTrigger><SelectValue placeholder="Selecione o centro..." /></SelectTrigger>
          <SelectContent>
            {centrosResultado.map(c => <SelectItem key={c.id} value={c.id}>{c.codigo} - {c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea value={formData.observacoes || ''} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 border rounded-sm bg-slate-50">
          <Label>Exige Aprovação</Label>
          <Switch checked={!!formData.exige_aprovacao} onCheckedChange={(v) => setFormData({ ...formData, exige_aprovacao: v })} />
        </div>
        {formData.exige_aprovacao && (
          <div>
            <Label>Limite para Aprovação Automática (R$)</Label>
            <Input type="number" step="0.01" value={formData.limite_aprovacao_automatica || 0}
              onChange={(e) => setFormData({ ...formData, limite_aprovacao_automatica: parseFloat(e.target.value) || 0 })} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-3 border rounded-sm bg-slate-50">
        <Label>Pode ser Recorrente</Label>
        <Switch checked={!!formData.pode_ser_recorrente} onCheckedChange={(v) => setFormData({ ...formData, pode_ser_recorrente: v })} />
      </div>

      <div className="flex items-center justify-between p-3 border rounded-sm bg-slate-50">
        <Label className="font-semibold">Tipo Ativo</Label>
        <Switch checked={!!formData.ativo} onCheckedChange={(v) => setFormData({ ...formData, ativo: v })} />
      </div>

      <Button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700"
        disabled={dadosIniciais?.id ? !podeEditar : !podeCriar}
      >
        {dadosIniciais ? 'Atualizar Tipo' : 'Criar Tipo de Despesa'}
      </Button>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-purple-50 to-purple-100">
          <Receipt className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-bold text-slate-900">{dadosIniciais ? 'Editar Tipo de Despesa' : 'Novo Tipo de Despesa'}</h2>
        </div>
        <div className="flex-1 overflow-auto">{content}</div>
      </div>
    );
  }
  return content;
}