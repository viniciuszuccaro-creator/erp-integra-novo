import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Layers } from "lucide-react";
import { FORMATOS_DISPONIVEIS, ETAPAS_OBRA } from "./useCorteDobraIA";

export default function PosicaoForm({ editando, setEditando, bitolas, onSave, onAdd }) {
  if (!editando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Posição Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={onAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Nova Posição
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatoSelecionado = FORMATOS_DISPONIVEIS.find(f => f.id === editando.formato);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Posição Manual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Código</Label>
              <Input
                placeholder="Ex: N1"
                value={editando.codigo}
                onChange={(e) => setEditando({ ...editando, codigo: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={editando.quantidade}
                onChange={(e) => setEditando({ ...editando, quantidade: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label className="text-xs">Bitola</Label>
              <Select value={editando.bitola} onValueChange={(value) => setEditando({ ...editando, bitola: value })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="z-[99999]">
                  {bitolas.map((b) => (
                    <SelectItem key={b.id} value={b.bitola_diametro_mm.toString()}>
                      {b.bitola_diametro_mm}mm ({b.tipo_aco})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Formato</Label>
              <Select
                value={editando.formato}
                onValueChange={(value) => {
                  const formato = FORMATOS_DISPONIVEIS.find(f => f.id === value);
                  const medidas = {};
                  formato.medidas.forEach(m => medidas[m] = 0);
                  setEditando({ ...editando, formato: value, medidas });
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[99999]">
                  {FORMATOS_DISPONIVEIS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs flex items-center gap-1 text-purple-600">
              <Layers className="w-3 h-3" />
              Etapa da Obra (opcional)
            </Label>
            <Select
              value={editando.etapa_obra_id}
              onValueChange={(value) => {
                const etapa = ETAPAS_OBRA.find(e => e.id === value);
                setEditando({ ...editando, etapa_obra_id: value, etapa_obra_nome: etapa?.nome || '' });
              }}
            >
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="z-[99999]">
                {ETAPAS_OBRA.map(etapa => (
                  <SelectItem key={etapa.id} value={etapa.id}>{etapa.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vol 5.4: Vínculo a obra — ponto, pavimento, posição, revisão, data prevista */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-blue-50 rounded">
            <div>
              <Label className="text-xs">Ponto</Label>
              <Input placeholder="Ex: P1" value={editando.ponto || ''} onChange={(e) => setEditando({ ...editando, ponto: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Pavimento</Label>
              <Input placeholder="Ex: Térreo" value={editando.pavimento || ''} onChange={(e) => setEditando({ ...editando, pavimento: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Posição</Label>
              <Input placeholder="Ex: A1" value={editando.posicao || ''} onChange={(e) => setEditando({ ...editando, posicao: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Revisão</Label>
              <Input type="number" min="1" value={editando.revisao || 1} onChange={(e) => setEditando({ ...editando, revisao: parseInt(e.target.value) || 1 })} />
            </div>
            <div>
              <Label className="text-xs">Data Prevista</Label>
              <Input type="date" value={editando.data_prevista || ''} onChange={(e) => setEditando({ ...editando, data_prevista: e.target.value })} />
            </div>
          </div>

          {formatoSelecionado && (
            <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded">
              {formatoSelecionado.medidas.map((medida) => (
                <div key={medida}>
                  <Label className="text-xs">{medida} (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editando.medidas?.[medida] || ''}
                    onChange={(e) => setEditando({
                      ...editando,
                      medidas: { ...(editando.medidas || {}), [medida]: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => setEditando(null)} variant="outline" className="flex-1">
              Cancelar
            </Button>
            <Button onClick={onSave} className="flex-1 bg-green-600 hover:bg-green-700">
              Salvar Posição
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}