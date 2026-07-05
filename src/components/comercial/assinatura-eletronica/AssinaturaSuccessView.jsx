import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";

/**
 * Tela de sucesso exibida após a assinatura ser registrada.
 */
export default function AssinaturaSuccessView({ dadosAssinatura, onBaixar, onConcluir }) {
  return (
    <div className="py-12 text-center">
      <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-green-900 mb-2">
        Documento Assinado!
      </h3>
      <p className="text-green-800 mb-6">
        Sua assinatura foi registrada com sucesso
      </p>
      <Card className="p-6 max-w-md mx-auto mb-6 text-left">
        <p className="font-semibold mb-3">Detalhes da Assinatura:</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Assinante:</span>
            <strong>{dadosAssinatura.nome_completo}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">CPF:</span>
            <strong>{dadosAssinatura.cpf}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Data/Hora:</span>
            <strong>{new Date().toLocaleString('pt-BR')}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">IP:</span>
            <strong>{dadosAssinatura.ip_address}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Dispositivo:</span>
            <strong>{dadosAssinatura.dispositivo} - {dadosAssinatura.navegador}</strong>
          </div>
        </div>
      </Card>
      <div className="flex justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBaixar}
          data-permission="Comercial.Assinatura.visualizar"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Comprovante
        </Button>
        <Button
          onClick={onConcluir}
          data-permission="Comercial.Assinatura.criar"
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Concluir
        </Button>
      </div>
    </div>
  );
}