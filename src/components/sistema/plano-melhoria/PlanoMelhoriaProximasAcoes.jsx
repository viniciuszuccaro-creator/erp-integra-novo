import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, User, Calendar } from "lucide-react";

export default function PlanoMelhoriaProximasAcoes() {
  const acoes = [
    {
      id: 1,
      tarefa: "Finalizar testes de Sincronização Grupo",
      responsavel: "Dev Team A",
      prazo: "28 Mai",
      prioridade: "Crítica",
      status: "Em Progresso",
    },
    {
      id: 2,
      tarefa: "Code Review — Motor Financeiro V22",
      responsavel: "CTO",
      prazo: "29 Mai",
      prioridade: "Alta",
      status: "Pendente",
    },
    {
      id: 3,
      tarefa: "Deploy Staging — Módulo Logística",
      responsavel: "DevOps",
      prazo: "31 Mai",
      prioridade: "Alta",
      status: "Pendente",
    },
    {
      id: 4,
      tarefa: "Treinamento QA — Novos Testes",
      responsavel: "QA Lead",
      prazo: "02 Jun",
      prioridade: "Média",
      status: "Agendado",
    },
    {
      id: 5,
      tarefa: "Documentação — API RESTful",
      responsavel: "Tech Writer",
      prazo: "05 Jun",
      prioridade: "Média",
      status: "Planejado",
    },
  ];

  const getPriorBadge = (p) => {
    const map = {
      Crítica: "bg-red-100 text-red-700",
      Alta: "bg-amber-100 text-amber-700",
      Média: "bg-blue-100 text-blue-700",
    };
    return map[p] || "";
  };

  const getStatusBadge = (s) => {
    const map = {
      "Em Progresso": "bg-blue-100 text-blue-700",
      Pendente: "bg-amber-100 text-amber-700",
      Agendado: "bg-green-100 text-green-700",
      Planejado: "bg-slate-100 text-slate-700",
    };
    return map[s] || "";
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-slate-600" />
          Próximas Ações — Próximos 2 Sprints
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {acoes.map((acao) => (
            <div
              key={acao.id}
              className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-medium text-sm text-slate-900">{acao.tarefa}</p>
                <Badge className={`text-[10px] flex-shrink-0 ${getPriorBadge(acao.prioridade)}`}>
                  {acao.prioridade}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                  <User className="w-3 h-3" />
                  <span>{acao.responsavel}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Calendar className="w-3 h-3" />
                  <span>{acao.prazo}</span>
                </div>
                <div className="text-right">
                  <Badge className={`text-[10px] ${getStatusBadge(acao.status)}`}>
                    {acao.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t">
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              <strong>Total:</strong> {acoes.length} ações críticas
            </p>
            <p>
              <strong>Em Progresso:</strong> {acoes.filter((a) => a.status === "Em Progresso").length}
            </p>
            <p>
              <strong>Bloqueadores:</strong> 1 (Sincronização Grupo)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}