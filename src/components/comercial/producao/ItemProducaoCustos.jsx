import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import { PRECO_FERRO_KG, MARGEM_MINIMA } from "./useItemProducaoCalculo";

export default function ItemProducaoCustos({ formData, updateField, margem, margemBaixa, margemNegativa }) {
  return (
    <Card>
      <CardHeader className={`pb-3 ${margemNegativa ? 'bg-red-50' : margemBaixa ? 'bg-amber-50' : 'bg-green-50'}`}>
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Custos e Preços</span>
          <div className="flex gap-2">
            <Badge className="bg-slate-600 text-white">Peso Total: {(formData.peso_total_kg || 0).toFixed(2)} kg</Badge>
            <Badge className={`${margemNegativa ? 'bg-red-600' : margemBaixa ? 'bg-amber-600' : 'bg-green-600'} text-white`}>
              {margemNegativa ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
              Margem: {margem.toFixed(1)}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <Label>Custo Material (Auto) *</Label>
            <Input type="number" value={formData.custo_material || 0} disabled className="bg-slate-100 font-bold" />
            <p className="text-xs text-slate-500 mt-1">{(formData.peso_total_kg || 0).toFixed(2)} kg × R$ {PRECO_FERRO_KG}/kg</p>
          </div>
          <div>
            <Label>Custo Mão de Obra</Label>
            <Input type="number" step="0.01" value={formData.custo_mao_obra || 0}
              onChange={(e) => updateField('custo_mao_obra', parseFloat(e.target.value) || 0)} />
          </div>
          {formData.tipo_peca === "Bloco" && (
            <div>
              <Label>Custo Laçamento</Label>
              <Input type="number" step="0.01" value={formData.custo_lacamento || 0}
                onChange={(e) => updateField('custo_lacamento', parseFloat(e.target.value) || 0)} />
            </div>
          )}
          <div>
            <Label>Custo Overhead</Label>
            <Input type="number" step="0.01" value={formData.custo_overhead || 0}
              onChange={(e) => updateField('custo_overhead', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Custo Total</Label>
            <Input type="number" value={formData.custo_total || 0} disabled
              className="bg-slate-100 font-bold text-red-600" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Preço Venda Unit. *</Label>
            <Input type="number" step="0.01" value={formData.preco_venda_unitario || 0}
              onChange={(e) => updateField('preco_venda_unitario', parseFloat(e.target.value) || 0)}
              className="font-bold text-green-600" />
            <p className="text-xs text-blue-600 mt-1">Sugerido: R$ {(((formData.custo_total || 0) / (formData.quantidade || 1)) * 1.20).toFixed(2)} (+20%)</p>
          </div>
          <div>
            <Label>Preço Total</Label>
            <Input type="number" value={formData.preco_venda_total || 0} disabled
              className="bg-green-100 font-bold text-lg text-green-600" />
          </div>
          <div>
            <Label>Tempo Produção</Label>
            <Input type="number" value={formData.tempo_producao_horas || 0} disabled className="bg-slate-100" />
            <p className="text-xs text-slate-500 mt-1">horas (calculado)</p>
          </div>
        </div>

        {margemNegativa && (
          <Alert className="mt-4 bg-red-100 border-red-300">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-sm text-red-800 font-semibold">
              ⛔ PREJUÍZO! O preço de venda está R$ {(((formData.custo_total || 0) - (formData.preco_venda_total || 0))).toFixed(2)} abaixo do custo.
              <strong> Requer aprovação gerencial!</strong>
            </AlertDescription>
          </Alert>
        )}
        {!margemNegativa && margemBaixa && (
          <Alert className="mt-4 bg-amber-100 border-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-800">
              ⚠️ Margem abaixo do mínimo recomendado ({MARGEM_MINIMA}%). Considere aumentar o preço.
            </AlertDescription>
          </Alert>
        )}
        {!margemNegativa && !margemBaixa && (
          <Alert className="mt-4 bg-green-100 border-green-300">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              ✅ Margem saudável! Lucro projetado: R$ {(((formData.preco_venda_total || 0) - (formData.custo_total || 0))).toFixed(2)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}