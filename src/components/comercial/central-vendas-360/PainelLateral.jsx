// Painel lateral da Central 360 — mostra a informação selecionada sem sair do orçamento
import React from 'react';
import { X } from 'lucide-react';
import { TITULOS_PAINEL, FILTRO_RELACIONADO } from './paineis/paineisConfig';
import PainelRegistros from './paineis/PainelRegistros';
import PainelResumo from './paineis/PainelResumo';
import PainelCliente from './paineis/PainelCliente';
import { proximaAcao, brl, dataCurta } from './negociacaoUtils';

export default function PainelLateral({ painel, negociacao, cliente, onClose }) {
  const { pedidoId, clienteId } = FILTRO_RELACIONADO(negociacao);
  const registro = negociacao.registro || {};

  const corpo = () => {
    switch (painel) {
      case 'cliente':
        return <PainelCliente cliente={cliente} />;
      case 'historico':
        return (
          <PainelRegistros
            entity="Pedido"
            filter={{ cliente_id: clienteId }}
            ordenacao="-data_pedido"
            vazio="Nenhum pedido anterior localizado para este cliente."
            campos={[
              { key: 'numero_pedido', destaque: true },
              { key: 'status', label: 'Situação' },
              { key: 'valor_total', label: 'Valor', tipo: 'moeda' },
            ]}
          />
        );
      case 'financeiro':
        return (
          <PainelRegistros
            entity="ContaReceber"
            filter={{ cliente_id: clienteId }}
            ordenacao="-data_vencimento"
            vazio="Nenhum título financeiro em aberto para este cliente."
            campos={[
              { key: 'descricao', destaque: true },
              { key: 'valor', label: 'Valor', tipo: 'moeda' },
              { key: 'data_vencimento', label: 'Vencimento', tipo: 'data' },
              { key: 'status', label: 'Situação' },
            ]}
          />
        );
      case 'estoque':
        return (
          <PainelResumo
            linhas={negociacao.itens.slice(0, 8).map((item) => ({
              label: item.descricao,
              valor: `${item.quantidade} ${item.unidade}`,
            }))}
            nota="Disponibilidade, reservas e saldos por depósito são consultados no módulo Estoque e Almoxarifado."
          />
        );
      case 'producao':
        return (
          <PainelRegistros
            entity="OrdemProducao"
            filter={{ pedido_id: pedidoId || registro.pedido_id }}
            vazio="Nenhuma ordem de produção vinculada a este pedido."
            campos={[
              { key: 'numero_op', destaque: true },
              { key: 'status', label: 'Situação' },
              { key: 'data_previsao_conclusao', label: 'Previsão', tipo: 'data' },
            ]}
          />
        );
      case 'entregas':
        return (
          <PainelRegistros
            entity="Entrega"
            filter={{ pedido_id: pedidoId }}
            vazio="Nenhuma entrega programada para este pedido."
            campos={[
              { key: 'numero_pedido', destaque: true },
              { key: 'status', label: 'Situação' },
              { key: 'data_previsao', label: 'Previsão', tipo: 'data' },
            ]}
          />
        );
      case 'fiscal':
        return (
          <PainelRegistros
            entity="NotaFiscal"
            filter={{ pedido_id: pedidoId }}
            vazio="Nenhuma nota fiscal emitida para este pedido."
            campos={[
              { key: 'numero', destaque: true },
              { key: 'data_emissao', label: 'Emissão', tipo: 'data' },
              { key: 'valor_total', label: 'Valor', tipo: 'moeda' },
            ]}
          />
        );
      case 'pagamento':
        return (
          <PainelResumo
            linhas={[
              { label: 'Forma de pagamento', valor: registro.forma_pagamento || negociacao.condicao_pagamento },
              { label: 'Parcelas', valor: registro.numero_parcelas ? `${registro.numero_parcelas}x` : '—' },
              { label: 'Total', valor: brl(negociacao.totais.total) },
              { label: 'Previsão de entrega', valor: dataCurta(registro.data_prevista_entrega) },
            ]}
            nota="Cobranças, links de pagamento e confirmação pelo provedor são tratados no módulo Financeiro."
          />
        );
      case 'atendimento':
      default:
        return (
          <PainelResumo
            linhas={[
              { label: 'Canal', valor: negociacao.canal },
              { label: 'Responsável', valor: negociacao.vendedor },
              { label: 'Próxima ação', valor: proximaAcao(negociacao) },
              { label: 'Última atualização', valor: dataCurta(registro.updated_date) },
            ]}
            nota={registro.observacoes_internas || registro.observacoes || 'Sem resumo registrado nesta negociação.'}
          />
        );
    }
  };

  return (
    <aside className="w-full lg:w-[340px] shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
        <h3 className="text-sm font-semibold text-slate-800">{TITULOS_PAINEL[painel] || 'Painel'}</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" title="Fechar painel">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">{corpo()}</div>
    </aside>
  );
}