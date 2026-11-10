// Painel Retornos da Central 360° — pendências do cliente com filtro por tipo e registro do desfecho
import React, { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import PainelResumo from './PainelResumo';
import PainelRegistros from './PainelRegistros';
import DesfechoRetornoDialog from './DesfechoRetornoDialog';
import usePainelRetornos, { CATEGORIAS_RETORNO } from './usePainelRetornos';

const CHIP_BASE = 'rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors';

export default function PainelRetornos({ clienteId, ativo }) {
  const retornos = usePainelRetornos({ clienteId, ativo });
  const [selecionado, setSelecionado] = useState(null);

  const opcoes = [
    { id: 'todos', label: 'Todos', total: retornos.totais.total },
    ...CATEGORIAS_RETORNO.map((categoria) => ({
      id: categoria,
      label: categoria,
      total: retornos.contagens[categoria] || 0,
    })),
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {opcoes.map((opcao) => {
          const ativoChip = retornos.categoria === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => retornos.setCategoria(opcao.id)}
              aria-pressed={ativoChip}
              className={`${CHIP_BASE} ${
                ativoChip
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opcao.label}
              <span className="ml-1 text-slate-400">{opcao.total}</span>
            </button>
          );
        })}
      </div>

      <PainelResumo
        linhas={[
          { label: 'Retornos pendentes', valor: String(retornos.totais.total) },
          { label: 'Atrasados', valor: String(retornos.totais.atrasados) },
          { label: 'Para hoje', valor: String(retornos.totais.hoje) },
          { label: 'Agendados', valor: String(retornos.totais.agendados) },
        ]}
        bloco={
          <PainelRegistros
            entity="Interacao"
            filter={{ cliente_id: clienteId }}
            registros={retornos.lista}
            carregando={retornos.isLoading}
            ordenacao="-data_proxima_acao"
            vazio={retornos.permitido
              ? (retornos.temCliente
                ? 'Nenhum retorno pendente para este filtro.'
                : 'Negociação sem cliente vinculado — sem retornos a cobrar.')
              : 'Sem permissão de leitura no módulo CRM.'}
            campos={[
              { key: 'titulo', destaque: true },
              { key: 'categoria', label: 'Tipo' },
              { key: 'proxima_acao', label: 'Próxima ação' },
              { key: 'data_proxima_acao', label: 'Retorno', tipo: 'data' },
              { key: 'situacao', label: 'Situação', tipo: 'situacao' },
            ]}
            renderAcao={(registro) => (
              <button
                type="button"
                onClick={() => setSelecionado(registro)}
                disabled={!retornos.editarPermitido}
                title={retornos.editarPermitido ? 'Registrar desfecho do retorno' : 'Sem permissão de edição no CRM'}
                className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <CalendarClock className="w-3 h-3" /> Registrar desfecho
              </button>
            )}
          />
        }
        nota="Follow-ups reais do CRM (Interações) com próxima ação datada. O desfecho positivo ou negativo encerra o retorno; os demais são reagendados aqui mesmo."
      />

      <DesfechoRetornoDialog
        aberto={!!selecionado}
        retorno={selecionado}
        salvando={retornos.salvando}
        permitido={retornos.editarPermitido}
        onFechar={() => setSelecionado(null)}
        onSalvar={retornos.registrarDesfecho}
      />
    </div>
  );
}