// Central de Vendas 360° — layout versão 6: tabela de 12 colunas, grade de itens e Cliente 360° lateral
import React, { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import ProtectedSection from '@/components/security/ProtectedSection';
import PedidosTab from '@/components/comercial/PedidosTab';
import HeaderCentral360 from './HeaderCentral360';
import TabelaNegociacoes from './TabelaNegociacoes';
import MesaNegociacao from './MesaNegociacao';
import Cliente360Lateral from './Cliente360Lateral';
import useCentral360Data from './useCentral360Data';
import { orcamentoParaNegociacao, pedidoParaNegociacao } from './negociacaoUtils';

export default function CentralVendas360({
  pedidos = [], clientes = [], empresas = [], onCreatePedido, onEditPedido,
}) {
  const [modo, setModo] = useState('central');
  const [selecionada, setSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState('todas');
  const [painelAberto, setPainelAberto] = useState(true);

  const { orcamentos, isLoading, refetch, empresaAtual, grupoAtual } = useCentral360Data();

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

  const filtradasPorGrupo = useMemo(
    () => porGrupo(negociacoes, grupo),
    [negociacoes, grupo]
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return filtradasPorGrupo;
    return filtradasPorGrupo.filter((negociacao) => {
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
  }, [filtradasPorGrupo, busca, clientesPorId]);

  const contadores = useMemo(() => {
    return negociacoes.reduce((acc, negociacao) => {
      acc[negociacao.grupo] = (acc[negociacao.grupo] || 0) + 1;
      return acc;
    }, {});
  }, [negociacoes]);

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
          onNovo={onCreatePedido}
          modo={modo}
          setModo={setModo}
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
            />
          </div>
        )}
      </div>
    </ProtectedSection>
  );
}

function porGrupo(negociacoes, grupo) {
  return grupo === 'todas' ? negociacoes : negociacoes.filter((negociacao) => negociacao.grupo === grupo);
}