import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FileText, Tag, Clock, Star } from 'lucide-react';

const artigos = [
  { id: 'A001', titulo: 'Guia Completo: Emissão de NF-e no ERP', categoria: 'Fiscal', tags: ['NF-e', 'Fiscal', 'Tutorial'], relevancia: 98, leituras: 1240, atualizado: '2026-05-20', favorito: true },
  { id: 'A002', titulo: 'Como Criar Ordens de Compra com Aprovação', categoria: 'Compras', tags: ['OC', 'Aprovação', 'Fluxo'], relevancia: 95, leituras: 876, atualizado: '2026-05-18', favorito: false },
  { id: 'A003', titulo: 'Configuração de Regras de Acesso RBAC', categoria: 'Sistema', tags: ['RBAC', 'Segurança', 'Admin'], relevancia: 92, leituras: 654, atualizado: '2026-05-15', favorito: true },
  { id: 'A004', titulo: 'Processo de Fechamento Financeiro Mensal', categoria: 'Financeiro', tags: ['Fechamento', 'DRE', 'Contábil'], relevancia: 89, leituras: 432, atualizado: '2026-05-10', favorito: false },
  { id: 'A005', titulo: 'Roteirização Inteligente de Entregas com IA', categoria: 'Logística', tags: ['Roteirização', 'IA', 'Entrega'], relevancia: 87, leituras: 321, atualizado: '2026-05-08', favorito: false },
];

const categorias = ['Todos', 'Fiscal', 'Compras', 'Sistema', 'Financeiro', 'Logística', 'RH', 'Produção'];

const categoriaCores = {
  Fiscal: 'bg-orange-900 text-orange-200',
  Compras: 'bg-blue-900 text-blue-200',
  Sistema: 'bg-purple-900 text-purple-200',
  Financeiro: 'bg-emerald-900 text-emerald-200',
  Logística: 'bg-cyan-900 text-cyan-200',
  RH: 'bg-pink-900 text-pink-200',
  Produção: 'bg-amber-900 text-amber-200',
};

export default function KnowledgeBaseSearch() {
  const [query, setQuery] = useState('');
  const [catAtiva, setCatAtiva] = useState('Todos');

  const filtrados = artigos.filter(a => {
    const matchQ = !query || a.titulo.toLowerCase().includes(query.toLowerCase()) || a.tags.some(t => t.toLowerCase().includes(query.toLowerCase()));
    const matchC = catAtiva === 'Todos' || a.categoria === catAtiva;
    return matchQ && matchC;
  });

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Busca semântica */}
      <Card className="bg-gradient-to-r from-indigo-900/30 to-slate-800 border-indigo-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="Busca semântica com IA... (ex: como emitir nota fiscal?)"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {query && (
            <p className="text-xs text-indigo-300 mt-2">🤖 IA encontrou {filtrados.length} resultado(s) relevantes para "{query}"</p>
          )}
        </CardContent>
      </Card>

      {/* Filtros por categoria */}
      <div className="flex gap-2 flex-wrap">
        {categorias.map(c => (
          <button
            key={c}
            onClick={() => setCatAtiva(c)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${catAtiva === c ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Artigos */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">{filtrados.length} Artigos Encontrados</h3>
        {filtrados.map(a => (
          <Card key={a.id} className="bg-slate-800 border-slate-700 hover:border-indigo-600 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{a.titulo}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Atualizado {new Date(a.atualizado).toLocaleDateString('pt-BR')}
                        <span>• {a.leituras} leituras</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 items-start">
                    {a.favorito && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                    <span className="text-xs font-bold text-emerald-400">{a.relevancia}%</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={`text-xs ${categoriaCores[a.categoria] || 'bg-slate-700 text-slate-200'}`}>{a.categoria}</Badge>
                  {a.tags.map(t => (
                    <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />{t}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}