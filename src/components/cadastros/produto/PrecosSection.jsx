import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

export default function PrecosSection({ formData, setFormData }) {
  const [optimizing, setOptimizing] = useState(false);
  const canOptimize = Boolean(formData?.id);
  const handleOptimize = async () => {
    if (!canOptimize || optimizing) return;
    setOptimizing(true);
    try {
      const { data } = await base44.functions.invoke('productPriceOptimizer', { produto_id: formData.id });
      if (data?.updated) {
        setFormData(prev => ({ ...prev, ...data.updated }));
      }
    } finally {
      setOptimizing(false);
    }
  };
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-bold text-green-900">💰 Precificação</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Custo Aquisição</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.custo_aquisicao}
              onChange={(e) => setFormData(prev => ({...prev, custo_aquisicao: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Preço Venda</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.preco_venda}
              onChange={(e) => setFormData(prev => ({...prev, preco_venda: parseFloat(e.target.value) || 0}))}
            />
          </div>
          <div>
            <Label>Margem (%)</Label>
            <Input
              type="number"
              value={formData.custo_aquisicao > 0 ? (((formData.preco_venda - formData.custo_aquisicao) / formData.custo_aquisicao) * 100).toFixed(2) : 0}
              disabled
              className="bg-white"
            />
          </div>
          <div>
            <Label>Margem Mínima (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.margem_minima_percentual}
              onChange={(e) => setFormData(prev => ({...prev, margem_minima_percentual: parseFloat(e.target.value) || 0}))}
            />
            <p className="text-xs text-slate-500 mt-1">Usada na aprovação de descontos</p>
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleOptimize} disabled={!canOptimize || optimizing} className="bg-blue-600 hover:bg-blue-700">
            {optimizing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Otimizando...</>) : 'Otimizar Preço (Políticas)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}