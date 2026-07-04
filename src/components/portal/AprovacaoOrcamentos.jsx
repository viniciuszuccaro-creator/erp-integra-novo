import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, FileText } from "lucide-react";

/**
 * Aprovação de Orçamentos pelo Cliente
 * V12.0 - Funcional e completo
 */
export default function AprovacaoOrcamentos({ clienteId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos-cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      return base44.entities.OrcamentoCliente.filter({
        cliente_id: clienteId,
        status: 'Pendente'
      });
    },
    enabled: !!clienteId
  });

  const aprovarMutation = useMutation({
    mutationFn: async (orcamento) => {
      // 1. Atualizar orçamento
      await base44.entities.OrcamentoCliente.update(orcamento.id, {
        status: 'Aprovado',
        aprovado_por: 'Portal Cliente',
        data_aprovacao: new Date().toISOString()
      });

      // 2. Criar pedido automaticamente
      const pedido = await base44.entities.Pedido.create({
        numero_pedido: `PED${Date.now()}`,
        cliente_id: clienteId,
        cliente_nome: orcamento.cliente_nome, // Assumes orcamento object contains cliente_nome
        data_pedido: new Date().toISOString().split('T')[0],
        valor_total: orcamento.valor_total,
        itens_revenda: orcamento.itens || [],
        status: 'Aguardando Aprovação',
        origem_pedido: 'Portal',
        observacoes_publicas: `Pedido gerado a partir do orçamento ${orcamento.numero_orcamento}`,
        pode_ver_no_portal: true
      });

      // 3. Vincular pedido ao orçamento
      await base44.entities.OrcamentoCliente.update(orcamento.id, {
        pedido_gerado_id: pedido.id,
        status: 'Convertido'
      });

      return { orcamento, pedido };
    },
    onSuccess: ({ pedido }) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos-cliente'] });
      queryClient.invalidateQueries({ queryKey: ['meus-pedidos'] });
      toast.success(`✅ Orçamento aprovado! Pedido ${pedido.numero_pedido} criado.`);
    }
  });

  const rejeitarMutation = useMutation({
    mutationFn: async ({ orcamento, motivo }) => {
      await base44.entities.OrcamentoCliente.update(orcamento.id, {
        status: 'Rejeitado',
        motivo_rejeicao: motivo,
        data_aprovacao: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos-cliente'] });
      toast.success('Orçamento rejeitado');
    }
  });

  return (
    <div className="space-y-4">
      <Card className="border-2 border-orange-300 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Orçamentos Aguardando Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orcamentos.length > 0 ? (
            <div className="space-y-4">
              {orcamentos.map(orc => (
                <Card key={orc.id} className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg">{orc.numero_orcamento}</p>
                        <p className="text-sm text-slate-600">
                          Criado em {new Date(orc.data_criacao).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-slate-600">
                          Válido até {new Date(orc.data_validade).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          R$ {orc.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-600">{orc.itens?.length || 0} item(ns)</p>
                      </div>
                    </div>

                    {/* Itens */}
                    <div className="mb-4 p-3 bg-slate-50 rounded border">
                      <p className="font-semibold mb-2 text-sm">Itens:</p>
                      <div className="space-y-1">
                        {(orc.itens || []).slice(0, 3).map((item, idx) => (
                          <p key={idx} className="text-sm text-slate-700">
                            • {item.descricao} - Qtd: {item.quantidade}
                          </p>
                        ))}
                        {orc.itens?.length > 3 && (
                          <p className="text-xs text-slate-500">+ {orc.itens.length - 3} item(ns)</p>
                        )}
                      </div>
                    </div>

                    {/* Condições */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-slate-600">Pagamento:</p>
                        <p className="font-medium">{orc.condicoes_pagamento || 'À Vista'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Prazo Entrega:</p>
                        <p className="font-medium">{orc.prazo_entrega || '7 dias'}</p>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Button
                        data-permission="Comercial.Orcamento.aprovar"
                        onClick={() => aprovarMutation.mutate(orc)}
                        disabled={aprovarMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar Orçamento
                      </Button>

                      <Button
                        variant="outline"
                        data-permission="Comercial.Orcamento.rejeitar"
                        onClick={() => {
                          const motivo = prompt('Motivo da rejeição (opcional):');
                          rejeitarMutation.mutate({ orcamento: orc, motivo: motivo || 'Não informado' });
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum orçamento pendente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}