// Painel lateral da Central 360 — listagem de registros relacionados (dados reais do ERP)
import React from 'react';
import useRLSQuery from '@/components/lib/useRLSQuery';
import { brl } from '../negociacaoUtils';
import { ESTILO_TITULO } from './usePainelFinanceiro';

function formatar(valor, tipo) {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (tipo === 'moeda') return brl(valor);
  if (tipo === 'data') {
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? String(valor) : d.toLocaleDateString('pt-BR');
  }
  return String(valor);
}

function ValorCampo({ registro, campo }) {
  if (campo.tipo === 'situacao') {
    const estilo = ESTILO_TITULO[registro[campo.key]] || 'bg-slate-100 text-slate-600 border-slate-200';
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${estilo}`}>
        {registro[campo.key] || '—'}
      </span>
    );
  }
  return <>{formatar(registro[campo.key], campo.tipo)}</>;
}

export default function PainelRegistros({
  entity, filter, campos, vazio, ordenacao = '-created_date', registros, carregando,
}) {
  const ativo = Object.keys(filter || {}).some((chave) => Boolean(filter[chave]));
  // Quando o painel já carregou os registros (fonte externa), evita consulta duplicada.
  const usaFonte = Array.isArray(registros);
  const { data = [], isLoading } = useRLSQuery(entity, filter || {}, ordenacao, 15, {
    enabled: ativo && !usaFonte,
    staleTime: 30000,
  });

  const lista = usaFonte ? registros : data;
  const carregandoLista = usaFonte ? Boolean(carregando) : isLoading;

  if (!ativo && !usaFonte) return <p className="text-sm text-slate-500">{vazio}</p>;
  if (carregandoLista) return <p className="text-sm text-slate-500">Carregando…</p>;
  if (!lista.length) return <p className="text-sm text-slate-500">{vazio}</p>;

  return (
    <div className="space-y-2">
      {lista.map((registro) => (
        <div key={registro.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
          {campos.map((campo) => (
            <div
              key={campo.key}
              className={campo.destaque
                ? 'text-sm font-semibold text-slate-800 leading-snug'
                : 'flex items-start justify-between gap-3 text-xs mt-0.5'}
            >
              {campo.destaque ? (
                <ValorCampo registro={registro} campo={campo} />
              ) : (
                <>
                  <span className="text-slate-500">{campo.label}</span>
                  <span className="font-medium text-slate-800 text-right">
                    <ValorCampo registro={registro} campo={campo} />
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}