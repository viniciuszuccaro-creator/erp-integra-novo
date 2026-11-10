// Cabeçalho da Central 360° — identidade azul/branca, empresa, busca universal, filtros e ação primária
import React from 'react';
import { Building2, List, Plus, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedSection from '@/components/security/ProtectedSection';
import { GRUPOS_NEGOCIACAO } from './negociacaoUtils';

export default function HeaderCentral360({
  empresa, grupo, busca, setBusca, grupoFiltro, setGrupoFiltro,
  contadores = {}, total = 0, onNovo, modo, setModo,
}) {
  const contexto = empresa?.nome || grupo?.nome || 'Grupo não selecionado';

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-100">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 text-white shrink-0">
          <ShoppingCart className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 leading-tight">Central de Vendas 360°</h2>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Building2 className="w-3 h-3" /> {contexto}
          </span>
        </div>

        <div className="relative flex-1 min-w-[220px] max-w-xl mx-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nº, CPF/CNPJ, cliente, telefone, vendedor, cidade ou produto"
            className="w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModo(modo === 'lista' ? 'central' : 'lista')}
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs font-medium ${
              modo === 'lista'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Lista completa de pedidos"
          >
            <List className="w-3.5 h-3.5" /> Lista completa
          </button>
          <ProtectedSection module="Comercial" section="Pedidos" action="criar">
            <Button onClick={onNovo} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Novo orçamento
            </Button>
          </ProtectedSection>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 px-3 py-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mr-1">{total} registros</span>
        {GRUPOS_NEGOCIACAO.map((opcao) => {
          const ativo = grupoFiltro === opcao.id;
          const quantidade = opcao.id === 'todas' ? total : (contadores[opcao.id] || 0);
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setGrupoFiltro(opcao.id)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                ativo
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opcao.label}
              <span className={`ml-1 ${ativo ? 'text-blue-100' : 'text-slate-400'}`}>{quantidade}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}