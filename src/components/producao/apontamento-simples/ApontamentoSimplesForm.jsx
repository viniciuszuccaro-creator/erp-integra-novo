import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";

export default function ApontamentoSimplesForm({ form, setForm, itensDisponiveis, onSubmit, isPending }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Apontar Produção
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Item / Elemento *</Label>
              <Select value={form.item_elemento} onValueChange={(v) => setForm({ ...form, item_elemento: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione o item" /></SelectTrigger>
                <SelectContent>
                  {itensDisponiveis.map((item, idx) => (
                    <SelectItem key={idx} value={item.elemento}>
                      {item.elemento} - {item.descricao_automatica || item.tipo_peca}
                      {item.apontado && " ✓"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor *</Label>
              <Select value={form.setor} onValueChange={(v) => setForm({ ...form, setor: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Em Corte">Corte</SelectItem>
                  <SelectItem value="Em Dobra">Dobra</SelectItem>
                  <SelectItem value="Em Armação">Armação</SelectItem>
                  <SelectItem value="Em Conferência">Conferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade Produzida *</Label>
              <Input type="number" value={form.quantidade_produzida} onChange={(e) => setForm({ ...form, quantidade_produzida: parseInt(e.target.value) || 0 })} required />
            </div>
            <div>
              <Label>Peso Produzido (kg) *</Label>
              <Input type="number" step="0.01" value={form.peso_produzido_kg} onChange={(e) => setForm({ ...form, peso_produzido_kg: parseFloat(e.target.value) || 0 })} required />
            </div>
            <div>
              <Label>Quantidade Refugada</Label>
              <Input type="number" value={form.quantidade_refugada} onChange={(e) => setForm({ ...form, quantidade_refugada: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Peso Refugado (kg)</Label>
              <Input type="number" step="0.01" value={form.peso_refugado_kg} onChange={(e) => setForm({ ...form, peso_refugado_kg: parseFloat(e.target.value) || 0 })} />
            </div>
            {form.quantidade_refugada > 0 && (
              <div className="col-span-2">
                <Label>Motivo do Refugo</Label>
                <Select value={form.motivo_refugo} onValueChange={(v) => setForm({ ...form, motivo_refugo: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corte Errado">Corte Errado</SelectItem>
                    <SelectItem value="Dobra Errada">Dobra Errada</SelectItem>
                    <SelectItem value="Falta de Material">Falta de Material</SelectItem>
                    <SelectItem value="Desenho Incorreto">Desenho Incorreto</SelectItem>
                    <SelectItem value="Falha Equipamento">Falha Equipamento</SelectItem>
                    <SelectItem value="Medida Errada">Medida Errada</SelectItem>
                    <SelectItem value="Qualidade Inferior">Qualidade Inferior</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Tempo em Minutos</Label>
              <Input type="number" value={form.tempo_minutos} onChange={(e) => setForm({ ...form, tempo_minutos: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Hora Início</Label>
              <Input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
            </div>
            <div>
              <Label>Hora Fim</Label>
              <Input type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
              {isPending ? "Salvando..." : "Registrar Apontamento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}