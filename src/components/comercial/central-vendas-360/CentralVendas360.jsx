// Central de Vendas 360 — mesa de trabalho do vendedor sobre orçamentos e pedidos existentes
import React, { useMemo, useState } from 'react';
import { ShoppingCart, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProtectedSection from '@/components/security/ProtectedSection';
import PedidosTab from '@/components/comercial/PedidosTab';
import ListaNegociacoes from './ListaNegociacoes';
import MesaNegociacao from './MesaNegociacao';
import useCentral360Data from './useCentral360Data';
import { orcamentoParaNegociacao, pedidoParaNegociacao } from './negociacaoUtils';

export default function CentralVendas360({
  pedidos = [], clientes = [], empresas = [], onCreatePedido, onEditPedido,
}) {
  const [aba, setAba] = useState('negociacoes');
  const [selecionada, setSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [grupo, setGrupo] = useState('todas');

  const { orcamentos, isLoading, refetch, empresaAtual, grupoAtual } = useCentral360Data();

  const negociacoes = useMemo(() => {
    const lista = [
      ...orcamentos.map(orcamentoParaNegociacao),
      ...pedidos.map(pedidoParaNegociacao),
    ];
    return lista.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [orcamentos, pedidos]);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return negociacoes.filter((negociacao) => {
      const combinaGrupo = grupo === 'todas' || negociacao.grupo === grupo;
      const combinaBusca = !termo
        || negociacao.cliente_nome.toLowerCase().includes(termo)
        || negociacao.numero.toLowerCase().includes(termo)
        || (negociacao.vendedor || '').toLowerCase().includes(termo);
      return combinaGrupo && combinaBusca;
    });
  }, [negociacoes, grupo, busca]);

  const atualizar = async () => {
    await refetch();
    setSelecionada((atual) => {
      if (!atual) return atual;
      const orcamentoAtualizado = orcamentos.find((o) => `orc-${o.id}` === atual.chave);
      return orcamentoAtualizado ? orcamentoParaNegociacao(orcamentoAtualizado) : atual;
    });
  };

  return (
    <ProtectedSection module="Comercial" section="Pedidos" action="visualizar">
      <div className="w-full h-full flex flex-col gap-2 min-h-0">
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              Central de Vendas 360
            </h2>
            <p className="text-xs text-slate-500">
              Atender, montar orçamento, fechar a venda e acompanhar pagamento, produção e entrega na mesma área.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setAba('negociacoes')}
                className={`rounded-md px-3 py-1 text-xs font-medium ${aba === 'negociacoes' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Negociações
              </button>
              <button
                type="button"
                onClick={() => setAba('pedidos')}
                className={`rounded-md px-3 py-1 text-xs font-medium ${aba === 'pedidos' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Lista de pedidos
              </button>
            </div>
            <ProtectedSection module="Comercial" section="Pedidos" action="criar">
              <Button onClick={onCreatePedido} className="bg-indigo-600 hover:bg-indigo-700" size="sm">
                <Plus className="w-4 h-4 mr-1" /> Novo pedido
              </Button>
            </ProtectedSection>
          </div>
        </div>

        {aba === 'pedidos' ? (
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
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-2">
            <ListaNegociacoes
              negociacoes={filtradas}
              selecionada={selecionada}
              onSelect={setSelecionada}
              busca={busca}
              setBusca={setBusca}
              grupo={grupo}
              setGrupo={setGrupo}
              carregando={isLoading}
            />

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
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center p-8">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Selecione uma negociação para abrir a mesa de trabalho</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  O orçamento fica no centro; os atalhos laterais abrem atendimento, cliente, histórico, financeiro,
                  estoque, produção, entregas, fiscal e pagamento sem sair da negociação.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedSection>
  );
}