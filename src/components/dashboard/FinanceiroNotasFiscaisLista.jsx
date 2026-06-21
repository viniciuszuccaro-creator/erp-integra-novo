import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FinanceiroNotasFiscaisLista({ notasFiscais = [] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Últimas Notas Fiscais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notasFiscais.slice(0, 8).map((nf) => (
            <div key={nf.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
              <div>
                <p className="font-medium">{nf.numero_nf || nf.id}</p>
                <p className="text-xs text-slate-600">{new Date(nf.created_date).toLocaleDateString("pt-BR")}</p>
              </div>
              <Badge
                className={`${
                  nf.status === "Autorizada"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {nf.status || "Pendente"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}