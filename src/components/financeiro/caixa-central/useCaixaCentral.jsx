import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";

/**
 * Hook: Caixa Central de Liquidação
 * Queries e mutations com multi-tenant, RBAC e auditoria
 */
export default function useCaixaCentral() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, filterInContext, updateInContext } = useContextoVisual();
  const { canEdit, hasPermission } = usePermissions();

  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeLiquidar = canEdit("Financeiro", "Caixa") || canEdit("Financeiro", "Caixa Central") || hasPermission("Financeiro", null, "baixar");

  const [filtros, setFiltros] = useState({ tipo: "todos", origem: "todos", status: "Pendente" });
  const [ordensSelecionadas, setOrdensSelecionadas] = useState([]);
  const [modalLiquidacao, setModalLiquidacao] = useState(false);
  const [dadosLiquidacao, setDadosLiquidacao] = useState({
    forma_pagamento: "", valor_recebido: 0, acrescimo: 0, desconto: 0, observacoes: ""
  });

  const { data: ordensLiquidacao = [], isLoading } = useQuery({
    queryKey: ['caixa-ordens', filtros, contextKey],
    queryFn: async () => {
      const ordens = await filterInContext('CaixaOrdemLiquidacao', {}, '-created_date', 200);
      return ordens.filter(o => {
        if (filtros.status !== "todos" && o.status !== filtros.status) return false;
        if (filtros.tipo !== "todos" && o.tipo_operacao !== filtros.tipo) return false;
        if (filtros.origem !== "todos" && o.origem !== filtros.origem) return false;
        return true;
      });
    },
    enabled: contextoValido
  });

  const liquidarOrdens = useMutation({
    mutationFn: async ({ ordensIds, dados }) => {
      if (!contextoValido || !podeLiquidar) throw new Error("Sem contexto ou permissão para liquidar.");
      const resultados = [];
      for (const ordemId of ordensIds) {
        const ordem = ordensLiquidacao.find(o => o.id === ordemId);
        const valorLiquido = dados.valor_recebido + dados.acrescimo - dados.desconto;

        await updateInContext('CaixaOrdemLiquidacao', ordemId, {
          status: "Liquidado",
          usuario_liquidacao_id: user.id,
          data_liquidacao: new Date().toISOString()
        });

        for (const titulo of (ordem.titulos_vinculados || [])) {
          if (titulo.tipo_titulo === "ContaReceber") {
            await updateInContext('ContaReceber', titulo.titulo_id, {
              status: "Pago", data_pagamento: new Date().toISOString(),
              valor_pago: valorLiquido, forma_pagamento: dados.forma_pagamento, usuario_baixa_id: user.id
            });
          } else if (titulo.tipo_titulo === "ContaPagar") {
            await updateInContext('ContaPagar', titulo.titulo_id, {
              status: "Pago", data_pagamento: new Date().toISOString(),
              valor_pago: valorLiquido, forma_pagamento: dados.forma_pagamento, usuario_baixa_id: user.id
            });
          }
        }

        try {
          await base44.entities.AuditLog.create({
            group_id: ordem.group_id, empresa_id: ordem.empresa_id,
            usuario: user.full_name || user.email, usuario_id: user.id,
            acao: "Aprovação", modulo: "Financeiro", tipo_auditoria: "entidade",
            entidade: "CaixaOrdemLiquidacao", registro_id: ordemId,
            descricao: `Liquidação no Caixa - ${ordem.tipo_operacao} (R$ ${valorLiquido.toFixed(2)})`,
            dados_anteriores: { status: ordem.status, valor_total: ordem.valor_total },
            dados_novos: { status: "Liquidado", valor_liquido: valorLiquido, forma_pagamento: dados.forma_pagamento },
            data_hora: new Date().toISOString(),
          });
        } catch (e) { console.error('[caixa-central] catch:', e); }
        resultados.push({ ordemId, success: true });
      }
      return resultados;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixa-ordens'] });
      setOrdensSelecionadas([]);
      setModalLiquidacao(false);
      setDadosLiquidacao({ forma_pagamento: "", valor_recebido: 0, acrescimo: 0, desconto: 0, observacoes: "" });
      toast.success("Liquidação realizada com sucesso!");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const toggleOrdemSelecionada = (ordemId) => {
    setOrdensSelecionadas(prev =>
      prev.includes(ordemId) ? prev.filter(id => id !== ordemId) : [...prev, ordemId]
    );
  };

  const iniciarLiquidacao = () => {
    if (ordensSelecionadas.length === 0) { toast.error("Selecione ao menos uma ordem para liquidar"); return; }
    const ordens = ordensLiquidacao.filter(o => ordensSelecionadas.includes(o.id));
    const valorTotal = ordens.reduce((sum, o) => sum + (o.valor_total || 0), 0);
    setDadosLiquidacao({ forma_pagamento: "", valor_recebido: valorTotal, acrescimo: 0, desconto: 0, observacoes: "" });
    setModalLiquidacao(true);
  };

  const confirmarLiquidacao = () => {
    if (!dadosLiquidacao.forma_pagamento) { toast.error("Selecione a forma de pagamento"); return; }
    if (dadosLiquidacao.valor_recebido <= 0) { toast.error("Valor recebido deve ser maior que zero"); return; }
    liquidarOrdens.mutate({ ordensIds: ordensSelecionadas, dados: dadosLiquidacao });
  };

  return {
    ordensLiquidacao, isLoading,
    filtros, setFiltros,
    ordensSelecionadas, toggleOrdemSelecionada,
    modalLiquidacao, setModalLiquidacao,
    dadosLiquidacao, setDadosLiquidacao,
    iniciarLiquidacao, confirmarLiquidacao,
    liquidarOrdens,
    contextoValido, podeLiquidar,
    user,
  };
}