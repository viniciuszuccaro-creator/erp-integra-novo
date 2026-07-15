import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function ChamadoFormDialog({
  dialogOpen,
  setDialogOpen,
  formChamado,
  setFormChamado,
  handleSubmit,
  criarChamadoMutation,
}) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Chamado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Abrir Novo Chamado</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Categoria *</Label>
            <Select value={formChamado.categoria} onValueChange={(v) => setFormChamado({ ...formChamado, categoria: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Suporte Técnico">Suporte Técnico</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Comercial">Comercial</SelectItem>
                <SelectItem value="Entrega">Entrega</SelectItem>
                <SelectItem value="Produto">Produto</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prioridade *</Label>
            <Select value={formChamado.prioridade} onValueChange={(v) => setFormChamado({ ...formChamado, prioridade: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Baixa">Baixa</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Título *</Label>
            <Input value={formChamado.titulo} onChange={(e) => setFormChamado({ ...formChamado, titulo: e.target.value })} placeholder="Resumo do problema" required />
          </div>
          <div>
            <Label>Descrição Detalhada *</Label>
            <Textarea value={formChamado.descricao} onChange={(e) => setFormChamado({ ...formChamado, descricao: e.target.value })} placeholder="Descreva o problema com o máximo de detalhes possível..." rows={5} required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={criarChamadoMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {criarChamadoMutation.isPending ? "Abrindo..." : "Abrir Chamado"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}