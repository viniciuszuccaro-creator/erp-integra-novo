import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Plus } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import { useConfirm } from "@/components/ui/confirm-dialog";
import useTabelaPrecoItens from "@/components/comercial/tabela-preco-itens/useTabelaPrecoItens";
import TabelaPrecoItemForm from "@/components/comercial/tabela-preco-itens/TabelaPrecoItemForm";
import TabelaPrecoItensTable from "@/components/comercial/tabela-preco-itens/TabelaPrecoItensTable";

export default function TabelaPrecoItensModal({ tabela, isOpen, onClose, windowMode = false }) {
  const { hasPermission } = usePermissions();
  const { confirm, ConfirmDialog } = useConfirm();
  const h = useTabelaPrecoItens(tabela);
  const podeEditar = hasPermission("comercial", "editar_tabela_preco");

  const handleDeleteItem = async (item) => {
    const ok = await confirm({ title: "Remover Item", description: `Remover "${item.produto_descricao}" desta tabela?`, variant: "danger", confirmText: "Remover" });
    if (ok) h.handleDeleteItem(item);
  };

  const content = (
    <div className={`${windowMode ? "w-full h-full overflow-hidden flex flex-col bg-white" : ""}`}>
      <div className={`${windowMode ? "border-b pb-4 px-6 pt-6" : ""} flex-shrink-0`}>
        <div className="flex items-start justify-between">
          <div>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              {tabela.nome}
            </DialogTitle>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline">{tabela.tipo}</Badge>
              <Badge className={tabela.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                {tabela.ativo ? "Ativa" : "Inativa"}
              </Badge>
              {tabela.data_inicio && (
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(tabela.data_inicio).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
          {podeEditar && !h.showItemForm && (
            <Button
              onClick={() => { h.setEditingItem(null); h.resetForm(); h.setShowItemForm(true); }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
            </Button>
          )}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto ${windowMode ? "px-6 pb-6" : "p-6"}`}>
        {h.showItemForm ? (
          <TabelaPrecoItemForm
            formItem={h.formItem}
            setFormItem={h.setFormItem}
            handleSubmitItem={h.handleSubmitItem}
            editingItem={h.editingItem}
            produtos={h.produtos}
            produtosDisponiveis={h.produtosDisponiveis}
            setShowItemForm={h.setShowItemForm}
            setEditingItem={h.setEditingItem}
            createItemMutation={h.createItemMutation}
            updateItemMutation={h.updateItemMutation}
          />
        ) : (
          <TabelaPrecoItensTable
            filteredItens={h.filteredItens}
            searchTerm={h.searchTerm}
            setSearchTerm={h.setSearchTerm}
            podeEditar={podeEditar}
            handleEditItem={h.handleEditItem}
            handleDeleteItem={handleDeleteItem}
            setShowItemForm={h.setShowItemForm}
          />
        )}
      </div>
      <ConfirmDialog />
    </div>
  );

  if (windowMode) return content;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1180px] max-h-[620px] overflow-hidden flex flex-col">
        {content}
      </DialogContent>
    </Dialog>
  );
}