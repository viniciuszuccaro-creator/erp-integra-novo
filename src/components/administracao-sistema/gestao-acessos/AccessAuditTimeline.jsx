import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, FileText, Search, AlertTriangle, CheckCircle2, Lock } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];

const ACAO_CONFIG = {
  "Bloqueio":      { color: "bg-red-100 text-red-700",     icon: Lock },
  "Criação":       { color: "bg-blue-100 text-blue-700",   icon: CheckCircle2 },
  "Edição":        { color: "bg-amber-100 text-amber-700", icon: FileText },
  "Exclusão":      { color: "bg-red-100 text-red-700",     icon: AlertTriangle },
  "Visualização":  { color: "bg-slate-100 text-slate-600", icon: Clock },
};

const PAGE_SIZE = 10;

export default function AccessAuditTimeline({ auditorias = [] }) {
  const [search, setSearch] = useState("");
  const [filterAcao, setFilterAcao] = useState("todas");
  const [page, setPage] = useState(0);

  const rows = safeArray(auditorias);

  const acoes = ["todas", ...Array.from(new Set(rows.map(r => r.acao).filter(Boolean)))];

  const filtered = rows.filter(item => {
    const matchAcao = filterAcao === "todas" || item.acao === filterAcao;
    const matchSearch = !search || [item.usuario, item.descricao, item.entidade].join(" ").toLowerCase().includes(search.toLowerCase());
    return matchAcao && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Auditoria de Acessos</h3>
          </div>
          <Badge variant="outline">{filtered.length} evento(s)</Badge>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <Input
              className="pl-8 h-8 text-xs"
              placeholder="Buscar evento..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {acoes.slice(0, 6).map(acao => (
              <Button
                key={acao}
                size="sm"
                variant={filterAcao === acao ? "default" : "outline"}
                className="h-8 text-xs px-2"
                onClick={() => { setFilterAcao(acao); setPage(0); }}
              >
                {acao === "todas" ? "Todas" : acao}
              </Button>
            ))}
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 text-center">
            Nenhum evento encontrado no escopo atual.
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((item, idx) => {
              const cfg = ACAO_CONFIG[item.acao] || ACAO_CONFIG["Visualização"];
              const Icon = cfg.icon;
              return (
                <div key={item.id || `${item.acao}-${item.data_hora}-${idx}`} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 bg-slate-50 hover:bg-white transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-900">{item.acao || "Evento"}</p>
                      <Badge className={cfg.color + " text-[10px]"}>{item.entidade || "Acesso"}</Badge>
                      {item.empresa_nome && (
                        <Badge variant="outline" className="text-[10px]">{item.empresa_nome}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 break-words mt-0.5">{item.descricao || "Sem descrição"}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {item.usuario || "Usuário"} • {item.data_hora ? new Date(item.data_hora).toLocaleString("pt-BR") : "sem data"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              ← Anterior
            </Button>
            <span className="text-xs text-slate-500">{page + 1}/{totalPages}</span>
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Próxima →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}