import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, ArrowRight, Pencil, Box, Layers } from 'lucide-react';

/**
 * V21.1 - Lista de peças do Armado Padrão + ações de consolidação
 * Extraído de ArmadoPadraoTab.jsx.
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
              <Button onClick={onConsolidar} data-permission="Comercial.ArmadoPadrao.visualizar" variant="outline" size="sm" className="border-purple-300 text-purple-600">
                <Layers className="w-4 h-4 mr-2" />
                Agrupar por Etapa
              </Button>
              <Button onClick={onGerarComerciais} data-permission="Comercial.ArmadoPadrao.criar" variant="outline" size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                Enviar para Aba Revenda
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {temItens ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>ID</TableHead>
                <TableHead>Etapa Obra</TableHead>
                <TableHead>Descrição Técnica</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-center">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((peca, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{peca.identificador}</TableCell>
                  <TableCell>
                    {peca.etapa_obra_nome ? (
                      <Badge className="bg-purple-100 text-purple-700">{peca.etapa_obra_nome}</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm">{peca.descricao_automatica}</p>
                  </TableCell>
                  <TableCell>{peca.quantidade}</TableCell>
                  <TableCell className="font-semibold">{peca.peso_total_kg?.toFixed(2)} kg</TableCell>
                  <TableCell className="font-semibold text-green-600">R$ {peca.preco_venda_total?.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" data-permission="Comercial.ArmadoPadrao.editar" onClick={() => onEditar(index)} className="text-blue-600 hover:bg-blue-50" title="Editar Peça">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-permission="Comercial.ArmadoPadrao.excluir" onClick={() => onRemover(index)} className="text-red-600 hover:bg-red-50" title="Remover Peça">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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