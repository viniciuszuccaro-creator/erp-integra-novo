import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import usePermissions from "@/components/lib/usePermissions";

const APONTAMENTO_INIT = {
  setor: "Em Corte",
  quantidade_produzida: 0,
  peso_produzido_kg: 0,
  tempo_minutos: 0,
  observacoes: ""
};

export default function useProducaoMobile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = usePermissions();

  const [user, setUser] = useState(null);
  const [opSelecionada, setOpSelecionada] = useState(null);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [apontamento, setApontamento] = useState(APONTAMENTO_INIT);

  const podeApontar = hasPermission?.('Produção', null, 'editar') ?? isAdmin;
  const podeExpedir = hasPermission?.('Produção', null, 'aprovar') ?? isAdmin;

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: ops = [], isLoading } = useQuery({
    queryKey: ['ops-mobile', user?.empresa_atual_id, user?.group_id],
    queryFn: async () => {
      const filtro = {
        $or: [
          { empresa_id: user?.empresa_atual_id },
          ...(user?.group_id ? [{ group_id: user?.group_id }] : [])
        ],
        status: { $in: ['Liberada', 'Em Corte', 'Em Dobra', 'Em Armação', 'Aguardando Matéria-Prima'] }
      };
      return await base44.entities.OrdemProducao.filter(filtro, '-created_date', 200);
    },
    enabled: !!(user?.empresa_atual_id || user?.group_id),
  });

  const apontarMutation = useMutation({
    mutationFn: async (dados) => {
      const novoApontamento = {
        data_hora: new Date().toISOString(),
        operador: user?.full_name || "Operador",
        operador_id: user?.id,
        item_elemento: itemSelecionado.elemento,
        setor: dados.setor,
        quantidade_produzida: dados.quantidade_produzida,
        peso_produzido_kg: dados.peso_produzido_kg,
        tempo_minutos: dados.tempo_minutos,
        observacoes: dados.observacoes,
        tipo: "Andamento"
      };

      const apontamentosAtuais = opSelecionada.apontamentos || [];
      const itensAtualizados = (opSelecionada.itens_producao || []).map(item => {
        if (item.elemento === itemSelecionado.elemento) {
          return {
            ...item,
            apontado: true,
            data_apontamento: new Date().toISOString(),
            operador_apontamento: user?.full_name,
            peso_real_total: (item.peso_real_total || 0) + dados.peso_produzido_kg
          };
        }
        return item;
      });

      const itensConcluidos = itensAtualizados.filter(i => i.apontado).length;
      const percentual = opSelecionada.itens_producao?.length > 0
        ? Math.round((itensConcluidos / opSelecionada.itens_producao.length) * 100)
        : 0;

      await base44.entities.OrdemProducao.update(opSelecionada.id, {
        apontamentos: [...apontamentosAtuais, novoApontamento],
        itens_producao: itensAtualizados,
        peso_real_total_kg: (opSelecionada.peso_real_total_kg || 0) + dados.peso_produzido_kg,
        itens_concluidos: itensConcluidos,
        percentual_conclusao: percentual,
        status: percentual === 100 ? "Em Conferência" : dados.setor,
        data_inicio_real: opSelecionada.data_inicio_real || new Date().toISOString()
      });

      try {
        await base44.entities.AuditLog.create({
          usuario: user?.email || 'Operador',
          usuario_id: user?.id,
          acao: 'Edição',
          modulo: 'Produção',
          tipo_auditoria: 'entidade',
          entidade: 'OrdemProducao',
          registro_id: opSelecionada.id,
          descricao: `Apontamento de produção: ${dados.quantidade_produzida} ${itemSelecionado.elemento} (${dados.setor})`,
          group_id: opSelecionada.group_id,
          empresa_id: opSelecionada.empresa_id,
          dados_novos: novoApontamento,
          data_hora: new Date().toISOString()
        });
      } catch {}

      return { sucesso: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-mobile'] });
      setItemSelecionado(null);
      setApontamento(APONTAMENTO_INIT);
      toast({ title: "✅ Apontamento registrado!", description: "Produção atualizada com sucesso" });
    },
  });

  const finalizarEEnviarMutation = useMutation({
    mutationFn: async (opId) => {
      const op = ops.find(o => o.id === opId);

      const novaEntrega = await base44.entities.Entrega.create({
        group_id: op.group_id,
        empresa_id: op.empresa_id,
        pedido_id: op.pedido_id,
        numero_pedido: op.numero_pedido,
        op_id: op.id,
        cliente_id: op.cliente_id,
        cliente_nome: op.cliente_nome,
        endereco_entrega_completo: {},
        data_previsao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        peso_total_kg: op.peso_real_total_kg,
        status: "Pronto para Expedir",
        qr_code: `QR-${Date.now()}`,
        historico_status: [{
          status: "Pronto para Expedir",
          data_hora: new Date().toISOString(),
          usuario: user?.full_name || "Sistema",
          observacao: `Finalizado via mobile por ${user?.full_name}`
        }]
      });

      await base44.entities.OrdemProducao.update(opId, {
        status: "Expedida",
        entrega_id: novaEntrega.id
      });

      try {
        await base44.entities.AuditLog.create({
          usuario: user?.email || 'Operador',
          usuario_id: user?.id,
          acao: 'Edição',
          modulo: 'Produção',
          tipo_auditoria: 'entidade',
          entidade: 'OrdemProducao',
          registro_id: opId,
          descricao: `OP finalizada e enviada para expedição. Entrega ${novaEntrega.id}`,
          group_id: op.group_id,
          empresa_id: op.empresa_id,
          data_hora: new Date().toISOString()
        });
      } catch {}

      return novaEntrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-mobile'] });
      setOpSelecionada(null);
      toast({ title: "✅ Enviado para expedição!", description: "OP finalizada com sucesso" });
    },
  });

  const handleSubmitApontamento = (e) => {
    e.preventDefault();
    if (!podeApontar) {
      toast({ title: "⛔ Sem permissão", description: "Você não pode registrar apontamentos.", variant: "destructive" });
      return;
    }
    if (!apontamento.quantidade_produzida || apontamento.quantidade_produzida <= 0) {
      toast({ title: "⚠️ Informe a quantidade", variant: "destructive" });
      return;
    }
    apontarMutation.mutate(apontamento);
  };

  const resetApontamento = () => {
    setItemSelecionado(null);
    setApontamento(APONTAMENTO_INIT);
  };

  return {
    user,
    ops,
    isLoading,
    opSelecionada,
    setOpSelecionada,
    itemSelecionado,
    setItemSelecionado,
    apontamento,
    setApontamento,
    handleSubmitApontamento,
    finalizarEEnviarMutation,
    apontarMutation,
    podeApontar,
    podeExpedir,
    resetApontamento
  };
}