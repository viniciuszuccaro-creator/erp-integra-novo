// Diálogo de abertura de negociação da Central 360° — cliente, tipo de negociação e condições
import React, { useMemo, useState } from 'react';
import { Loader2, Search, ShoppingCart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

const CONDICOES = ['À Vista', '30 dias', '30/60 dias', '30/60/90 dias', 'Cartão de Crédito', 'Boleto', 'Entrada + Saldo na Entrega'];

const rotuloCliente = (cliente) =>
  cliente?.nome_fantasia || cliente?.razao_social || cliente?.nome || cliente?.nome_completo || 'Cliente sem nome';

const documentoCliente = (cliente) =>
  cliente?.cpf_cnpj || cliente?.cnpj || cliente?.cpf || '';

export default function NovaNegociacaoDialog({
  aberto, onOpenChange, clientes = [], onConfirmar, salvando = false, validadePadrao = '',
}) {
  const [tipo, setTipo] = useState('orcamento');
  const [busca, setBusca] = useState('');
  const [cliente, setCliente] = useState(null);
  const [validade, setValidade] = useState(validadePadrao);
  const [condicao, setCondicao] = useState('À Vista');
  const [prazo, setPrazo] = useState('7 dias úteis');
  const [observacoes, setObservacoes] = useState('');

  const encontrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = (clientes || []).filter((item) => item.ativo !== false);
    const filtrados = termo
      ? lista.filter((item) => [rotuloCliente(item), documentoCliente(item), item.cidade, item.telefone, item.celular]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termo)))
      : lista;
    return filtrados.slice(0, 8);
  }, [clientes, busca]);

  const limpar = () => {
    setTipo('orcamento');
    setBusca('');
    setCliente(null);
    setValidade(validadePadrao);
    setCondicao('À Vista');
    setPrazo('7 dias úteis');
    setObservacoes('');
  };

  const fechar = (valor) => {
    onOpenChange?.(valor);
    if (!valor) limpar();
  };

  const confirmar = () => {
    if (!cliente) return;
    onConfirmar?.({
      tipo,
      cliente,
      validade,
      condicaoPagamento: condicao,
      prazo,
      observacoes: observacoes.trim() || null,
    });
  };

  return (
    <Dialog open={aberto} onOpenChange={fechar}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova negociação</DialogTitle>
          <DialogDescription>
            Comece pelo cliente e escolha se a negociação nasce como proposta (orçamento) ou como pedido direto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTipo('orcamento')}
            className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-colors ${
              tipo === 'orcamento' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">Orçamento (proposta)</span>
              <span className="block text-[11px] text-slate-500">Abre na mesa da Central para montar itens e enviar ao cliente.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTipo('pedido')}
            className={`flex items-start gap-2 rounded-lg border p-2.5 text-left transition-colors ${
              tipo === 'pedido' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">Pedido direto</span>
              <span className="block text-[11px] text-slate-500">Abre o formulário completo de pedido com o cliente preenchido.</span>
            </span>
          </button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Cliente *</Label>
          {cliente ? (
            <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800 truncate">{rotuloCliente(cliente)}</span>
                {documentoCliente(cliente) && (
                  <span className="block text-[11px] text-slate-500">{documentoCliente(cliente)}</span>
                )}
              </span>
              <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setCliente(null)}>
                Trocar
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome, razão social, CPF/CNPJ, telefone ou cidade"
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <div className="max-h-44 overflow-auto rounded-md border border-slate-200 divide-y divide-slate-100">
                {encontrados.length === 0 && (
                  <p className="px-2.5 py-3 text-xs text-slate-500">Nenhum cliente encontrado no contexto atual.</p>
                )}
                {encontrados.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCliente(item)}
                    className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50"
                  >
                    <span className="block text-xs font-medium text-slate-800 truncate">{rotuloCliente(item)}</span>
                    <span className="block text-[11px] text-slate-500">
                      {[documentoCliente(item), item.cidade].filter(Boolean).join(' • ') || 'Sem documento informado'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {tipo === 'orcamento' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Validade</Label>
                <Input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Condição de pagamento</Label>
                <select
                  value={condicao}
                  onChange={(e) => setCondicao(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CONDICOES.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prazo de entrega</Label>
                <Input value={prazo} onChange={(e) => setPrazo(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Observações da negociação</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Condições combinadas, obra de destino, referências do cliente"
                className="text-sm"
              />
            </div>
          </>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => fechar(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="button" onClick={confirmar} disabled={!cliente || salvando} className="bg-blue-600 hover:bg-blue-700">
            {salvando && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            {tipo === 'orcamento' ? 'Abrir orçamento' : 'Abrir pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}