import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { format } from "date-fns";

export default function ChamadoDetalhesDialog({ chamadoSelecionado, setChamadoSelecionado, chamados, getStatusColor, getPrioridadeColor }) {
  if (!chamadoSelecionado) return null;
  const idx = chamados.findIndex((c) => c.id === chamadoSelecionado.id);

  return (
    <Dialog open={!!chamadoSelecionado} onOpenChange={() => setChamadoSelecionado(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chamado #{idx + 1} - {chamadoSelecionado.titulo}
            <Badge className={getStatusColor(chamadoSelecionado.status)}>{chamadoSelecionado.status}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Categoria</p>
              <p className="font-semibold">{chamadoSelecionado.categoria}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Prioridade</p>
              <Badge className={getPrioridadeColor(chamadoSelecionado.prioridade)}>{chamadoSelecionado.prioridade}</Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600">Data Abertura</p>
              <p className="font-semibold">{format(new Date(chamadoSelecionado.data_abertura), "dd/MM/yyyy")}</p>
            </div>
            {chamadoSelecionado.responsavel_nome && (
              <div>
                <p className="text-sm text-slate-600">Responsável</p>
                <p className="font-semibold">{chamadoSelecionado.responsavel_nome}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-2">Descrição</p>
            <div className="p-4 bg-slate-50 rounded-lg"><p>{chamadoSelecionado.descricao}</p></div>
          </div>
          {(chamadoSelecionado.mensagens || []).length > 0 && (
            <div>
              <p className="text-sm text-slate-600 mb-3">Histórico de Atendimento</p>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chamadoSelecionado.mensagens.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-lg ${msg.tipo === "Cliente" ? "bg-blue-50 border-l-4 border-blue-600" : "bg-slate-50 border-l-4 border-slate-400"}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">{msg.autor}</span>
                      <span className="text-xs text-slate-500">{format(new Date(msg.data), "dd/MM/yyyy HH:mm")}</span>
                    </div>
                    <p className="text-sm">{msg.mensagem}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {chamadoSelecionado.avaliacao && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-semibold text-amber-900 mb-2">Avaliação do Atendimento</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= chamadoSelecionado.avaliacao.nota ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                ))}
                <span className="ml-2 text-sm text-amber-900">{chamadoSelecionado.avaliacao.nota}/5</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}