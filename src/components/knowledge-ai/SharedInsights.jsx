/**
 * SharedInsights v1.0
 * Insights compartilhados entre empresas do grupo
 * Passo 35: Conhecimento corporativo unificado
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Award } from 'lucide-react';

const SHARED_INSIGHTS = [
  {
    id: 1,
    titulo: 'Best Practice: Reduzir Lead Time em 15%',
    origem: 'Zuccaro MG',
    contribuidores: 4,
    impacto: 'R$ 340k/ano',
    upvotes: 67,
    categoria: 'Operacional',
  },
  {
    id: 2,
    titulo: 'Estratégia: Otimização de Frete com IA',
    origem: 'Zuccaro Brasil',
    contribuidores: 7,
    impacto: 'R$ 580k/ano',
    upvotes: 94,
    categoria: 'Logística',
  },
  {
    id: 3,
    titulo: 'Procedimento Padronizado: Onboarding de Fornecedor',
    origem: 'Zuccaro SP',
    contribuidores: 3,
    impacto: 'Reduz ciclo em 5 dias',
    upvotes: 52,
    categoria: 'Suprimentos',
  },
  {
    id: 4,
    titulo: 'Caso de Sucesso: Aumento de Conversão 23% (E-commerce)',
    origem: 'Zuccaro MG',
    contribuidores: 5,
    impacto: 'R$ 420k em 3 meses',
    upvotes: 78,
    categoria: 'Comercial',
  },
];

export default function SharedInsights({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Share2 className="w-6 h-6 text-indigo-400" />
        Insights Compartilhados do Grupo
      </h2>

      <div className="space-y-3">
        {SHARED_INSIGHTS.map((insight) => (
          <Card key={insight.id} className="p-4 bg-white/5 border border-indigo-500/30 rounded-lg hover:border-indigo-400/60 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{insight.titulo}</p>
                <p className="text-xs text-slate-400 mt-1">De: {insight.origem}</p>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">{insight.categoria}</Badge>
            </div>

            {/* Impacto */}
            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div className="p-2 bg-white/5 rounded">
                <p className="text-slate-400">Impacto</p>
                <p className="text-white font-bold">{insight.impacto}</p>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <p className="text-slate-400">Contribuidores</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-indigo-400" />
                  <p className="text-white font-bold">{insight.contribuidores} pessoas</p>
                </div>
              </div>
            </div>

            {/* Upvotes */}
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">{insight.upvotes} aprovações</span>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card className="p-4 bg-indigo-500/10 border border-indigo-400/40 rounded-lg">
        <p className="text-sm font-semibold text-indigo-300 mb-1">🚀 Compartilhe Seu Conhecimento</p>
        <p className="text-xs text-slate-300">Contribua com suas melhores práticas e aproveite o conhecimento coletivo do grupo!</p>
        <button className="mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors">
          Criar Novo Insight
        </button>
      </Card>
    </div>
  );
}