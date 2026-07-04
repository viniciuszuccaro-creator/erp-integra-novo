import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  CheckCircle 
} from 'lucide-react';

export default function KPIsRealtime({ metricas }) {
  return (
    <div className="w-full h-full overflow-auto p-3">
      <Card className={metricas.saldoCaixa >= 0 ? 'border-green-200 min-h-[90px] max-h-[90px]' : 'border-red-200 min-h-[90px] max-h-[90px]'}>
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Saldo Caixa Hoje</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <Wallet className={`w-4 h-4 ${metricas.saldoCaixa >= 0 ? 'text-green-600' : 'text-red-600'} flex-shrink-0`} />
            <span className={`text-base font-bold ${metricas.saldoCaixa >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
              {metricas.saldoCaixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[90px] max-h-[90px]">
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Receitas Hoje</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-base font-bold text-green-600 truncate">
              {metricas.receitasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[90px] max-h-[90px]">
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Despesas Hoje</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-base font-bold text-red-600 truncate">
              {metricas.despesasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[90px] max-h-[90px]">
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Vencem Hoje</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-xl font-bold text-orange-600">{metricas.contasVencerHoje}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[90px] max-h-[90px]">
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Vencidas</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-xl font-bold text-red-600">{metricas.contasVencidas}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[90px] max-h-[90px]">
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Cartões</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-xl font-bold">{metricas.cartoesACompensar}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[90px] max-h-[90px]">
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Conciliações</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-xl font-bold">{metricas.conciliacoesHoje}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-[90px] max-h-[90px]">
        <CardHeader className="pb-2 pt-2 px-2.5">
          <CardTitle className="text-xs font-medium text-slate-600 truncate">Divergências</CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 pt-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-xl font-bold text-red-600">{metricas.divergenciasBancarias}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}