import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

/**
 * Filtros extraídos de PedidosEntregaTab
 */
export default function PedidosEntregaFiltros({ busca, setBusca, regiaoFiltro, setRegiaoFiltro, statusFiltro, setStatusFiltro, pedidosPorRegiao }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por pedido ou cliente..."
              className="pl-10"
            />
          </div>

          <Select value={regiaoFiltro} onValueChange={setRegiaoFiltro}>
            <SelectTrigger><SelectValue placeholder="Todas as regiões" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Regiões</SelectItem>
              {Object.keys(pedidosPorRegiao).map(regiao => (
                <SelectItem key={regiao} value={regiao}>
                  {regiao} ({pedidosPorRegiao[regiao].length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger><SelectValue placeholder="Todos os status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="Aprovado">Aprovado</SelectItem>
              <SelectItem value="Pronto para Faturar">Pronto para Faturar</SelectItem>
              <SelectItem value="Faturado">Faturado</SelectItem>
              <SelectItem value="Em Expedição">Em Expedição</SelectItem>
              <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}