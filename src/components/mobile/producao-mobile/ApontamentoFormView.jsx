import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Camera, User } from "lucide-react";

export default function ApontamentoFormView({
  opSelecionada,
  itemSelecionado,
  apontamento,
  setApontamento,
  onSubmit,
  onVoltar,
  onCancel,
  isSaving,
  podeApontar
}) {
  return (
    <div className="w-full h-full overflow-auto min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
          <Button variant="ghost" size="sm" onClick={onVoltar} className="text-white hover:bg-blue-700 mb-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">{opSelecionada.numero_op}</h2>
          <p className="text-blue-100 text-lg">{itemSelecionado.elemento} - {itemSelecionado.tipo_peca}</p>
        </div>

        {!podeApontar && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            ⛔ Você não tem permissão para registrar apontamentos de produção.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <Card className="bg-white/95">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Registrar Produção
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label className="text-base mb-2 block">Setor *</Label>
                <Select value={apontamento.setor} onValueChange={(v) => setApontamento({ ...apontamento, setor: v })}>
                  <SelectTrigger className="h-14 text-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em Corte" className="text-lg py-3">🔪 Corte</SelectItem>
                    <SelectItem value="Em Dobra" className="text-lg py-3">🔧 Dobra</SelectItem>
                    <SelectItem value="Em Montagem" className="text-lg py-3">🏗️ Armação</SelectItem>
                    <SelectItem value="Inspeção" className="text-lg py-3">✅ Conferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base mb-2 block">Quantidade Produzida *</Label>
                <Input
                  type="number"
                  value={apontamento.quantidade_produzida}
                  onChange={(e) => setApontamento({ ...apontamento, quantidade_produzida: parseInt(e.target.value) })}
                  className="h-14 text-2xl font-bold text-center"
                  placeholder="0"
                  required
                  disabled={!podeApontar}
                />
                <p className="text-sm text-slate-500 mt-2">Total previsto: {itemSelecionado.quantidade_pecas} peças</p>
              </div>

              <div>
                <Label className="text-base mb-2 block">Peso Produzido (kg)</Label>
                <Input
                  type="number" step="0.1"
                  value={apontamento.peso_produzido_kg}
                  onChange={(e) => setApontamento({ ...apontamento, peso_produzido_kg: parseFloat(e.target.value) })}
                  className="h-14 text-2xl font-bold text-center"
                  placeholder="0.0"
                  disabled={!podeApontar}
                />
                <p className="text-sm text-slate-500 mt-2">Peso teórico: {itemSelecionado.peso_teorico_total?.toFixed(2)} kg</p>
              </div>

              <div>
                <Label className="text-base mb-2 block">Tempo Gasto (minutos)</Label>
                <Input
                  type="number"
                  value={apontamento.tempo_minutos}
                  onChange={(e) => setApontamento({ ...apontamento, tempo_minutos: parseInt(e.target.value) })}
                  className="h-14 text-xl text-center"
                  placeholder="0"
                  disabled={!podeApontar}
                />
              </div>

              <div>
                <Label className="text-base mb-2 block">Observações</Label>
                <Textarea
                  value={apontamento.observacoes}
                  onChange={(e) => setApontamento({ ...apontamento, observacoes: e.target.value })}
                  className="min-h-24 text-base"
                  placeholder="Alguma observação sobre esta produção..."
                  rows={3}
                  disabled={!podeApontar}
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Button type="button" variant="outline" className="w-full h-12" disabled>
                  <Camera className="w-5 h-5 mr-2" />
                  Tirar Foto (em breve)
                </Button>
                <p className="text-xs text-blue-700 text-center mt-2">Função de foto em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1 h-14 bg-white text-lg" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-lg" disabled={isSaving || !podeApontar}>
              {isSaving ? 'Salvando...' : 'Registrar'}
            </Button>
          </div>
        </form>

        <Card className="bg-white/90">
          <CardContent className="p-4 flex items-center gap-3">
            <User className="w-5 h-5 text-slate-600" />
            <div className="flex-1">
              <p className="text-xs text-slate-500">Apontando como</p>
              <p className="font-semibold text-slate-900">{opSelecionada.operador || 'Operador'}</p>
            </div>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}