import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package, Plus } from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";

export default function TabelaPrecoItensTable({
  filteredItens,
  searchTerm,
  setSearchTerm,
  podeEditar,
  handleEditItem,
  handleDeleteItem,
  setShowItemForm,
}) {
  return (
    <>
      <div className="mb-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar produtos na tabela..." />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Preço Base</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Preço Final</TableHead>
            <TableHead>Vigência</TableHead>
            <TableHead>Status</TableHead>
            {podeEditar && <TableHead>Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItens.map((item) => (
            <TableRow key={item.id} className="hover:bg-slate-50">
              <TableCell className="font-medium text-sm">{item.produto_codigo || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  {item.produto_descricao}
                </div>
              </TableCell>
              <TableCell className="text-slate-600">R$ {(item.preco_base || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
              <TableCell>
                {item.percentual_desconto > 0 ? (
                  <Badge className="bg-red-100 text-red-700">-{item.percentual_desconto}%</Badge>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </TableCell>
              <TableCell className="font-bold text-green-600">
                R$ {(item.preco_com_desconto || item.preco_base || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {item.data_inicio_vigencia ? (
                  <>
                    {new Date(item.data_inicio_vigencia).toLocaleDateString("pt-BR")}
                    {item.data_fim_vigencia && <> até {new Date(item.data_fim_vigencia).toLocaleDateString("pt-BR")}</>}
                  </>
                ) : "-"}
              </TableCell>
              <TableCell>
                <Badge className={item.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                  {item.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              {podeEditar && (
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" data-permission="Comercial.TabelaPreco.editar" onClick={() => handleEditItem(item)} title="Editar">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" data-permission="Comercial.TabelaPreco.excluir" onClick={() => handleDeleteItem(item)} title="Remover">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredItens.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Nenhum produto cadastrado nesta tabela</p>
          {podeEditar && (
            <Button onClick={() => setShowItemForm(true)} data-permission="Comercial.TabelaPreco.criar" className="mt-4 bg-green-600">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Produto
            </Button>
          )}
        </div>
      )}
    </>
  );
}