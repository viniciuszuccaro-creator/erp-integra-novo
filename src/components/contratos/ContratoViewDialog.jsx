import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Zap, CheckCircle } from "lucide-react";

const statusColors = {
  'Rascunho': 'bg-gray-100 text-gray-700',
  'Aguardando Assinatura': 'bg-yellow-100 text-yellow-700',
  'Vigente': 'bg-green-100 text-green-700',
  'Vencido': 'bg-red-100 text-red-700',
  'Rescindido': 'bg-orange-100 text-orange-700',
  'Renovado': 'bg-blue-100 text-blue-700'
};

export default function ContratoViewDialog({ contrato, onClose }) {
  if (!contrato) return null;

  return (
    <Dialog open={!!contrato} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Contrato</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Número</Label>
              <p className="font-bold text-lg">{contrato.numero_contrato}</p>
            </div>
            <div>
              <Label className="text-slate-600">Status</Label>
              <Badge className={statusColors[contrato.status]}>{contrato.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Tipo</Label>
              <p className="font-medium">{contrato.tipo}</p>
            </div>
            <div>
              <Label className="text-slate-600">Parte Contratante</Label>
              <p className="font-medium">{contrato.parte_contratante}</p>
            </div>
          </div>

          <div>
            <Label className="text-slate-600">Objeto</Label>
            <p className="font-medium">{contrato.objeto}</p>
          </div>

          {contrato.descricao && (
            <div>
              <Label className="text-slate-600">Descrição</Label>
              <p className="text-sm">{contrato.descricao}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Valor Mensal</Label>
              <p className="text-xl font-bold text-emerald-600">
                R$ {contrato.valor_mensal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <Label className="text-slate-600">Valor Total</Label>
              <p className="text-xl font-bold text-slate-900">
                R$ {contrato.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-600">Data Início</Label>
              <p className="font-medium">{contrato.data_inicio && new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <Label className="text-slate-600">Data Fim</Label>
              <p className="font-medium">{contrato.data_fim && new Date(contrato.data_fim).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <Label className="text-slate-600">Vigência</Label>
              <p className="font-medium">{contrato.vigencia_meses} meses</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Forma de Pagamento</Label>
              <p className="font-medium">{contrato.forma_pagamento}</p>
            </div>
            <div>
              <Label className="text-slate-600">Dia Vencimento</Label>
              <p className="font-medium">Dia {contrato.dia_vencimento}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Índice de Reajuste</Label>
              <p className="font-medium">{contrato.indice_reajuste}</p>
            </div>
            <div>
              <Label className="text-slate-600">Reajuste Anual</Label>
              <p className="font-medium">{contrato.percentual_reajuste}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-600">Renovação Automática</Label>
              <p className="font-medium">{contrato.renovacao_automatica ? 'Sim' : 'Não'}</p>
            </div>
            <div>
              <Label className="text-slate-600">Alertar Renovação</Label>
              <p className="font-medium">{contrato.prazo_aviso_renovacao} dias antes</p>
            </div>
          </div>

          {contrato.gerar_cobranca_automatica && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <p className="font-semibold text-purple-900">Cobrança Automática Ativa</p>
                </div>
                <div className="text-sm text-purple-800 space-y-1">
                  <p>Última cobrança: {contrato.ultima_cobranca_gerada ? new Date(contrato.ultima_cobranca_gerada).toLocaleDateString('pt-BR') : 'Nenhuma'}</p>
                  <p>Próxima cobrança: {contrato.proxima_cobranca ? new Date(contrato.proxima_cobranca).toLocaleDateString('pt-BR') : 'Pendente'}</p>
                  <p>Total de cobranças geradas: {contrato.contas_geradas_ids?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {contrato.responsavel_empresa && (
            <div>
              <Label className="text-slate-600">Responsável</Label>
              <p className="font-medium">{contrato.responsavel_empresa}</p>
            </div>
          )}

          {contrato.assinado && contrato.assinatura_digital && (
            <div className="border-t pt-4">
              <Label className="text-slate-600 mb-2 block">Assinatura Digital</Label>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold mb-1">Documento Assinado Digitalmente</p>
                    <p>Por: <strong>{contrato.assinatura_digital.nome_completo}</strong></p>
                    <p>Em: <strong>{contrato.data_assinatura && new Date(contrato.data_assinatura).toLocaleString('pt-BR')}</strong></p>
                    <p className="text-xs text-green-700 mt-1">
                      IP: {contrato.assinatura_digital.ip_address} |
                      {contrato.assinatura_digital.dispositivo} - {contrato.assinatura_digital.navegador}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {contrato.observacoes && (
            <div>
              <Label className="text-slate-600">Observações</Label>
              <p className="text-sm">{contrato.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}