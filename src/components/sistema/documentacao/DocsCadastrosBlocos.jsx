import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { blocosCadastros, getCor } from "./documentacaoData";

export default function DocsCadastrosBlocos() {
  return (
    <div className="space-y-5">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
          <CardTitle className="text-lg">Cadastros Gerais — 6 Blocos, 48 Entidades</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <p className="text-sm text-slate-600">
            Cadastros são únicos e compartilhados no grupo. A criação especifica sempre a empresa de origem
            (empresa_id) e o grupo (group_id); nada é duplicado por empresa.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {blocosCadastros.map((bloco) => {
          const cor = getCor(bloco.cor);
          return (
            <Card key={bloco.bloco} className={`border-2 ${cor.card}`}>
              <CardHeader className="bg-white/70 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-sm">
                  Bloco {bloco.bloco} · {bloco.nome}
                </CardTitle>
                <Badge className={cor.badge}>{bloco.total}</Badge>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-slate-700 leading-relaxed">{bloco.entidades}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}