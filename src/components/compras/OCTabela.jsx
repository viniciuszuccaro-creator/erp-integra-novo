import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Edit, CheckCircle2, Send, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function OCTabela({
  ocs,
  selectedOCs,
  onToggleOC,
  onSort,
  statusColors,
  onImprimir,
  onVer,
  onEditar,
  onAprovar,
  onEnviar,
  onReceber,
  onAvaliar,
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead />
          <TableHead>
            <button className="hover:underline" onClick={() => onSort('numero_oc')}>Número OC</button>
          </TableHead>
          <TableHead>
            <button className="hover:underline" onClick={() => onSort('fornecedor_nome')}>Fornecedor</button>
          </TableHead>
          <TableHead>
            <button className="hover:underline" onClick={() => onSort('data_solicitacao')}>Data Solicitação</button>
          </TableHead>
          <TableHead>
            <button className="hover:underline" onClick={() => onSort('valor_total')}>Valor</button>
          </TableHead>
          <TableHead>
            <button className="hover:underline" onClick={() => onSort('status')}>Status</button>
          </TableHead>
          <TableHead>
            <button className="hover:underline" onClick={() => onSort('lead_time_real')}>Lead Time</button>
          </TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ocs.map((oc) => (
          <TableRow key={oc.id} className="hover:bg-slate-50">
            <TableCell>
              <Checkbox
                checked={selectedOCs.includes(oc.id)}
                onCheckedChange={() => onToggleOC(oc.id)}
              />
            </TableCell>
            <TableCell className="font-medium">{oc.numero_oc}</TableCell>
            <TableCell>{oc.fornecedor_nome}</TableCell>
            <TableCell>{new Date(oc.data_solicitacao).toLocaleDateString('pt-BR')}</TableCell>
            <TableCell className="font-semibold">
              R$ {oc.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[oc.status]}>
                {oc.status}
              </Badge>
            </TableCell>
            <TableCell>
              {oc.lead_time_real ? (
                <Badge variant="outline" className="text-xs">
                  {oc.lead_time_real} dias
                </Badge>
              ) : (
                <span className="text-slate-400 text-xs">-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" data-permission="Compras.OrdemCompra.imprimir" onClick={() => onImprimir(oc)} title="Imprimir OC" className="text-slate-600">
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-permission="Compras.OrdemCompra.visualizar" onClick={() => onVer(oc)} title="Ver Detalhes">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" data-permission="Compras.OrdemCompra.editar" onClick={() => onEditar(oc)} title="Editar OC">
                  <Edit className="w-4 h-4" />
                </Button>
                {oc.status === 'Solicitada' && (
                  <Button variant="ghost" size="sm" data-permission="Compras.OrdemCompra.aprovar" data-sensitive="true" onClick={() => onAprovar(oc)} className="text-purple-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                {oc.status === 'Aprovada' && (
                  <Button variant="ghost" size="sm" data-permission="Compras.OrdemCompra.enviar_fornecedor" onClick={() => onEnviar(oc)} className="text-indigo-600">
                    <Send className="w-4 h-4" />
                  </Button>
                )}
                {(oc.status === 'Enviada ao Fornecedor' || oc.status === 'Em Processo') && (
                  <Button variant="ghost" size="sm" data-permission="Compras.OrdemCompra.receber" data-sensitive="true" onClick={() => onReceber(oc)} className="text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                )}
                {oc.status === 'Recebida' && !oc.avaliacao_fornecedor?.realizada && (
                  <Button variant="ghost" size="sm" data-permission="Compras.OrdemCompra.avaliar_fornecedor" onClick={() => onAvaliar(oc)} className="text-amber-600">
                    <Star className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}