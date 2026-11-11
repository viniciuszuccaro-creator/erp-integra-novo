import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import AssinaturaCanvas from '@/components/comercial/assinatura-eletronica/AssinaturaCanvas';
import useAssinaturaCanvas from '@/components/comercial/assinatura-eletronica/useAssinaturaCanvas';
import useComprovanteDigital from '@/components/expedicao/useComprovanteDigital';
import { ARQUIVOS_COMPROVANTE } from '@/components/expedicao/comprovanteDigitalStorage';

// Formulário e leitura únicos, reutilizados no motorista, na Expedição e na Central 360°.
export default function ComprovanteDigital({ entrega, isOpen, onClose, onSuccess, onOffline, windowMode = false, readOnly = false }) {
  const [dados, setDados] = useState({ nome_recebedor: '', documento_recebedor: '', cargo_recebedor: '', observacoes_recebimento: '' });
  const [arquivos, setArquivos] = useState({}); const [previews, setPreviews] = useState({});
  const [revisado, setRevisado] = useState(false); const [erroArquivo, setErroArquivo] = useState('');
  const [itensPendentes, setItensPendentes] = useState([]); const [quantidades, setQuantidades] = useState({});
  const assinatura = useAssinaturaCanvas();
  const hook = useComprovanteDigital({ entrega, readOnly, onOffline, onSuccess: onSuccess || onClose });
  // §23 — itens com saldo a atender nesta entrega, sempre apurados no servidor.
  useEffect(() => {
    if (readOnly || !hook.permitido || !entrega?.id) return;
    let ativo = true;
    base44.functions.invoke('onEntregaUpdated', { acao: 'consultar_itens_entrega', entrega_id: entrega.id, group_id: entrega.group_id, empresa_id: entrega.empresa_id })
      .then(({ data }) => {
        if (!ativo) return;
        const lista = (data?.itens || []).filter((i) => i.saldo_atender === null || i.saldo_atender > 0);
        setItensPendentes(lista);
        setQuantidades(Object.fromEntries(lista.map((i) => [i.chave, i.saldo_atender === null ? '' : String(i.saldo_atender)])));
      })
      .catch(() => { if (ativo) setErroArquivo('Não foi possível consultar o saldo por item desta entrega.'); });
    return () => { ativo = false; };
  }, [readOnly, hook.permitido, entrega?.id]);
  const itensSelecionados = () => itensPendentes
    .map((i) => ({ chave: i.chave, quantidade: Number(String(quantidades[i.chave] ?? '').replace(',', '.')) }))
    .filter((i) => Number.isFinite(i.quantidade) && i.quantidade > 0);
  useEffect(() => {
    if (!readOnly) assinatura.inicializarCanvas();
  }, [readOnly, hook.permitido]);
  useEffect(() => {
    const urls = Object.fromEntries(Object.entries(arquivos).map(([k, file]) => [k, URL.createObjectURL(file)]));
    setPreviews(urls); return () => Object.values(urls).forEach(URL.revokeObjectURL);
  }, [arquivos]);
  const alterar = (campo, valor) => { setRevisado(false); setDados((anterior) => ({ ...anterior, [campo]: valor })); };
  const escolherArquivo = (campo, file) => {
    setErroArquivo(''); if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setErroArquivo('Use fotos JPG, PNG ou WebP de até 5 MB.'); return; }
    setRevisado(false); setArquivos((anterior) => ({ ...anterior, [campo]: file }));
  };
  const enviar = async (e) => {
    e.preventDefault();
    if (assinatura.assinaturaVazia || !revisado || ARQUIVOS_COMPROVANTE.some(({ campo }) => !arquivos[campo])) { setErroArquivo('Inclua as três fotos, uma assinatura legível e confirme a conferência.'); return; }
    const itens = itensSelecionados();
    if (itensPendentes.length && !itens.length) { setErroArquivo('Informe a quantidade entregue de ao menos um item.'); return; }
    await hook.salvar({ dados, arquivos, assinatura: assinatura.canvasRef.current, revisado, itens });
  };
  const comprovante = hook.consulta.data?.comprovante || {};
  const conteudo = (
    <div className="w-full h-full min-h-0 overflow-auto space-y-4 p-4 bg-background text-foreground">
      <div><h2 className="text-lg font-semibold">Comprovante de entrega</h2><p className="text-sm text-muted-foreground">Pedido {entrega?.numero_pedido || 'sem número'} · {entrega?.cliente_nome}</p><p className="text-xs text-muted-foreground">{entrega?.endereco_entrega_completo?.logradouro}, {entrega?.endereco_entrega_completo?.numero}</p></div>
      {!hook.permitido ? <p role="alert">Sem permissão ou contexto de grupo/empresa inválido.</p> : readOnly ? (
        hook.consulta.isLoading ? <p className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Carregando comprovante…</p> : hook.consulta.isError ? <Alert variant="destructive"><AlertDescription>{hook.consulta.error?.response?.data?.error || hook.consulta.error?.message || 'Falha ao carregar comprovante.'}</AlertDescription></Alert> : !Object.keys(comprovante).length ? <p className="text-muted-foreground">Nenhum comprovante registrado para esta entrega.</p> : (
          <div className="space-y-3">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[['Recebedor', comprovante.nome_recebedor], ['Documento', comprovante.documento_recebedor], ['Cargo', comprovante.cargo_recebedor], ['Recebimento', comprovante.data_hora_recebimento ? new Date(comprovante.data_hora_recebimento).toLocaleString('pt-BR') : null], ['GPS', comprovante.latitude_entrega != null ? `${comprovante.latitude_entrega}, ${comprovante.longitude_entrega}` : 'Não disponível']].map(([label, valor]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{valor || 'Não informado'}</dd></div>)}
            </dl>
            {comprovante.observacoes_recebimento && <p className="text-sm whitespace-pre-wrap">{comprovante.observacoes_recebimento}</p>}
            {[...ARQUIVOS_COMPROVANTE, { campo: 'assinatura_digital', label: 'Assinatura digital' }].map(({ campo, label }) => <div key={campo} className="space-y-1"><p className="text-sm font-medium">{label}</p>{comprovante[campo] ? <a href={comprovante[campo]} target="_blank" rel="noopener noreferrer"><img src={comprovante[campo]} alt={label} className="w-full max-h-72 object-contain rounded border bg-card" /></a> : <p className="text-xs text-muted-foreground">Não registrado no comprovante legado.</p>}</div>)}
          </div>
        )
      ) : (
        <form onSubmit={enviar} className="w-full h-full space-y-4">
          <fieldset disabled={hook.enviando} className="space-y-4">
            {ARQUIVOS_COMPROVANTE.map(({ campo, label }) => <div key={campo} className="space-y-2"><Label>{label} *<Input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" required={!arquivos[campo]} onChange={(e) => escolherArquivo(campo, e.target.files?.[0])} className="mt-1" /></Label>{previews[campo] && <img src={previews[campo]} alt={label} className="w-full max-h-48 object-contain rounded border" />}</div>)}
            <p className="text-xs text-muted-foreground">Fotos e assinatura são guardadas em armazenamento privado. JPG, PNG ou WebP, até 5 MB por foto.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Label>Nome completo de quem recebeu *<Input required minLength={3} maxLength={160} value={dados.nome_recebedor} onChange={(e) => alterar('nome_recebedor', e.target.value)} /></Label><Label>CPF/RG do recebedor *<Input required minLength={5} maxLength={40} value={dados.documento_recebedor} onChange={(e) => alterar('documento_recebedor', e.target.value)} /></Label></div>
            <Label className="block">Cargo/função<Input maxLength={100} value={dados.cargo_recebedor} onChange={(e) => alterar('cargo_recebedor', e.target.value)} /></Label>
            <Label className="block">Observações do recebimento<Textarea maxLength={2000} value={dados.observacoes_recebimento} onChange={(e) => alterar('observacoes_recebimento', e.target.value)} /></Label>
            {itensPendentes.length > 0 && (
              <div className="space-y-2 rounded border p-3">
                <p className="text-sm font-medium">Itens entregues</p>
                <p className="text-xs text-muted-foreground">Quantidade limitada ao saldo oficial a atender de cada item.</p>
                <div className="space-y-2">
                  {itensPendentes.map((item) => (
                    <div key={item.chave} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{item.descricao || item.chave}</p>
                        <p className="text-xs text-muted-foreground">Pedido: {item.pedida ?? '—'} {item.unidade} · A atender: {item.saldo_atender === null ? 'sem vínculo verificável' : `${item.saldo_atender} ${item.unidade}`}{item.ja_registrado != null ? ` · Já registrado: ${item.ja_registrado}` : ''}</p>
                      </div>
                      <Input className="w-28" inputMode="decimal" aria-label={`Quantidade entregue de ${item.descricao || item.chave}`} value={quantidades[item.chave] ?? ''} onChange={(e) => { setRevisado(false); setQuantidades((anterior) => ({ ...anterior, [item.chave]: e.target.value })); }} disabled={item.saldo_atender === null} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <AssinaturaCanvas canvasRef={assinatura.canvasRef} assinaturaVazia={assinatura.assinaturaVazia} onIniciarDesenho={(e) => { setRevisado(false); assinatura.iniciarDesenho(e); }} onDesenhar={assinatura.desenhar} onPararDesenho={assinatura.pararDesenho} onLimpar={() => { setRevisado(false); assinatura.limparAssinatura(); }} />
            <label className="flex items-start gap-2 text-sm"><Checkbox checked={revisado} onCheckedChange={(v) => setRevisado(v === true)} /><span>Conferi mercadoria, local, canhoto, documento e legibilidade da assinatura.</span></label>
          </fieldset>
          {(hook.erro || erroArquivo) && <Alert variant="destructive"><AlertDescription>{hook.erro || erroArquivo}</AlertDescription></Alert>}
          <div className="flex flex-wrap justify-end gap-2">{onClose && <Button type="button" variant="outline" onClick={onClose} disabled={hook.enviando}>Cancelar</Button>}<Button type="submit" disabled={hook.enviando || !revisado || assinatura.assinaturaVazia}>{hook.enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{hook.enviando ? 'Registrando…' : 'Confirmar entrega'}</Button></div>
        </form>
      )}
    </div>
  );
  if (windowMode) return conteudo;
  return <Dialog open={isOpen} onOpenChange={(aberto) => { if (!aberto && !hook.enviando) onClose?.(); }}><DialogContent className="w-full h-full max-w-2xl max-h-[90dvh] overflow-auto"><DialogHeader><DialogTitle>{readOnly ? 'Consultar comprovante' : 'Confirmar entrega'}</DialogTitle></DialogHeader>{conteudo}</DialogContent></Dialog>;
}