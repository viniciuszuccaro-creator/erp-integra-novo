import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bolt, Settings, Activity } from 'lucide-react';

const CORES_BADGE = {
  blue: 'bg-blue-100 text-blue-700 border-blue-300',
  green: 'bg-green-100 text-green-700 border-green-300',
  purple: 'bg-purple-100 text-purple-700 border-purple-300',
  orange: 'bg-orange-100 text-orange-700 border-orange-300',
  red: 'bg-red-100 text-red-700 border-red-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  pink: 'bg-pink-100 text-pink-700 border-pink-300',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-300',
};

export default function CanalOrigemCard({ param, metricas, onToggle, isPending, isAdmin }) {
  const temAtividade = metricas.ultimos7dias > 0;

  return (
    <Card key={param.id} className={`transition-all ${param.ativo ? 'border-l-4' : 'opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${param.ativo ? `bg-${param.cor_badge}-100` : 'bg-slate-100'}`}>
              {param.tipo_criacao === 'Automático' || param.tipo_criacao === 'Misto' ? <Bolt className="w-6 h-6 text-slate-600" /> : <Settings className="w-6 h-6 text-slate-600" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-slate-900">{param.nome}</h4>
                <Badge className={CORES_BADGE[param.cor_badge] || CORES_BADGE.blue}>{param.canal}</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{param.tipo_criacao}</Badge>
                {param.bloquear_edicao_automatico && <Badge variant="outline" className="text-xs">🔒 Auto-bloqueio</Badge>}
                {temAtividade && (
                  <Badge className="bg-green-600 text-white text-xs">
                    <Activity className="w-3 h-3 mr-1" />{metricas.ultimos7dias} pedidos (7d)
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex gap-6 text-center">
            <div>
              <p className="text-xs text-slate-600">Total</p>
              <p className="text-lg font-bold text-blue-600">{metricas.totalPedidos}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Valor</p>
              <p className="text-lg font-bold text-green-600">R$ {(metricas.valorTotal / 1000).toFixed(0)}k</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-600">Status</p>
              <p className={`text-sm font-semibold ${param.ativo ? 'text-green-600' : 'text-red-600'}`}>{param.ativo ? 'Ativo' : 'Inativo'}</p>
            </div>
            <Switch
              checked={param.ativo}
              onCheckedChange={onToggle}
              disabled={isPending || !isAdmin}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}