import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Building2 } from "lucide-react";
import useContextoVisual from "@/components/lib/useContextoVisual";

const PERIODOS = [
  { label: 'Hoje', dias: 0 },
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: 'Este mês', mes: true },
  { label: 'Este ano', ano: true },
];

export default function FiltrosPeriodoEmpresa({ filtros, setFiltros }) {
  const { empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();

  const aplicarPeriodo = (p) => {
    const hoje = new Date();
    const fim = hoje.toISOString().split('T')[0];
    let inicio;
    if (p.ano) {
      inicio = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
    } else if (p.mes) {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    } else if (p.dias === 0) {
      inicio = fim;
    } else {
      const d = new Date(hoje);
      d.setDate(d.getDate() - p.dias);
      inicio = d.toISOString().split('T')[0];
    }
    setFiltros(f => ({ ...f, data_inicio: inicio, data_fim: fim }));
  };

  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-slate-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
            <Building2 className="w-4 h-4" />
            <span>{estaNoGrupo ? `Grupo: ${grupoAtual?.razao_social || 'Todos'}` : `Empresa: ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || 'N/A'}`}</span>
          </div>

          <div className="flex-1 flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Data Início</Label>
              <Input type="date" value={filtros.data_inicio} onChange={e => setFiltros(f => ({ ...f, data_inicio: e.target.value }))} className="h-8 text-sm w-36" />
            </div>
            <div>
              <Label className="text-xs text-slate-600 mb-1 block">Data Fim</Label>
              <Input type="date" value={filtros.data_fim} onChange={e => setFiltros(f => ({ ...f, data_fim: e.target.value }))} className="h-8 text-sm w-36" />
            </div>
            <div className="flex gap-1 flex-wrap">
              {PERIODOS.map(p => (
                <Button key={p.label} size="sm" variant="outline" className="h-8 text-xs" onClick={() => aplicarPeriodo(p)}>
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}