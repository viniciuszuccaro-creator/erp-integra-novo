import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function OrcamentosList({ cliente }) {
  const qc = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const [revisaoPedido, setRevisaoPedido] = useState(null);
  const [revisaoComentario, setRevisaoComentario] = useState('');
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const { data: orcamentos = [] } = useQuery({
    queryKey: ['portal-orcamentos', cliente?.id, contextoKey],
    enabled: !!cliente?.id,
    queryFn: async () => filterInContext('Pedido', { cliente_id: cliente.id, tipo: 'Orçamento' }, '-data_pedido', 50)
  });

  const aceitar = useMutation({
    mutationFn: async (p) => base44.functions.invoke('solicitacoesAprovacao', { action: 'acceptBudget', pedido_id: p.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-orcamentos', cliente?.id] });
      try { window.dispatchEvent(new CustomEvent('portal:setTab', { detail: 'pedidos' })); } catch (e) { console.error('[portal] catch:', e); }
    }
  });

  const solicitarRevisao = useMutation({
    mutationFn: async ({ p, comment }) => base44.functions.invoke('solicitacoesAprovacao', { action: 'requestRevision', pedido_id: p.id, comments: comment || 'Cliente solicitou revisão pelo Portal' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal-orcamentos', cliente?.id] })
  });

  return (
    <div className="space-y-3">
      {orcamentos.map((p) => (
        <Card key={p.id} className="w-full">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="font-medium">Orçamento #{p.numero_pedido || p.id}</div>
              <Badge variant="secondary">{p.status_aprovacao || 'pendente'}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">Valor: R$ {Number(p.valor_total || 0).toFixed(2)} • Validade: {p.data_validade || '—'}</div>
            <div className="flex gap-2">
              <Button onClick={() => aceitar.mutate(p)} disabled={!cliente?.pode_aprovar_orcamento_portal} className="gap-2">
                <CheckCircle2 className="w-4 h-4" /> Aceitar
              </Button>
              <Button variant="outline" onClick={() => { setRevisaoPedido(p); setRevisaoComentario(''); }} className="gap-2">
                <XCircle className="w-4 h-4" /> Solicitar Revisão
              </Button>
            </div>
            {revisaoPedido?.id === p.id && (
              <div className="space-y-2 rounded-md border p-3 bg-muted/30">
                <label className="text-xs font-medium text-muted-foreground">Descreva o que deseja revisar (opcional):</label>
                <Textarea value={revisaoComentario} onChange={(e) => setRevisaoComentario(e.target.value)} placeholder="Ex: Alterar quantidade do item 2..." className="text-sm" rows={2} />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setRevisaoPedido(null)}>Cancelar</Button>
                  <Button size="sm" onClick={() => { solicitarRevisao.mutate({ p, comment: revisaoComentario }); setRevisaoPedido(null); }} disabled={solicitarRevisao.isPending}>
                    {solicitarRevisao.isPending ? 'Enviando...' : 'Confirmar Revisão'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {orcamentos.length === 0 && (
        <div className="text-sm text-muted-foreground">Nenhum orçamento pendente.</div>
      )}
    </div>
  );
}