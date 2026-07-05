import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const STATUS_CORES = {
  Aberto: "bg-green-100 text-green-700",
  "Em Andamento": "bg-blue-100 text-blue-700",
  "Aguardando Cliente": "bg-yellow-100 text-yellow-700",
  Resolvido: "bg-purple-100 text-purple-700",
  Fechado: "bg-slate-100 text-slate-700",
};

const PRIORIDADE_CORES = {
  Baixa: "bg-blue-100 text-blue-700",
  Média: "bg-yellow-100 text-yellow-700",
  Alta: "bg-orange-100 text-orange-700",
  Urgente: "bg-red-100 text-red-700",
};

export default function useChamadosCliente(clienteId, clienteNome) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [formChamado, setFormChamado] = useState({
    titulo: "",
    descricao: "",
    categoria: "Suporte Técnico",
    prioridade: "Média",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clienteData } = useQuery({
    queryKey: ["cliente-portal-by-id", clienteId],
    enabled: !!clienteId,
    queryFn: async () => {
      const rows = await base44.entities.Cliente.filter({ id: clienteId });
      return rows?.[0] || null;
    },
  });

  const { data: chamados = [] } = useQuery({
    queryKey: ["chamados", clienteId, clienteData?.empresa_id, clienteData?.group_id],
    enabled: !!clienteId,
    queryFn: async () => {
      if (!clienteId) return [];
      const filtros = {
        cliente_id: clienteId,
        ...(clienteData?.empresa_id ? { empresa_id: clienteData.empresa_id } : {}),
        ...(clienteData?.group_id ? { group_id: clienteData.group_id } : {}),
      };
      return await base44.entities.Chamado.filter(filtros, "-created_date");
    },
  });

  const criarChamadoMutation = useMutation({
    mutationFn: async (data) => {
      const cli = clienteData || (await base44.entities.Cliente.filter({ id: clienteId }).then((r) => r?.[0]));
      return base44.entities.Chamado.create({
        ...data,
        cliente_id: clienteId,
        cliente_nome: clienteNome,
        status: "Aberto",
        data_abertura: new Date().toISOString().split("T")[0],
        mensagens: [],
        empresa_id: cli?.empresa_id || undefined,
        group_id: cli?.group_id || undefined,
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["chamados", clienteId] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "✅ Chamado Aberto!", description: "Seu chamado foi registrado e será atendido em breve" });
      try {
        await base44.entities.AuditLog.create({
          acao: "Criação",
          modulo: "Portal",
          tipo_auditoria: "entidade",
          entidade: "Chamado",
          descricao: "Chamado aberto via Portal",
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
    },
  });

  const avaliarChamadoMutation = useMutation({
    mutationFn: ({ chamadoId, avaliacao }) => base44.entities.Chamado.update(chamadoId, { avaliacao }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["chamados", clienteId] });
      toast({ title: "✅ Obrigado!", description: "Sua avaliação foi registrada" });
      try {
        const cli = clienteData || (await base44.entities.Cliente.filter({ id: clienteId }).then((r) => r?.[0]));
        const novo = Number(cli?.pontos_fidelidade || 0) + 10;
        await base44.entities.Cliente.update(clienteId, {
          pontos_fidelidade: novo,
          empresa_id: cli?.empresa_id || undefined,
          group_id: cli?.group_id || undefined,
        });
        try {
          await base44.entities.AuditLog.create({
            acao: "Edição",
            modulo: "Portal",
            tipo_auditoria: "entidade",
            entidade: "Cliente",
            registro_id: clienteId,
            descricao: "Gamificação: feedback registrado (+10)",
            dados_novos: { pontos_fidelidade: novo },
            data_hora: new Date().toISOString(),
          });
        } catch {}
      } catch (_) {}
      try { await queryClient.invalidateQueries({ queryKey: ["portal-has-feedback"] }); } catch {}
      try { await queryClient.invalidateQueries({ queryKey: ["cliente-portal"] }); } catch {}
    },
  });

  const resetForm = () => {
    setFormChamado({ titulo: "", descricao: "", categoria: "Suporte Técnico", prioridade: "Média" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    criarChamadoMutation.mutate(formChamado);
  };

  const getStatusColor = (status) => STATUS_CORES[status] || "bg-slate-100 text-slate-700";
  const getPrioridadeColor = (prioridade) => PRIORIDADE_CORES[prioridade] || "bg-slate-100 text-slate-700";

  return {
    dialogOpen,
    setDialogOpen,
    chamadoSelecionado,
    setChamadoSelecionado,
    chatOpen,
    setChatOpen,
    formChamado,
    setFormChamado,
    chamados,
    criarChamadoMutation,
    avaliarChamadoMutation,
    handleSubmit,
    resetForm,
    getStatusColor,
    getPrioridadeColor,
  };
}