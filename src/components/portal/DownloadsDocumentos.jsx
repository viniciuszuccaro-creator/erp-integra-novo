import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Download, Eye, Search, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * Downloads de Documentos (NF-e, Boletos, etc)
 * V12.0 - Com busca e filtros
 */
export default function DownloadsDocumentos({ clienteId, notasFiscais = [] }) {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const documentosFiltrados = notasFiscais.filter(nf => {
    const matchBusca = nf.numero?.includes(busca) || 
                       nf.chave_acesso?.includes(busca);
    const matchTipo = filtroTipo === 'todos' || nf.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Meus Documentos Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Filtros */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por número ou chave..."
              className="pl-10"
            />
          </div>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="NF-e (Saída)">NF-e Saída</option>
            <option value="NF-e (Entrada)">NF-e Entrada</option>
            <option value="NFC-e">NFC-e</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Número/Série</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Downloads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentosFiltrados.map(nf => (
                <TableRow key={nf.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{nf.numero}/{nf.serie}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {nf.chave_acesso?.slice(0, 20)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(nf.data_emissao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    R$ {nf.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      nf.status === 'Autorizada' ? 'bg-green-100 text-green-700' :
                      nf.status === 'Cancelada' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {nf.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      {nf.xml_nfe && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(nf.xml_nfe, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          XML
                        </Button>
                      )}
                      {nf.pdf_danfe && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(nf.pdf_danfe, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {documentosFiltrados.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhum documento encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}