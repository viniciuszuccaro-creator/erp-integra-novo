import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";

export default function NotasFiscaisToolbar({
  searchTerm, setSearchTerm, statusFilter, setStatusFilter,
  tipoFilter, setTipoFilter, onCreateNFe,
}) {
  const { hasPermission } = usePermissions();
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input placeholder="Buscar por cliente, número, série, chave, CPF/CNPJ, tipo, pedido..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os Status</SelectItem>
              <SelectItem value="Autorizada">Autorizada</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
              <SelectItem value="Denegada">Denegada</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Erro">Erro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os Tipos</SelectItem>
              <SelectItem value="NF-e (Saída)">NF-e (Saída)</SelectItem>
              <SelectItem value="NF-e (Entrada)">NF-e (Entrada)</SelectItem>
              <SelectItem value="NFS-e">NFS-e</SelectItem>
              <SelectItem value="CT-e">CT-e</SelectItem>
            </SelectContent>
          </Select>
          {onCreateNFe && hasPermission('Fiscal', 'NotaFiscal', 'criar') && (
            <Button className="bg-blue-600 hover:bg-blue-700" data-permission="Fiscal.NotaFiscal.criar" onClick={onCreateNFe}>
              <Plus className="w-4 h-4 mr-2" /> Nova NF-e
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}