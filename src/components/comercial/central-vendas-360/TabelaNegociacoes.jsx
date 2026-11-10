// Grade 1 da Central 360° — tabela de 12 colunas, cabeçalho fixo e colunas Nº/Cliente fixas
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { SITUACAO_ESTILO, brl, dataCurta } from './negociacaoUtils';

const COLUNAS = [
  { id: 'numero', label: 'Nº', largura: 'w-[112px]', fixa: 0 },
  { id: 'cliente', label: 'Cliente', largura: 'w-[200px]', fixa: 112 },
  { id: 'data', label: 'Data', largura: 'w-[88px]' },
  { id: 'prazo', label: 'Prazo', largura: 'w-[96px]' },
  { id: 'vendedor', label: 'Vendedor', largura: 'w-[126px]' },
  { id: 'origem', label: 'Origem', largura: 'w-[100px]' },
  { id: 'cidade', label: 'Cidade', largura: 'w-[116px]' },
  { id: 'itens', label: 'Itens', largura: 'w-[62px]', alinhamento: 'text-center' },
  { id: 'peso', label: 'Peso (kg)', largura: 'w-[88px]', alinhamento: 'text-right' },
  { id: 'valor', label: 'Valor', largura: 'w-[112px]', alinhamento: 'text-right' },
  { id: 'condicao', label: 'Condição', largura: 'w-[112px]' },
  { id: 'situacao', label: 'Situação', largura: 'w-[118px]' },
];

const valorOrdenacao = (negociacao, campo, clientesPorId) => {
  const cliente = clientesPorId[negociacao.cliente_id] || {};
  switch (campo) {
    case 'numero': return negociacao.numero;
    case 'cliente': return negociacao.cliente_nome;
    case 'data': return new Date(negociacao.data || 0).getTime() || 0;
    case 'prazo': return negociacao.prazo || '';
    case 'vendedor': return negociacao.vendedor || '';
    case 'origem': return negociacao.canal || '';
    case 'cidade': return cliente.cidade || cliente.endereco_cidade || '';
    case 'itens': return negociacao.itens?.length || 0;
    case 'peso': return Number(negociacao.registro?.peso_total || negociacao.registro?.peso_total_kg || 0);
    case 'valor': return Number(negociacao.totais?.total || 0);
    case 'condicao': return negociacao.condicao_pagamento || '';
    case 'situacao': return negociacao.situacao || '';
    default: return '';
  }
};

export default function TabelaNegociacoes({
  negociacoes = [], clientes = [], selecionada, onSelect, onAbrir, carregando,
}) {
  const [ordenacao, setOrdenacao] = useState({ campo: 'data', direcao: 'desc' });

  const clientesPorId = useMemo(
    () => (clientes || []).reduce((acc, cliente) => { acc[cliente.id] = cliente; return acc; }, {}),
    [clientes]
  );

  const ordenadas = useMemo(() => {
    const lista = [...negociacoes];
    lista.sort((a, b) => {
      const va = valorOrdenacao(a, ordenacao.campo, clientesPorId);
      const vb = valorOrdenacao(b, ordenacao.campo, clientesPorId);
      const comparacao = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'pt-BR');
      return ordenacao.direcao === 'asc' ? comparacao : -comparacao;
    });
    return lista;
  }, [negociacoes, ordenacao, clientesPorId]);

  const ordenar = (campo) => {
    setOrdenacao((atual) => (
      atual.campo === campo
        ? { campo, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' }
        : { campo, direcao: 'asc' }
    ));
  };

  const Icone = ({ campo }) => {
    if (ordenacao.campo !== campo) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return ordenacao.direcao === 'asc'
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  return (
    <div className="flex-1 w-full rounded-lg border border-slate-200 bg-white flex flex-col min-h-0 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 border-b border-slate-100 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-800">
          Orçamentos e pedidos
          <span className="ml-1.5 text-xs font-normal text-slate-500">({negociacoes.length})</span>
        </h3>
        <span className="ml-auto text-[11px] text-slate-500">
          Clique para abrir na grade de itens · duplo clique abre o registro
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1360px] border-collapse text-xs">
          <thead className="sticky top-0 z-20 bg-slate-100">
            <tr>
              {COLUNAS.map((coluna) => {
                const fixa = coluna.fixa !== undefined;
                return (
                  <th
                    key={coluna.id}
                    scope="col"
                    style={fixa ? { left: coluna.fixa } : undefined}
                    className={`${coluna.largura} ${coluna.alinhamento || 'text-left'} px-2 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-100 whitespace-nowrap ${
                      fixa ? 'sticky z-30' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => ordenar(coluna.id)}
                      className={`inline-flex items-center gap-1 hover:text-blue-700 ${coluna.alinhamento === 'text-right' ? 'justify-end w-full' : ''}`}
                    >
                      {coluna.label}
                      <Icone campo={coluna.id} />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td colSpan={COLUNAS.length} className="px-3 py-6 text-center text-xs text-slate-500">
                  Carregando negociações…
                </td>
              </tr>
            )}

            {!carregando && ordenadas.length === 0 && (
              <tr>
                <td colSpan={COLUNAS.length} className="px-3 py-8 text-center text-xs text-slate-500">
                  Nenhum orçamento ou pedido encontrado com esses filtros.
                </td>
              </tr>
            )}

            {ordenadas.map((negociacao) => {
              const cliente = clientesPorId[negociacao.cliente_id] || {};
              const ativa = selecionada?.chave === negociacao.chave;
              const peso = Number(negociacao.registro?.peso_total || negociacao.registro?.peso_total_kg || 0);
              const fundo = ativa ? 'bg-blue-50' : 'bg-white group-hover:bg-slate-50';
              return (
                <tr
                  key={negociacao.chave}
                  onClick={() => onSelect(negociacao)}
                  onDoubleClick={() => onAbrir?.(negociacao)}
                  className={`group cursor-pointer border-b border-slate-100 ${ativa ? 'bg-blue-50' : ''}`}
                >
                  <td
                    className={`sticky left-0 z-10 w-[112px] px-2 py-1.5 font-semibold text-blue-700 whitespace-nowrap ${fundo} ${ativa ? 'border-l-2 border-l-blue-600' : 'border-l-2 border-l-transparent'}`}
                  >
                    {negociacao.numero}
                  </td>
                  <td
                    className={`sticky left-[112px] z-10 w-[200px] px-2 py-1.5 ${fundo}`}
                    title={negociacao.cliente_nome}
                  >
                    <span className="block truncate text-slate-800">{negociacao.cliente_nome}</span>
                  </td>
                  <td className="w-[88px] px-2 py-1.5 whitespace-nowrap text-slate-600">{dataCurta(negociacao.data)}</td>
                  <td className="w-[96px] px-2 py-1.5 whitespace-nowrap text-slate-600" title={`Validade: ${dataCurta(negociacao.validade)}`}>
                    {negociacao.prazo || '—'}
                  </td>
                  <td className="w-[126px] px-2 py-1.5 truncate text-slate-600" title={negociacao.vendedor}>{negociacao.vendedor || '—'}</td>
                  <td className="w-[100px] px-2 py-1.5 truncate text-slate-600">{negociacao.canal || '—'}</td>
                  <td className="w-[116px] px-2 py-1.5 truncate text-slate-600" title={cliente.cidade || cliente.endereco_cidade || ''}>
                    {cliente.cidade || cliente.endereco_cidade || '—'}
                  </td>
                  <td className="w-[62px] px-2 py-1.5 text-center text-slate-600">{negociacao.itens?.length || 0}</td>
                  <td className="w-[88px] px-2 py-1.5 text-right text-slate-600">
                    {peso > 0 ? peso.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'}
                  </td>
                  <td className="w-[112px] px-2 py-1.5 text-right font-semibold text-slate-800">{brl(negociacao.totais?.total || 0)}</td>
                  <td className="w-[112px] px-2 py-1.5 truncate text-slate-600" title={negociacao.condicao_pagamento}>{negociacao.condicao_pagamento || '—'}</td>
                  <td className="w-[118px] px-2 py-1.5">
                    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold ${SITUACAO_ESTILO[negociacao.grupo]}`}>
                      {negociacao.situacao}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}