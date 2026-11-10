import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { padroesTecnicos, getCor } from "./documentacaoData";

export default function DocsPadroesTecnicos() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {padroesTecnicos.map((padrao) => {
        const cor = getCor(padrao.cor);
        return (
          <Card key={padrao.titulo} className={`border-2 ${cor.card}`}>
            <CardHeader className="bg-white/70 border-b">
              <CardTitle className="text-base flex items-start gap-2">
                <span aria-hidden="true">{padrao.icon}</span>
                <span className="leading-snug">{padrao.titulo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ul className="space-y-1.5">
                {padrao.items.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${cor.badge}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}