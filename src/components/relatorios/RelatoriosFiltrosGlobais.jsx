import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Building2, Calendar } from "lucide-react";
import useContextoVisual from "@/components/lib/useContextoVisual";

const PERIODOS = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Última Semana" },
  { value: "mes", label: "Este Mês" },
  { value: "trimestre", label: "Último Trimestre" },
  { value: "semestre", label: "Último Semestre" },
  { value: "ano", label: "Este Ano" },
  { value: "personalizado", label: "Personalizado" },
];

function calcularDatas(periodo) {
  const hoje = new Date();
  let inicio = new Date();
  switch (periodo) {
    case "hoje": inicio = hoje; break;
    case "semana": inicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case "mes": inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1); break;
    case "trimestre": inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1); break;
    case "semestre": inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1); break;
    case "ano": inicio = new Date(hoje.getFullYear(), 0, 1); break;
    default: return null;
  }
  return {
    data_inicio: inicio.toISOString().split("T")[0],
    data_fim: hoje.toISOString().split("T")[0],
  };
}

export default function RelatoriosFiltrosGlobais({ filtros, setFiltros, extraFilters }) {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();

  const activeCount = [
    filtros.periodo && filtros.periodo !== "mes",
    filtros.status && filtros.status !== "todos",
    filtros.tipo && filtros.tipo !== "todos",
  ].filter(Boolean).length;

  const handlePeriodo = (value) => {
    if (value === "personalizado") {
      setFiltros({ ...filtros, periodo: value });
      return;
    }
    const datas = calcularDatas(value);
    setFiltros({ ...filtros, periodo: value, ...datas });
  };

  const handleClear = () => {
    const datas = calcularDatas("mes");
    setFiltros({ periodo: "mes", status: "todos", tipo: "todos", ...datas });
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-4">
        {/* Linha de contexto multiempresa */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500">Contexto:</span>
          {contexto === "grupo" ? (
            <Badge className="bg-indigo-100 text-indigo-700 text-xs">
              Grupo: {grupoAtual?.nome || "Todos"}
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-700 text-xs">
              {empresaAtual?.nome_fantasia || empresaAtual?.razao_social || "Empresa atual"}
            </Badge>
          )}
          {activeCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 text-xs ml-auto">
              {activeCount} filtro(s) ativo(s)
            </Badge>
          )}
        </div>

        {/* Filtros principais */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Período rápido */}
          <div className="min-w-[160px]">
            <Label className="text-xs flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" /> Período
            </Label>
            <Select value={filtros.periodo || "mes"} onValueChange={handlePeriodo}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODOS.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datas manuais */}
          <div className="flex gap-2 items-end">
            <div>
              <Label className="text-xs mb-1 block">De</Label>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={filtros.data_inicio || ""}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value, periodo: "personalizado" })}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Até</Label>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={filtros.data_fim || ""}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value, periodo: "personalizado" })}
              />
            </div>
          </div>

          {/* Status */}
          <div className="min-w-[130px]">
            <Label className="text-xs mb-1 block">Status</Label>
            <Select value={filtros.status || "todos"} onValueChange={(v) => setFiltros({ ...filtros, status: v })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos" className="text-xs">Todos</SelectItem>
                <SelectItem value="Ativo" className="text-xs">Ativo</SelectItem>
                <SelectItem value="Pendente" className="text-xs">Pendente</SelectItem>
                <SelectItem value="Cancelado" className="text-xs">Cancelado</SelectItem>
                <SelectItem value="Entregue" className="text-xs">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros extras injetados por quem usa */}
          {extraFilters}

          {/* Ações */}
          <div className="flex gap-2 ml-auto">
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-slate-500" onClick={handleClear}>
                <X className="h-3 w-3" /> Limpar
              </Button>
            )}
            <Button size="sm" className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700">
              <Filter className="h-3 w-3" /> Aplicar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}