/**
 * SupplierNetworkMap v1.0
 * Visualização da rede de fornecedores com status real-time
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const SUPPLIERS = [
  { id: 1, nome: 'Fornecedor A', categoria: 'Matéria-Prima', status: 'online', pedidos: 12, leadtime: '5 dias', qualidade: 94 },
  { id: 2, nome: 'Fornecedor B', categoria: 'Componentes', status: 'online', pedidos: 8, leadtime: '7 dias', qualidade: 89 },
  { id: 3, nome: 'Fornecedor C', categoria: 'Serviço', status: 'alerta', pedidos: 3, leadtime: '10 dias', qualidade: 76 },
  { id: 4, nome: 'Fornecedor D', categoria: 'Matéria-Prima', status: 'online', pedidos: 15, leadtime: '3 dias', qualidade: 98 },
  { id: 5, nome: 'Fornecedor E', categoria: 'Embalagem', status: 'online', pedidos: 6, leadtime: '2 dias', qualidade: 92 },
];

export default function SupplierNetworkMap({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-cyan-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />
        Rede de Fornecedores — {empresa}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {SUPPLIERS.map((supplier) => (
          <Card key={supplier.id} className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg hover:border-cyan-400/60 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-white">{supplier.nome}</p>
                <p className="text-xs text-slate-400">{supplier.categoria}</p>
              </div>
              {supplier.status === 'online' ? (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>

            <div className="space-y-1 text-xs mb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Pedidos:</span>
                <span className="text-white font-semibold">{supplier.pedidos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lead Time:</span>
                <span className="text-cyan-300">{supplier.leadtime}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Qualidade</span>
                <span className="text-xs font-bold text-white">{supplier.qualidade}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${supplier.qualidade >= 95 ? 'bg-green-500' : supplier.qualidade >= 85 ? 'bg-cyan-500' : 'bg-amber-500'}`}
                  style={{ width: `${supplier.qualidade}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Conectividade */}
      <Card className="p-4 bg-cyan-500/10 border border-cyan-400/40 rounded-lg">
        <p className="text-sm font-semibold text-cyan-300 mb-2">📊 Status da Rede</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><CheckCircle2 className="w-4 h-4 text-green-400 inline-block mr-1" /> 5 Online</div>
          <div><AlertCircle className="w-4 h-4 text-amber-400 inline-block mr-1" /> 0 Atrasos</div>
          <div>Qualidade: <span className="font-bold">91.8%</span></div>
        </div>
      </Card>
    </div>
  );
}

import { Globe } from 'lucide-react';