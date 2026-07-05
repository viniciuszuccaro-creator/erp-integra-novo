import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, TrendingUp, TrendingDown, Box, AlertCircle } from "lucide-react";

export default function AnalisePedidoItensTable({
  todosItens, descontosItens, calcularValoresItem, handleDescontoItemChange
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Itens do Pedido ({todosItens.length})
        </h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Custo Unit.</TableHead>
                <TableHead>Valor Bruto</TableHead>
                <TableHead>Desc. %</TableHead>
                <TableHead>Desc. R$</TableHead>
                <TableHead>Valor Líq.</TableHead>
                <TableHead>Markup</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todosItens.map(item => {
                const valores = calcularValoresItem(item);
                const descontoAtual = descontosItens[item.id_interno] || { percentual: item.desconto_percentual || 0, valor: item.desconto_valor || 0 };
                const corMarkup = valores.markup < 5 ? "text-red-600" : valores.markup < 10 ? "text-yellow-600" : "text-green-600";
                return (
                  <TableRow key={item.id_interno} className="hover:bg-slate-50">
                    <TableCell><Badge variant="outline" className="text-xs">{item.tipo}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate">{item.descricao || item.produto_descricao || '-'}</TableCell>
                    <TableCell>{item.quantidade || 1}</TableCell>
                    <TableCell>
                      {item.tipo === "Revenda" ? (
                        valores.estoque.disponivel ? (
                          <Badge className="bg-green-100 text-green-700 text-xs"><Box className="w-3 h-3 mr-1" />{valores.estoque.estoque}</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 text-xs"><AlertCircle className="w-3 h-3 mr-1" />Falta {valores.estoque.falta}</Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="text-xs">Produção</Badge>
                      )}
                    </TableCell>
                    <TableCell>R$ {(item.preco_unitario || item.valor_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-slate-600">R$ {valores.custoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="font-semibold">R$ {valores.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" className="w-20 h-8 text-xs" value={descontoAtual.percentual}
                        onChange={(e) => handleDescontoItemChange(item.id_interno, 'percentual', e.target.value)} placeholder="0" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" className="w-24 h-8 text-xs" value={descontoAtual.valor}
                        onChange={(e) => handleDescontoItemChange(item.id_interno, 'valor', e.target.value)} placeholder="0.00" />
                    </TableCell>
                    <TableCell className="font-bold text-green-600">R$ {valores.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${corMarkup} flex items-center gap-1`}>
                        {valores.markup >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {valores.markup.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}