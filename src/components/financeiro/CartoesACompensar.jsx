import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function CartoesACompensar() {
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: cartoes = [], isLoading } = useQuery({
    queryKey: ["movimento-cartao", contextoKey],
    queryFn: () => filterInContext('MovimentoCartao', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const conciliarMutation = useMutation({
    mutationFn: async ({ id }) => {
      return base44.entities.MovimentoCartao.update(id, {
        status_compensacao: "Compensado",
        data_recebimento_efetivo: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["movimento-cartao"]);
      toast.success("Cartão compensado com sucesso!");
    },
  });

  const cartoesFiltrados = filtroStatus === "todos" 
    ? cartoes 
    : cartoes.filter(c => c.status_compensacao === filtroStatus);

  const totalEmTransito = cartoes
    .filter(c => c.status_compensacao === "Em Trânsito" || c.status_compensacao === "A Compensar")
    .reduce((acc, c) => acc + (c.valor_liquido || 0), 0);

  const totalCompensado = cartoes
    .filter(c => c.status_compensacao === "Compensado")
    .reduce((acc, c) => acc + (c.valor_liquido || 0), 0);

  if (isLoading) return <div className="p-6">Carregando cartões...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Em Trânsito</p>
                <p className="text-2xl font-bold">
                  R$ {totalEmTransito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Compensado</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalCompensado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Transações</p>
                <p className="text-2xl font-bold">{cartoes.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cartões a Compensar</CardTitle>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="todos">Todos</option>
              <option value="Em Trânsito">Em Trânsito</option>
              <option value="A Compensar">A Compensar</option>
              <option value="Compensado">Compensado</option>
              <option value="Divergente">Divergente</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Data</th>
                  <th className="text-left p-3 text-sm font-semibold">Cliente</th>
                  <th className="text-left p-3 text-sm font-semibold">Bandeira</th>
                  <th className="text-left p-3 text-sm font-semibold">Adquirente</th>
                  <th className="text-left p-3 text-sm font-semibold">NSU</th>
                  <th className="text-right p-3 text-sm font-semibold">Valor Bruto</th>
                  <th className="text-right p-3 text-sm font-semibold">Taxa</th>
                  <th className="text-right p-3 text-sm font-semibold">Valor Líquido</th>
                  <th className="text-left p-3 text-sm font-semibold">Previsão</th>
                  <th className="text-left p-3 text-sm font-semibold">Status</th>
                  <th className="text-center p-3 text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {cartoesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center p-6 text-slate-500">
                      Nenhum cartão encontrado
                    </td>
                  </tr>
                ) : (
                  cartoesFiltrados.map((cartao) => (
                    <tr key={cartao.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-sm">
                        {new Date(cartao.data_transacao).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-sm">{cartao.cliente_nome}</td>
                      <td className="p-3 text-sm">
                        <Badge variant="outline">{cartao.bandeira}</Badge>
                      </td>
                      <td className="p-3 text-sm">{cartao.adquirente}</td>
                      <td className="p-3 text-sm font-mono text-xs">{cartao.nsu}</td>
                      <td className="p-3 text-sm text-right">
                        R$ {(cartao.valor_bruto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-sm text-right text-red-600">
                        {cartao.taxa_mdr_percentual}% (-R$ {(cartao.valor_taxa || 0).toFixed(2)})
                      </td>
                      <td className="p-3 text-sm text-right font-semibold">
                        R$ {(cartao.valor_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-sm">
                        {cartao.previsao_recebimento 
                          ? new Date(cartao.previsao_recebimento).toLocaleDateString('pt-BR')
                          : '-'}
                      </td>
                      <td className="p-3">
                        <Badge 
                          className={
                            cartao.status_compensacao === "Compensado" ? "bg-green-100 text-green-800" :
                            cartao.status_compensacao === "Divergente" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {cartao.status_compensacao}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        {cartao.status_compensacao !== "Compensado" && (
                          <Button
                            size="sm"
                            onClick={() => conciliarMutation.mutate({ id: cartao.id })}
                            disabled={conciliarMutation.isPending}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Conciliar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}