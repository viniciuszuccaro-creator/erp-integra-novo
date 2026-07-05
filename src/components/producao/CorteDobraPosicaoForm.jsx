import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import ImagemComCotas from "./ImagemComCotas";
import { BITOLAS_DISPONIVEIS, FORMATOS_FERRO, calcularPesoBarra } from "./corteDobraConstants";

export default function CorteDobraPosicaoForm({ posicaoAtual, setPosicaoAtual, formData, adicionarPosicao }) {
  const handleFormatoChange = (formato) => {
    const formatoObj = FORMATOS_FERRO.find((f) => f.value === formato);
    const novasMedidas = {};
    formatoObj?.medidas.forEach((m) => { novasMedidas[m] = 0; });
    setPosicaoAtual({ ...posicaoAtual, formato, medidas: novasMedidas });
  };

  const tipoPeca = posicaoAtual.formato;
  const m = posicaoAtual.medidas || {};

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-base">Adicionar Posição (N1, N2, N3...)</CardTitle></CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Código da Posição</Label>
            <Input value={posicaoAtual.codigo} onChange={(e) => setPosicaoAtual({ ...posicaoAtual, codigo: e.target.value })} placeholder="N1" />
          </div>
          <div>
            <Label>Bitola (mm)</Label>
            <Select value={posicaoAtual.bitola} onValueChange={(v) => setPosicaoAtual({ ...posicaoAtual, bitola: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BITOLAS_DISPONIVEIS.map((b) => (<SelectItem key={b.valor} value={b.valor}>{b.valor}mm ({b.peso_metro.toFixed(3)} kg/m)</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantidade de Barras</Label>
            <Input type="number" value={posicaoAtual.quantidade_barras} onChange={(e) => setPosicaoAtual({ ...posicaoAtual, quantidade_barras: parseInt(e.target.value) || 0 })} min="1" />
          </div>
          <div>
            <Label>Formato</Label>
            <Select value={posicaoAtual.formato} onValueChange={handleFormatoChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORMATOS_FERRO.map((f) => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {Object.keys(posicaoAtual.medidas).map((medida) => (
            <div key={medida}>
              <Label className="capitalize">{medida.replace("_", " ")} (cm)</Label>
              <Input type="number" step="0.1" value={posicaoAtual.medidas[medida]}
                onChange={(e) => setPosicaoAtual({ ...posicaoAtual, medidas: { ...posicaoAtual.medidas, [medida]: parseFloat(e.target.value) || 0 } })} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox checked={posicaoAtual.variavel} onCheckedChange={(checked) => setPosicaoAtual({ ...posicaoAtual, variavel: checked })} />
            <Label className="cursor-pointer">Medida Variável</Label>
          </div>
          <div className="flex-1">
            <Label>Observações</Label>
            <Input value={posicaoAtual.observacoes} onChange={(e) => setPosicaoAtual({ ...posicaoAtual, observacoes: e.target.value })} placeholder="Ex: dobra só lado esquerdo, 3 cortes, etc" />
          </div>
        </div>

        {tipoPeca && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-3">📐 Visualização da Peça</h4>
              <ImagemComCotas
                tipoPeca={tipoPeca}
                comprimento={m.comprimento || 0}
                largura={m.largura || 0}
                altura={m.altura || 0}
                dobraLado1={m.dobra_lado1 || 0}
                dobraLado2={m.dobra_lado2 || 0}
                dobra={m.dobra || 0}
                gancho={m.gancho || 0}
                diametro={m.diametro || 0}
                bitola={posicaoAtual.bitola}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-slate-600">Peso estimado por barra: <strong>{calcularPesoBarra(posicaoAtual.bitola, posicaoAtual.medidas, posicaoAtual.formato).toFixed(2)} kg</strong></div>
          <Button type="button" onClick={adicionarPosicao} className="bg-blue-600"><Plus className="w-4 h-4 mr-2" />Adicionar Posição</Button>
        </div>
      </CardContent>
    </Card>
  );
}