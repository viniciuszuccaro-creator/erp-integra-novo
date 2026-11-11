// Corpo dos painéis do Cliente 360° — somente leitura das entidades dos módulos proprietários
import React from 'react';
import { FILTRO_RELACIONADO } from './paineisConfig';
import PainelRegistros from './PainelRegistros';
import PainelResumo from './PainelResumo';
import PainelCliente from './PainelCliente';
import PainelAtendimento from './PainelAtendimento';
import PainelHistorico from './PainelHistorico';
import useTitulosFinanceiros from './usePainelFinanceiro';
import usePainelEstoque from './usePainelEstoque';
import PainelRetornos from './PainelRetornos';
import PainelCopiloto from './PainelCopiloto';
import PainelMapaEntregas from './PainelMapaEntregas';
import { brl, dataCurta } from '../negociacaoUtils';

export default function PainelCorpo({
  painel, negociacao, cliente, alertas = [], validacao, onSelecionarNegociacao,
}) {
  const { pedidoId, clienteId } = FILTRO_RELACIONADO(negociacao);
  const registro = negociacao?.registro || {};
  const financeiro = useTitulosFinanceiros({ clienteId, pedidoId, modo: 'cliente', ativo: painel === 'financeiro' });
  const pagamento = useTitulosFinanceiros({ clienteId, pedidoId, modo: 'pedido', ativo: painel === 'pagamento' });
  const estoque = usePainelEstoque({ itens: negociacao?.itens, ativo: painel === 'estoque' });

  switch (painel) {
    case 'copiloto':
      return (
        <PainelCopiloto
          negociacao={negociacao}
          validacao={validacao}
          alertas={alertas}
          onSelecionarNegociacao={onSelecionarNegociacao}
        />
      );
    case 'mapa':
      return <PainelMapaEntregas negociacao={negociacao} />;
    case 'cliente':
      return <PainelCliente cliente={cliente} />;
    case 'historico':
      return <PainelHistorico clienteId={clienteId} />;
    case 'retornos':
      return <PainelRetornos clienteId={clienteId} ativo={painel === 'retornos'} />;
    case 'financeiro':
      return (
        <PainelResumo
          linhas={[
            { label: 'Em aberto', valor: `${brl(financeiro.totais.aberto)} · ${financeiro.totais.abertos} título(s)` },
            { label: 'Recebido', valor: brl(financeiro.totais.recebido) },
            { label: 'Total do cliente', valor: brl(financeiro.totais.total) },
          ]}
          bloco={
            <PainelRegistros
              entity="ContaReceber"
              filter={{ cliente_id: clienteId }}
              registros={financeiro.titulos}
              carregando={financeiro.isLoading}
              vazio={financeiro.permitido
                ? 'Nenhum título financeiro para este cliente.'
                : 'Sem permissão de leitura no módulo Financeiro.'}
              campos={[
                { key: 'descricao', destaque: true },
                { key: 'numero_parcela', label: 'Parcela' },
                { key: 'valor', label: 'Valor', tipo: 'moeda' },
                { key: 'data_vencimento', label: 'Vencimento', tipo: 'data' },
                { key: 'status', label: 'Situação', tipo: 'situacao' },
              ]}
            />
          }
          nota="Títulos reais do cliente no contexto de grupo/empresa ativo. Cobranças e baixas permanecem no módulo Financeiro."
        />
      );
    case 'estoque':
      return (
        <PainelResumo
          linhas={[
            { label: 'Itens analisados', valor: String(estoque.totais.itens) },
            { label: 'Sem saldo suficiente', valor: `${estoque.totais.pendentes} item(ns)` },
            { label: 'Sem saldo', valor: `${estoque.totais.semSaldo} item(ns)` },
            { label: 'Necessidade estimada', valor: brl(estoque.totais.valor) },
          ]}
          bloco={
            <PainelRegistros
              entity="Produto"
              filter={{ id: { $in: (negociacao?.itens || []).map((item) => item.produto_id).filter(Boolean) } }}
              registros={estoque.itens}
              carregando={estoque.isLoading}
              vazio={estoque.permitido
                ? (estoque.temItens
                  ? 'Nenhum saldo localizado para os itens desta negociação.'
                  : 'Negociação sem itens de revenda com produto vinculado.')
                : 'Sem permissão de leitura no módulo Estoque.'}
              campos={[
                { key: 'descricao', destaque: true },
                { key: 'codigo', label: 'Código' },
                { key: 'necessario', label: 'Necessário' },
                { key: 'disponivel', label: 'Disponível' },
                { key: 'minimo', label: 'Mínimo' },
                { key: 'situacao', label: 'Saldo', tipo: 'situacao' },
              ]}
            />
          }
          nota="Saldos reais do cadastro único de produtos no contexto de grupo/empresa ativo. Reservas, transferências e ajustes permanecem no módulo Estoque e Almoxarifado."
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
    case 'pagamento': {
      const parcelas = pagamento.titulos.length
        ? `${pagamento.titulos.length}x`
        : (registro.numero_parcelas ? `${registro.numero_parcelas}x` : '—');
      return (
        <PainelResumo
          linhas={[
            { label: 'Forma de pagamento', valor: registro.forma_pagamento || negociacao?.condicao_pagamento },
            { label: 'Parcelas', valor: parcelas },
            { label: 'Total', valor: brl(negociacao?.totais?.total || 0) },
            { label: 'Recebido', valor: brl(pagamento.totais.recebido) },
            { label: 'Em aberto', valor: brl(pagamento.totais.aberto) },
            { label: 'Previsão de entrega', valor: dataCurta(registro.data_prevista_entrega) },
          ]}
          bloco={
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">
                {pagamento.porPedido ? 'Parcelas do pedido' : 'Títulos do cliente'}
              </p>
              <PainelRegistros
                entity="ContaReceber"
                filter={pagamento.porPedido ? { pedido_id: pedidoId } : { cliente_id: clienteId }}
                registros={pagamento.titulos}
                carregando={pagamento.isLoading}
                vazio={pagamento.permitido
                  ? 'Nenhuma parcela registrada para esta negociação.'
                  : 'Sem permissão de leitura no módulo Financeiro.'}
                campos={[
                  { key: 'descricao', destaque: true },
                  { key: 'numero_parcela', label: 'Parcela' },
                  { key: 'valor', label: 'Valor', tipo: 'moeda' },
                  { key: 'data_vencimento', label: 'Vencimento', tipo: 'data' },
                  { key: 'forma_recebimento', label: 'Forma' },
                  { key: 'status', label: 'Situação', tipo: 'situacao' },
                ]}
              />
            </div>
          }
          nota="Parcelas reais do pedido ou do cliente no contexto ativo. Links de pagamento e confirmação pelo provedor são tratados no módulo Financeiro."
        />
      );
    }
    case 'atendimento':
    default:
      return <PainelAtendimento negociacao={negociacao} cliente={cliente} />;
  }
}