import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, Building2, Calendar, User } from "lucide-react";
import { format } from "date-fns";

/**
 * V21.1.2 - Modal para visualizar espelhos de um documento de GRUPO
 * Mostra como o documento foi distribuído para as empresas
 * e o status de cada título gerado
 * WINDOW MODE READY
 */
export default function VerEspelhosModal({ open, onClose, documento, tipo = "ContaPagar", windowMode = false, onBaixarGrupo }) {
  if (!documento || !documento.distribuicao_realizada) {
    return null;
  }

  const distribuicao = documento.distribuicao_realizada;
  const totalValor = distribuicao.reduce((sum, d) => sum + d.valor, 0);
  const totalPago = distribuicao.reduce((sum, d) => {
    if (d.status === 'Pago' || d.status === 'Recebido') {
      return sum + d.valor;
    }
    return sum;
  }, 0);
  const percentualPago = totalValor > 0 ? (totalPago / totalValor) * 100 : 0;

  const todosPagos = distribuicao.every(d => d.status === 'Pago' || d.status === 'Recebido');
  const algunsPagos = distribuicao.some(d => d.status === 'Pago' || d.status === 'Recebido');

  const statusGeral = todosPagos ? 'Total' : algunsPagos ? 'Parcial' : 'Pendente';
  const corStatusGeral = todosPagos ? 'text-green-600' : algunsPagos ? 'text-orange-600' : 'text-slate-600';

  const getStatusIcon = (status) => {
    if (status === 'Pago' || status === 'Recebido') {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    if (status === 'Atrasado') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-orange-600" />;
  };

  const getStatusColor = (status) => {
    if (status === 'Pago' || status === 'Recebido') {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    if (status === 'Atrasado') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const content = (
    <div className={`space-y-4 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      {!windowMode && (
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">Distribuição para Empresas</h2>
        </div>
      )}

      {/* RESUMO DO DOCUMENTO DE GRUPO */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-semibold">Documento de Grupo</p>
                  <p className="text-lg font-bold text-blue-900">{documento.descricao}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">Valor Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-blue-700">
                {documento.fornecedor && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {documento.fornecedor || documento.cliente}
                  </div>
                )}
                {documento.data_vencimento && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Vencimento: {format(new Date(documento.data_vencimento), 'dd/MM/yyyy')}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-blue-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-700">Situação do Grupo:</span>
                  <div className="flex items-center gap-2">
                    <Badge className={`${
                      statusGeral === 'Total' ? 'bg-green-100 text-green-700' :
                      statusGeral === 'Parcial' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {statusGeral}
                    </Badge>
                    <span className={`text-lg font-bold ${corStatusGeral}`}>
                      {percentualPago.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {percentualPago > 0 && percentualPago < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full transition-all duration-300"
                        style={{ width: `${percentualPago}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TÍTULOS POR EMPRESA */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Títulos nas Empresas
          </h3>

          {distribuicao.map((dist, idx) => (
            <Card key={idx} className={`border-2 ${
              dist.status === 'Pago' || dist.status === 'Recebido' 
                ? 'border-green-200 bg-green-50' 
                : dist.status === 'Atrasado'
                ? 'border-red-200 bg-red-50'
                : 'border-slate-200 bg-white'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(dist.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900">{dist.empresa_nome}</p>
                        <Badge variant="outline" className="text-xs">
                          {dist.percentual}%
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        R$ {dist.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <Badge className={getStatusColor(dist.status)}>
                          {dist.status}
                        </Badge>
                        
                        {(dist.status === 'Pago' || dist.status === 'Recebido') && dist.data_pagamento && (
                          <span className="text-xs text-slate-600">
                            em {format(new Date(dist.data_pagamento), 'dd/MM/yyyy HH:mm')}
                          </span>
                        )}
                      </div>

                      {dist.usuario_baixa && (
                        <p className="text-xs text-slate-500 mt-1">
                          por {dist.usuario_baixa}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* INFORMAÇÕES ADICIONAIS */}
        {documento.politica_distribuicao_nome && (
          <Card className="bg-slate-50">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600">
                <span className="font-semibold">Política aplicada:</span> {documento.politica_distribuicao_nome}
              </p>
              {documento.created_date && (
                <p className="text-xs text-slate-600 mt-1">
                  <span className="font-semibold">Distribuído em:</span> {format(new Date(documento.created_date), 'dd/MM/yyyy HH:mm')}
                </p>
              )}
              {documento.created_by && (
                <p className="text-xs text-slate-600 mt-1">
                  <span className="font-semibold">Por:</span> {documento.created_by}
                </p>
              )}
            </CardContent>
          </Card>
        )}

      {/* AÇÕES */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        {!todosPagos && (
          <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => onBaixarGrupo?.(documento)}
            data-action={tipo === 'ContaPagar' ? 'Financeiro.ContaPagar.baixar' : 'Financeiro.ContaReceber.baixar'}
            data-sensitive="true"
          >
            Baixar no Grupo
          </Button>
        )}
      </div>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Distribuição para Empresas
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}