// Central de Vendas 360° — layout versão 6: tabela de 12 colunas, grade de itens e Cliente 360° lateral
import React, { useMemo, useState } from 'react';
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

const cidadeDoCliente = (cliente) => cliente?.cidade || cliente?.endereco_cidade || '—';

export default function CentralVendas360({
  pedidos = [], clientes = [], empresas = [], onCreatePedido, onEditPedido,
}) {
  const [modo, setModo] = useState('central');
  const [selecionada, setSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState('todas');
  const [painelAberto, setPainelAberto] = useState(true);
  const [novaNegociacaoAberta, setNovaNegociacaoAberta] = useState(false);

  const preferencias = usePreferenciasCentral360();
  const { orcamentos, isLoading, refetch, empresaAtual, grupoAtual } = useCentral360Data();
  const { criarOrcamento, salvando, dataPadraoValidade } = useNovaNegociacao({ orcamentos });

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
    setSelecionada(orcamentoParaNegociacao(criado));
  };

  const negociacoes = useMemo(() => {
    const lista = [
      ...orcamentos.map(orcamentoParaNegociacao),
      ...pedidos.map(pedidoParaNegociacao),
    ];
    return lista.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [orcamentos, pedidos]);

  const clientesPorId = useMemo(
    () => (clientes || []).reduce((acc, cliente) => { acc[cliente.id] = cliente; return acc; }, {}),
    [clientes]
  );

  const porGrupo = useMemo(
    () => (grupo === 'todas' ? negociacoes : negociacoes.filter((negociacao) => negociacao.grupo === grupo)),
    [negociacoes, grupo]
  );

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

  const contadores = useMemo(() => {
    return negociacoes.reduce((acc, negociacao) => {
      acc[negociacao.grupo] = (acc[negociacao.grupo] || 0) + 1;
      return acc;
    }, {});
  }, [negociacoes]);

  const opcoesFiltro = useMemo(() => ({
    vendedores: valoresUnicos(porGrupo.map((negociacao) => negociacao.vendedor)),
    cidades: valoresUnicos(porGrupo.map((negociacao) => cidadeDoCliente(clientesPorId[negociacao.cliente_id]))),
    origens: valoresUnicos(porGrupo.map((negociacao) => negociacao.canal)),
  }), [porGrupo, clientesPorId]);

  const atualizar = async () => {
    await refetch();
    setSelecionada((atual) => {
      if (!atual) return atual;
      const orcamentoAtualizado = orcamentos.find((o) => `orc-${o.id}` === atual.chave);
      return orcamentoAtualizado ? orcamentoParaNegociacao(orcamentoAtualizado) : atual;
    });
  };

  const abrirRegistro = (negociacao) => {
    if (negociacao.origem === 'pedido' && onEditPedido) {
      onEditPedido(negociacao.registro);
      return;
    }
    setSelecionada(negociacao);
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
                  onSelect={setSelecionada}
                  onAbrir={abrirRegistro}
                  carregando={isLoading}
                  larguras={preferencias.larguras}
                  onLargura={preferencias.setLargura}
                  ordenacao={preferencias.ordenacao}
                  onOrdenacao={preferencias.setOrdenacao}
                />
              </div>

              <div className="flex-1 min-h-0 flex">
                {selecionada ? (
                  <MesaNegociacao
                    negociacao={selecionada}
                    clientes={clientes}
                    empresa={empresaAtual}
                    grupo={grupoAtual}
                    onVoltar={() => setSelecionada(null)}
                    onAtualizar={atualizar}
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
              cliente={clientesPorId[selecionada?.cliente_id] || null}
              recolhido={!painelAberto}
              onToggle={() => setPainelAberto((v) => !v)}
              largura={preferencias.larguraPainel}
              onRedimensionar={preferencias.setLarguraPainel}
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