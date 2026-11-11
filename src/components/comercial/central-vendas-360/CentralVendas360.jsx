// Central de Vendas 360° — layout versão 6: tabela de 12 colunas, grade de itens e Cliente 360° lateral
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWindow } from '@/components/lib/useWindow';
import { Sparkles } from 'lucide-react';
import ProtectedSection from '@/components/security/ProtectedSection';
import PedidosTab from '@/components/comercial/PedidosTab';
import HeaderCentral360 from './HeaderCentral360';
import TabelaNegociacoes from './TabelaNegociacoes';
import MesaNegociacao from './MesaNegociacao';
import Cliente360Lateral from './Cliente360Lateral';
import NovaNegociacaoDialog from './NovaNegociacaoDialog';
import useCentral360Data from './useCentral360Data';
import useNovaNegociacao from './useNovaNegociacao';
import usePreferenciasCentral360 from './usePreferenciasCentral360';
import { orcamentoParaNegociacao, pedidoParaNegociacao } from './negociacaoUtils';
import usePesosProdutos from './usePesosProdutos';
import { pesoDaNegociacao } from './pesoNegociacao';
import useAlertasComerciais from './useAlertasComerciais';
import useValidacaoFechamento from './useValidacaoFechamento';

const cidadeDoCliente = (cliente) => cliente?.cidade || cliente?.endereco_cidade || '—';

// "Em execução" agrega as etapas detalhadas (Produção, Entrega e Retira)
const GRUPOS_EXECUCAO = ['acompanhamento', 'producao', 'entrega', 'retira'];

export default function CentralVendas360({
  pedidos = [], clientes = [], empresas = [], onCreatePedido, onEditPedido,
}) {
  const [modo, setModo] = useState('central');
  // Seleção por chave: a negociação é sempre relida da lista, então status/itens
  // salvos aparecem na mesa imediatamente (sem ficar preso ao objeto antigo).
  const [chaveSelecionada, setChaveSelecionada] = useState(null);
  const snapshotSelecionada = useRef(null);
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState('aberto');
  const { openWindow, closeWindow } = useWindow();
  const [painelAberto, setPainelAberto] = useState(true);
  const [novaNegociacaoAberta, setNovaNegociacaoAberta] = useState(false);
  // Ações rápidas contextuais da negociação, publicadas pela mesa e exibidas sob o Cliente 360°
  const [acoesRapidas, setAcoesRapidas] = useState([]);
  // §2: "Histórico" no rodapé Mais Ações leva ao painel de histórico já existente do Cliente 360°
  const [painelSolicitado, setPainelSolicitado] = useState(null);

  const preferencias = usePreferenciasCentral360();
  const {
    orcamentos, pedidosBusca, buscando, isLoading, refetch, empresaAtual, grupoAtual,
  } = useCentral360Data({ busca });
  const { criarOrcamento, salvando, dataPadraoValidade } = useNovaNegociacao({ orcamentos });
  useEffect(() => {
    setChaveSelecionada(null);
    snapshotSelecionada.current = null;
  }, [empresaAtual?.id, grupoAtual?.id]);

  // Abertura de negociação: proposta nasce na mesa da Central; pedido direto usa o formulário completo existente
  const abrirNegociacao = async (dados) => {
    if (dados.tipo === 'pedido') {
      setNovaNegociacaoAberta(false);
      onCreatePedido?.(dados.cliente);
      return;
    }
    const criado = await criarOrcamento(dados);
    if (!criado) return;
    setNovaNegociacaoAberta(false);
    setBusca('');
    setGrupo('todas');
    setModo('central');
    await refetch();
    selecionar(orcamentoParaNegociacao(criado));
  };

  // Durante a busca, os pedidos encontrados no servidor entram junto aos já carregados pela página
  const pedidosBase = useMemo(() => {
    if (!buscando) return pedidos;
    const porId = new Map((pedidos || []).filter((pedido) => pedido?.id).map((pedido) => [pedido.id, pedido]));
    (pedidosBusca || []).forEach((pedido) => { if (pedido?.id) porId.set(pedido.id, pedido); });
    return Array.from(porId.values());
  }, [pedidos, pedidosBusca, buscando]);

  const negociacoes = useMemo(() => {
    const lista = [
      ...orcamentos.map(orcamentoParaNegociacao),
      ...pedidosBase.map(pedidoParaNegociacao),
    ];
    return lista.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [orcamentos, pedidosBase]);

  // Negociação em foco relida da lista (evita estado congelado após salvar/aprovar)
  const selecionada = useMemo(() => {
    if (!chaveSelecionada) return null;
    const encontrada = negociacoes.find((negociacao) => negociacao.chave === chaveSelecionada);
    if (encontrada) snapshotSelecionada.current = encontrada;
    return encontrada || snapshotSelecionada.current;
  }, [negociacoes, chaveSelecionada]);

  const selecionar = (negociacao) => setChaveSelecionada(negociacao?.chave || null);

  const clientesPorId = useMemo(
    () => (clientes || []).reduce((acc, cliente) => { acc[cliente.id] = cliente; return acc; }, {}),
    [clientes]
  );

  const { alertas } = useAlertasComerciais({ negociacoes });

  // §2 — aba Pendências: reaproveita exatamente as regras de alerta já apuradas (proposta vencida,
  // aprovação parada, negociação sem movimento), sem duplicar cálculo nem consulta.
  const chavesComAlerta = useMemo(
    () => new Set((alertas || []).map((alerta) => alerta.chave).filter(Boolean)),
    [alertas]
  );

  // Proteção comercial: outras negociações ativas do mesmo cliente (evita propostas concorrentes)
  const concorrentes = useMemo(() => {
    if (!selecionada?.cliente_id) return [];
    const ativos = ['aberto', 'aguardando', 'aprovacao', 'acompanhamento', 'producao', 'entrega', 'retira'];
    return negociacoes.filter((negociacao) => negociacao.chave !== selecionada.chave
      && negociacao.cliente_id === selecionada.cliente_id
      && ativos.includes(negociacao.grupo));
  }, [negociacoes, selecionada]);

  const clienteSelecionado = clientesPorId[selecionada?.cliente_id] || null;
  const validacaoSelecionada = useValidacaoFechamento({
    negociacao: selecionada,
    cliente: clienteSelecionado,
  });

  const porGrupo = useMemo(() => {
    if (grupo === 'todas') return negociacoes;
    if (grupo === 'pendencia') return negociacoes.filter((negociacao) => chavesComAlerta.has(negociacao.chave));
    if (grupo === 'aberto') return negociacoes.filter((negociacao) => negociacao.origem === 'orcamento' && negociacao.grupo === 'aberto');
    if (grupo === 'acompanhamento') {
      return negociacoes.filter((negociacao) => GRUPOS_EXECUCAO.includes(negociacao.grupo));
    }
    return negociacoes.filter((negociacao) => negociacao.grupo === grupo);
  }, [negociacoes, grupo, chavesComAlerta]);

  const filtros = preferencias.filtros || {};

  const porFiltrosRapidos = useMemo(() => {
    return porGrupo.filter((negociacao) => {
      if (filtros.vendedor && filtros.vendedor !== 'todos' && negociacao.vendedor !== filtros.vendedor) return false;
      if (filtros.origem && filtros.origem !== 'todos' && negociacao.canal !== filtros.origem) return false;
      if (filtros.cidade && filtros.cidade !== 'todos') {
        const cliente = clientesPorId[negociacao.cliente_id] || {};
        if (cidadeDoCliente(cliente) !== filtros.cidade) return false;
      }
      return true;
    });
  }, [porGrupo, filtros, clientesPorId]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return porFiltrosRapidos;
    return porFiltrosRapidos.filter((negociacao) => {
      const cliente = clientesPorId[negociacao.cliente_id] || {};
      const campos = [
        negociacao.numero,
        negociacao.cliente_nome,
        negociacao.vendedor,
        negociacao.canal,
        negociacao.condicao_pagamento,
        cliente.cidade,
        cliente.endereco_cidade,
        cliente.nome_fantasia,
        cliente.razao_social,
        cliente.cpf_cnpj,
        cliente.cnpj,
        cliente.cpf,
        cliente.telefone,
        cliente.celular,
        cliente.whatsapp,
        ...(negociacao.itens || []).map((item) => item.descricao),
      ];
      return campos.filter(Boolean).some((valor) => String(valor).toLowerCase().includes(termo));
    });
  }, [porFiltrosRapidos, busca, clientesPorId]);

  // Peso: documento do pedido ou cálculo pelos cadastros oficiais de Produto
  const produtosPorId = usePesosProdutos(filtradas);
  const pesos = useMemo(() => filtradas.reduce((acc, negociacao) => {
    const peso = pesoDaNegociacao(negociacao, produtosPorId);
    if (peso) acc[negociacao.chave] = peso;
    return acc;
  }, {}), [filtradas, produtosPorId]);

  const contadores = useMemo(() => {
    const contagem = negociacoes.reduce((acc, negociacao) => {
      acc[negociacao.grupo] = (acc[negociacao.grupo] || 0) + 1;
      return acc;
    }, {});
    // Abertos inicia apenas com orçamentos; pedidos rascunho continuam acessíveis em Todas / Lista completa.
    contagem.aberto = negociacoes.filter((negociacao) => negociacao.origem === 'orcamento' && negociacao.grupo === 'aberto').length;
    // "Em execução" permanece como visão agregada das etapas Produção + Entrega + Retira
    contagem.acompanhamento = (contagem.producao || 0) + (contagem.entrega || 0)
      + (contagem.retira || 0) + (contagem.acompanhamento || 0);
    contagem.pendencia = chavesComAlerta.size;
    return contagem;
  }, [negociacoes, chavesComAlerta]);

  const opcoesFiltro = useMemo(() => ({
    vendedores: valoresUnicos(porGrupo.map((negociacao) => negociacao.vendedor)),
    cidades: valoresUnicos(porGrupo.map((negociacao) => cidadeDoCliente(clientesPorId[negociacao.cliente_id]))),
    origens: valoresUnicos(porGrupo.map((negociacao) => negociacao.canal)),
  }), [porGrupo, clientesPorId]);

  const atualizar = () => refetch();

  const abrirRegistro = (negociacao) => {
    if (negociacao.origem === 'pedido' && onEditPedido) {
      onEditPedido(negociacao.registro);
      return;
    }
    selecionar(negociacao);
    let janela;
    janela = openWindow(MesaNegociacao, {
      negociacao, clientes, onVoltar: () => closeWindow(janela),
      empresa: empresas.find((item) => item.id === negociacao.registro.empresa_id) || empresaAtual,
      grupo: grupoAtual, onAtualizar: atualizar,
    }, { title: `Orçamento ${negociacao.numero}`, width: 1280, height: 850, uniqueKey: `mesa-${negociacao.chave}` });
  };

  // §2 — Cliente 360° destacável: a mesma instância lateral aberta em janela própria,
  // preservando atalhos, painéis e ações rápidas da negociação em foco.
  const destacarCliente = () => {
    if (!selecionada) return;
    openWindow(Cliente360Lateral, {
      negociacao: selecionada,
      cliente: clienteSelecionado,
      recolhido: false,
      destacado: true,
      alertas,
      validacao: validacaoSelecionada,
      onSelecionarNegociacao: selecionar,
      acoesRapidas,
    }, {
      title: `Cliente 360° — ${selecionada.cliente_nome || selecionada.numero || ''}`,
      width: 520,
      height: 820,
      uniqueKey: `cliente360-${selecionada.chave}`,
    });
  };

  return (
    <ProtectedSection module="Comercial" section="Pedidos" action="visualizar">
      <div className="w-full h-full flex flex-col gap-2 min-h-0">
        <HeaderCentral360
          empresa={empresaAtual}
          grupo={grupoAtual}
          busca={busca}
          setBusca={setBusca}
          grupoFiltro={grupo}
          setGrupoFiltro={setGrupo}
          contadores={contadores}
          total={negociacoes.length}
          onNovo={() => setNovaNegociacaoAberta(true)}
          modo={modo}
          setModo={setModo}
          filtros={filtros}
          onFiltro={preferencias.setFiltro}
          onLimparFiltros={preferencias.limparFiltros}
          opcoes={opcoesFiltro}
          alertas={alertas}
        />

        {modo === 'lista' ? (
          <div className="flex-1 min-h-0">
            <PedidosTab
              pedidos={pedidos}
              clientes={clientes}
              empresas={empresas}
              onCreatePedido={onCreatePedido}
              onEditPedido={onEditPedido}
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2">
            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <div className="flex-[0_0_46%] min-h-[190px] flex">
                <TabelaNegociacoes
                  negociacoes={filtradas}
                  clientes={clientes}
                  selecionada={selecionada}
                  onSelect={selecionar}
                  onAbrir={abrirRegistro}
                  carregando={isLoading}
                  larguras={preferencias.larguras}
                  onLargura={preferencias.setLargura}
                  ordenacao={preferencias.ordenacao}
                  onOrdenacao={preferencias.setOrdenacao}
                  pesos={pesos}
                />
              </div>

              <div className="flex-1 min-h-0 flex">
                {selecionada ? (
                  <MesaNegociacao
                    key={selecionada.chave}
                    negociacao={selecionada}
                    clientes={clientes}
                    empresa={empresaAtual}
                    grupo={grupoAtual}
                    onVoltar={() => selecionar(null)}
                    onAtualizar={atualizar}
                    concorrentes={concorrentes}
                    onAcoesRapidas={setAcoesRapidas}
                    onHistorico={() => {
                      setPainelAberto(true);
                      setPainelSolicitado({ id: 'historico', em: Date.now() });
                    }}
                  />
                ) : (
                  <div className="flex-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center p-6">
                    <Sparkles className="w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Selecione um orçamento ou pedido na tabela</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      A grade de itens, os totais, o fechamento da venda e o Cliente 360° abrem na mesma tela,
                      sem sair da Central.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Cliente360Lateral
              negociacao={selecionada}
              cliente={clienteSelecionado}
              recolhido={!painelAberto}
              onToggle={() => setPainelAberto((v) => !v)}
              largura={preferencias.larguraPainel}
              onRedimensionar={preferencias.setLarguraPainel}
              alertas={alertas}
              validacao={validacaoSelecionada}
              onSelecionarNegociacao={selecionar}
              acoesRapidas={selecionada ? acoesRapidas : []}
              painelSolicitado={painelSolicitado}
              onDestacar={selecionada ? destacarCliente : undefined}
            />
          </div>
        )}

        <NovaNegociacaoDialog
          aberto={novaNegociacaoAberta}
          onOpenChange={setNovaNegociacaoAberta}
          clientes={clientes}
          onConfirmar={abrirNegociacao}
          salvando={salvando}
          validadePadrao={dataPadraoValidade}
        />
      </div>
    </ProtectedSection>
  );
}

function valoresUnicos(valores = []) {
  return Array.from(new Set(valores.filter((valor) => valor && valor !== '—'))).sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}