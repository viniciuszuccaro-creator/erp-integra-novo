import React, { useState } from 'react';
import { FileText, Download, Share2, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SharedDocumentsPanel() {
  const [documents] = useState([
    {
      id: '1',
      nome: 'Política de Preços 2026',
      tipo: 'pdf',
      tamanho: '2.4 MB',
      compartilhadoPor: 'João Silva',
      data: '2026-05-30',
      acessos: 12,
      compartilhadoCom: ['Maria Santos', 'Carlos Mendes']
    },
    {
      id: '2',
      nome: 'Plano de Vendas Q2',
      tipo: 'xlsx',
      tamanho: '1.8 MB',
      compartilhadoPor: 'Maria Santos',
      data: '2026-05-29',
      acessos: 8,
      compartilhadoCom: ['João Silva', 'Equipe Comercial']
    },
    {
      id: '3',
      nome: 'Processo de Aprovação Pedidos',
      tipo: 'doc',
      tamanho: '890 KB',
      compartilhadoPor: 'Carlos Mendes',
      data: '2026-05-28',
      acessos: 15,
      compartilhadoCom: ['Todos']
    }
  ]);

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {documents.map((doc) => (
        <Card key={doc.id} className="bg-white border-emerald-200 hover:border-emerald-400 transition">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-emerald-50 rounded">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base text-slate-900">{doc.nome}</CardTitle>
                  <p className="text-xs text-slate-600 mt-1">
                    {doc.compartilhadoPor} • {doc.data} • {doc.acessos} acessos
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">{doc.tipo.toUpperCase()}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Detalhes */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-2 rounded">
                <p className="text-xs text-slate-600">Tamanho</p>
                <p className="font-semibold text-slate-900">{doc.tamanho}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <p className="text-xs text-slate-600">Compartilhado com</p>
                <p className="font-semibold text-slate-900 text-xs">
                  {doc.compartilhadoCom.length} {doc.compartilhadoCom.length === 1 ? 'pessoa' : 'pessoas'}
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button data-permission="Sistema.SharedDocuments.baixar" variant="outline" size="sm" className="flex-1">
                <Eye className="w-3 h-3 mr-1" />
                Visualizar
              </Button>
              <Button data-permission="Sistema.SharedDocuments.baixar" variant="outline" size="sm" className="flex-1">
                <Download className="w-3 h-3 mr-1" />
                Baixar
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Share2 className="w-3 h-3 mr-1" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}