// Mesa de trabalho da negociação — cabeçalho, atendimento, itens, atalhos, painel e rodapé
import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useWindow } from '@/components/lib/useWindow';
import { useUser } from '@/components/lib/UserContext';
import PedidoFormCompleto from '@/components/comercial/PedidoFormCompleto';
import useComercialPedidoWindows from '@/components/comercial/page/useComercialPedidoWindows';
import useRascunhoNegociacao from '@/components/comercial/central-vendas-360/useRascunhoNegociacao';
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
  tipo: item.tipo || 'revenda',
  valor_total: Number(Number(item.valor_total || 0).toFixed(2)),
})));

export default function MesaNegociacao({
  negociacao: recebida, clientes = [], empresa, grupo, onVoltar, onAtualizar, concorrentes = [],
}) {
  const [registroLocal, setRegistroLocal] = useState(null);
  const negociacao = registroLocal && (!recebida.registro?.updated_date || registroLocal.registro.updated_date >= recebida.registro.updated_date) ? registroLocal : recebida;
  const [itens, setItens] = useState(negociacao.itens);
  const [faixaAberta, setFaixaAberta] = useState(true);
  const [versao, setVersao] = useState(negociacao.registro?.updated_date);
  const [dadosOrcamento, setDadosOrcamento] = useState({ data_validade: negociacao.registro?.data_validade || '', condicoes_pagamento: negociacao.registro?.condicoes_pagamento || '', prazo_entrega: negociacao.registro?.prazo_entrega || '' });
  const [envioAberto, setEnvioAberto] = useState(false);
  const [destinoAberto, setDestinoAberto] = useState(false);
  const [derivacaoAberta, setDerivacaoAberta] = useState(null);
  const [importarAberto, setImportarAberto] = useState(false);

  const { openWindow, closeWindow } = useWindow();
  const { user } = useUser();

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
  const { handleEditPedido } = useComercialPedidoWindows({ clientes, refetchPedidos: onAtualizar || (() => Promise.resolve()) });
  const rascunho = useRascunhoNegociacao({
    chave: user?.id && negociacao.registro?.group_id && negociacao.registro?.empresa_id ? `central360:rascunho:${user.id}:${negociacao.registro.group_id}:${negociacao.registro.empresa_id}:${negociacao.registro.id}` : null,
    habilitado: negociacao.origem === 'orcamento' && negociacao.editavel && acoes.podeEditar,
    sujo, itens, dados: dadosOrcamento, versao,
  });
  const podeEditarItens = negociacao.editavel && acoes.podeEditar && !rascunho.carregando && !rascunho.pendente;
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
    if (!podeEditarItens || salvando) return;
    if (negociacao.origem !== 'orcamento') return handleEditPedido(negociacao.registro);
    const atualizado = await acoesOrcamento.executarFechamento('salvar', itens, versao, dadosOrcamento);
    if (atualizado) {
      await rascunho.limpar();
      setRegistroLocal(orcamentoParaNegociacao(atualizado));
      setVersao(atualizado.updated_date);
      setItens(orcamentoParaNegociacao(atualizado).itens);
      setDadosOrcamento({ data_validade: atualizado.data_validade || '', condicoes_pagamento: atualizado.condicoes_pagamento || '', prazo_entrega: atualizado.prazo_entrega || '' });
    }
  };

  const aprovarOrcamento = async () => {
    if (!acoes.podeAprovar || salvando) return;
    const atualizado = await acoesOrcamento.executarFechamento('fechar', itens, versao, dadosOrcamento);
    if (atualizado) {
      await rascunho.limpar();
      setRegistroLocal(orcamentoParaNegociacao(atualizado));
      setVersao(atualizado.updated_date);
      setItens(orcamentoParaNegociacao(atualizado).itens);
      setDadosOrcamento({ data_validade: atualizado.data_validade || '', condicoes_pagamento: atualizado.condicoes_pagamento || '', prazo_entrega: atualizado.prazo_entrega || '' });
    }
  };

  const gerarPedido = async (destino = 'entrega') => {
    if (!acoes.podeCriar || salvando) return;
    let preparo;
    try { preparo = await acoesOrcamento.prepararConversao(destino, versao); }
    catch { return; }
    setDestinoAberto(false);
    const operacaoId = crypto.randomUUID();
    const janela = openWindow(PedidoFormCompleto, {
      clientes, windowMode: true, conversaoOrcamento: true,
      pedido: preparo.pedido_base,
      onCancel: () => closeWindow(janela),
      onSubmit: async (formData) => {
        const resultado = await acoesOrcamento.converterPedido(formData, preparo, operacaoId);
        setRegistroLocal(orcamentoParaNegociacao(resultado.orcamento));
        toast.success(resultado.repetida ? 'Pedido existente conciliado, sem duplicação.' : `Pedido ${resultado.pedido.numero_pedido} criado e aguardando aprovação.`);
        if (janela) closeWindow(janela);
        await onAtualizar?.();
        return resultado.pedido;
      },
    }, { title: `Pedido do orçamento ${negociacao.numero}`, width: 1400, height: 800 });
  };

  const avancar = () => {
    if (negociacao.origem === 'orcamento') {
      if (negociacao.registro.status === 'Pendente') return aprovarOrcamento();
      if (negociacao.grupo === 'aguardando') return setDestinoAberto(true);
      return undefined;
    }
    return handleEditPedido(negociacao.registro);
  };

  // Edição reutiliza useComercialPedidoWindows: a mesma trava atende a mesa, lista e duplo clique.

  const acaoLabel = negociacao.origem === 'orcamento'
    ? (negociacao.registro.status === 'Pendente' ? 'Fechar orçamento' : negociacao.grupo === 'aguardando' ? 'Gerar pedido' : 'Etapa concluída')
    : 'Abrir pedido';

  const acaoDesabilitada =
    (negociacao.origem === 'orcamento' && !['Pendente', 'Aprovado'].includes(negociacao.registro.status));

  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-0 overflow-auto">
      <HeaderNegociacao negociacao={negociacao} empresa={empresa} grupo={grupo} sujo={sujo} salvando={salvando}
        dados={dadosOrcamento} onAlterar={podeEditarItens && !salvando
          ? (campo, valor) => setDadosOrcamento((atual) => ({ ...atual, [campo]: valor })) : undefined} />
      {concorrentes.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
          <span className="font-semibold">Negociação ativa para este cliente:</span>{' '}
          {concorrentes.map((outra) => `${outra.numero} (${outra.situacao})`).join(' · ')}
          {' '}— alinhe o atendimento antes de fechar uma nova proposta.
        </div>
      )}
      {rascunho.pendente && <div className="w-full rounded-md border border-border bg-muted px-3 py-2 text-xs" role="status">
        <p>Rascunho local disponível, salvo em {new Date(rascunho.pendente.salvo_em).toLocaleString('pt-BR')}. {rascunho.pendente.versao !== versao ? 'A versão no servidor mudou. Revise todos os dados antes de salvar.' : 'Ainda não enviado ao servidor.'}</p>
        <div className="flex gap-3 mt-1"><button type="button" className="font-semibold text-primary" onClick={() => { setItens(rascunho.pendente.itens); setDadosOrcamento((atual) => ({ ...atual, ...rascunho.pendente.dados })); rascunho.recuperar(); }}>Recuperar rascunho</button><button type="button" className="text-muted-foreground" onClick={rascunho.limpar}>Descartar rascunho local</button></div>
      </div>}
      {sujo && rascunho.estado && <p role="status" className="text-xs text-muted-foreground">{rascunho.estado}</p>}
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

      <div className="flex-1 min-h-[310px] flex">
        <ItensNegociacaoGrid
          itens={negociacao.origem === 'pedido' ? negociacao.itens : itens}
          pedido={negociacao.origem === 'pedido' ? negociacao.registro : undefined}
          setItens={setItens}
          editavel={podeEditarItens && !salvando}
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
        acaoDesabilitada={acaoDesabilitada || bloqueioFechamento || validacao.carregando || salvando || acoes.carregando || rascunho.carregando || Boolean(rascunho.pendente)
          || (negociacao.origem === 'orcamento' ? negociacao.registro.status === 'Pendente' ? !acoes.podeAprovar : !acoes.podeCriar : !acoes.podeEditar)}
        onSalvar={salvar}
        onVoltar={onVoltar}
        onAvancar={avancar}
        onEnviar={abrirEnvio}
        onImprimir={acoes.podeExportar ? imprimir : undefined}
        enviando={enviando}
        enviarDesabilitado={sujo || !acoes.podeEditar || salvando}
        onDuplicar={negociacao.origem === 'orcamento' && acoes.podeCriar && !sujo && !rascunho.pendente && !rascunho.carregando
          ? () => setDerivacaoAberta('duplicar')
          : undefined}
        onDesmembrar={negociacao.origem === 'orcamento' && negociacao.editavel && acoes.podeEditar && acoes.podeCriar && !sujo && !rascunho.pendente && !rascunho.carregando
          ? () => setDerivacaoAberta('desmembrar')
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
        aberto={Boolean(derivacaoAberta)}
        modo={derivacaoAberta || 'desmembrar'}
        onOpenChange={(aberto) => { if (!aberto) setDerivacaoAberta(null); }}
        itens={itens}
        erro={acoesOrcamento.erroFechamento}
        controle={negociacao.registro.derivacao_orcamento}
        executando={acoesOrcamento.executando}
        onConfirmar={async (ids, revisado) => {
          const ok = derivacaoAberta === 'duplicar' ? await acoesOrcamento.duplicar(revisado) : await acoesOrcamento.desmembrar(ids, revisado);
          if (ok) { setDerivacaoAberta(null); onVoltar?.(); }
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