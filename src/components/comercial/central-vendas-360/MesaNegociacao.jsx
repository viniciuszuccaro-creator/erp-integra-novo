// Mesa de trabalho da negociação — cabeçalho, atendimento, itens, atalhos, painel e rodapé
import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useWindow } from '@/components/lib/useWindow';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import PedidoFormCompleto from '@/components/comercial/PedidoFormCompleto';
import HeaderNegociacao from './HeaderNegociacao';
import FaixaAtendimento from './FaixaAtendimento';
import ItensNegociacaoGrid from './ItensNegociacaoGrid';
import RodapeNegociacao from './RodapeNegociacao';
import EnviarPropostaDialog from './EnviarPropostaDialog';
import useEnvioProposta from './useEnvioProposta';
import PainelValidacaoFechamento from './PainelValidacaoFechamento';
import useValidacaoFechamento from './useValidacaoFechamento';
import useAcoesComerciais from './useAcoesComerciais';
import useAcoesOrcamento from './useAcoesOrcamento';
import DestinoPedidoDialog from './DestinoPedidoDialog';
import DesmembrarDialog from './DesmembrarDialog';
import ImportarItensDialog from './ImportarItensDialog';
import { totalizarItens, dataCurta, orcamentoParaNegociacao } from './negociacaoUtils';
import { ImprimirPedido } from '@/components/lib/impressao';

// Comparação estável dos itens: ignora ids gerados na tela e a diferença texto/número
const assinaturaItens = (lista = []) => JSON.stringify(lista.map((item) => ({
  produto_id: item.produto_id || null,
  descricao: item.descricao || '',
  quantidade: Number(item.quantidade || 0),
  unidade: item.unidade || 'UN',
  valor_unitario: Number(item.valor_unitario || 0),
  desconto_percentual: Number(item.desconto_percentual || 0),
  valor_total: Number(Number(item.valor_total || 0).toFixed(2)),
})));

export default function MesaNegociacao({
  negociacao, clientes = [], empresa, grupo, onVoltar, onAtualizar, concorrentes = [],
}) {
  const [itens, setItens] = useState(negociacao.itens);
  const [faixaAberta, setFaixaAberta] = useState(true);
  const [versao, setVersao] = useState(negociacao.registro?.updated_date);
  const [dadosOrcamento, setDadosOrcamento] = useState({ data_validade: negociacao.registro?.data_validade || '', condicoes_pagamento: negociacao.registro?.condicoes_pagamento || '', prazo_entrega: negociacao.registro?.prazo_entrega || '' });
  const [envioAberto, setEnvioAberto] = useState(false);
  const [destinoAberto, setDestinoAberto] = useState(false);
  const [desmembrarAberto, setDesmembrarAberto] = useState(false);
  const [importarAberto, setImportarAberto] = useState(false);

  const { openWindow, closeWindow } = useWindow();
  const { user } = useUser();
  const { createInContext, updateInContext } = useContextoVisual();

  useEffect(() => {
    setItens(negociacao.itens);
    setVersao(negociacao.registro?.updated_date);
    setDadosOrcamento({ data_validade: negociacao.registro?.data_validade || '', condicoes_pagamento: negociacao.registro?.condicoes_pagamento || '', prazo_entrega: negociacao.registro?.prazo_entrega || '' });
  }, [negociacao.chave]);

  const sujo = useMemo(
    () => negociacao.editavel && (assinaturaItens(itens) !== assinaturaItens(negociacao.itens)
      || Object.entries(dadosOrcamento).some(([chave, valor]) => valor !== (negociacao.registro?.[chave] || ''))),
    [itens, negociacao, dadosOrcamento]
  );

  const totais = negociacao.editavel ? totalizarItens(itens) : negociacao.totais;

  const { enviar, enviando, dataFollowUpPadrao } = useEnvioProposta({
    negociacao, empresa, grupo, onAtualizar,
  });

  const clienteNegociacao = useMemo(
    () => (clientes || []).find((c) => c.id === negociacao.cliente_id) || null,
    [clientes, negociacao.cliente_id]
  );

  const acoes = useAcoesComerciais();
  const acoesOrcamento = useAcoesOrcamento({ negociacao, onAtualizar });
  const salvando = acoesOrcamento.executando;
  const validacao = useValidacaoFechamento({
    negociacao: { ...negociacao, itens, ...(negociacao.origem === 'orcamento' ? { condicao_pagamento: dadosOrcamento.condicoes_pagamento, validade: dadosOrcamento.data_validade, registro: { ...negociacao.registro, ...dadosOrcamento } } : {}) },
    cliente: clienteNegociacao,
  });
  const bloqueioFechamento = negociacao.origem === 'orcamento' && validacao.erros.length > 0;

  const contextoNegociacao = empresa?.nome || grupo?.nome || '';

  const imprimir = () => {
    const registro = negociacao.registro || {};
    ImprimirPedido({
      titulo: negociacao.origem === 'orcamento' ? 'ORÇAMENTO' : 'PEDIDO',
      empresa,
      pedido: {
        numero_pedido: negociacao.numero,
        data_pedido: registro.data_criacao || registro.data_pedido || new Date().toISOString(),
        cliente_nome: negociacao.cliente_nome,
        itens_revenda: itens.map((item) => ({
          descricao: item.descricao,
          quantidade: Number(item.quantidade || 0),
          unidade: item.unidade,
          preco_unitario: Number(item.valor_unitario || 0),
          valor_total: Number(item.valor_total || 0),
        })),
        valor_produtos: Number(totais.produtos || 0),
        desconto_geral_pedido_valor: Number(totais.desconto || 0),
        valor_frete: Number(totais.frete || 0),
        valor_total: Number(totais.total || 0),
        forma_pagamento: negociacao.condicao_pagamento,
        observacoes_publicas: [
          negociacao.origem === 'orcamento' ? `Proposta válida até ${dataCurta(negociacao.validade)}.` : '',
          `Prazo de entrega: ${negociacao.prazo}.`,
          registro.observacoes || '',
        ].filter(Boolean).join(' '),
      },
    });
    registrarAuditoria('Impressão', `${negociacao.origem === 'orcamento' ? 'Orçamento' : 'Pedido'} ${negociacao.numero} impresso`, negociacao.origem === 'orcamento' ? 'OrcamentoCliente' : 'Pedido');
  };

  const abrirEnvio = () => {
    if (!acoes.podeEditar) {
      toast.error('Sem permissão para enviar propostas.');
      return;
    }
    setEnvioAberto(true);
  };

  const registrarAuditoria = (acao, descricao, entidade) => {
    void base44.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id || null,
      acao: acao === 'Impressão' ? 'Exportação' : acao === 'Conversão' ? 'Criação' : acao,
      modulo: 'Comercial',
      tipo_auditoria: 'entidade',
      entidade,
      registro_id: negociacao.registro?.id,
      descricao,
      dados_anteriores: negociacao.registro,
      dados_novos: { itens, totais },
      empresa_id: negociacao.registro?.empresa_id || empresa?.id || null,
      group_id: negociacao.registro?.group_id || grupo?.id || null,
      data_hora: new Date().toISOString(),
    }).catch((erro) => { console.error('AuditLog falhou (Central 360):', erro); });
  };

  const salvar = async () => {
    if (!negociacao.editavel || !acoes.podeEditar || salvando) return;
    if (negociacao.origem !== 'orcamento') return PedidoEdicao(negociacao.registro);
    const atualizado = await acoesOrcamento.executarFechamento('salvar', itens, versao, dadosOrcamento);
    if (atualizado) {
      setVersao(atualizado.updated_date);
      setItens(orcamentoParaNegociacao(atualizado).itens);
      setDadosOrcamento({ data_validade: atualizado.data_validade || '', condicoes_pagamento: atualizado.condicoes_pagamento || '', prazo_entrega: atualizado.prazo_entrega || '' });
    }
  };

  const aprovarOrcamento = async () => {
    if (!acoes.podeAprovar || salvando) return;
    const atualizado = await acoesOrcamento.executarFechamento('fechar', itens, versao, dadosOrcamento);
    if (atualizado) {
      setVersao(atualizado.updated_date);
      setItens(orcamentoParaNegociacao(atualizado).itens);
      setDadosOrcamento({ data_validade: atualizado.data_validade || '', condicoes_pagamento: atualizado.condicoes_pagamento || '', prazo_entrega: atualizado.prazo_entrega || '' });
    }
  };

  const gerarPedido = async (destino = 'entrega') => {
    if (!acoes.podeCriar) {
      toast.error('Sem permissão para criar pedidos.');
      return;
    }
    if (salvando) return;
    const validado = await acoesOrcamento.executarFechamento('validar', undefined, versao);
    if (!validado) return;
    setDestinoAberto(false);
    let criado = false;
    const janela = openWindow(
      PedidoFormCompleto,
      {
        clientes,
        windowMode: true,
        pedido: {
          status: 'Aguardando Aprovação',
          group_id: negociacao.registro.group_id,
          empresa_id: negociacao.registro.empresa_id,
          tipo_frete: destino === 'retira' ? 'Retirada' : 'CIF',
          cliente_id: negociacao.cliente_id,
          cliente_nome: negociacao.cliente_nome,
          observacoes_publicas: `Originado do orçamento ${negociacao.numero} — destino ${destino}`,
          itens_revenda: itens.map((item) => ({
            produto_id: item.produto_id || null,
            produto_descricao: item.descricao,
            quantidade: Number(item.quantidade || 0),
            unidade: item.unidade,
            valor_unitario: Number(item.valor_unitario || 0),
            preco_unitario: Number(item.valor_unitario || 0),
            desconto_percentual: Number(item.desconto_percentual || 0),
            valor_total: Number(item.valor_total || 0),
          })),
        },
        onSubmit: async (formData) => {
          if (criado) return;
          criado = true;
          try {
            const pedidoCriado = await createInContext('Pedido', {
              ...formData,
              status: 'Aguardando Aprovação',
              group_id: negociacao.registro.group_id,
              empresa_id: negociacao.registro.empresa_id,
              vendedor: formData.vendedor || user?.full_name,
              vendedor_id: formData.vendedor_id || user?.id,
            });
            await updateInContext('OrcamentoCliente', negociacao.registro.id, { status: 'Convertido', pedido_gerado_id: pedidoCriado.id });
            registrarAuditoria('Conversão', `Orçamento ${negociacao.numero} convertido em pedido`, 'Pedido');
            toast.success('Pedido gerado a partir do orçamento.');
            await onAtualizar?.();
            if (janela) closeWindow(janela);
          } catch (erro) {
            criado = false;
            toast.error(`Erro ao gerar pedido: ${erro.message}`);
          }
        },
      },
      { title: `Pedido do orçamento ${negociacao.numero}`, width: 1400, height: 800 }
    );
  };

  const avancar = () => {
    if (negociacao.origem === 'orcamento') {
      if (negociacao.grupo === 'aberto') return aprovarOrcamento();
      if (negociacao.grupo === 'aguardando') return setDestinoAberto(true);
      return undefined;
    }
    return onEditarPedido(negociacao.registro);
  };

  function onEditarPedido(pedido) {
    if (!acoes.podeEditar) {
      toast.error('Sem permissão para editar pedidos.');
      return;
    }
    PedidoEdicao(pedido);
  }

  function PedidoEdicao(pedido) {
    let atualizando = false;
    const janela = openWindow(
      PedidoFormCompleto,
      {
        pedido,
        clientes,
        windowMode: true,
        onSubmit: async (formData) => {
          if (atualizando) return;
          atualizando = true;
          try {
            await updateInContext('Pedido', formData.id, formData);
            registrarAuditoria('Edição', `Pedido ${negociacao.numero} atualizado na Central 360`, 'Pedido');
            toast.success('Pedido atualizado.');
            await onAtualizar?.();
            if (janela) closeWindow(janela);
          } catch (erro) {
            atualizando = false;
            toast.error(`Erro ao atualizar: ${erro.message}`);
          }
        },
      },
      { title: `Editar ${pedido.numero_pedido || 'pedido'}`, width: 1400, height: 800 }
    );
  }

  const acaoLabel = negociacao.origem === 'orcamento'
    ? (negociacao.grupo === 'aberto' ? 'Fechar orçamento' : negociacao.grupo === 'aguardando' ? 'Gerar pedido' : 'Etapa concluída')
    : 'Abrir pedido';

  const acaoDesabilitada =
    (negociacao.origem === 'orcamento' && !['aberto', 'aguardando'].includes(negociacao.grupo));

  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-0">
      <HeaderNegociacao negociacao={negociacao} empresa={empresa} grupo={grupo} sujo={sujo} salvando={salvando}
        dados={dadosOrcamento} onAlterar={negociacao.editavel && acoes.podeEditar && !salvando
          ? (campo, valor) => setDadosOrcamento((atual) => ({ ...atual, [campo]: valor })) : undefined} />
      {concorrentes.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
          <span className="font-semibold">Negociação ativa para este cliente:</span>{' '}
          {concorrentes.map((outra) => `${outra.numero} (${outra.situacao})`).join(' · ')}
          {' '}— alinhe o atendimento antes de fechar uma nova proposta.
        </div>
      )}
      <FaixaAtendimento negociacao={negociacao} aberta={faixaAberta} onToggle={() => setFaixaAberta((v) => !v)} />
      <PainelValidacaoFechamento validacao={validacao} />
      {acoesOrcamento.erroFechamento && (
        <div role="alert" className="w-full rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <p>{acoesOrcamento.erroFechamento}</p>
          {acoesOrcamento.checagensServidor.filter((checagem) => checagem.status === 'erro').map((checagem) => (
            <p key={checagem.chave}>{checagem.titulo}: {checagem.detalhe}</p>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 flex">
        <ItensNegociacaoGrid
          itens={itens}
          setItens={setItens}
          editavel={negociacao.editavel && acoes.podeEditar && !salvando}
          permiteDesconto={acoes.podeAprovarDesconto}
        />
      </div>

      <RodapeNegociacao
        totais={totais}
        condicaoPagamento={negociacao.origem === 'orcamento' ? dadosOrcamento.condicoes_pagamento : negociacao.condicao_pagamento}
        prazo={negociacao.origem === 'orcamento' ? dadosOrcamento.prazo_entrega : negociacao.prazo}
        editavel={negociacao.editavel && acoes.podeEditar}
        sujo={sujo}
        salvando={salvando}
        acaoLabel={acaoLabel}
        acaoDescricao={bloqueioFechamento
          ? `Resolva ${validacao.erros.length} bloqueio(s) do fechamento para avançar`
          : 'Avança a negociação para a próxima etapa'}
        acaoDesabilitada={acaoDesabilitada || bloqueioFechamento || validacao.carregando || salvando || acoes.carregando
          || (negociacao.origem === 'orcamento' ? negociacao.grupo === 'aberto' ? !acoes.podeAprovar : !acoes.podeCriar : !acoes.podeEditar)}
        onSalvar={salvar}
        onVoltar={onVoltar}
        onAvancar={avancar}
        onEnviar={abrirEnvio}
        onImprimir={imprimir}
        enviando={enviando}
        enviarDesabilitado={sujo || !acoes.podeEditar || salvando}
        onDuplicar={negociacao.origem === 'orcamento' && acoes.podeCriar
          ? async () => { const criado = await acoesOrcamento.duplicar(); if (criado) onVoltar?.(); }
          : undefined}
        onDesmembrar={negociacao.origem === 'orcamento' && negociacao.editavel && acoes.podeEditar && acoes.podeCriar && !sujo
          ? () => setDesmembrarAberto(true)
          : undefined}
        onImportar={negociacao.origem === 'orcamento' && negociacao.editavel && acoes.podeEditar
          ? () => setImportarAberto(true)
          : undefined}
      />

      <DestinoPedidoDialog
        aberto={destinoAberto}
        onOpenChange={setDestinoAberto}
        numero={negociacao.numero}
        salvando={salvando}
        onConfirmar={gerarPedido}
      />

      <DesmembrarDialog
        aberto={desmembrarAberto}
        onOpenChange={setDesmembrarAberto}
        itens={itens}
        executando={acoesOrcamento.executando}
        onConfirmar={async (ids) => {
          const ok = await acoesOrcamento.desmembrar(ids);
          if (ok) {
            setDesmembrarAberto(false);
            onVoltar?.();
          }
        }}
      />

      <ImportarItensDialog
        aberto={importarAberto}
        onOpenChange={setImportarAberto}
        clienteId={negociacao.cliente_id}
        importando={acoesOrcamento.importando}
        onImportar={async (pedido) => {
          const novos = await acoesOrcamento.importarItens(pedido);
          if (!novos?.length) return;
          setItens((atual) => [...atual, ...novos]);
          setImportarAberto(false);
          toast.success(`${novos.length} item(ns) importados de ${pedido.numero_pedido || 'pedido anterior'}. Revise os preços e salve.`);
        }}
      />

      <EnviarPropostaDialog
        aberto={envioAberto}
        onOpenChange={setEnvioAberto}
        negociacao={negociacao}
        cliente={clienteNegociacao}
        contexto={contextoNegociacao}
        dataFollowUpPadrao={dataFollowUpPadrao}
        enviando={enviando}
        onEnviar={enviar}
      />
    </div>
  );
}