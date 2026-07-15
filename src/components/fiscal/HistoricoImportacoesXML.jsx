import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileText, 
  Eye, 
  Download, 
  CheckCircle2, 
  Package,
  DollarSign,
  Calendar,
  Hash
} from 'lucide-react';

/**
 * Histórico de Importações de XML
 */
export default function HistoricoImportacoesXML({ empresaId }) {
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [importacaoSelecionada, setImportacaoSelecionada] = useState(null);

  const { data: importacoes = [], isLoading } = useQuery({
    queryKey: ['importacoes-xml', empresaId],
    queryFn: async () => {
      const result = await base44.entities.ImportacaoXMLNFe.filter(
        { empresa_id: empresaId },
        '-data_importacao',
        50
      );
      return result;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Histórico de Importações ({importacoes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>NF-e</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importacoes.map((imp) => (
                <TableRow key={imp.id} className="hover:bg-slate-50">
                  <TableCell className="text-sm">
                    {new Date(imp.data_importacao).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">
                        {imp.numero_nfe} / {imp.serie_nfe}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {imp.chave_acesso?.substring(0, 20)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{imp.fornecedor_nome}</p>
                      <p className="text-xs text-slate-500">{imp.fornecedor_cnpj}</p>
                      {imp.fornecedor_criado && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">
                          Criado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    R$ {imp.valor_total_nfe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{imp.quantidade_itens}</Badge>
                    {imp.produtos_criados_automaticamente > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        +{imp.produtos_criados_automaticamente} criados
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      imp.status_processamento === 'Processado' ? 'bg-green-100 text-green-700' :
                      imp.status_processamento === 'Erro' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }>
                      {imp.status_processamento}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setImportacaoSelecionada(imp);
                          setDetalhesOpen(true);
                        }}
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {imp.arquivo_xml_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(imp.arquivo_xml_url, '_blank')}
                          title="Download XML"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {importacoes.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma importação realizada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Detalhes da Importação - NF-e {importacaoSelecionada?.numero_nfe}
            </DialogTitle>
          </DialogHeader>

          {importacaoSelecionada && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Data Importação</p>
                        <p className="font-semibold text-sm">
                          {new Date(importacaoSelecionada.data_importacao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-600">Itens</p>
                        <p className="font-bold text-blue-600">{importacaoSelecionada.quantidade_itens}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-slate-600">Valor Total</p>
                        <p className="font-bold text-green-600">
                          R$ {importacaoSelecionada.valor_total_nfe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-slate-600">Status</p>
                        <Badge className="bg-green-600 text-xs">{importacaoSelecionada.status_processamento}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fornecedor */}
              <Card>
                <CardHeader className="bg-slate-50">
                  <p className="font-semibold text-sm">Fornecedor</p>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="font-semibold">{importacaoSelecionada.fornecedor_nome}</p>
                  <p className="text-sm text-slate-600">CNPJ: {importacaoSelecionada.fornecedor_cnpj}</p>
                  {importacaoSelecionada.fornecedor_criado && (
                    <Badge className="bg-blue-100 text-blue-700 mt-2">
                      Fornecedor criado automaticamente
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Documentos Gerados */}
              <Card>
                <CardHeader className="bg-slate-50">
                  <p className="font-semibold text-sm">Documentos Gerados</p>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {importacaoSelecionada.ordem_compra_criada && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>Ordem de Compra criada</span>
                    </div>
                  )}
                  {importacaoSelecionada.entrada_estoque_realizada && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>
                        {importacaoSelecionada.movimentacoes_estoque_ids?.length || 0} entrada(s) no estoque
                      </span>
                    </div>
                  )}
                  {importacaoSelecionada.conta_pagar_criada && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>
                        {importacaoSelecionada.contas_pagar_ids?.length || 0} conta(s) a pagar criada(s)
                      </span>
                    </div>
                  )}
                  {importacaoSelecionada.produtos_criados_automaticamente > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>
                        {importacaoSelecionada.produtos_criados_automaticamente} produto(s) criado(s)
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chave de Acesso */}
              <div className="p-3 bg-slate-50 rounded">
                <p className="text-xs text-slate-600 mb-1">Chave de Acesso</p>
                <p className="font-mono text-xs text-slate-800">{importacaoSelecionada.chave_acesso}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}