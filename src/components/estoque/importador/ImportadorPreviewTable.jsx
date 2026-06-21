import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Loader2, Wand2 } from "lucide-react";
import { makeKey } from "./importadorHelpers";

export default function ImportadorPreviewTable({
  preview, totalLinhas, invalidNCMKeys, ncmSuggestions, suggesting,
  importarParaTodasEmpresas, grupoId, sugerirNCMsIA, applyAllSuggestions, applySuggestion
}) {
  if (!preview.length) return null;

  return (
    <div className="border rounded mt-2">
      <div className="bg-slate-50 border-b p-3 flex items-center justify-between">
        <span className="text-sm font-semibold">
          Pré-visualização ({preview.length}/{totalLinhas})
          {(importarParaTodasEmpresas || (!grupoId)) ? '' : ' • Modo: Grupo'}
          {' '}• NCMs pendentes: {invalidNCMKeys.size}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={sugerirNCMsIA} disabled={suggesting || invalidNCMKeys.size === 0} className="gap-1">
            {suggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Sugerir NCMs (IA)
          </Button>
          {Object.keys(ncmSuggestions || {}).length > 0 && (
            <Button variant="secondary" size="sm" onClick={applyAllSuggestions}>Aplicar todos</Button>
          )}
        </div>
      </div>
      <div className="max-h-64 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-white">
              <TableHead>Código</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>UN</TableHead>
              <TableHead>Est. Mín.</TableHead>
              <TableHead>NCM</TableHead>
              <TableHead>Sugestão IA</TableHead>
              <TableHead>Custo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((p, idx) => {
              const key = makeKey(p.empresa_id, p.codigo);
              const ncmPendente = invalidNCMKeys.has(key);
              return (
                <TableRow key={idx}>
                  <TableCell>{p.codigo || "-"}</TableCell>
                  <TableCell className="font-medium">{p.descricao}</TableCell>
                  <TableCell>{p.unidade_medida}</TableCell>
                  <TableCell>{p.estoque_minimo ?? 0}</TableCell>
                  <TableCell className={ncmPendente ? "bg-amber-50 text-amber-800" : ""}>
                    <div className="flex items-center gap-1">
                      <span>{p.ncm || "-"}</span>
                      {ncmPendente && <AlertCircle className="w-4 h-4 text-amber-600" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ncmPendente ? (
                      ncmSuggestions[key] ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ncmSuggestions[key]}</Badge>
                          <Button size="sm" variant="outline" onClick={() => applySuggestion(key)}>Aplicar</Button>
                        </div>
                      ) : <span className="text-amber-600 text-xs">Aguardando</span>
                    ) : <span className="text-green-600 text-xs">OK</span>}
                  </TableCell>
                  <TableCell>R$ {(p.custo_aquisicao || 0).toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}