import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, FileText } from "lucide-react";

export default function RemessaTab({
  titulosAptosRemessa,
  titulosSelecionados,
  setTitulosSelecionados,
  valorTotalSelecionado,
  onGerarRemessa,
  contextoValido,
  podeGerarRemessa,
}) {
  return (
    <div className="space-y-4">
      {titulosSelecionados.length > 0 && (
        <Alert className="border-blue-300 bg-blue-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">{titulosSelecionados.length} título(s) selecionado(s)</p>
              <p className="text-xs text-blue-700">Total: R$ {valorTotalSelecionado.toFixed(2)}</p>
            </div>
            <Button
              data-action="Financeiro.Remessa.gerar"
              onClick={onGerarRemessa}
              disabled={!contextoValido || !podeGerarRemessa}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Gerar Remessa
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Títulos Aptos para Remessa ({titulosAptosRemessa.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={titulosSelecionados.length === titulosAptosRemessa.length && titulosAptosRemessa.length > 0}
                    onCheckedChange={(checked) => {
                      setTitulosSelecionados(checked ? titulosAptosRemessa.map(t => t.id) : []);
                    }}
                    disabled={!contextoValido || !podeGerarRemessa}
                  />
                </TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Canal Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {titulosAptosRemessa.map(titulo => (
                <TableRow key={titulo.id}>
                  <TableCell>
                    <Checkbox
                      checked={titulosSelecionados.includes(titulo.id)}
                      onCheckedChange={() => {
                        setTitulosSelecionados(prev =>
                          prev.includes(titulo.id) ? prev.filter(id => id !== titulo.id) : [...prev, titulo.id]
                        );
                      }}
                      disabled={!contextoValido || !podeGerarRemessa}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{titulo.cliente}</TableCell>
                  <TableCell className="max-w-xs truncate">{titulo.descricao}</TableCell>
                  <TableCell>{new Date(titulo.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-bold">R$ {(titulo.valor || 0).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{titulo.canal_origem || 'Manual'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {titulosAptosRemessa.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum título apto para remessa</p>
              <p className="text-xs mt-2">Títulos devem ter forma de cobrança "Boleto"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}