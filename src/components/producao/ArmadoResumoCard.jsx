import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Layers } from "lucide-react";

export default function ArmadoResumoCard({ resumo, formData, tipoSelecionado }) {
  if (!resumo) return null;

  return (
    <Card className="border-2 border-green-500">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-600" />
          Resumo Calculado
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {tipoSelecionado === "Bloco" ? (
          <>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-sm text-slate-600 mb-1">Ferros Lado 1</p>
                <p className="text-3xl font-bold text-blue-600">{resumo.ferros_lado1}</p>
                <p className="text-xs text-slate-500 mt-1">barras de {formData.ferro_principal_bitola}mm</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <p className="text-sm text-slate-600 mb-1">Ferros Lado 2</p>
                <p className="text-3xl font-bold text-purple-600">{resumo.ferros_lado2}</p>
                <p className="text-xs text-slate-500 mt-1">barras de {formData.ferro_principal_bitola}mm</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <p className="text-sm text-slate-600 mb-1">Costelas</p>
                <p className="text-3xl font-bold text-orange-600">{resumo.costelas}</p>
                <p className="text-xs text-slate-500 mt-1">{resumo.costelas > 0 ? `reforços de ${formData.bitola_costelas}mm` : 'sem costelas'}</p>
              </div>
            </div>
            <Separator className="my-4" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-sm text-slate-600 mb-1">Ferros Principais</p>
                <p className="text-3xl font-bold text-blue-600">{resumo.ferros}</p>
                <p className="text-xs text-slate-500 mt-1">barras de {formData.ferro_principal_bitola}mm</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded">
                <p className="text-sm text-slate-600 mb-1">Estribos</p>
                <p className="text-3xl font-bold text-orange-600">{resumo.estribos}</p>
                <p className="text-xs text-slate-500 mt-1">{formData.estribo_bitola}mm</p>
              </div>
            </div>
            <Separator className="my-4" />
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded">
            <p className="text-sm text-slate-600 mb-1">Estribos Totais</p>
            <p className="text-2xl font-bold">{resumo.estribos} unidades</p>
            {tipoSelecionado === "Bloco" && (
              <p className="text-xs text-slate-500">{formData.estribo_largura}x{formData.estribo_altura}cm - 4.2mm (fixo)</p>
            )}
            {tipoSelecionado === "Estaca/Broca" && (
              <p className="text-xs text-slate-500">Ø{formData.estribo_diametro}cm - {formData.estribo_bitola}mm</p>
            )}
            {(tipoSelecionado === "Coluna" || tipoSelecionado === "Viga") && (
              <p className="text-xs text-slate-500">{formData.estribo_largura}x{formData.estribo_altura}cm - {formData.estribo_bitola}mm</p>
            )}
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-slate-600 mb-1">Peso Total</p>
            <p className="text-2xl font-bold text-green-600">{resumo.peso_total.toFixed(2)} kg</p>
            <p className="text-xs text-slate-500">Aço: {resumo.peso_aco.toFixed(2)} kg + Arame: {resumo.peso_arame.toFixed(2)} kg</p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-50 rounded">
            <p className="text-sm text-slate-600 mb-1">Custo Total</p>
            <p className="text-2xl font-bold text-yellow-700">R$ {formData.custo_total.toFixed(2)}</p>
            <p className="text-xs text-slate-500">por peça</p>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-slate-600 mb-1">Preço de Venda</p>
            <p className="text-2xl font-bold text-blue-600">R$ {formData.preco_venda_total.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{formData.quantidade} unidade(s)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}