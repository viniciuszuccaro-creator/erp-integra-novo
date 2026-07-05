import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award } from "lucide-react";

/**
 * Sub-componente extraído de RepresentanteFormCompleto.jsx
 * Aba Comissão: tipo, percentual, cashback, simulação.
 */
export default function RepresentanteTabComissao({ formData, setFormData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Tipo de Comissão *</Label>
        <Select value={formData.tipo_comissao} onValueChange={(v) => setFormData({ ...formData, tipo_comissao: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]">
            <SelectItem value="Percentual">📊 Percentual sobre venda</SelectItem><SelectItem value="Valor Fixo por Venda">💵 Valor fixo por venda</SelectItem>
            <SelectItem value="Cashback Percentual">💰 Cashback % (Construtor/Arquiteto)</SelectItem><SelectItem value="Cashback Fixo">🎁 Cashback fixo por venda</SelectItem><SelectItem value="Misto">🔀 Misto (% + fixo)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Status do Contrato</Label>
        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="Ativo">✅ Ativo</SelectItem><SelectItem value="Inativo">❌ Inativo</SelectItem><SelectItem value="Suspenso">⏸️ Suspenso</SelectItem></SelectContent>
        </Select>
      </div>
      {(formData.tipo_comissao === 'Percentual' || formData.tipo_comissao === 'Misto' || formData.tipo_comissao === 'Cashback Percentual') && (
        <div><Label>Percentual de Comissão (%)</Label><Input type="number" step="0.01" min="0" max="100" value={formData.percentual_comissao} onChange={(e) => setFormData({ ...formData, percentual_comissao: parseFloat(e.target.value) || 0 })} /></div>
      )}
      {(formData.tipo_comissao === 'Valor Fixo por Venda' || formData.tipo_comissao === 'Misto' || formData.tipo_comissao === 'Cashback Fixo') && (
        <div><Label>Valor Fixo por Venda (R$)</Label><Input type="number" step="0.01" min="0" value={formData.valor_fixo_comissao} onChange={(e) => setFormData({ ...formData, valor_fixo_comissao: parseFloat(e.target.value) || 0 })} /></div>
      )}
      {formData.tipo_comissao.includes('Cashback') && (
        <div><Label>Cashback Adicional (%)</Label><Input type="number" step="0.01" min="0" max="100" value={formData.percentual_cashback} onChange={(e) => setFormData({ ...formData, percentual_cashback: parseFloat(e.target.value) || 0 })} /><p className="text-xs text-slate-500 mt-1">Cashback cumulativo com comissão</p></div>
      )}
      <div><Label>Limite Mensal de Comissão (R$)</Label><Input type="number" step="0.01" min="0" value={formData.limite_mensal_comissao} onChange={(e) => setFormData({ ...formData, limite_mensal_comissao: parseFloat(e.target.value) || 0 })} placeholder="0 = sem limite" /><p className="text-xs text-slate-500 mt-1">0 = sem limite</p></div>
      <div><Label>Vigência do Contrato - Início</Label><Input type="date" value={formData.data_inicio_contrato} onChange={(e) => setFormData({ ...formData, data_inicio_contrato: e.target.value })} /></div>
      <div><Label>Vigência do Contrato - Fim</Label><Input type="date" value={formData.data_fim_contrato} onChange={(e) => setFormData({ ...formData, data_fim_contrato: e.target.value })} /></div>
      <div className="col-span-2">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2"><Award className="w-4 h-4" />Simulação de Comissão</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[10000, 50000, 100000].map(v => (
                <div key={v}>
                  <p className="text-xs text-slate-600">Venda de R$ {v.toLocaleString('pt-BR')}</p>
                  <p className="text-lg font-bold text-purple-600">R$ {((v * (formData.percentual_comissao || 0) / 100) + (formData.valor_fixo_comissao || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}