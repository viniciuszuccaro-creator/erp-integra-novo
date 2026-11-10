// Cabeçalho compacto da negociação — grupo/empresa, vendedor, cliente, obra, número, canal, situação
import React from 'react';
import { Building2, User, MapPin, Hash, Radio } from 'lucide-react';
import { SITUACAO_ESTILO, dataCurta } from './negociacaoUtils';

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2 py-1 text-xs text-slate-700">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {children}
    </span>
  );
}

export default function HeaderNegociacao({ negociacao, empresa, grupo, sujo, salvando }) {
  const contexto = empresa?.nome || grupo?.nome || 'Grupo não selecionado';
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
        <Building2 className="w-3.5 h-3.5" />
        {contexto}
      </span>
      <Chip icon={Hash}>{negociacao.numero}</Chip>
      <Chip icon={User}>{negociacao.cliente_nome}</Chip>
      <Chip icon={User}>Vendedor: {negociacao.vendedor}</Chip>
      {negociacao.obra && <Chip icon={MapPin}>{negociacao.obra}</Chip>}
      <Chip icon={Radio}>{negociacao.canal}</Chip>
      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${SITUACAO_ESTILO[negociacao.grupo]}`}>
        {negociacao.situacao}
      </span>
      <span className="text-xs text-slate-500">Validade: {dataCurta(negociacao.validade)}</span>
      <span className="ml-auto inline-flex items-center gap-1.5 text-xs">
        <span className={`w-2 h-2 rounded-full ${sujo ? 'bg-amber-500' : salvando ? 'bg-blue-500' : 'bg-green-500'}`} />
        <span className={sujo ? 'text-amber-700 font-medium' : 'text-slate-500'}>
          {sujo ? 'Alterações não salvas' : salvando ? 'Salvando…' : 'Salvo'}
        </span>
      </span>
    </div>
  );
}