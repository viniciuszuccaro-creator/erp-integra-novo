import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

export default function OrdensCompraHeader({ searchTerm, onSearchChange, onNovaOC }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <h2 className="text-lg font-bold">Ordens de Compra</h2>
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
        <Input
          placeholder="Buscar por OC, fornecedor, status, solicitante, centro custo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-7 h-8 text-sm"
        />
      </div>
      <Button onClick={onNovaOC} size="sm">
        <Plus className="w-3 h-3 mr-1" />
        Nova OC
      </Button>
    </div>
  );
}