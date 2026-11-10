// Painel lateral da Central 360 — listagem de registros relacionados (dados reais do ERP)
import React from 'react';
import useRLSQuery from '@/components/lib/useRLSQuery';
import { brl } from '../negociacaoUtils';

function formatar(valor, tipo) {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (tipo === 'moeda') return brl(valor);
  if (tipo === 'data') {
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? String(valor) : d.toLocaleDateString('pt-BR');
  }
  return String(valor);
}

export default function PainelRegistros({ entity, filter, campos, vazio, ordenacao = '-created_date' }) {
  const ativo = Object.keys(filter || {}).some((chave) => Boolean(filter[chave]));
  const { data = [], isLoading } = useRLSQuery(entity, filter || {}, ordenacao, 15, {
    enabled: ativo,
    staleTime: 30000,
  });

  if (!ativo) return <p className="text-sm text-slate-500">{vazio}</p>;
  if (isLoading) return <p className="text-sm text-slate-500">Carregando…</p>;
  if (!data.length) return <p className="text-sm text-slate-500">{vazio}</p>;

  return (
    <div className="space-y-2">
      {data.map((registro) => (
        <div key={registro.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
          {campos.map((campo) => (
            <div
              key={campo.key}
              className={campo.destaque
                ? 'text-sm font-semibold text-slate-800 leading-snug'
                : 'flex items-start justify-between gap-3 text-xs mt-0.5'}
            >
              {campo.destaque ? (
                formatar(registro[campo.key], campo.tipo)
              ) : (
                <>
                  <span className="text-slate-500">{campo.label}</span>
                  <span className="font-medium text-slate-800 text-right">{formatar(registro[campo.key], campo.tipo)}</span>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}