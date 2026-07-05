import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";

export default function NotasFiscaisDetailsDialog({ viewingDetails, setViewingDetails }) {
  if (!viewingDetails) return null;
  return (
    <Dialog open={!!viewingDetails} onOpenChange={() => setViewingDetails(null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>📄 Detalhes NF-e {viewingDetails.numero}/{viewingDetails.serie}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-600">Cliente/Fornecedor</Label>
              <p className="font-semibold">{viewingDetails.cliente_fornecedor}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Status</Label>
              <Badge className={viewingDetails.status === 'Autorizada' ? 'bg-green-600' : viewingDetails.status === 'Cancelada' ? 'bg-red-600' : 'bg-yellow-600'}>
                {viewingDetails.status}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Chave de Acesso</Label>
              <p className="font-mono text-xs">{viewingDetails.chave_acesso || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Protocolo</Label>
              <p className="font-mono text-xs">{viewingDetails.protocolo_autorizacao || '-'}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Valor Produtos</Label>
              <p className="text-lg font-bold text-green-600">R$ {viewingDetails.valor_produtos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Valor Total</Label>
              <p className="text-lg font-bold text-blue-600">R$ {viewingDetails.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          {viewingDetails.observacoes && (
            <div>
              <Label className="text-xs text-slate-600">Observações</Label>
              <p className="text-sm p-3 bg-slate-50 rounded">{viewingDetails.observacoes}</p>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            {viewingDetails.danfe_url && (
              <Button data-permission="Fiscal.NotaFiscal.baixar_pdf" onClick={() => window.open(viewingDetails.danfe_url, '_blank')}>
                <Download className="w-4 h-4 mr-2" /> Baixar DANFE
              </Button>
            )}
            <Button variant="outline" data-permission="Fiscal.NotaFiscal.visualizar" onClick={() => setViewingDetails(null)}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}