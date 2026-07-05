import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function SelecionarProdutoForm({ onSelect, windowMode = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', contextoKey],
    queryFn: () => filterInContext('Produto', {}, 'descricao', 999),
    enabled: !!contexto,
  });

  const produtosFiltrados = produtos.filter(p => 
    p.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <div className={`space-y-4 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar por código ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          autoFocus
        />
      </div>

      <div className="border rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0">
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Un</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtosFiltrados.map((produto) => {
              const estoqueBaixo = (produto.estoque_atual || 0) <= (produto.estoque_minimo || 0);

              return (
                <TableRow key={produto.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm">{produto.codigo || '-'}</TableCell>
                  <TableCell className="font-medium">{produto.descricao}</TableCell>
                  <TableCell>{produto.unidade_medida || 'UN'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={estoqueBaixo ? 'text-orange-600 font-semibold' : ''}>
                        {produto.estoque_atual || 0}
                      </span>
                      {estoqueBaixo && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    R$ {(produto.preco_venda || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => onSelect(produto)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {produtosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded sticky bottom-0">
        <span>Total de produtos: {produtosFiltrados.length}</span>
        <span>Clique em "Adicionar" para incluir no pedido</span>
      </div>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}