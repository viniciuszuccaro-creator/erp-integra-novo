import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, GitBranch } from "lucide-react";

export default function PlanoMelhoriaGovernanca() {
  const governance = [
    { area: "Aprovações", responsavel: "CTO", cadencia: "Semanal", status: "Ativa" },
    { area: "Testes", responsavel: "QA Lead", cadencia: "Contínua", status: "Ativa" },
    { area: "Deploy", responsavel: "DevOps", cadencia: "Bi-semanal", status: "Ativa" },
    { area: "Segurança", responsavel: "Security", cadencia: "Mensal", status: "Ativa" },
    { area: "Compliance", responsavel: "Legal", cadencia: "Trimestral", status: "Planejado" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          Governança & Processos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 mb-4">
          {governance.map((gov, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{gov.area}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {gov.responsavel} • {gov.cadencia}
                </p>
              </div>
              <Badge
                className={`text-xs flex-shrink-0 ${
                  gov.status === "Ativa" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {gov.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3 h-3 text-slate-500" />
            <span>Git Strategy: GitFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-slate-500" />
            <span>Code Review: Obrigatório</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}