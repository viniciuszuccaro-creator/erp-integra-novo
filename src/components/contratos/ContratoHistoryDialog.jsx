import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Bell, CheckCircle } from "lucide-react";

export default function ContratoHistoryDialog({ contrato, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico do Contrato {contrato?.numero_contrato}</DialogTitle>
        </DialogHeader>
        {contrato && (
          <div className="space-y-6">
            {/* Histórico de Renovações */}
            {contrato.historico_renovacoes && contrato.historico_renovacoes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  Renovações e Reajustes
                </h4>
                <div className="space-y-2">
                  {contrato.historico_renovacoes.map((renovacao, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{renovacao.observacao}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(renovacao.data_renovacao).toLocaleDateString('pt-BR')} - Por {renovacao.usuario}
                          </p>
                          <div className="text-sm mt-2">
                            <p>Valor anterior: <span className="font-semibold">R$ {renovacao.valor_anterior?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                            <p>Valor novo: <span className="font-semibold text-green-600">R$ {renovacao.valor_novo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                            {renovacao.percentual_reajuste > 0 && (
                              <p>Reajuste: <Badge className="bg-blue-100 text-blue-700">{renovacao.percentual_reajuste}% ({renovacao.indice_utilizado})</Badge></p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico de Alertas */}
            {contrato.alertas_enviados && contrato.alertas_enviados.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-orange-600" />
                  Alertas Enviados
                </h4>
                <div className="space-y-2">
                  {contrato.alertas_enviados.map((alerta, idx) => (
                    <Card key={idx} className="p-3 bg-orange-50 border-orange-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-orange-900">{alerta.tipo}</p>
                          <p className="text-sm text-orange-700">
                            Enviado em {new Date(alerta.data_envio).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-orange-600">Para: {alerta.destinatario}</p>
                        </div>
                        {alerta.enviado && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}