import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";

/**
 * Lista de pontas reutilizáveis com botão de salvar no estoque
 * Extraído de OtimizadorCorte.jsx
 */
export default function CortePontasReutilizaveis({ pontas, onSave }) {
  if (!pontas || pontas.length === 0) return null;

  return (
    <Card className="border-2 border-green-300 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <Save className="w-5 h-5 text-green-600" />
            Pontas para Reaproveitamento
          </CardTitle>
          <Button size="sm" onClick={onSave} data-permission="Producao.OtimizadorCorte.salvar"
            className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-1" />
            Salvar no Estoque
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {pontas.map((ponta, idx) => (
            <Card key={idx} className="border bg-white">
              <CardContent className="p-2">
                <p className="text-xs text-slate-600">Barra #{ponta.barra}</p>
                <p className="font-bold">{ponta.tamanho} cm</p>
                <Badge variant="outline" className="text-xs">{ponta.bitola}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}