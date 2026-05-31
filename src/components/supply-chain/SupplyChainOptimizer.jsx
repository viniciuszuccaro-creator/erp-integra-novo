/**
 * SupplyChainOptimizer v1.0
 * Motor de otimização da cadeia por IA
 * Regra-Mãe: IA preditiva, multi-fornecedor, automação
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2 } from 'lucide-react';

const OTIMIZACOES = [
  {
    id: 1,
    tipo: 'Reposição Automática',
    descricao: 'Gerar OC automática para Filial MG (SKU-001, 200 un)',
    economia: 'R$ 4.200',
    urgencia: 'crítica',
    automatizavel: true,
  },
  {
    id: 2,
    tipo: 'Transferência Interna',
    descricao: 'Transferir 150 un do CD Principal → Filial MG',
    economia: 'R$ 1.850',
    urgencia: 'alta',
    automatizavel: true,
  },
  {
    id: 3,
    tipo: 'Consolidar Pedidos',
    descricao: 'Unir OC-004 e OC-005 ao Fornecedor A para reduzir frete',
    economia: 'R$ 3.100',
    urgencia: 'media',
    automatizavel: false,
  },
  {
    id: 4,
    tipo: 'Ajuste de Lote Mínimo',
    descricao: 'Reduzir lote mínimo SKU-003 de 500 → 200 un (baseado em demanda)',
    economia: 'R$ 8.700',
    urgencia: 'media',
    automatizavel: false,
  },
];

export default function SupplyChainOptimizer() {
  const [otimizacoes, setOtimizacoes] = useState(OTIMIZACOES);
  const [executando, setExecutando] = useState(null);
  const [executadas, setExecutadas] = useState([]);

  const handleExecutar = async (id) => {
    setExecutando(id);
    await new Promise((r) => setTimeout(r, 1800));
    setExecutadas((prev) => [...prev, id]);
    setExecutando(null);
  };

  const urgenciaCor = (u) => ({
    crítica: 'bg-red-100 text-red-800',
    alta: 'bg-amber-100 text-amber-800',
    media: 'bg-blue-100 text-blue-800',
  }[u]);

  const totalEconomia = otimizacoes.reduce((acc, o) => {
    const val = parseFloat(o.economia.replace('R$ ', '').replace('.', '').replace(',', '.'));
    return acc + val;
  }, 0);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-cyan-50 overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-8 h-8 text-cyan-600" />
          Otimizador de Cadeia IA
        </h2>
        <div className="text-right">
          <p className="text-xs text-slate-600">Economia Total Estimada</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {totalEconomia.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {otimizacoes.map((opt) => {
          const feito = executadas.includes(opt.id);
          return (
            <Card key={opt.id} className={`p-4 bg-white rounded-lg border border-slate-200 transition-all ${feito ? 'opacity-60' : 'hover:shadow-md'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={urgenciaCor(opt.urgencia)}>
                      {opt.urgencia.toUpperCase()}
                    </Badge>
                    <p className="font-bold text-slate-900">{opt.tipo}</p>
                  </div>
                  <p className="text-sm text-slate-600">{opt.descricao}</p>
                </div>
                <p className="font-bold text-green-600 ml-3 whitespace-nowrap">{opt.economia}</p>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {feito ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-semibold">Executado!</span>
                  </div>
                ) : (
                  <>
                    {opt.automatizavel && (
                      <Button
                        size="sm"
                        onClick={() => handleExecutar(opt.id)}
                        disabled={executando === opt.id}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        {executando === opt.id ? '⏳ Executando...' : '⚡ Executar Agora'}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs">
                      Ver Detalhes
                    </Button>
                    {!opt.automatizavel && (
                      <span className="text-xs text-slate-500 ml-1">Requer aprovação manual</span>
                    )}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}