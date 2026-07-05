import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

/**
 * Sub-componente extraído de RepresentanteFormCompleto.jsx
 * Aba Clientes: lista de clientes indicados.
 */
export default function RepresentanteTabClientes({ clientesIndicados }) {
  if (clientesIndicados.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Nenhum cliente indicado ainda</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {clientesIndicados.map(cliente => (
        <Card key={cliente.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{cliente.nome}</p>
                <p className="text-sm text-slate-600">{cliente.tipo === 'Pessoa Física' ? cliente.cpf : cliente.cnpj}</p>
              </div>
              <div className="text-right">
                <Badge className={cliente.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{cliente.status}</Badge>
                {cliente.data_primeira_compra && <p className="text-xs text-slate-500 mt-1">Cliente desde {new Date(cliente.data_primeira_compra).toLocaleDateString('pt-BR')}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}