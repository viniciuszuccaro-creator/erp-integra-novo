// Rodapé fixo — totais, condição e ações da etapa
import React from 'react';
import { Copy, Import, MoreHorizontal, Printer, Send, Split } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { brl } from './negociacaoUtils';

export default function RodapeNegociacao({
  totais, condicaoPagamento, prazo,
  editavel, sujo, salvando,
  acaoLabel, acaoDescricao, acaoDesabilitada,
  onSalvar, onVoltar, onAvancar,
  onEnviar, enviando, enviarDesabilitado,
  onDuplicar, onDesmembrar, onImportar, onImprimir,
}) {
  const temMaisAcoes = Boolean(onDuplicar || onDesmembrar || onImportar);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
        <span>Produtos: <span className="font-semibold text-slate-800">{brl(totais.produtos)}</span></span>
        <span>Desconto: <span className="font-semibold text-slate-800">{brl(totais.desconto)}</span></span>
        <span>Frete: <span className="font-semibold text-slate-800">{brl(totais.frete)}</span></span>
        <span>Condição: <span className="font-semibold text-slate-800">{condicaoPagamento}</span></span>
        <span>Prazo: <span className="font-semibold text-slate-800">{prazo}</span></span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Total da negociação</p>
          <p className="text-lg font-bold text-indigo-700 leading-none">{brl(totais.total)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onVoltar}>Voltar</Button>
          {onImprimir && (
            <Button type="button" variant="outline" size="sm" onClick={onImprimir} title="Imprimir documento">
              <Printer className="w-3.5 h-3.5 mr-1" /> Imprimir
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={onEnviar}
            disabled={enviando || enviarDesabilitado || salvando}
            title={enviarDesabilitado ? 'Salve as alterações antes de enviar a proposta' : 'Enviar a proposta ao cliente'}
          >
            <Send className="w-3.5 h-3.5 mr-1" /> {enviando ? 'Enviando…' : 'Enviar proposta'}
          </Button>
          {temMaisAcoes && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={salvando} title="Duplicar, desmembrar e importar itens">
                  <MoreHorizontal className="w-3.5 h-3.5 mr-1" /> Mais ações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {onDuplicar && (
                  <DropdownMenuItem onClick={onDuplicar}>
                    <Copy className="w-3.5 h-3.5 mr-2" /> Duplicar orçamento
                  </DropdownMenuItem>
                )}
                {onDesmembrar && (
                  <DropdownMenuItem onClick={onDesmembrar}>
                    <Split className="w-3.5 h-3.5 mr-2" /> Desmembrar itens
                  </DropdownMenuItem>
                )}
                {onImportar && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onImportar}>
                      <Import className="w-3.5 h-3.5 mr-2" /> Importar itens de pedido anterior
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {editavel && (
            <Button type="button" variant="secondary" size="sm" onClick={onSalvar} disabled={!sujo || salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={onAvancar}
            disabled={acaoDesabilitada || salvando}
            title={acaoDescricao}
          >
            {acaoLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}