import React from 'react';

export default function SaldoItemNegociacao({ saldo, permissoes = { separacao: false, producao: false, entregas: false, fiscal: false }, fabricacao }) {
  if (!saldo) return <p className="px-3 py-1 text-[11px] text-muted-foreground">Saldo do item indisponível.</p>;
  const numero = (valor) => valor == null ? 'Sem vínculo verificável' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 6 })} ${saldo.unidade}`;
  const campos = [
    ...(permissoes.separacao ? [['Separada', saldo.separada], ['Conferida', saldo.conferida]] : []),
    ...(permissoes.producao && fabricacao ? [['Produzida', saldo.produzida]] : []),
    ...(permissoes.entregas ? [['Entregue', saldo.entregue], ['Retirada', saldo.retirada], ['Saldo a atender', saldo.saldo_atender]] : []),
    ...(permissoes.fiscal ? [['Faturada', saldo.faturada], ['Saldo a faturar', saldo.saldo_faturar]] : []),
  ];
  return (
    <div className="w-full h-full border-b border-border bg-muted/40 px-3 py-2 text-[11px]">
      <dl className="flex flex-wrap gap-x-5 gap-y-1">{campos.map(([label, valor]) => <div key={label}><dt className="inline text-muted-foreground">{label}: </dt><dd className="inline font-medium text-foreground">{numero(valor)}</dd></div>)}</dl>
      {!campos.length && <p className="text-muted-foreground">Sem permissão para consultar saldos dos módulos proprietários.</p>}
      {saldo.divergencia && <p role="alert" className="mt-1 font-medium text-destructive">Divergência nas quantidades oficiais. Revise os vínculos no módulo responsável.</p>}
    </div>
  );
}