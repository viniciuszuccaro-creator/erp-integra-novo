import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Eye, Edit, CheckCircle2, Send, Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import RBACButton from "@/components/lib/RBACButton";

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
                <RBACButton module="Compras" section="OrdemCompra" action="imprimir" variant="ghost" size="sm" onClick={() => onImprimir(oc)} title="Imprimir OC" className="text-slate-600">
                  <Printer className="w-4 h-4" />
                </RBACButton>
                <RBACButton module="Compras" section="OrdemCompra" action="visualizar" variant="ghost" size="sm" onClick={() => onVer(oc)} title="Ver Detalhes">
                  <Eye className="w-4 h-4" />
                </RBACButton>
                <RBACButton module="Compras" section="OrdemCompra" action="editar" variant="ghost" size="sm" onClick={() => onEditar(oc)} title="Editar OC">
                  <Edit className="w-4 h-4" />
                </RBACButton>
                {oc.status === 'Solicitada' && (
                  <RBACButton module="Compras" section="OrdemCompra" action="aprovar" variant="ghost" size="sm" onClick={() => onAprovar(oc)} className="text-purple-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </RBACButton>
                )}
                {oc.status === 'Aprovada' && (
                  <RBACButton module="Compras" section="OrdemCompra" action="enviar" variant="ghost" size="sm" onClick={() => onEnviar(oc)} className="text-indigo-600">
                    <Send className="w-4 h-4" />
                  </RBACButton>
                )}
                {(oc.status === 'Enviada ao Fornecedor' || oc.status === 'Em Processo') && (
                  <RBACButton module="Compras" section="OrdemCompra" action="receber" variant="ghost" size="sm" onClick={() => onReceber(oc)} className="text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </RBACButton>
                )}
                {oc.status === 'Recebida' && !oc.avaliacao_fornecedor?.realizada && (
                  <RBACButton module="Compras" section="OrdemCompra" action="avaliar" variant="ghost" size="sm" onClick={() => onAvaliar(oc)} className="text-amber-600">
                    <Star className="w-4 h-4" />
                  </RBACButton>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}