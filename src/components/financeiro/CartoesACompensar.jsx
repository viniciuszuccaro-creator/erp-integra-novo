import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";

export default function CartoesACompensar() {
  const queryClient = useQueryClient();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const { filterInContext, updateInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const { user } = useUser();
  const { canEdit, hasPermission } = usePermissions();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = !!(grupoAtual?.id || empresaAtual?.id);
  const podeConciliar = canEdit('Financeiro', 'Cartões') || canEdit('Financeiro', 'Caixa') || hasPermission('Financeiro', null, 'conciliar');

  const { data: cartoes = [], isLoading } = useQuery({
    queryKey: ["movimento-cartao", contextoKey],
    queryFn: () => filterInContext('MovimentoCartao', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const conciliarMutation = useMutation({
    mutationFn: async ({ id }) => {
      // Regra-Mãe 5a/5b: contexto multiempresa e permissão obrigatórios na persistência
      if (!contextoValido || !podeConciliar) throw new Error("Sem contexto de grupo/empresa ou permissão para conciliar cartão (Regra-Mãe 5a/5b).");
      const antes = cartoes.find(c => c.id === id) || null;
      const mudancas = {
        status_compensacao: "Compensado",
        data_recebimento_efetivo: new Date().toISOString().split('T')[0]
      };
      await updateInContext('MovimentoCartao', id, mudancas);

      // Regra-Mãe 5d: auditoria com antes/depois, grupo, empresa e usuário
      try { await base44.entities.AuditLog.create({
        acao: 'Conciliação', modulo: 'Financeiro', entidade: 'MovimentoCartao', registro_id: id,
        descricao: 'Cartão compensado manualmente',
        data_hora: new Date().toISOString(),
        group_id: groupId, grupo_id: groupId, empresa_id: antes?.empresa_id || empresaAtual?.id || null,
        usuario: user?.full_name || 'Sistema', usuario_id: user?.id,
        tipo_auditoria: 'operacional', sucesso: true,
        dados_anteriores: antes ? { status_compensacao: antes.status_compensacao, valor_liquido: antes.valor_liquido, nsu: antes.nsu, bandeira: antes.bandeira } : null,
        dados_novos: mudancas
      }); } catch (e) { console.error('[Cartões] Falha ao auditar conciliação:', e?.message || e); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["movimento-cartao"]);
      toast.success("Cartão compensado com sucesso!");
    },
    onError: (error) => toast.error(error.message || "Erro ao conciliar cartão"),
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
                            disabled={conciliarMutation.isPending || !contextoValido || !podeConciliar}
                            data-permission="Financeiro.Cartões.conciliar" data-action="conciliar_cartao" data-sensitive="true" data-context-required="true"
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