// Resultado explicativo do motor de validação de fechamento — visível na própria mesa
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Info, XCircle } from 'lucide-react';

const ESTILO_STATUS = {
  ok: { Icone: CheckCircle2, cor: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', rotulo: 'OK' },
  atencao: { Icone: AlertTriangle, cor: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', rotulo: 'Atenção' },
  erro: { Icone: XCircle, cor: 'text-red-600', bg: 'bg-red-50 border-red-200', rotulo: 'Bloqueio' },
};

export default function PainelValidacaoFechamento({ validacao, compacto = false }) {
  const [aberto, setAberto] = useState(false);
  const { checagens = [], erros = [], avisos = [], carregando } = validacao || {};
  const bloqueado = erros.length > 0;

  const corResumo = bloqueado
    ? 'border-red-200 bg-red-50 text-red-700'
    : avisos.length
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  const ResumoIcone = bloqueado ? XCircle : avisos.length ? AlertTriangle : CheckCircle2;

  return (
    <div className={`rounded-lg border ${compacto ? '' : 'bg-white'} ${bloqueado ? 'border-red-200' : 'border-slate-200'}`}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left rounded-lg ${corResumo}`}
      >
        <ResumoIcone className="w-4 h-4 shrink-0" />
        <span className="text-xs font-semibold">
          Fechamento: {carregando ? 'validando…' : bloqueado
            ? `${erros.length} bloqueio(s)`
            : avisos.length ? `${avisos.length} atenção(ões)` : 'pronto'}
        </span>
        <span className="ml-auto text-[11px] font-medium inline-flex items-center gap-1">
          {aberto ? 'Ocultar' : 'Detalhar'}
          {aberto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </span>
      </button>

      {aberto && (
        <ul className="divide-y divide-slate-100 max-h-48 overflow-auto">
          {checagens.length === 0 && (
            <li className="px-3 py-2 text-xs text-slate-500 inline-flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Nenhuma regra aplicável a esta negociação.
            </li>
          )}
          {checagens.map((checagem) => {
            const estilo = ESTILO_STATUS[checagem.status] || ESTILO_STATUS.ok;
            const Icone = estilo.Icone;
            return (
              <li key={checagem.chave} className="px-3 py-1.5 flex items-start gap-2">
                <Icone className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${estilo.cor}`} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-700">{checagem.titulo}</p>
                  <p className="text-[11px] text-slate-500 break-words">{checagem.detalhe}</p>
                  {checagem.acao && (
                    <p className="text-[11px] font-semibold text-slate-700">Ação necessária: {checagem.acao}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}