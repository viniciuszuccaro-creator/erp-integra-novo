// Atalhos laterais — abrem painéis sem sair da negociação
import React from 'react';
import { ATALHOS_360, PERMISSOES_PAINEL } from './paineis/paineisConfig';
import usePermissions from '@/components/lib/usePermissions';

export default function AtalhosLateral({ ativo, onSelect }) {
  const { hasPermission, isLoading } = usePermissions();
  const permitidos = ATALHOS_360.filter((atalho) => !isLoading && hasPermission(...PERMISSOES_PAINEL[atalho.id], 'visualizar'));
  return (
    <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible rounded-lg border border-slate-200 bg-white p-1.5 lg:w-[86px] shrink-0">
      {permitidos.map((atalho) => {
        const Icon = atalho.icon;
        const selecionado = ativo === atalho.id;
        return (
          <button
            key={atalho.id}
            type="button"
            onClick={() => onSelect(selecionado ? null : atalho.id)}
            title={atalho.label}
            aria-pressed={selecionado}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors shrink-0 lg:w-full ${
              selecionado
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{atalho.label}</span>
          </button>
        );
      })}
    </div>
  );
}