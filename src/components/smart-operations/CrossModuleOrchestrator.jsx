import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Link2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const fluxos = [
  {
    id: 'FLX001',
    nome: 'Ciclo Completo de Pedido',
    etapas: [
      { modulo: 'CRM', acao: 'Oportunidade', status: 'ok' },
      { modulo: 'Comercial', acao: 'Pedido Aprovado', status: 'ok' },
      { modulo: 'Estoque', acao: 'Reserva', status: 'ok' },
      { modulo: 'Produção', acao: 'OP Gerada', status: 'pendente' },
      { modulo: 'Logística', acao: 'Expedição', status: 'aguardando' },
      { modulo: 'Fiscal', acao: 'NF-e', status: 'aguardando' },
      { modulo: 'Financeiro', acao: 'Cobrança', status: 'aguardando' },
    ],
    sla: '5 dias',
    inicio: 'Ontem 14h',
    progresso: 42,
  },
  {
    id: 'FLX002',
    nome: 'Ciclo de Compras e Recebimento',
    etapas: [
      { modulo: 'Estoque', acao: 'Solicitação', status: 'ok' },
      { modulo: 'Compras', acao: 'Cotação', status: 'ok' },
      { modulo: 'Compras', acao: 'OC Aprovada', status: 'ok' },
      { modulo: 'Estoque', acao: 'Recebimento', status: 'pendente' },
      { modulo: 'Fiscal', acao: 'Entrada NF', status: 'aguardando' },
      { modulo: 'Financeiro', acao: 'Pagamento', status: 'aguardando' },
    ],
    sla: '10 dias',
    inicio: 'Hoje 09h',
    progresso: 55,
  },
  {
    id: 'FLX003',
    nome: 'Onboarding de Novo Cliente',
    etapas: [
      { modulo: 'CRM', acao: 'Lead Qualificado', status: 'ok' },
      { modulo: 'Comercial', acao: 'Proposta Enviada', status: 'ok' },
      { modulo: 'Comercial', acao: 'Contrato', status: 'pendente' },
      { modulo: 'Financeiro', acao: 'Limite Crédito', status: 'aguardando' },
      { modulo: 'Sistema', acao: 'Acesso Portal', status: 'aguardando' },
    ],
    sla: '3 dias',
    inicio: 'Hoje 11h',
    progresso: 38,
  },
];

const etapaColor = (status) => {
  switch (status) {
    case 'ok': return { bg: 'bg-emerald-900/50', border: 'border-emerald-600', icon: <CheckCircle className="w-3 h-3 text-emerald-400" /> };
    case 'pendente': return { bg: 'bg-yellow-900/50', border: 'border-yellow-600', icon: <Clock className="w-3 h-3 text-yellow-400" /> };
    default: return { bg: 'bg-slate-700/50', border: 'border-slate-600', icon: <Clock className="w-3 h-3 text-slate-500" /> };
  }
};

const integracoesCriticas = [
  { de: 'Pedido Aprovado', para: 'Reserva Estoque', status: 'Sincronizado', latencia: '< 1s' },
  { de: 'Recebimento NF', para: 'Entrada Estoque', status: 'Sincronizado', latencia: '< 1s' },
  { de: 'Entrega Confirmada', para: 'Título Cobrança', status: 'Sincronizado', latencia: '2s' },
  { de: 'OC Aprovada', para: 'Reserva Financeiro', status: 'Alerta', latencia: '12s' },
];

export default function CrossModuleOrchestrator() {
  const [activeFluxo, setActiveFluxo] = useState('FLX001');
  const fluxo = fluxos.find(f => f.id === activeFluxo);

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Seletor de Fluxo */}
      <div className="flex gap-2 flex-wrap">
        {fluxos.map(f => (
          <button key={f.id} onClick={() => setActiveFluxo(f.id)}
            className={`px-3 py-2 text-xs rounded-lg font-semibold transition-all ${activeFluxo === f.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {f.nome}
          </button>
        ))}
      </div>

      {/* Fluxo Ativo */}
      {fluxo && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-400" />
                {fluxo.nome}
              </CardTitle>
              <div className="flex gap-2 items-center">
                <p className="text-xs text-slate-400">Início: {fluxo.inicio}</p>
                <Badge className="bg-blue-900 text-blue-200">SLA: {fluxo.sla}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Barra de Progresso */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <p className="text-xs text-slate-400">Progresso</p>
                <p className="text-xs text-blue-400 font-semibold">{fluxo.progresso}%</p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${fluxo.progresso}%` }} />
              </div>
            </div>

            {/* Pipeline Visual */}
            <div className="flex flex-wrap gap-2 items-center">
              {fluxo.etapas.map((etapa, idx) => {
                const colors = etapaColor(etapa.status);
                return (
                  <React.Fragment key={idx}>
                    <div className={`p-2 rounded-lg border ${colors.bg} ${colors.border} min-w-[80px] text-center`}>
                      <p className="text-xs text-slate-400 mb-1">{etapa.modulo}</p>
                      <div className="flex items-center justify-center gap-1">
                        {colors.icon}
                        <p className="text-xs text-white font-semibold">{etapa.acao}</p>
                      </div>
                    </div>
                    {idx < fluxo.etapas.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Próxima Ação */}
            <div className="mt-4 bg-blue-900/30 p-3 rounded-lg border border-blue-700">
              <p className="text-xs text-blue-400 font-semibold mb-1">Próxima Ação Necessária</p>
              <p className="text-xs text-blue-200">
                {fluxo.etapas.find(e => e.status === 'pendente')?.modulo} → {fluxo.etapas.find(e => e.status === 'pendente')?.acao}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrações Críticas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Integrações Inter-Módulos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {integracoesCriticas.map((intg, idx) => (
            <div key={idx} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs flex-1">
                <Badge className="bg-slate-600 text-slate-200">{intg.de}</Badge>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <Badge className="bg-slate-600 text-slate-200">{intg.para}</Badge>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <p className="text-xs text-slate-400">{intg.latencia}</p>
                <Badge className={intg.status === 'Sincronizado' ? 'bg-emerald-900 text-emerald-200' : 'bg-yellow-900 text-yellow-200'}>
                  {intg.status === 'Sincronizado' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                  {intg.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}