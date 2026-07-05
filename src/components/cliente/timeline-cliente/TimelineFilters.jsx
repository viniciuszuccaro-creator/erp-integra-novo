import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Filtros da timeline (busca + módulo + tipo)
 * Extraído de TimelineCliente.jsx
 */
export default function TimelineFilters({ busca, setBusca, filtroModulo, setFiltroModulo, filtroTipo, setFiltroTipo }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input placeholder="Buscar na timeline..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full" />
          </div>
          <Select value={filtroModulo} onValueChange={setFiltroModulo}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Módulos</SelectItem>
              <SelectItem value="Comercial">Comercial</SelectItem>
              <SelectItem value="Producao">Produção</SelectItem>
              <SelectItem value="Expedicao">Expedição</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
              <SelectItem value="Fiscal">Fiscal</SelectItem>
              <SelectItem value="CRM">CRM</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Tipos</SelectItem>
              <SelectItem value="Criacao">Criação</SelectItem>
              <SelectItem value="Aprovacao">Aprovação</SelectItem>
              <SelectItem value="Envio">Envio</SelectItem>
              <SelectItem value="Pagamento">Pagamento</SelectItem>
              <SelectItem value="Entrega">Entrega</SelectItem>
              <SelectItem value="Comunicacao">Comunicação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}