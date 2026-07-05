import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download } from "lucide-react";

/**
 * View de sucesso após assinatura do documento
 * Extraído de AssinaturaEletronicaForm.jsx
 */
export default function AssinaturaSucessoView({ dadosAssinatura, onBaixarComprovante }) {
  const detalhes = [
    ['Assinante', dadosAssinatura.nome_completo],
    ['CPF', dadosAssinatura.cpf],
    ['Data/Hora', new Date().toLocaleString('pt-BR')],
    ['IP', dadosAssinatura.ip_address],
    ['Dispositivo', `${dadosAssinatura.dispositivo} - ${dadosAssinatura.navegador}`]
  ];

  return (
    <div className="py-12 text-center">
      <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-green-900 mb-2">Documento Assinado!</h3>
      <p className="text-green-800 mb-6">Sua assinatura foi registrada com sucesso</p>

      <Card className="p-6 max-w-md mx-auto mb-6 text-left">
        <p className="font-semibold mb-3">Detalhes da Assinatura:</p>
        <div className="space-y-2 text-sm">
          {detalhes.map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-slate-600">{label}:</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-center gap-3">
        <Button type="button" variant="outline" data-permission="Sistema.AssinaturaEletronica.baixar" onClick={onBaixarComprovante}>
          <Download className="w-4 h-4 mr-2" />Baixar Comprovante
        </Button>
      </div>
    </div>
  );
}