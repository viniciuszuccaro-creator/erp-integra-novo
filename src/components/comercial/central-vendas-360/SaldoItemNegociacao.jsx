import React from 'react';
import { brl } from './negociacaoUtils';

// Linha de saldos oficiais do item — somente leitura, cada domínio sujeito à sua permissão.
export default function SaldoItemNegociacao({ saldo, permissoes = { separacao: false, producao: false, entregas: false, fiscal: false, financeiro: false }, fabricacao }) {
  if (!saldo) return <p className="px-3 py-1 text-[11px] text-muted-foreground">Saldo do item indisponível.</p>;
  const numero = (valor) => valor == null ? 'Sem vínculo verificável' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 6 })} ${saldo.unidade}`;
  const moeda = (valor) => valor == null ? 'Sem vínculo verificável' : brl(valor);
  const campos = [
    ...(permissoes.separacao ? [['Separada', numero(saldo.separada)], ['Conferida', numero(saldo.conferida)]] : []),
    ...(permissoes.producao && fabricacao ? [['Produzida', numero(saldo.produzida)]] : []),
    ...(permissoes.entregas ? [['Entregue', numero(saldo.entregue)], ['Retirada', numero(saldo.retirada)], ['Saldo a atender', numero(saldo.saldo_atender)]] : []),
    ...(permissoes.fiscal ? [['Faturada', numero(saldo.faturada)], ['Saldo a faturar', numero(saldo.saldo_faturar)]] : []),
    ...(permissoes.financeiro ? [['Valor faturado', moeda(saldo.valor_faturado)], ['Cobrado', moeda(saldo.cobrado)], ['Saldo a cobrar', moeda(saldo.saldo_cobrar)]] : []),
  ];
  return (
    <div className="w-full h-full border-b border-border bg-muted/40 px-3 py-2 text-[11px]">
      <dl className="flex flex-wrap gap-x-5 gap-y-1">{campos.map(([label, valor]) => <div key={label}><dt className="inline text-muted-foreground">{label}: </dt><dd className="inline font-medium text-foreground">{valor}</dd></div>)}</dl>
      {!campos.length && <p className="text-muted-foreground">Sem permissão para consultar saldos dos módulos proprietários.</p>}
      {permissoes.financeiro && saldo.cobrado != null && <p className="mt-1 text-muted-foreground">Cobrança rateada pelos títulos do pedido, na proporção da quantidade faturada de cada item.</p>}
      {saldo.divergencia && <p role="alert" className="mt-1 font-medium text-destructive">Divergência nas quantidades oficiais. Revise os vínculos no módulo responsável.</p>}
    </div>
  );
}