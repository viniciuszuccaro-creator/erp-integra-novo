// Corpo dos painéis do Cliente 360° — somente leitura das entidades dos módulos proprietários
import React from 'react';
import { FILTRO_RELACIONADO } from './paineisConfig';
import PainelRegistros from './PainelRegistros';
import PainelResumo from './PainelResumo';
import PainelCliente from './PainelCliente';
import { proximaAcao, brl, dataCurta } from '../negociacaoUtils';

export default function PainelCorpo({ painel, negociacao, cliente }) {
  const { pedidoId, clienteId } = FILTRO_RELACIONADO(negociacao);
  const registro = negociacao?.registro || {};

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
          linhas={(negociacao?.itens || []).slice(0, 8).map((item) => ({
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
            { label: 'Forma de pagamento', valor: registro.forma_pagamento || negociacao?.condicao_pagamento },
            { label: 'Parcelas', valor: registro.numero_parcelas ? `${registro.numero_parcelas}x` : '—' },
            { label: 'Total', valor: brl(negociacao?.totais?.total || 0) },
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
            { label: 'Canal', valor: negociacao?.canal || '—' },
            { label: 'Responsável', valor: negociacao?.vendedor || '—' },
            { label: 'Próxima ação', valor: proximaAcao(negociacao) },
            { label: 'Última atualização', valor: dataCurta(registro.updated_date) },
          ]}
          nota={registro.observacoes_internas || registro.observacoes || 'Sem resumo registrado nesta negociação.'}
        />
      );
  }
}