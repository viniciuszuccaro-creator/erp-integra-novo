import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ArrowRight, Pencil, Box, Layers, QrCode, Lock } from 'lucide-react';

/**
 * V21.1 - Lista de peças do Armado Padrão + ações de consolidação
 * Vol 5.3: Adicionado QR code, vínculo (ponto/pavimento/posição/revisão) e proteção de remoção.
 */
export default function ArmadoPadraoListaPecas({
  itens,
  onEditar,
  onRemover,
  onConsolidar,
  onGerarComerciais
}) {
  const temItens = itens && itens.length > 0;

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Peças Adicionadas ({itens?.length || 0})</span>
          {temItens && (
            <div className="flex gap-2">
              <Button onClick={onConsolidar} variant="outline" size="sm" className="border-purple-300 text-purple-600">
                <Layers className="w-4 h-4 mr-2" />
                Agrupar por Etapa
              </Button>
              <Button onClick={onGerarComerciais} variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                Enviar para Aba Revenda
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {temItens ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Etapa / Ponto</TableHead>
                  <TableHead>Pav / Pos / Rev</TableHead>
                  <TableHead>Descrição Técnica</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>QR</TableHead>
                  <TableHead className="text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((peca, index) => {
                  const bloqueado = peca?.produzido || (peca?.quantidade_faturada || 0) > 0;
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{peca.identificador}</TableCell>
                      <TableCell>
                        {peca.etapa_obra_nome ? (
                          <Badge className="bg-purple-100 text-purple-700">{peca.etapa_obra_nome}</Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                        {peca.ponto && <p className="text-xs text-slate-500 mt-1">{peca.ponto}</p>}
                      </TableCell>
                      <TableCell className="text-xs">
                        {peca.pavimento && <p>{peca.pavimento}</p>}
                        {peca.posicao && <p>{peca.posicao}</p>}
                        {peca.revisao && <p className="text-slate-400">Rev: {peca.revisao}</p>}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm">{peca.descricao_automatica}</p>
                        {peca.memoria_calculo && (
                          <p className="text-xs text-slate-400 mt-1 italic">{peca.memoria_calculo}</p>
                        )}
                        {bloqueado && (
                          <Badge className="bg-amber-100 text-amber-700 mt-1">
                            <Lock className="w-3 h-3 mr-1" />
                            {peca.produzido ? 'Produzido' : 'Faturado'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{peca.quantidade}</TableCell>
                      <TableCell className="font-semibold">{peca.peso_total_kg?.toFixed(2)} kg</TableCell>
                      <TableCell className="font-semibold text-green-600">R$ {peca.preco_venda_total?.toFixed(2)}</TableCell>
                      <TableCell>
                        {peca.qr_code ? (
                          <div className="flex items-center gap-1" title={peca.qr_code}>
                            <QrCode className="w-4 h-4 text-slate-400" />
                            <span className="font-mono text-xs text-slate-400">{peca.qr_code.slice(-8)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => onEditar(index)} className="text-blue-600 hover:bg-blue-50" title="Editar Peça">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemover(index)}
                            className={bloqueado ? "text-slate-300 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}
                            title={bloqueado ? "Bloqueado: peça produzida/faturada" : "Remover Peça"}
                            disabled={bloqueado}
                          >
                            {bloqueado ? <Lock className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Box className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhuma peça adicionada</p>
            <p className="text-sm mt-1">Selecione um tipo de peça acima para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}