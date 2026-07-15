import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Camera, CheckCircle, AlertTriangle } from "lucide-react";

export default function ApontamentoForm({
  apontamento,
  setApontamento,
  colaboradores,
  capturarLocalizacao,
  capturarFoto,
  finalizarApontamento,
  onClose,
  isPending,
  cronometro,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Apontamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Operador *</Label>
            <Select
              value={apontamento.operador_id}
              onValueChange={(value) => {
                const colab = colaboradores.find((c) => c.id === value);
                setApontamento((prev) => ({ ...prev, operador_id: value, operador_nome: colab?.nome_completo || "" }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o operador" />
              </SelectTrigger>
              <SelectContent>
                {colaboradores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome_completo} - {c.cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Apontamento</Label>
            <Select
              value={apontamento.tipo_apontamento}
              onValueChange={(value) => setApontamento((prev) => ({ ...prev, tipo_apontamento: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Produção">Produção</SelectItem>
                <SelectItem value="Setup">Setup</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Parada">Parada</SelectItem>
                <SelectItem value="Retrabalho">Retrabalho</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Máquina/Equipamento</Label>
            <Input
              placeholder="Ex: Torno CNC 01"
              value={apontamento.maquina_nome}
              onChange={(e) => setApontamento((prev) => ({ ...prev, maquina_nome: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Peça/Item</Label>
            <Input
              placeholder="Descrição da peça"
              value={apontamento.peca_descricao}
              onChange={(e) => setApontamento((prev) => ({ ...prev, peca_descricao: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Quantidade Produzida</Label>
            <Input
              type="number"
              value={apontamento.quantidade_produzida}
              onChange={(e) => setApontamento((prev) => ({ ...prev, quantidade_produzida: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Peso Produzido (kg)</Label>
            <Input
              type="number"
              step="0.01"
              value={apontamento.peso_produzido_kg}
              onChange={(e) => setApontamento((prev) => ({ ...prev, peso_produzido_kg: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Controle de Refugo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantidade Refugo</Label>
              <Input
                type="number"
                value={apontamento.quantidade_refugo}
                onChange={(e) => setApontamento((prev) => ({ ...prev, quantidade_refugo: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Peso Refugo (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={apontamento.peso_refugo_kg}
                onChange={(e) => setApontamento((prev) => ({ ...prev, peso_refugo_kg: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Motivo do Refugo</Label>
              <Input
                placeholder="Ex: Medida incorreta"
                value={apontamento.motivo_refugo}
                onChange={(e) => setApontamento((prev) => ({ ...prev, motivo_refugo: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Comprovação</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={capturarLocalizacao} variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Capturar GPS
              {apontamento.localizacao_gps.latitude !== 0 && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
            </Button>
            <Button onClick={capturarFoto} variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Capturar Foto
              {apontamento.foto_comprovacao_url && <CheckCircle className="w-4 h-4 ml-2 text-green-600" />}
            </Button>
          </div>
          {apontamento.foto_comprovacao_url && (
            <img src={apontamento.foto_comprovacao_url} alt="Comprovação" className="mt-3 rounded border max-w-xs" />
          )}
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            placeholder="Informações adicionais sobre o apontamento..."
            value={apontamento.observacoes}
            onChange={(e) => setApontamento((prev) => ({ ...prev, observacoes: e.target.value }))}
            rows={3}
          />
        </div>
      </CardContent>

      <div className="flex justify-end gap-3 p-6 pt-0">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={finalizarApontamento}
          disabled={!apontamento.operador_id || cronometro.segundos === 0 || isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Finalizar Apontamento
        </Button>
      </div>
    </Card>
  );
}