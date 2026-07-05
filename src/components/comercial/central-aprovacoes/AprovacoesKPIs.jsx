import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export default function AprovacoesKPIs({ pendentes, aprovados, negados }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" /> Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent><div className="text-3xl font-bold text-orange-600">{pendentes}</div></CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Aprovados
          </CardTitle>
        </CardHeader>
        <CardContent><div className="text-3xl font-bold text-green-600">{aprovados}</div></CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" /> Negados
          </CardTitle>
        </CardHeader>
        <CardContent><div className="text-3xl font-bold text-red-600">{negados}</div></CardContent>
      </Card>
    </div>
  );
}