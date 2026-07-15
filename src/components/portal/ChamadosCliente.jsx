import React, { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, MessageSquare, Star } from "lucide-react";
import { format } from "date-fns";
import useChamadosCliente from "@/components/portal/chamados-cliente/useChamadosCliente";
import ChamadoFormDialog from "@/components/portal/chamados-cliente/ChamadoFormDialog";
import ChamadoDetalhesDialog from "@/components/portal/chamados-cliente/ChamadoDetalhesDialog";

const ChatbotWidgetAvancado = React.lazy(() => import("@/components/chatbot/ChatbotWidgetAvancado"));

export default function ChamadosCliente({ clienteId, clienteNome }) {
  const h = useChamadosCliente(clienteId, clienteNome);

  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Meus Chamados</h2>
          <p className="text-sm text-slate-600">Acompanhe suas solicitações de suporte</p>
        </div>
        <ChamadoFormDialog
          dialogOpen={h.dialogOpen}
          setDialogOpen={h.setDialogOpen}
          formChamado={h.formChamado}
          setFormChamado={h.setFormChamado}
          handleSubmit={h.handleSubmit}
          criarChamadoMutation={h.criarChamadoMutation}
        />
        <Button variant="outline" onClick={() => h.setChatOpen(true)}>
          Atendimento via Chat
        </Button>
      </div>

      <Card className="border-0 shadow-md w-full">
        <CardContent className="p-0 w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nº</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Abertura</TableHead>
                <TableHead>Mensagens</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {h.chamados.map((chamado, idx) => (
                <TableRow key={chamado.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm">#{String(idx + 1).padStart(4, "0")}</TableCell>
                  <TableCell className="font-medium">{chamado.titulo}</TableCell>
                  <TableCell><Badge variant="outline">{chamado.categoria}</Badge></TableCell>
                  <TableCell><Badge className={h.getPrioridadeColor(chamado.prioridade)}>{chamado.prioridade}</Badge></TableCell>
                  <TableCell><Badge className={h.getStatusColor(chamado.status)}>{chamado.status}</Badge></TableCell>
                  <TableCell className="text-sm">{format(new Date(chamado.data_abertura), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{(chamado.mensagens || []).length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => h.setChamadoSelecionado(chamado)}>
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </Button>
                      {chamado.status === "Resolvido" && !chamado.avaliacao && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600"
                          onClick={() => {
                            const nota = prompt("Avalie de 1 a 5:");
                            if (nota && !isNaN(nota) && nota >= 1 && nota <= 5) {
                              h.avaliarChamadoMutation.mutate({ chamadoId: chamado.id, avaliacao: { nota: parseInt(nota), comentario: "" } });
                            }
                          }}
                        >
                          <Star className="w-4 h-4 mr-1" /> Avaliar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {h.chamados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">Nenhum chamado aberto</p>
              <p className="text-sm mt-2">Abra um chamado para solicitar suporte</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ChamadoDetalhesDialog
        chamadoSelecionado={h.chamadoSelecionado}
        setChamadoSelecionado={h.setChamadoSelecionado}
        chamados={h.chamados}
        getStatusColor={h.getStatusColor}
        getPrioridadeColor={h.getPrioridadeColor}
      />

      <Dialog open={h.chatOpen} onOpenChange={h.setChatOpen}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader><DialogTitle>Assistente de Suporte</DialogTitle></DialogHeader>
          <div className="w-full h-full">
            <Suspense fallback={<div className="w-full h-full bg-white/60 animate-pulse rounded" />}>
              <ChatbotWidgetAvancado clienteId={clienteId} canal="Portal-Suporte" exibirBotaoFlutuante={false} habilitarAvaliacao={true} />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}