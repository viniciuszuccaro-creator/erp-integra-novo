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

export default function GerarLinkPagamentoModal({ isOpen, onClose, contaReceber }) {
  const queryClient = useQueryClient();
  const [linkGerado, setLinkGerado] = useState(null);

  const gerarLinkMutation = useMutation({
    mutationFn: async () => {
      // Simular chamada ao gateway
      const linkSimulado = `https://pag.erp-integra.com.br/pay/${contaReceber.id}`;
      
      // Criar PagamentoOmnichannel pendente
      await base44.entities.PagamentoOmnichannel.create({
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
      await base44.entities.ContaReceber.update(contaReceber.id, {
        url_fatura: linkSimulado,
        status_cobranca: 'gerada_simulada',
        forma_cobranca: 'Link Pagamento'
      });

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
              data-permission="Financeiro.LinkPagamento.gerar"
              onClick={() => gerarLinkMutation.mutate()}
              disabled={gerarLinkMutation.isPending}
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