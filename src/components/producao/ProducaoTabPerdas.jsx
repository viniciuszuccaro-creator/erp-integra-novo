import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, DollarSign, Clock, AlertTriangle } from "lucide-react";

export default function ProducaoTabPerdas({ formData, setFormData, isDisabled }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center gap-2"><TrendingDown className="w-5 h-5 text-orange-600" />Perdas de Material</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="perda_aco">Perda de Aço (%)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input id="perda_aco" type="number" step="0.1" min="0" max="100" value={formData.perda_aco_percentual}
                  onChange={(e) => setFormData({ ...formData, perda_aco_percentual: parseFloat(e.target.value) || 0 })} disabled={isDisabled} className="text-lg font-semibold" />
                <Badge className="bg-orange-600 text-lg px-3 py-1">%</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-2">Percentual de perda considerado no cálculo de aço CA-50</p>
            </div>
            <div>
              <Label htmlFor="perda_arame">Perda de Arame Recozido (%)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input id="perda_arame" type="number" step="0.1" min="0" max="100" value={formData.perda_arame_percentual}
                  onChange={(e) => setFormData({ ...formData, perda_arame_percentual: parseFloat(e.target.value) || 0 })} disabled={isDisabled} className="text-lg font-semibold" />
                <Badge className="bg-red-600 text-lg px-3 py-1">%</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-2">Percentual de perda considerado no cálculo de arame</p>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-yellow-600" /><p className="font-semibold text-yellow-900">Importante</p></div>
            <p className="text-sm text-yellow-800">A perda é aplicada automaticamente em todos os cálculos de orçamento. Valores típicos: Aço 3-7%, Arame 8-12%.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" />Preços de Materiais</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="preco_aco">Preço do Aço (R$/kg)</Label>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-lg font-semibold text-slate-600">R$</span>
                <Input id="preco_aco" type="number" step="0.01" min="0" value={formData.preco_aco_kg}
                  onChange={(e) => setFormData({ ...formData, preco_aco_kg: parseFloat(e.target.value) || 0 })} disabled={isDisabled} className="text-lg font-semibold" />
              </div>
              <p className="text-sm text-slate-500 mt-2">Preço médio do aço CA-50 por quilograma</p>
            </div>
            <div>
              <Label htmlFor="preco_arame">Preço do Arame (R$/kg)</Label>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-lg font-semibold text-slate-600">R$</span>
                <Input id="preco_arame" type="number" step="0.01" min="0" value={formData.preco_arame_kg}
                  onChange={(e) => setFormData({ ...formData, preco_arame_kg: parseFloat(e.target.value) || 0 })} disabled={isDisabled} className="text-lg font-semibold" />
              </div>
              <p className="text-sm text-slate-500 mt-2">Preço médio do arame recozido 18 por quilograma</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" />Tempos de Produção</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label htmlFor="tempo_corte">Tempo de Corte (min/barra)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input id="tempo_corte" type="number" step="0.5" min="0" value={formData.tempo_corte_por_barra}
                  onChange={(e) => setFormData({ ...formData, tempo_corte_por_barra: parseFloat(e.target.value) || 0 })} disabled={isDisabled} className="text-lg font-semibold" />
                <Badge variant="outline">min</Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="tempo_dobra">Tempo de Dobra (min/barra)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input id="tempo_dobra" type="number" step="0.5" min="0" value={formData.tempo_dobra_por_barra}
                  onChange={(e) => setFormData({ ...formData, tempo_dobra_por_barra: parseFloat(e.target.value) || 0 })} disabled={isDisabled} className="text-lg font-semibold" />
                <Badge variant="outline">min</Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="tempo_armacao">Tempo de Armação (min/peça)</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input id="tempo_armacao" type="number" step="1" min="0" value={formData.tempo_armacao_por_peca}
                  onChange={(e) => setFormData({ ...formData, tempo_armacao_por_peca: parseFloat(e.target.value) || 0 })} disabled={isDisabled} className="text-lg font-semibold" />
                <Badge variant="outline">min</Badge>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500">Tempos médios utilizados para estimar prazos de produção e calcular custos de mão de obra.</p>
        </CardContent>
      </Card>
    </div>
  );
}