// Envio da proposta ao cliente — WhatsApp ou e-mail, com follow-up agendado no CRM
import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Mail, MessageCircle, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  montarMensagemProposta, montarAssuntoProposta, whatsappDoCliente, emailDoCliente,
} from './useEnvioProposta';

export default function EnviarPropostaDialog({
  aberto, onOpenChange, negociacao, cliente, contexto = '', dataFollowUpPadrao = '',
  enviando = false, onEnviar,
}) {
  const [canal, setCanal] = useState('whatsapp');
  const [destinatario, setDestinatario] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [followUpAtivo, setFollowUpAtivo] = useState(true);
  const [followUpData, setFollowUpData] = useState(dataFollowUpPadrao);
  const [followUpAcao, setFollowUpAcao] = useState('');

  const mensagemPadrao = useMemo(
    () => (negociacao ? montarMensagemProposta(negociacao, contexto) : ''),
    [negociacao, contexto]
  );

  // Múltiplos contatos do cliente: o vendedor escolhe com quem falar (Regra: selecionar contato)
  const contatosDoCanal = useMemo(() => {
    const tipos = canal === 'whatsapp'
      ? /whatsapp|celular|telefone/i
      : /e-?mail/i;
    const lista = (Array.isArray(cliente?.contatos) ? cliente.contatos : [])
      .filter((contato) => contato?.valor && tipos.test(String(contato.tipo || '')));
    const padrao = canal === 'whatsapp'
      ? (cliente?.celular || cliente?.telefone || '')
      : (cliente?.email || negociacao?.registro?.cliente_email || '');
    if (padrao) lista.unshift({ nome: 'Contato principal', tipo: canal, valor: padrao });
    return lista.filter((contato, indice, array) =>
      array.findIndex((outro) => outro.valor === contato.valor) === indice);
  }, [cliente, canal, negociacao]);

  useEffect(() => {
    if (!aberto || !negociacao) return;
    const whats = whatsappDoCliente(cliente);
    const email = emailDoCliente(cliente) || negociacao.registro?.cliente_email || '';
    setCanal(whats || !email ? 'whatsapp' : 'email');
    setDestinatario(whats || email || '');
    setAssunto(montarAssuntoProposta(negociacao, contexto));
    setMensagem(mensagemPadrao);
    setFollowUpAtivo(true);
    setFollowUpData(dataFollowUpPadrao);
    setFollowUpAcao(`Cobrar retorno da proposta ${negociacao.numero}`);
  }, [aberto, negociacao?.chave]);

  useEffect(() => {
    if (canal === 'email') setDestinatario(emailDoCliente(cliente) || negociacao?.registro?.cliente_email || '');
    else setDestinatario(whatsappDoCliente(cliente));
  }, [canal]);

  const confirmar = async () => {
    const ok = await onEnviar?.({
      canal, destinatario, mensagem, assunto, followUpAtivo, followUpData, followUpAcao,
    });
    if (ok) onOpenChange?.(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar proposta {negociacao?.numero || ''}</DialogTitle>
          <DialogDescription>
            O cliente recebe a proposta com itens, totais, condição e validade. O follow-up entra na agenda comercial.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCanal('whatsapp')}
            className={`flex items-center gap-2 rounded-lg border p-2.5 text-left ${canal === 'whatsapp' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-800">WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setCanal('email')}
            className={`flex items-center gap-2 rounded-lg border p-2.5 text-left ${canal === 'email' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">E-mail</span>
          </button>
        </div>

        {contatosDoCanal.length > 1 && (
          <div className="space-y-1.5">
            <Label className="text-xs">Contato de envio</Label>
            <select
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {!contatosDoCanal.some((contato) => contato.valor === destinatario) && destinatario && (
                <option value={destinatario}>{destinatario}</option>
              )}
              {contatosDoCanal.map((contato, indice) => (
                <option key={`${contato.valor}-${indice}`} value={contato.valor}>
                  {contato.nome ? `${contato.nome} — ` : ''}{contato.valor}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">{canal === 'whatsapp' ? 'WhatsApp do cliente *' : 'E-mail do cliente *'}</Label>
            <Input
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              placeholder={canal === 'whatsapp' ? '(00) 00000-0000' : 'cliente@empresa.com.br'}
              className="h-9 text-sm"
            />
          </div>
          {canal === 'email' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Assunto</Label>
              <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} className="h-9 text-sm" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Mensagem</Label>
          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={10}
            className="text-xs font-mono leading-relaxed"
          />
        </div>

        <div className="rounded-lg border border-slate-200 p-2.5 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={followUpAtivo} onCheckedChange={(v) => setFollowUpAtivo(!!v)} />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <CalendarClock className="w-3.5 h-3.5 text-amber-500" /> Agendar follow-up no CRM
            </span>
          </label>
          {followUpAtivo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Data do retorno</Label>
                <Input type="date" value={followUpData} onChange={(e) => setFollowUpData(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Próxima ação</Label>
                <Input value={followUpAcao} onChange={(e) => setFollowUpAcao(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={confirmar}
            disabled={enviando || !destinatario.trim()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {enviando && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Enviar proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}