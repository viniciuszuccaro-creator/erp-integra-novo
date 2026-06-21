import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { makeKey } from "./importadorHelpers";

export default function ImportadorDuplicidadesPanel({
  duplicidades, estrategiaDuplicidadeGlobal, setEstrategiaDuplicidadeGlobal,
  escolhasDuplicidades, setEscolhasDuplicidades
}) {
  if (!duplicidades.length) return null;

  return (
    <Card className="border-amber-200 mt-4">
      <CardHeader className="bg-amber-50 border-b">
        <CardTitle className="text-sm">Produtos duplicados ({duplicidades.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Estratégia Global:</span>
          <Select value={estrategiaDuplicidadeGlobal} onValueChange={(v) => {
            setEstrategiaDuplicidadeGlobal(v);
            const all = {};
            duplicidades.forEach(d => { all[makeKey(d.empresa_id, d.codigo)] = v; });
            setEscolhasDuplicidades(all);
          }}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pular">Pular (manter existente)</SelectItem>
              <SelectItem value="atualizar">Atualizar (mesclar dados)</SelectItem>
              <SelectItem value="substituir">Substituir (sobrescrever)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-xs text-blue-800">
            <strong>Pular:</strong> Mantém existente. <strong>Atualizar:</strong> Mescla dados. <strong>Substituir:</strong> Sobrescreve tudo.
          </AlertDescription>
        </Alert>
        <div className="max-h-56 overflow-auto border rounded">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead>Empresa</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descrição (existente → novo)</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicidades.map((d, idx) => {
                const key = makeKey(d.empresa_id, d.codigo);
                return (
                  <TableRow key={idx}>
                    <TableCell className="text-xs">{d.empresa_id}</TableCell>
                    <TableCell>{d.codigo}</TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div><span className="text-slate-500">Existente:</span> {d.existente?.descricao || '-'}</div>
                        <div><span className="text-slate-500">Novo:</span> {d.novo?.descricao || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={escolhasDuplicidades[key] || ''} onValueChange={(v) => setEscolhasDuplicidades(prev => ({ ...prev, [key]: v }))}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Escolha" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pular">Pular</SelectItem>
                          <SelectItem value="atualizar">Atualizar</SelectItem>
                          <SelectItem value="substituir">Substituir</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}