import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function TabelaPrecoItemForm({
  formItem,
  setFormItem,
  handleSubmitItem,
  editingItem,
  produtos,
  produtosDisponiveis,
  setShowItemForm,
  setEditingItem,
  createItemMutation,
  updateItemMutation,
}) {
  return (
    <form onSubmit={handleSubmitItem} className="space-y-4 bg-slate-50 p-6 rounded-lg">
      <h3 className="font-semibold text-lg mb-4">{editingItem ? "Editar Item" : "Novo Item"}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="produto_id">Produto *</Label>
          <select
            id="produto_id"
            value={formItem.produto_id}
            onChange={(e) => {
              const produto = produtos.find((p) => p.id === e.target.value);
              setFormItem({ ...formItem, produto_id: e.target.value, preco_base: produto?.preco_venda || 0 });
            }}
            required
            className="w-full border rounded-md p-2"
            disabled={!!editingItem}
          >
            <option value="">Selecione um produto...</option>
            {(editingItem ? produtos : produtosDisponiveis).map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} - {p.descricao}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="preco_base">Preço Base *</Label>
          <Input id="preco_base" type="number" step="0.01" value={formItem.preco_base} onChange={(e) => setFormItem({ ...formItem, preco_base: parseFloat(e.target.value) })} required />
        </div>
        <div>
          <Label htmlFor="percentual_desconto">Desconto (%)</Label>
          <Input id="percentual_desconto" type="number" step="0.01" min="0" max="100" value={formItem.percentual_desconto} onChange={(e) => setFormItem({ ...formItem, percentual_desconto: parseFloat(e.target.value) })} />
        </div>
        <div>
          <Label>Preço Final</Label>
          <div className="text-2xl font-bold text-green-600 mt-1">
            R$ {(formItem.preco_base * (1 - formItem.percentual_desconto / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="ativo_item" checked={formItem.ativo} onChange={(e) => setFormItem({ ...formItem, ativo: e.target.checked })} className="rounded" />
          <Label htmlFor="ativo_item" className="font-normal cursor-pointer">Item Ativo</Label>
        </div>
        <div>
          <Label htmlFor="data_inicio_vigencia">Vigência Início</Label>
          <Input id="data_inicio_vigencia" type="date" value={formItem.data_inicio_vigencia} onChange={(e) => setFormItem({ ...formItem, data_inicio_vigencia: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="data_fim_vigencia">Vigência Fim (opcional)</Label>
          <Input id="data_fim_vigencia" type="date" value={formItem.data_fim_vigencia} onChange={(e) => setFormItem({ ...formItem, data_fim_vigencia: e.target.value })} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="observacoes_item">Observações</Label>
          <Input id="observacoes_item" value={formItem.observacoes} onChange={(e) => setFormItem({ ...formItem, observacoes: e.target.value })} placeholder="Observações sobre este preço" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" data-permission="Comercial.TabelaPreco.visualizar" onClick={() => { setShowItemForm(false); setEditingItem(null); }}>Cancelar</Button>
        <Button type="submit" data-permission="Comercial.TabelaPreco.criar" disabled={createItemMutation.isPending || updateItemMutation.isPending} className="bg-green-600 hover:bg-green-700">
          {editingItem ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}