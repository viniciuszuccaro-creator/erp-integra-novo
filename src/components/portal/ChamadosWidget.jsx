import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import ChatbotPortal from './ChatbotPortal';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ChamadosWidget({ cliente }) {
  const qc = useQueryClient();
  const [mensagem, setMensagem] = useState('');
  const { filterInContext, createInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: chamados = [], isLoading } = useQuery({
    queryKey: ['portal-chamados', cliente?.id, contextoKey],
    enabled: !!cliente?.id,
    queryFn: async () => {
      return filterInContext('Chamado', { cliente_id: cliente.id }, '-created_date', 50);
    }
  });

  const novaMut = useMutation({
    mutationFn: async () => {
      const titulo = mensagem.trim().slice(0, 80) || 'Chamado via Portal';
      return createInContext('Chamado', {
        titulo,
        descricao: mensagem,
        cliente_id: cliente.id,
        cliente_nome: cliente.nome || cliente.nome_fantasia,
        origem: 'Portal',
        status: 'Aberto'
      });
    },
    onSuccess: () => {
      setMensagem('');
      qc.invalidateQueries({ queryKey: ['portal-chamados', cliente?.id, contextoKey] });
    }
  });

  return (
    <div className="space-y-3">
      <ChatbotPortal cliente={cliente} />
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            Converse conosco: abra chamados ou pergunte sobre seus pedidos.
          </div>
          <div className="flex gap-2">
            <Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder="Descreva seu problema ou dúvida..." className="min-h-[80px]" />
          </div>
          <div className="flex justify-end">
            <Button data-permission="Portal.ChamadosWidget.enviar" onClick={() => novaMut.mutate()} disabled={!mensagem.trim() || novaMut.isPending} className="gap-2">
              {novaMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}<Send className="w-4 h-4" /> Enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {isLoading && <div className="text-sm text-muted-foreground">Carregando chamados...</div>}
        {chamados.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{c.titulo}</div>
                <div className="text-xs text-muted-foreground">{c.status}</div>
              </div>
              {c.descricao && <div className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{c.descricao}</div>}
            </CardContent>
          </Card>
        ))}
        {(!isLoading && chamados.length === 0) && (
          <div className="text-sm text-muted-foreground">Nenhum chamado encontrado.</div>
        )}
      </div>
    </div>
  );
}