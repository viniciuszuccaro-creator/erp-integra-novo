import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function NotasFiscaisKPIs({ notasList }) {
  const totalAutorizada = notasList.filter(n => n.status === "Autorizada").reduce((sum, n) => sum + (n.valor_total || 0), 0);
  const totalCancelada = notasList.filter(n => n.status === "Cancelada").reduce((sum, n) => sum + (n.valor_total || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Emitidas</p>
              <p className="text-2xl font-bold text-slate-900">{notasList.length}</p>
            </div>
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Autorizadas</p>
              <p className="text-2xl font-bold text-green-900">R$ {totalAutorizada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Canceladas</p>
              <p className="text-2xl font-bold text-red-900">R$ {totalCancelada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <FileText className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}