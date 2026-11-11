// Cliente 360° — painel lateral recolhível e redimensionável com os atalhos e painéis existentes
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import AtalhosLateral from './AtalhosLateral';
import PainelCorpo from './paineis/PainelCorpo';
import { TITULOS_PAINEL } from './paineis/paineisConfig';

const LARGURA_MINIMA = 280;
const LARGURA_MAXIMA = 560;

export default function Cliente360Lateral({
  negociacao, cliente, recolhido, onToggle, largura = 360, onRedimensionar,
  alertas = [], validacao, onSelecionarNegociacao,
}) {
  const [painel, setPainel] = useState('cliente');
  const [larguraLocal, setLarguraLocal] = useState(null);
  const larguraEfetiva = larguraLocal ?? largura;

  const redimensionar = (evento) => {
    evento.preventDefault();
    const inicioX = evento.clientX;
    const inicial = larguraEfetiva;
    let ultima = inicial;

    const mover = (movimento) => {
      ultima = Math.round(Math.min(LARGURA_MAXIMA, Math.max(LARGURA_MINIMA, inicial + (inicioX - movimento.clientX))));
      setLarguraLocal(ultima);
    };
    const soltar = () => {
      document.removeEventListener('mousemove', mover);
      document.removeEventListener('mouseup', soltar);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setLarguraLocal(null);
      if (ultima !== inicial) onRedimensionar?.(ultima);
    };

    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', soltar);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  if (recolhido) {
    return (
      <aside className="shrink-0 w-9 rounded-lg border border-slate-200 bg-white flex flex-col items-center min-h-0">
        <button
          type="button"
          onClick={onToggle}
          title="Abrir Cliente 360°"
          className="w-full py-2 text-slate-500 hover:text-blue-700 hover:bg-slate-50 border-b border-slate-100"
        >
          <ChevronLeft className="w-4 h-4 mx-auto" />
        </button>
        <div className="flex-1 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 [writing-mode:vertical-rl]">
          Cliente 360°
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{ '--largura-painel-360': `${larguraEfetiva}px` }}
      className="relative shrink-0 w-full lg:w-[var(--largura-painel-360)] rounded-lg border border-slate-200 bg-white flex flex-col min-h-0"
    >
      <span
        role="separator"
        aria-orientation="vertical"
        onMouseDown={redimensionar}
        title="Arrastar para redimensionar o painel"
        className="hidden lg:block absolute left-0 top-0 h-full w-1.5 cursor-col-resize select-none rounded-l-lg hover:bg-blue-400/60"
      />

      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800 inline-flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" /> Cliente 360°
        </h3>
        <button
          type="button"
          onClick={onToggle}
          title="Recolher Cliente 360°"
          className="text-slate-400 hover:text-slate-700"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {!negociacao ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6">
          <Users className="w-7 h-7 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">Selecione uma negociação</p>
          <p className="text-[11px] text-slate-500 mt-1">
            O painel mostra identificação, contatos, limite, pedidos, financeiro, produção e entregas do cliente.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex">
          <AtalhosLateral ativo={painel} onSelect={(id) => setPainel(id || 'cliente')} />
          <div className="flex-1 min-w-0 flex flex-col min-h-0 border-l border-slate-100">
            <div className="px-2 py-1.5 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {TITULOS_PAINEL[painel] || 'Painel'}
            </div>
            <div className="flex-1 overflow-auto p-2">
              <PainelCorpo
                painel={painel}
                negociacao={negociacao}
                cliente={cliente}
                alertas={alertas}
                validacao={validacao}
                onSelecionarNegociacao={onSelecionarNegociacao}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}