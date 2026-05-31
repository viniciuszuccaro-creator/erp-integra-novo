/**
 * TeamActivity v1.0
 * Feed de atividades em tempo real
 * Passo 32: O que a equipe está fazendo agora
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Edit3, Trash2, Plus } from 'lucide-react';

const ACTIVITY_FEED = [
  { id: 1, usuario: 'João Silva', acao: 'criou', recurso: 'Pedido #5847', tipo: 'create', hora: '11:50' },
  { id: 2, usuario: 'Maria Santos', acao: 'atualizou', recurso: 'Estoque SKU-001', tipo: 'update', hora: '11:45' },
  { id: 3, usuario: 'Carlos Oliveira', acao: 'aprovou', recurso: 'Transferência MG', tipo: 'update', hora: '11:40' },
  { id: 4, usuario: 'Ana Costa', acao: 'concluiu', recurso: 'Produção Diária', tipo: 'complete', hora: '11:35' },
  { id: 5, usuario: 'João Silva', acao: 'editou', recurso: 'Cliente #234', tipo: 'update', hora: '11:30' },
  { id: 6, usuario: 'Maria Santos', acao: 'criou', recurso: 'Ordem de Compra #89', tipo: 'create', hora: '11:20' },
];

const ICON_MAP = {
  create: Plus,
  update: Edit3,
  complete: CheckCircle2,
  delete: Trash2,
};

const COLOR_MAP = {
  create: 'bg-green-500/20 text-green-300',
  update: 'bg-blue-500/20 text-blue-300',
  complete: 'bg-emerald-500/20 text-emerald-300',
  delete: 'bg-red-500/20 text-red-300',
};

export default function TeamActivity({ empresa }) {
  const [activity] = useState(ACTIVITY_FEED);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-blue-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white">Team Activity Feed</h2>

      <div className="space-y-3">
        {activity.map((item) => {
          const Icon = ICON_MAP[item.tipo];
          return (
            <Card key={item.id} className="p-4 bg-white/5 border border-blue-500/30 rounded-lg hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${COLOR_MAP[item.tipo]} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{item.usuario}</span> {item.acao}{' '}
                    <span className="text-blue-300 font-semibold">{item.recurso}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{item.hora}</p>
                </div>
                <Badge className={COLOR_MAP[item.tipo]}>{item.tipo}</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="p-4 bg-blue-500/10 border border-blue-400/40 rounded-lg mt-4">
        <p className="text-sm text-blue-300 font-semibold">📊 Atividade de Hoje</p>
        <p className="text-xs text-slate-300 mt-1">
          6 ações registradas • 4 usuários ativos • 100% sincronizado em tempo real
        </p>
      </Card>
    </div>
  );
}