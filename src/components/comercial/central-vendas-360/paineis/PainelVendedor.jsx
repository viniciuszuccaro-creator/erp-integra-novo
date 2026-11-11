// §37 — painel do vendedor dentro da Central 360° (sem tela nova): hoje, mês, ticket, meta e retornos
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Target, TrendingUp, CalendarClock, Ticket } from 'lucide-react';
import { brl, dataCurta } from '../negociacaoUtils';
import usePainelVendedor from './usePainelVendedor';

const Cartao = ({ titulo, valor, Icone, cor }) => (
  <div className="rounded border border-slate-200 bg-white px-2 py-1">
    <p className="text-[10px] uppercase tracking-wide text-slate-500 inline-flex items-center gap-1">
      <Icone className="w-3 h-3" /> {titulo}
    </p>
    <p className={`text-sm font-semibold ${cor}`}>{valor}</p>
  </div>
);

export default function PainelVendedor({ onIrParaPainel }) {
  const { resumo, retornosVencidos, salvarMeta, salvando, podeEditar, permitido, isLoading } = usePainelVendedor({ ativo: true });
  const [metaTexto, setMetaTexto] = useState('');

  if (!permitido) {
    return <p className="text-[11px] text-slate-500">Sem permissão de leitura no módulo Comercial.</p>;
  }

  if (isLoading) {
    return <p className="text-[11px] text-slate-500">Carregando indicadores do vendedor…</p>;
  }

  const gravar = async () => {
    try {
      await salvarMeta(metaTexto || resumo.meta);
      setMetaTexto('');
      toast.success('Meta mensal registrada para o seu usuário.');
    } catch (erro) {
      toast.error(erro.message || 'Não foi possível salvar a meta.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        <Cartao titulo="Hoje" valor={brl(resumo.totalHoje)} Icone={TrendingUp} cor="text-emerald-700" />
        <Cartao titulo="Mês" valor={brl(resumo.totalMes)} Icone={TrendingUp} cor="text-slate-800" />
        <Cartao titulo="Pedidos no mês" valor={resumo.qtdMes} Icone={CalendarClock} cor="text-slate-800" />
        <Cartao titulo="Ticket médio" valor={brl(resumo.ticket)} Icone={Ticket} cor="text-slate-800" />
      </div>

      <div className="rounded border border-slate-200 bg-white p-2 space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 inline-flex items-center gap-1">
          <Target className="w-3.5 h-3.5" /> Meta do mês
        </p>
        {resumo.meta > 0 ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>{brl(resumo.totalMes)} de {brl(resumo.meta)}</span>
              <span className="font-semibold text-slate-800">{resumo.atingimento.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full rounded bg-slate-100 overflow-hidden">
              <div
                className={`h-full ${resumo.atingimento >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(resumo.atingimento, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              {resumo.atingimento >= 100
                ? 'Meta atingida no mês.'
                : `Faltam ${brl(resumo.aFaltar)} para a meta.`}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-slate-500">Meta ainda não configurada para o seu usuário.</p>
        )}
        {podeEditar && (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              step="100"
              value={metaTexto}
              onChange={(evento) => setMetaTexto(evento.target.value)}
              placeholder={resumo.meta > 0 ? String(resumo.meta) : 'Meta mensal (R$)'}
              className="h-7 w-full rounded border border-slate-200 px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-300"
            />
            <button
              type="button"
              onClick={gravar}
              disabled={salvando}
              className="h-7 shrink-0 rounded-md border border-blue-200 bg-blue-50 px-2 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
            >
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      <div className="rounded border border-slate-200 bg-white p-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1 inline-flex items-center gap-1">
          <CalendarClock className="w-3.5 h-3.5" /> Clientes para retornar ({retornosVencidos.length})
        </p>
        {retornosVencidos.length === 0 ? (
          <p className="text-[11px] text-slate-500">Nenhum retorno vencido para o seu usuário.</p>
        ) : (
          <ul className="space-y-1">
            {retornosVencidos.slice(0, 4).map((interacao) => (
              <li key={interacao.id} className="flex items-center justify-between gap-2 text-[11px] text-slate-600">
                <span className="truncate">{interacao.cliente_nome || interacao.titulo}</span>
                <span className="shrink-0 text-slate-500">{dataCurta(interacao.data_proxima_acao)}</span>
              </li>
            ))}
          </ul>
        )}
        {retornosVencidos.length > 0 && (
          <button
            type="button"
            onClick={() => onIrParaPainel?.('retornos')}
            className="mt-1.5 inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
          >
            Ver todos os retornos
          </button>
        )}
      </div>
    </div>
  );
}