import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Layers, Upload, ArrowRight, Lock, QrCode } from "lucide-react";
import { toast } from "sonner";

/**
 * Vol 5.4: Tabela de posições de corte e dobra com vínculo, QR code e proteção de remoção.
 */
export default function PosicoesTable({ itens, onRemover, onConsolidar, onSelecionar, posicaoSelecionada, onNext }) {
  const count = itens?.length || 0;
  return (
    <>
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Planilha de Posições ({count})</span>
            {count > 0 && (
              <Button onClick={onConsolidar} size="sm" variant="outline" className="border-purple-300 text-purple-600">
                <Layers className="w-3 h-3 mr-2" />
                Consolidar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {count > 0 ? (
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Pos</TableHead>
                    <TableHead>Etapa / Ponto</TableHead>
                    <TableHead>Pav / Pos</TableHead>
                    <TableHead>Bitola</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Medidas</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>QR</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((pos, index) => {
                    const bloqueado = pos?.produzido || (pos?.quantidade_faturada || 0) > 0;
                    return (
                      <TableRow
                        key={index}
                        className={`cursor-pointer hover:bg-blue-50 ${posicaoSelecionada === index ? 'bg-blue-100' : ''}`}
                        onClick={() => onSelecionar(index)}
                      >
                        <TableCell className="font-mono font-bold">{pos.codigo}</TableCell>
                        <TableCell>
                          {pos.etapa_obra_nome ? (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">{pos.etapa_obra_nome}</Badge>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                          {pos.ponto && <p className="text-xs text-slate-500 mt-1">{pos.ponto}</p>}
                        </TableCell>
                        <TableCell className="text-xs">
                          {pos.pavimento && <p>{pos.pavimento}</p>}
                          {pos.posicao && <p>{pos.posicao}</p>}
                          {pos.revisao && <p className="text-slate-400">Rev: {pos.revisao}</p>}
                        </TableCell>
                        <TableCell>
                          {pos.bitola}mm
                          {pos.origem_ia && <Badge className="ml-1 bg-purple-600 text-xs">IA</Badge>}
                        </TableCell>
                        <TableCell><Badge variant="outline">{pos.formato}</Badge></TableCell>
                        <TableCell className="text-xs">
                          {Object.entries(pos.medidas || {}).map(([k, v]) => (
                            <span key={k} className="mr-2">{k}:{v}cm</span>
                          ))}
                          {pos.memoria_calculo && (
                            <p className="text-slate-400 italic mt-1">{pos.memoria_calculo}</p>
                          )}
                          {bloqueado && (
                            <Badge className="bg-amber-100 text-amber-700 mt-1">
                              <Lock className="w-3 h-3 mr-1" />
                              {pos.produzido ? 'Produzido' : 'Faturado'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{pos.quantidade}</TableCell>
                        <TableCell className="font-semibold">{pos.peso_kg?.toFixed(2)} kg</TableCell>
                        <TableCell>
                          {pos.qr_code ? (
                            <div className="flex items-center gap-1" title={pos.qr_code}>
                              <QrCode className="w-4 h-4 text-slate-400" />
                              <span className="font-mono text-xs text-slate-400">{pos.qr_code.slice(-8)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onRemover(index); }}
                            className={bloqueado ? "text-slate-300 cursor-not-allowed" : "text-red-600"}
                            title={bloqueado ? "Bloqueado: posição produzida/faturada" : "Remover Posição"}
                            disabled={bloqueado}
                          >
                            {bloqueado ? <Lock className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Upload className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma posição adicionada</p>
              <p className="text-sm mt-1">Use IA ou adicione manualmente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {count > 0 && (
        <Button
          onClick={() => { toast.success('✅ Posições disponíveis para próxima etapa'); onNext(); }}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Próximo: Histórico do Cliente
        </Button>
      )}
    </>
  );
}