import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Trash2 } from "lucide-react";
import { FORMATOS_FERRO } from "./corteDobraConstants";

export default function CorteDobraResumoGeral({ formData, elementoEstrutural, resumo }) {
  if (formData.posicoes.length === 0) return null;
  return (
    <Card className="border-2 border-green-500">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2"><Calculator className="w-6 h-6 text-green-600" />Resumo Geral do Elemento {elementoEstrutural}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center"><p className="text-sm text-slate-600">Peso Total</p><p className="text-3xl font-bold text-green-600">{resumo.peso_total.toFixed(2)} kg</p></div>
          <div className="text-center"><p className="text-sm text-slate-600">Total de Barras</p><p className="text-3xl font-bold text-blue-600">{resumo.quantidade_total_barras}</p></div>
          <div className="text-center"><p className="text-sm text-slate-600">Posições</p><p className="text-3xl font-bold text-purple-600">{formData.posicoes.length}</p></div>
          <div className="text-center"><p className="text-sm text-slate-600">Elementos</p><p className="text-3xl font-bold text-amber-600">{formData.quantidade_elementos}</p></div>
        </div>
        <div className="mt-6 p-4 bg-slate-50 rounded">
          <h4 className="font-bold mb-3">Peso por Bitola:</h4>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(resumo.por_bitola).map(([bitola, dados]) => (
              <div key={bitola} className="text-center p-3 bg-white rounded border">
                <Badge className="bg-blue-600 mb-2">{bitola}mm</Badge>
                <p className="text-sm font-bold">{dados.peso.toFixed(2)} kg</p>
                <p className="text-xs text-slate-500">{dados.quantidade} barras</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CorteDobraListaPosicoes({ formData, removerPosicao }) {
  if (formData.posicoes.length === 0) return null;
  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-base">Posições Adicionadas ({formData.posicoes.length})</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 text-left">Código</th><th className="p-2 text-left">Bitola</th><th className="p-2 text-right">Qtd Barras</th>
                <th className="p-2 text-left">Formato</th><th className="p-2 text-right">Peso Unit.</th><th className="p-2 text-right">Peso Total</th><th className="p-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {formData.posicoes.map((pos, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-mono font-bold">{pos.codigo}</td>
                  <td className="p-2"><Badge className="bg-blue-600">{pos.bitola}mm</Badge></td>
                  <td className="p-2 text-right">{pos.quantidade_barras} x {formData.quantidade_elementos} = {pos.quantidade_barras * formData.quantidade_elementos}</td>
                  <td className="p-2">{FORMATOS_FERRO.find((f) => f.value === pos.formato)?.label}</td>
                  <td className="p-2 text-right">{pos.peso_unitario.toFixed(2)} kg</td>
                  <td className="p-2 text-right font-bold text-green-600">{pos.peso_total.toFixed(2)} kg</td>
                  <td className="p-2 text-center"><Button size="icon" variant="ghost" onClick={() => removerPosicao(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}