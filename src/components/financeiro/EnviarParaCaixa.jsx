import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Wallet, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * ETAPA 4 - Componente Enviar Para Caixa
 * Usado em Contas a Receber e Contas a Pagar
 */
export default function EnviarParaCaixa({ 
  titulosSelecionados = [], 
  tipo = 'receber', // 'receber' ou 'pagar'
  onEnviado 
}) {
  const queryClient = useQueryClient();

  const enviarMutation = useMutation({
    mutationFn: async () => {
      const ordens = await Promise.all(titulosSelecionados.map(async (titulo) => {
        return await base44.entities.CaixaOrdemLiquidacao.create({
          group_id: titulo.group_id,
          empresa_id: titulo.empresa_id,
          tipo_operacao: tipo === 'receber' ? 'Recebimento' : 'Pagamento',
          origem: tipo === 'receber' ? 'Contas a Receber' : 'Contas a Pagar',
          valor_total: titulo.valor,
          forma_pagamento_pretendida: tipo === 'receber' ? 'PIX' : 'Transferência',
          status: 'Pendente',
          titulos_vinculados: [{
            titulo_id: titulo.id,
            tipo_titulo: tipo === 'receber' ? 'ContaReceber' : 'ContaPagar',
            numero_titulo: titulo.numero_documento || titulo.descricao,
            cliente_fornecedor_nome: tipo === 'receber' ? titulo.cliente : titulo.fornecedor,
            valor_titulo: titulo.valor,
            data_vencimento: titulo.data_vencimento
          }],
          data_ordem: new Date().toISOString()
        });
      }));
      return ordens;
    },
    onSuccess: (ordens) => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens-liquidacao'] });
      toast.success(`✅ ${ordens.length} título(s) enviado(s) para o Caixa!`);
      if (onEnviado) onEnviado();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    }
  });

  if (titulosSelecionados.length === 0) {
    return null;
  }

  const totalValor = titulosSelecionados.reduce((sum, t) => sum + (t.valor || 0), 0);

  return (
    <Alert className={`border-${tipo === 'receber' ? 'emerald' : 'red'}-300 bg-${tipo === 'receber' ? 'emerald' : 'red'}-50`}>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className={`font-semibold text-${tipo === 'receber' ? 'emerald' : 'red'}-900 flex items-center gap-2`}>
            <Wallet className="w-5 h-5" />
            {titulosSelecionados.length} título(s) selecionado(s)
          </p>
          <p className={`text-xs text-${tipo === 'receber' ? 'emerald' : 'red'}-700 mt-1`}>
            Total: R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button
          onClick={() => enviarMutation.mutate()}
          disabled={enviarMutation.isPending}
          className={`bg-${tipo === 'receber' ? 'emerald' : 'red'}-600 hover:bg-${tipo === 'receber' ? 'emerald' : 'red'}-700`}
        >
          {enviarMutation.isPending ? (
            <>Enviando...</>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar para Caixa
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}