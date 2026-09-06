import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Link2, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";

export default function GerarLinkPagamentoModal({ isOpen, onClose, contaReceber }) {
  const queryClient = useQueryClient();
  const [linkGerado, setLinkGerado] = useState(null);
  const { user } = useUser();
  const { grupoAtual, empresaAtual, createInContext, updateInContext } = useContextoVisual();
  const { canCreate, canEdit, hasPermission } = usePermissions();

  const groupId = contaReceber?.group_id || grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const empresaId = contaReceber?.empresa_id || empresaAtual?.id || null;
  const contextoValido = !!(groupId && empresaId);
  const podeGerarLink =
    canCreate('Financeiro', 'Cobrança') ||
    canCreate('Financeiro', 'Cobranca') ||
    canEdit('Financeiro', 'Contas a Receber') ||
    hasPermission('Financeiro', null, 'gerenciar');

  const gerarLinkMutation = useMutation({
    mutationFn: async () => {
      // Regra-Mãe 5a/5b: contexto multiempresa e permissão obrigatórios na persistência
      if (!contextoValido) throw new Error('Contexto de grupo/empresa obrigatório para gerar link (Regra-Mãe 5a).');
      if (!podeGerarLink) throw new Error('Seu perfil não permite gerar links de pagamento.');

      // Simular chamada ao gateway
      const linkSimulado = `https://pag.erp-integra.com.br/pay/${contaReceber.id}`;
      
      // Criar PagamentoOmnichannel pendente
      await createInContext('PagamentoOmnichannel', {
        empresa_id: contaReceber.empresa_id,
        group_id: contaReceber.group_id,
        origem_pagamento: 'Link Pagamento',
        cliente_nome: contaReceber.cliente,
        cliente_cpf_cnpj: contaReceber.cliente_cpf_cnpj || '',
        valor_bruto: contaReceber.valor,
        valor_liquido: contaReceber.valor * 0.97, // 3% taxa gateway
        forma_pagamento: 'PIX',
        status_transacao: 'Pendente',
        status_conferencia: 'Pendente',
        conta_receber_id: contaReceber.id,
        link_pagamento: linkSimulado,
        gateway_utilizado: 'Asaas',
        data_transacao: new Date().toISOString()
      });

      // Atualizar CR
      await updateInContext('ContaReceber', contaReceber.id, {
        url_fatura: linkSimulado,
        status_cobranca: 'gerada_simulada',
        forma_cobranca: 'Link Pagamento'
      });

      // Regra-Mãe 5d: auditoria completa (antes/depois, grupo/empresa, usuário)
      try { await base44.entities.AuditLog.create({
        acao: 'Emissão', modulo: 'Financeiro', entidade: 'ContaReceber', registro_id: contaReceber.id,
        descricao: 'Link de pagamento gerado (simulado)',
        data_hora: new Date().toISOString(),
        group_id: groupId, grupo_id: groupId, empresa_id: empresaId,
        usuario: user?.full_name || 'Sistema', usuario_id: user?.id,
        tipo_auditoria: 'operacional', sucesso: true,
        dados_anteriores: { forma_cobranca: contaReceber.forma_cobranca, status_cobranca: contaReceber.status_cobranca, url_fatura: contaReceber.url_fatura },
        dados_novos: { forma_cobranca: 'Link Pagamento', status_cobranca: 'gerada_simulada', url_fatura: linkSimulado }
      }); } catch (e) { console.error('[LinkPagamento] Falha ao auditar:', e?.message || e); }

      return linkSimulado;
    },
    onSuccess: (link) => {
      setLinkGerado(link);
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos-omnichannel'] });
      toast.success('✅ Link de pagamento gerado!');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGerado);
    toast.success('📋 Link copiado!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>💳 Gerar Link de Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertDescription>
              <p className="font-semibold mb-2">Cliente: {contaReceber?.cliente}</p>
              <p>Valor: R$ {contaReceber?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-slate-500 mt-1">
                Vencimento: {new Date(contaReceber?.data_vencimento).toLocaleDateString('pt-BR')}
              </p>
            </AlertDescription>
          </Alert>

          {!linkGerado ? (
            <Button
              onClick={() => gerarLinkMutation.mutate()}
              disabled={gerarLinkMutation.isPending || !contextoValido || !podeGerarLink}
              data-permission="Financeiro.Cobrança.criar"
              data-action="gerar_link_pagamento"
              data-sensitive="true"
              data-context-required="true"
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {gerarLinkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Link...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Gerar Link de Pagamento
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  Link gerado com sucesso! Copie e envie ao cliente.
                </AlertDescription>
              </Alert>

              <div>
                <Label>Link de Pagamento</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={linkGerado}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copiarLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">ℹ️ Próximos passos:</p>
                  <ul className="text-xs space-y-1 ml-4 list-disc">
                    <li>Envie o link ao cliente via WhatsApp ou E-mail</li>
                    <li>Cliente clica e paga via PIX ou Cartão</li>
                    <li>Sistema recebe webhook e baixa automaticamente</li>
                    <li>Pagamento aparece em "Omnichannel" para conciliação</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button onClick={onClose} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}