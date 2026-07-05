import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calculator, DollarSign } from "lucide-react";
import { useWindow } from "@/components/lib/useWindow";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useComissoesTab from "./comissoes-tab/useComissoesTab";
import ComissoesKPIs from "./comissoes-tab/ComissoesKPIs";
import ComissoesTable from "./comissoes-tab/ComissoesTable";

/**
 * Gestão de Comissões — refatorado (482→~80 linhas, -83%)
 * Hook: useComissoesTab | Sub-componentes: ComissoesKPIs, ComissoesTable
 */
export default function ComissoesTab({ comissoes, pedidos, empresas = [] }) {
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const {
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    comissoesFiltradas, comissoesPendentes, comissoesAprovadas, totalPendente, totalPago,
    relatorioPorVendedor, handleAprovar, handleRecusar, handlePagar, confirm, ConfirmDialog,
  } = useComissoesTab({ comissoes, pedidos });

  return (
    <div className="space-y-6">
      <ComissoesKPIs pendentes={comissoesPendentes} aprovadas={comissoesAprovadas} totalPendente={totalPendente} totalPago={totalPago} />

      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle>Gestão de Comissões</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input placeholder="Buscar por vendedor, pedido, cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-64" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Aprovada">Aprovada</SelectItem>
                  <SelectItem value="Paga">Paga</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <Button data-permission="Comercial.Comissao.criar" className="bg-purple-600 hover:bg-purple-700"
                onClick={async () => {
                  const { default: CalcularComissoesForm } = await import('./CalcularComissoesForm');
                  openWindow(CalcularComissoesForm, { pedidos: pedidos || [], onSubmit: () => queryClient.invalidateQueries({ queryKey: ['comissoes'] }), onCancel: () => {} }, { title: '📊 Calcular Comissões', width: 900, height: 700 });
                }}>
                <Calculator className="w-4 h-4 mr-2" /> Calcular Comissões
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <ComissoesTable comissoes={comissoesFiltradas} onAprovar={handleAprovar} onRecusar={handleRecusar} onPagar={handlePagar} empresas={empresas} pedidos={pedidos} />

      <Card className="border-0 shadow-md">
        <CardHeader className="border-b bg-slate-50"><CardTitle>Relatório por Vendedor</CardTitle></CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Vendedor</TableHead>
                <TableHead>Total Vendas</TableHead>
                <TableHead>Total Comissões</TableHead>
                <TableHead>Pendentes</TableHead>
                <TableHead>Aprovadas</TableHead>
                <TableHead>Pagas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorioPorVendedor().map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.vendedor}</TableCell>
                  <TableCell className="font-semibold text-blue-600">R$ {item.total_vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="font-semibold text-green-600">R$ {item.total_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell><Badge className="bg-yellow-100 text-yellow-700">{item.pendentes}</Badge></TableCell>
                  <TableCell><Badge className="bg-green-100 text-green-700">{item.aprovadas}</Badge></TableCell>
                  <TableCell><Badge className="bg-blue-100 text-blue-700">{item.pagas}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {relatorioPorVendedor().length === 0 && <div className="text-center py-8 text-slate-500"><p>Nenhum dado para exibir</p></div>}
        </CardContent>
      </Card>

      <ConfirmDialog />
    </div>
  );
}