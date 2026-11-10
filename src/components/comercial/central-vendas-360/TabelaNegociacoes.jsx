// Grade 1 da Central 360° — 12 colunas, cabeçalho fixo, colunas redimensionáveis e Nº/Cliente fixos
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { SITUACAO_ESTILO, brl, dataCurta } from './negociacaoUtils';

const COLUNAS = [
  { id: 'numero', label: 'Nº', largura: 112, min: 88, fixa: true },
  { id: 'cliente', label: 'Cliente', largura: 200, min: 140, fixa: true },
  { id: 'data', label: 'Data', largura: 88, min: 72 },
  { id: 'prazo', label: 'Prazo', largura: 108, min: 86, titulo: 'Prazo de entrega e validade do orçamento' },
  { id: 'vendedor', label: 'Vendedor', largura: 126, min: 90 },
  { id: 'origem', label: 'Origem', largura: 100, min: 76 },
  { id: 'cidade', label: 'Cidade', largura: 116, min: 84 },
  { id: 'itens', label: 'Itens', largura: 62, min: 54, alinhamento: 'text-center' },
  { id: 'peso', label: 'Peso (kg)', largura: 88, min: 70, alinhamento: 'text-right' },
  { id: 'valor', label: 'Valor', largura: 112, min: 88, alinhamento: 'text-right' },
  { id: 'condicao', label: 'Condição', largura: 112, min: 84 },
  { id: 'situacao', label: 'Situação', largura: 118, min: 96 },
];

const LARGURAS_PADRAO = COLUNAS.reduce((acc, coluna) => { acc[coluna.id] = coluna.largura; return acc; }, {});

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
  larguras = {}, onLargura, ordenacao, onOrdenacao,
}) {
  const [rascunho, setRascunho] = useState(null);
  const [ordenacaoLocal, setOrdenacaoLocal] = useState({ campo: 'data', direcao: 'desc' });

  const largurasEfetivas = { ...LARGURAS_PADRAO, ...larguras, ...(rascunho || {}) };
  const larguraDe = (id) => largurasEfetivas[id] || LARGURAS_PADRAO[id];
  const larguraTotal = COLUNAS.reduce((soma, coluna) => soma + larguraDe(coluna.id), 0);
  const deslocamentoCliente = larguraDe('numero');

  const ordenacaoAtual = ordenacao || ordenacaoLocal;

  const clientesPorId = useMemo(
    () => (clientes || []).reduce((acc, cliente) => { acc[cliente.id] = cliente; return acc; }, {}),
    [clientes]
  );

  const ordenadas = useMemo(() => {
    const lista = [...negociacoes];
    lista.sort((a, b) => {
      const va = valorOrdenacao(a, ordenacaoAtual.campo, clientesPorId);
      const vb = valorOrdenacao(b, ordenacaoAtual.campo, clientesPorId);
      const comparacao = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'pt-BR');
      return ordenacaoAtual.direcao === 'asc' ? comparacao : -comparacao;
    });
    return lista;
  }, [negociacoes, ordenacaoAtual, clientesPorId]);

  const ordenar = (campo) => {
    const proxima = ordenacaoAtual.campo === campo
      ? { campo, direcao: ordenacaoAtual.direcao === 'asc' ? 'desc' : 'asc' }
      : { campo, direcao: 'asc' };
    if (onOrdenacao) onOrdenacao(proxima);
    else setOrdenacaoLocal(proxima);
  };

  const redimensionar = (evento, coluna) => {
    evento.preventDefault();
    evento.stopPropagation();
    const inicioX = evento.clientX;
    const larguraInicial = larguraDe(coluna.id);
    let ultima = larguraInicial;

    const mover = (movimento) => {
      ultima = Math.round(Math.max(coluna.min || 64, larguraInicial + (movimento.clientX - inicioX)));
      setRascunho((atual) => ({ ...(atual || {}), [coluna.id]: ultima }));
    };
    const soltar = () => {
      document.removeEventListener('mousemove', mover);
      document.removeEventListener('mouseup', soltar);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setRascunho(null);
      if (ultima !== larguraInicial) onLargura?.(coluna.id, ultima);
    };

    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', soltar);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const Icone = ({ campo }) => {
    if (ordenacaoAtual.campo !== campo) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return ordenacaoAtual.direcao === 'asc'
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
          Clique abre a grade de itens · duplo clique abre o registro · arraste a borda do título para redimensionar
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="border-collapse text-xs" style={{ width: larguraTotal, minWidth: larguraTotal }}>
          <thead className="sticky top-0 z-20 bg-slate-100">
            <tr>
              {COLUNAS.map((coluna) => {
                const largura = larguraDe(coluna.id);
                return (
                  <th
                    key={coluna.id}
                    scope="col"
                    title={coluna.titulo || coluna.label}
                    style={{
                      width: largura,
                      minWidth: largura,
                      ...(coluna.id === 'numero' ? { left: 0 } : {}),
                      ...(coluna.id === 'cliente' ? { left: deslocamentoCliente } : {}),
                    }}
                    className={`relative ${coluna.alinhamento || 'text-left'} px-2 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200 bg-slate-100 whitespace-nowrap ${
                      coluna.fixa ? 'sticky z-30' : ''
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
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      onMouseDown={(evento) => redimensionar(evento, coluna)}
                      title="Arrastar para redimensionar"
                      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none hover:bg-blue-400/70"
                    />
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
              const larguraNumero = larguraDe('numero');
              const larguraCliente = larguraDe('cliente');
              return (
                <tr
                  key={negociacao.chave}
                  onClick={() => onSelect(negociacao)}
                  onDoubleClick={() => onAbrir?.(negociacao)}
                  className={`group cursor-pointer border-b border-slate-100 ${ativa ? 'bg-blue-50' : ''}`}
                >
                  <td
                    style={{ width: larguraNumero, minWidth: larguraNumero, left: 0 }}
                    className={`sticky z-10 px-2 py-1.5 font-semibold text-blue-700 whitespace-nowrap ${fundo} ${ativa ? 'border-l-2 border-l-blue-600' : 'border-l-2 border-l-transparent'}`}
                  >
                    {negociacao.numero}
                  </td>
                  <td
                    style={{ width: larguraCliente, minWidth: larguraCliente, left: deslocamentoCliente }}
                    className={`sticky z-10 px-2 py-1.5 ${fundo}`}
                    title={negociacao.cliente_nome}
                  >
                    <span className="block truncate text-slate-800">{negociacao.cliente_nome}</span>
                  </td>
                  <td style={{ width: larguraDe('data'), minWidth: larguraDe('data') }} className="px-2 py-1.5 whitespace-nowrap text-slate-600">
                    {dataCurta(negociacao.data)}
                  </td>
                  <td
                    style={{ width: larguraDe('prazo'), minWidth: larguraDe('prazo') }}
                    className="px-2 py-1.5 text-slate-600"
                    title={`Entrega: ${negociacao.prazo || '—'} · Validade do orçamento: ${dataCurta(negociacao.validade)}`}
                  >
                    <span className="block truncate text-slate-700">{negociacao.prazo || '—'}</span>
                    <span className="block truncate text-[10px] text-slate-400">val. {dataCurta(negociacao.validade)}</span>
                  </td>
                  <td style={{ width: larguraDe('vendedor'), minWidth: larguraDe('vendedor') }} className="px-2 py-1.5 truncate text-slate-600" title={negociacao.vendedor}>
                    {negociacao.vendedor || '—'}
                  </td>
                  <td style={{ width: larguraDe('origem'), minWidth: larguraDe('origem') }} className="px-2 py-1.5 truncate text-slate-600">
                    {negociacao.canal || '—'}
                  </td>
                  <td
                    style={{ width: larguraDe('cidade'), minWidth: larguraDe('cidade') }}
                    className="px-2 py-1.5 truncate text-slate-600"
                    title={cliente.cidade || cliente.endereco_cidade || ''}
                  >
                    {cliente.cidade || cliente.endereco_cidade || '—'}
                  </td>
                  <td style={{ width: larguraDe('itens'), minWidth: larguraDe('itens') }} className="px-2 py-1.5 text-center text-slate-600">
                    {negociacao.itens?.length || 0}
                  </td>
                  <td style={{ width: larguraDe('peso'), minWidth: larguraDe('peso') }} className="px-2 py-1.5 text-right text-slate-600">
                    {peso > 0 ? peso.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—'}
                  </td>
                  <td style={{ width: larguraDe('valor'), minWidth: larguraDe('valor') }} className="px-2 py-1.5 text-right font-semibold text-slate-800">
                    {brl(negociacao.totais?.total || 0)}
                  </td>
                  <td
                    style={{ width: larguraDe('condicao'), minWidth: larguraDe('condicao') }}
                    className="px-2 py-1.5 truncate text-slate-600"
                    title={negociacao.condicao_pagamento}
                  >
                    {negociacao.condicao_pagamento || '—'}
                  </td>
                  <td style={{ width: larguraDe('situacao'), minWidth: larguraDe('situacao') }} className="px-2 py-1.5">
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