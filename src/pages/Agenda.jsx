import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";
import SemEmpresaBanner from "@/components/common/SemEmpresaBanner";
import ErrorBoundary from "@/components/lib/ErrorBoundary";
import AgendaCalendarioView from "@/components/agenda/AgendaCalendarioView";
import AgendaListaView from "@/components/agenda/AgendaListaView";
import AgendaFormDialog from "@/components/agenda/AgendaFormDialog";
import AgendaToolbar from "@/components/agenda/AgendaToolbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function Agenda() {
  const [visualizacao, setVisualizacao] = useState(() => {
    try { return localStorage.getItem("Agenda_view") || "calendario"; } catch { return "calendario"; }
  });
  const [dataAtual, setDataAtual] = useState(() => {
    try {
      const d = localStorage.getItem("Agenda_date");
      return d ? new Date(d) : new Date();
    } catch {
      return new Date();
    }
  });
  const [filtroUsuario, setFiltroUsuario] = useState(() => {
    try { return localStorage.getItem("Agenda_user") || null; } catch { return null; }
  });
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, carimbarContexto, createInContext, updateInContext, deleteInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || null;
  const contextoValido = !!(empresaAtual?.id || groupId);

  // Sincronizar estado -> localStorage
  useEffect(() => {
    try {
      localStorage.setItem("Agenda_view", visualizacao);
      localStorage.setItem("Agenda_date", dataAtual.toISOString());
      localStorage.setItem("Agenda_user", filtroUsuario || "");
    } catch {}
  }, [visualizacao, dataAtual, filtroUsuario]);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: eventos = [] } = useQuery({
    queryKey: ["eventos", empresaAtual?.id, groupId],
    queryFn: () => filterInContext("Evento", {}, "-data_inicio"),
    enabled: contextoValido,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", empresaAtual?.id, groupId],
    queryFn: () => filterInContext("Cliente", {}, "-created_date"),
    enabled: contextoValido,
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      try {
        const all = await base44.entities.User.list();
        return all || [];
      } catch {
        return [];
      }
    },
  });

  const createEventoMutation = useMutation({
    mutationFn: async (data) => {
      // Regra-Mãe 5: RBAC + contexto na persistência (fail-closed)
      if (!canCreate('Agenda')) throw new Error('Sem permissão para criar eventos.');
      const dataInicio = `${data.data_inicio}T${data.hora_inicio || "00:00"}:00`;
      const dataFim = `${data.data_fim}T${data.hora_fim || "23:59"}:00`;

      return await createInContext('Evento', {
          ...data,
          data_inicio: dataInicio,
          data_fim: dataFim,
          responsavel: user?.full_name || "Usuário",
          responsavel_id: user?.id,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      toast({ title: "Evento criado com sucesso" });
    },
    onError: (e) => toast({ title: "Erro ao criar evento", description: e?.message, variant: "destructive" }),
  });

  const updateEventoMutation = useMutation({
    mutationFn: async (data) => {
      // Regra-Mãe 5: RBAC + contexto na persistência (fail-closed)
      if (!canEdit('Agenda')) throw new Error('Sem permissão para editar eventos.');
      const dataInicio = `${data.data_inicio}T${data.hora_inicio || "00:00"}:00`;
      const dataFim = `${data.data_fim}T${data.hora_fim || "23:59"}:00`;

      return await updateInContext('Evento', data.id, {
        ...data,
        data_inicio: dataInicio,
        data_fim: dataFim,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      toast({ title: "Evento atualizado com sucesso" });
    },
    onError: (e) => toast({ title: "Erro ao atualizar evento", description: e?.message, variant: "destructive" }),
  });

  const deleteEventoMutation = useMutation({
    mutationFn: async (id) => {
      // Regra-Mãe 5: RBAC + contexto na persistência (fail-closed)
      if (!canDelete('Agenda')) throw new Error('Sem permissão para excluir eventos.');
      return await deleteInContext('Evento', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos"] });
      toast({ title: "Evento deletado com sucesso" });
      setEventoSelecionado(null);
    },
    onError: (e) => toast({ title: "Erro ao excluir evento", description: e?.message, variant: "destructive" }),
  });

  const handleNovoEvento = () => {
    setEventoSelecionado(null);
    setEventoDialogOpen(true);
  };

  const handleEventoClick = (evento) => {
    setEventoSelecionado(evento);
    setEventoDialogOpen(true);
  };

  const handleSaveEvento = async (data) => {
    if (eventoSelecionado?.id) {
      await updateEventoMutation.mutateAsync({ ...data, id: eventoSelecionado.id });
    } else {
      await createEventoMutation.mutateAsync(data);
    }
    setEventoDialogOpen(false);
  };

  const handleDeleteEvento = () => {
    if (!eventoSelecionado?.id) return;
    setConfirmDeleteOpen(true);
  };

  const confirmarDeleteEvento = async () => {
    if (!eventoSelecionado?.id) return;
    await deleteEventoMutation.mutateAsync(eventoSelecionado.id);
    setConfirmDeleteOpen(false);
  };

  if (!contextoValido) {
    return (
      <ProtectedSection module="Agenda" action="visualizar">
        <SemEmpresaBanner />
      </ProtectedSection>
    );
  }

  return (
    <ErrorBoundary>
      <ProtectedSection module="Agenda" action="visualizar">
        <div className="w-full h-full flex flex-col bg-slate-50">
          <AgendaToolbar
            visualizacao={visualizacao}
            setVisualizacao={setVisualizacao}
            filtroUsuario={filtroUsuario}
            setFiltroUsuario={setFiltroUsuario}
            usuarios={usuarios}
            onNovoEvento={handleNovoEvento}
            onDeleteEvento={handleDeleteEvento}
            eventoSelecionado={eventoSelecionado}
          />

          <div className="flex-1 overflow-hidden">
            {visualizacao === "calendario" && (
              <AgendaCalendarioView
                dataAtual={dataAtual}
                setDataAtual={setDataAtual}
                eventos={eventos}
                onEventoClick={handleEventoClick}
                filtroUsuario={filtroUsuario}
              />
            )}

            {visualizacao === "lista" && (
              <AgendaListaView
                eventos={eventos}
                filtroUsuario={filtroUsuario}
                onEventoClick={handleEventoClick}
              />
            )}
          </div>

          <AgendaFormDialog
            open={eventoDialogOpen}
            onOpenChange={setEventoDialogOpen}
            evento={eventoSelecionado}
            clientes={clientes}
            user={user}
            onSave={handleSaveEvento}
            isLoading={createEventoMutation.isPending || updateEventoMutation.isPending}
          />

          <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
              <p className="text-slate-600 text-sm">Tem certeza que deseja deletar este evento? Esta ação não pode ser desfeita.</p>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={confirmarDeleteEvento} disabled={deleteEventoMutation.isPending}>
                  {deleteEventoMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </ProtectedSection>
    </ErrorBoundary>
  );
}

export default Agenda;