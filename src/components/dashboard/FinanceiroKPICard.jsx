import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinanceiroKPICard({ title, value, count, color = "text-blue-600" }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${color}`}>
          R$ {(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
        </p>
        <p className="text-xs text-slate-600 mt-2">{count} títulos</p>
      </CardContent>
    </Card>
  );
}