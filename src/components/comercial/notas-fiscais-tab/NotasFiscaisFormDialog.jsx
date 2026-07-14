import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";

export default function NotasFiscaisFormDialog({
  isDialogOpen, setIsDialogOpen, selectedNF, formData, setFormData,
  handleSubmit, resetForm, createMutation, updateMutation,
}) {
  const { hasPermission } = usePermissions();
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) { resetForm(); }
    }}>
      <DialogTrigger asChild>
        {hasPermission('Fiscal', 'NotaFiscal', 'criar') && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Nova NF-e (Rápido)
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{selectedNF ? 'Editar' : 'Nova'} Nota Fiscal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo *</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NF-e (Saída)">NF-e (Saída)</SelectItem>
                <SelectItem value="NF-e (Entrada)">NF-e (Entrada)</SelectItem>
                <SelectItem value="NFS-e">NFS-e</SelectItem>
                <SelectItem value="CT-e">CT-e</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cliente/Fornecedor *</Label>
            <Input value={formData.cliente_fornecedor}
              onChange={(e) => setFormData({ ...formData, cliente_fornecedor: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Número *</Label>
              <Input value={formData.numero} onChange={(e) => setFormData({ ...formData, numero: e.target.value })} required />
            </div>
            <div>
              <Label>Série *</Label>
              <Input value={formData.serie} onChange={(e) => setFormData({ ...formData, serie: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Emissão *</Label>
              <Input type="date" value={formData.data_emissao}
                onChange={(e) => setFormData({ ...formData, data_emissao: e.target.value })} required />
            </div>
            <div>
              <Label>Valor Produtos *</Label>
              <Input type="number" step="0.01" value={formData.valor_produtos}
                onChange={(e) => setFormData({ ...formData, valor_produtos: parseFloat(e.target.value) })} required />
            </div>
          </div>
          <div>
            <Label>Valor Total *</Label>
            <Input type="number" step="0.01" value={formData.valor_total}
              onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) })} required />
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {selectedNF ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}