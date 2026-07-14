import React, { useState } from 'react';
import RBACButton from "@/components/lib/RBACButton";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { RotateCcw, AlertTriangle, Package } from 'lucide-react';
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Logística Reversa Automatizada
 * Processa devoluções e recusas com automação completa
 */
export default function LogisticaReversa({ entrega, onConcluido }) {
  const { user } = useUser();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [motivo, setMotivo] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [acao, setAcao] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processarDevolucaoMutation = useMutation({
    mutationFn: async () => {
      // 1. Atualizar status da entrega
      await base44.entities.Entrega.update(entrega.id, {
        status: 'Devolvido',
        entrega_frustrada: {
          motivo: motivo,
          detalhes: detalhes,
          tentativa_numero: 1,
          reagendamento: null
        }
      });

      // 2. Bloquear título financeiro (se existir)
      let ped = null;
      if (entrega.pedido_id) {
        const pedido = await base44.entities.Pedido.filter({ id: entrega.pedido_id });
        ped = pedido[0] || null;
        if (ped?.contas_receber_ids?.length > 0) {
          for (const contaId of ped.contas_receber_ids) {
            await base44.entities.ContaReceber.update(contaId, {
              status: 'Cancelado',
              observacoes: `Cancelado automaticamente - Devolução total. Motivo: ${motivo}`
            });
          }
        }
      }

      // 3. Criar entrada de devolução no estoque (se ação = devolver_estoque)
      if (acao === 'devolver_estoque' && entrega.pedido_id) {
        const pedido2 = ped ? [ped] : await base44.entities.Pedido.filter({ id: entrega.pedido_id });
        const pedidoRef = ped || pedido2[0];
        if (pedidoRef) {
          // Retornar itens de revenda ao estoque
          for (const item of (pedidoRef.itens_revenda || [])) {
            await base44.entities.MovimentacaoEstoque.create({
              empresa_id: entrega.empresa_id || empresaAtual?.id,
              group_id: grupoAtual?.id || empresaAtual?.group_id || entrega.group_id || null,
              origem_movimento: 'devolucao',
              origem_documento_id: entrega.id,
              tipo_movimento: 'entrada',
              produto_id: item.produto_id,
              produto_descricao: item.descricao,
              quantidade: item.quantidade,
              unidade_medida: item.unidade,
              data_movimentacao: new Date().toISOString(),
              documento: entrega.numero_pedido,
              motivo: `Devolução - ${motivo}`,
              responsavel: (user?.full_name || user?.email || 'Sistema Automático')
            });
          }
        }
      }

      // 4. Notificar vendedor via IA
      // Auditoria + Notificação
      const destinatario = ped?.vendedor_id || null;
      await base44.entities.Notificacao.create({
        destinatario_id: destinatario,
        tipo: 'urgente',
        categoria: 'Comercial',
        titulo: `Devolução Total - Pedido ${entrega.numero_pedido}`,
        mensagem: `Cliente ${entrega.cliente_nome} recusou a entrega. Motivo: ${motivo}. Ação tomada: ${acao}.`,
        link_acao: `/expedicao?ver=entrega&id=${entrega.id}`,
        group_id: grupoAtual?.id || empresaAtual?.group_id || entrega.group_id || null,
        empresa_id: entrega.empresa_id || empresaAtual?.id || null
      });

      // AuditLog
      try {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          empresa_id: entrega?.empresa_id || null,
          acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: entrega?.id,
          descricao: `Logística Reversa processada (motivo: ${motivo}, ação: ${acao})`
        });
      } catch (_) {}
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacao-estoque'] });
      toast({ title: '✅ Devolução processada com sucesso!' });
      onConcluido?.();
    }
  });

  return (
    <Card className="border-orange-300 bg-orange-50">
      <CardHeader className="border-b bg-white">
        <CardTitle className="text-base flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-orange-600" />
          Processar Logística Reversa
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label>Motivo da Recusa</Label>
          <Select value={motivo} onValueChange={setMotivo}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione o motivo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Recusa de Recebimento">Recusa de Recebimento</SelectItem>
              <SelectItem value="Produto Danificado">Produto Danificado</SelectItem>
              <SelectItem value="Pedido Incorreto">Pedido Incorreto</SelectItem>
              <SelectItem value="Cliente Cancelou">Cliente Cancelou</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Detalhes</Label>
          <Textarea
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
            placeholder="Descreva o que aconteceu..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Ação a Tomar</Label>
          <Select value={acao} onValueChange={setAcao}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione a ação..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="devolver_estoque">Devolver ao Estoque</SelectItem>
              <SelectItem value="descartar">Descartar (Refugo)</SelectItem>
              <SelectItem value="reagendar">Reagendar Entrega</SelectItem>
              <SelectItem value="manual">Processar Manualmente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 bg-white rounded-lg border border-orange-200">
          <h4 className="font-semibold text-sm text-orange-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Ações Automáticas
          </h4>
          <ul className="text-xs text-orange-800 space-y-1">
            <li>✓ Entrega marcada como "Devolvido"</li>
            <li>✓ Títulos financeiros serão bloqueados</li>
            {acao === 'devolver_estoque' && <li>✓ Produtos retornarão ao estoque</li>}
            <li>✓ Vendedor será notificado automaticamente</li>
            <li>✓ Histórico será registrado no cliente</li>
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <RBACButton module="Expedicao" action="reversa"
            variant="outline"
            onClick={onConcluido}
          >
            Cancelar
          </RBACButton>
          <Button
            onClick={() => processarDevolucaoMutation.mutate()}
            disabled={!motivo || !acao || processarDevolucaoMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {processarDevolucaoMutation.isPending ? 'Processando...' : 'Processar Devolução'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}