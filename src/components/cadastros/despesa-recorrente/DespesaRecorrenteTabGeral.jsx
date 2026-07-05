import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DespesaRecorrenteTabGeral({ formData, setFormData, tiposDespesa, empresas, fornecedores, centrosCusto, planoContas, centrosResultado, formasPagamento }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de Despesa *</Label>
        <Select
          value={formData.tipo_despesa_id}
          onValueChange={(v) => {
            const tipo = tiposDespesa.find(td => td.id === v);
            setFormData({
              ...formData,
              tipo_despesa_id: v,
              tipo_despesa_nome: tipo?.nome || '',
              categoria: tipo?.categoria || '',
              conta_contabil_id: tipo?.conta_contabil_padrao_id || '',
              conta_contabil_nome: tipo?.conta_contabil_padrao_nome || '',
              centro_resultado_id: tipo?.centro_resultado_padrao_id || '',
              centro_resultado_nome: tipo?.centro_resultado_padrao_nome || '',
            });
          }}
          required
        >
          <SelectTrigger><SelectValue placeholder="Selecione um tipo..." /></SelectTrigger>
          <SelectContent>
            {tiposDespesa.map(td => (
              <SelectItem key={td.id} value={td.id}>{td.nome} ({td.categoria})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1">A categoria e contas contábeis serão herdadas do Tipo de Despesa</p>
      </div>

      <div>
        <Label>Descrição da Despesa *</Label>
        <Input value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Ex: Aluguel Loja Centro" required />
      </div>

      <div>
        <Label>Empresa Proprietária *</Label>
        <Select value={formData.empresa_id || ''} onValueChange={(v) => setFormData({ ...formData, empresa_id: v, origem: 'empresa' })} required={!formData.rateio_automatico}>
          <SelectTrigger><SelectValue placeholder="Selecione a empresa..." /></SelectTrigger>
          <SelectContent>
            {empresas.map(emp => (<SelectItem key={emp.id} value={emp.id}>{emp.nome_fantasia || emp.razao_social}</SelectItem>))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1">Se usar rateio automático, selecione a empresa-mãe do grupo</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fornecedor</Label>
          <Select value={formData.fornecedor_id || ''} onValueChange={(v) => { const f = fornecedores.find(f => f.id === v); setFormData({ ...formData, fornecedor_id: v, fornecedor_nome: f?.nome || '' }); }}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{fornecedores.map(f => (<SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Centro de Custo</Label>
          <Select value={formData.centro_custo_id || ''} onValueChange={(v) => { const cc = centrosCusto.find(c => c.id === v); setFormData({ ...formData, centro_custo_id: v, centro_custo_nome: cc?.descricao || '' }); }}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{centrosCusto.map(cc => (<SelectItem key={cc.id} value={cc.id}>{cc.descricao}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Conta Contábil (Opcional)</Label>
          <Select value={formData.conta_contabil_id || ''} onValueChange={(v) => { const c = planoContas.find(pc => pc.id === v); setFormData({ ...formData, conta_contabil_id: v, conta_contabil_nome: c?.nome || '' }); }}>
            <SelectTrigger><SelectValue placeholder="Herda do Tipo ou selecione..." /></SelectTrigger>
            <SelectContent>{planoContas.map(pc => (<SelectItem key={pc.id} value={pc.id}>{pc.codigo} - {pc.nome}</SelectItem>))}</SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">Deixe vazio para usar a conta contábil padrão do Tipo de Despesa</p>
        </div>
        <div>
          <Label>Centro de Resultado (Opcional)</Label>
          <Select value={formData.centro_resultado_id || ''} onValueChange={(v) => { const cr = centrosResultado.find(c => c.id === v); setFormData({ ...formData, centro_resultado_id: v, centro_resultado_nome: cr?.nome || '' }); }}>
            <SelectTrigger><SelectValue placeholder="Herda do Tipo ou selecione..." /></SelectTrigger>
            <SelectContent>{centrosResultado.map(cr => (<SelectItem key={cr.id} value={cr.id}>{cr.codigo} - {cr.nome}</SelectItem>))}</SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">Deixe vazio para usar o centro de resultado padrão do Tipo de Despesa</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Valor Base *</Label>
          <Input type="number" step="0.01" value={formData.valor_base} onChange={(e) => setFormData({ ...formData, valor_base: parseFloat(e.target.value) || 0 })} required />
        </div>
        <div>
          <Label>Forma de Pagamento Padrão</Label>
          <Select value={formData.forma_pagamento_id || ''} onValueChange={(v) => { const f = formasPagamento.find(f => f.id === v); setFormData({ ...formData, forma_pagamento_id: v, forma_pagamento_nome: f?.descricao || '' }); }}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{formasPagamento.map(f => (<SelectItem key={f.id} value={f.id}>{f.descricao}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}