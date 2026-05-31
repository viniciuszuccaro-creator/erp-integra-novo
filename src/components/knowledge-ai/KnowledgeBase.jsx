/**
 * KnowledgeBase v1.0
 * Base de conhecimento corporativo estruturada por categorias
 * Passo 35: Documentos, best practices, procedimentos
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, BookMarked, Eye, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

const KNOWLEDGE_CATEGORIES = [
  {
    id: 1,
    titulo: 'Procedimento de Emissão NF-e',
    categoria: 'Fiscal',
    autor: 'Sistema',
    visualizacoes: 347,
    utilidade: 94,
    tags: ['fiscal', 'nfe', 'obrigatorio'],
    data: '2026-05-15',
  },
  {
    id: 2,
    titulo: 'Best Practice: Gestão de Estoque Crítico',
    categoria: 'Estoque',
    autor: 'Gerente Estoque',
    visualizacoes: 212,
    utilidade: 89,
    tags: ['estoque', 'critico', 'best-practice'],
    data: '2026-05-20',
  },
  {
    id: 3,
    titulo: 'Troubleshooting: Sistema Lento?',
    categoria: 'Suporte',
    autor: 'TI',
    visualizacoes: 156,
    utilidade: 87,
    tags: ['performance', 'suporte', 'troubleshooting'],
    data: '2026-05-18',
  },
  {
    id: 4,
    titulo: 'Como Configurar Integração Marketplace',
    categoria: 'Integrações',
    autor: 'Sistema',
    visualizacoes: 423,
    utilidade: 92,
    tags: ['marketplace', 'integracao', 'ecommerce'],
    data: '2026-05-22',
  },
  {
    id: 5,
    titulo: 'Dúvidas Frequentes: Financeiro',
    categoria: 'Financeiro',
    autor: 'CFO',
    visualizacoes: 289,
    utilidade: 91,
    tags: ['financeiro', 'faq', 'duvidas'],
    data: '2026-05-10',
  },
];

const CATEGORIES_COLOR = {
  'Fiscal': 'bg-red-500/20 text-red-300',
  'Estoque': 'bg-blue-500/20 text-blue-300',
  'Suporte': 'bg-cyan-500/20 text-cyan-300',
  'Integrações': 'bg-purple-500/20 text-purple-300',
  'Financeiro': 'bg-green-500/20 text-green-300',
};

export default function KnowledgeBase({ empresa }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = KNOWLEDGE_CATEGORIES.filter(
    (k) => k.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
           k.tags.some((t) => t.includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BookMarked className="w-6 h-6 text-indigo-400" />
        Base de Conhecimento — {empresa}
      </h2>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white/5 border border-indigo-500/30 rounded-lg px-4 py-2">
        <Search className="w-4 h-4 text-indigo-400" />
        <input
          type="text"
          placeholder="Buscar procedimento, best practice..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm"
        />
      </div>

      {/* Conhecimentos */}
      <div className="space-y-3">
        {filtered.map((kb) => (
          <Card key={kb.id} className="p-4 bg-white/5 border border-indigo-500/30 rounded-lg hover:border-indigo-400/60 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{kb.titulo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={CATEGORIES_COLOR[kb.categoria]}>{kb.categoria}</Badge>
                  <p className="text-xs text-slate-400">por {kb.autor} • {kb.data}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {kb.tags.map((tag) => (
                <Badge key={tag} className="text-xs bg-indigo-500/10 text-indigo-200">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {kb.visualizacoes} visualizações
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                Utilidade: {kb.utilidade}%
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-6 text-center bg-white/5 border border-indigo-500/20 rounded-lg">
          <p className="text-slate-400 text-sm">Nenhum conhecimento encontrado para "{searchTerm}"</p>
        </Card>
      )}
    </div>
  );
}