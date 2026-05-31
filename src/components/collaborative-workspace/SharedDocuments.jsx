import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Clock, Share2, Lock, Eye, Edit3, Trash2 } from 'lucide-react';

export default function SharedDocuments() {
  const [filter, setFilter] = useState('meus');

  const docs = [
    {
      id: 'D001', nome: 'Plano Comercial Q3 2026', tipo: 'Planilha', tamanho: '2.4 MB',
      dono: 'Ana Costa', empresa: 'Zuccaro SP', compartilhado_com: 5, criado: '25/05',
      modificado: '31/05 14:32', acesso: 'Editor', visibilidade: 'Interno'
    },
    {
      id: 'D002', nome: 'Manual de Qualidade v4.2', tipo: 'PDF', tamanho: '1.8 MB',
      dono: 'Carlos Mendes', empresa: 'Zuccaro Grupo', compartilhado_com: 12, criado: '10/05',
      modificado: '30/05 09:15', acesso: 'Visualizador', visibilidade: 'Grupo'
    },
    {
      id: 'D003', nome: 'Apresentação Resultados Maio', tipo: 'PowerPoint', tamanho: '8.3 MB',
      dono: 'Você', empresa: 'Zuccaro SP', compartilhado_com: 3, criado: '28/05',
      modificado: '31/05 16:45', acesso: 'Proprietário', visibilidade: 'Público'
    },
    {
      id: 'D004', nome: 'Matriz de Risco Operacional', tipo: 'Excel', tamanho: '3.1 MB',
      dono: 'João Silva', empresa: 'Zuccaro RJ', compartilhado_com: 8, criado: '15/05',
      modificado: '29/05 11:20', acesso: 'Comentador', visibilidade: 'Interno'
    },
  ];

  const tipoIcone = (tipo) => {
    if (tipo.includes('PDF')) return '📄';
    if (tipo.includes('Excel') || tipo.includes('Planilha')) return '📊';
    if (tipo.includes('PowerPoint')) return '🎯';
    return '📄';
  };

  const acessoColor = (acesso) => {
    if (acesso === 'Proprietário') return 'bg-purple-900 text-purple-200';
    if (acesso === 'Editor') return 'bg-blue-900 text-blue-200';
    if (acesso === 'Comentador') return 'bg-yellow-900 text-yellow-200';
    return 'bg-slate-700 text-slate-300';
  };

  const visibilidadeIcon = (vis) => {
    if (vis === 'Interno') return <Lock className="w-3 h-3" />;
    return <Eye className="w-3 h-3" />;
  };

  const filtrados = docs.filter(d => {
    if (filter === 'meus') return d.dono === 'Você';
    if (filter === 'compartilhados') return d.compartilhado_com > 0;
    return true;
  });

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      {/* Filtros */}
      <div className="flex gap-2">
        {['meus', 'compartilhados', 'todos'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {f === 'meus' ? `Meus (${docs.filter(d => d.dono === 'Você').length})` : f === 'compartilhados' ? `Compartilhados (${docs.filter(d => d.compartilhado_com > 0).length})` : `Todos (${docs.length})`}
          </button>
        ))}
      </div>

      {/* Documentos */}
      <div className="space-y-2">
        {filtrados.map((doc) => (
          <Card key={doc.id} className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3 flex-1">
                  <div className="text-2xl">{tipoIcone(doc.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{doc.nome}</p>
                    <p className="text-xs text-slate-400">
                      {doc.tipo} • {doc.tamanho} • Criado por {doc.dono} ({doc.empresa})
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Edit3 className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Share2 className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-red-700/20 rounded text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {visibilidadeIcon(doc.visibilidade)}
                  <span className="text-slate-400">{doc.visibilidade}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">{doc.compartilhado_com} compartilhados</span>
                </div>
                <Badge className={acessoColor(doc.acesso)}>{doc.acesso}</Badge>
              </div>

              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>Editado {doc.modificado}</span>
                <span>{doc.criado}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}