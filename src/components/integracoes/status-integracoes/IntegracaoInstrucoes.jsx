import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, MessageCircle } from 'lucide-react';

const INSTRUCTIONS = [
  {
    icon: FileText, cor: 'blue',
    title: '1. NF-e (eNotas.io ou NFe.io)',
    steps: [
      'Crie conta em eNotas.com.br ou NFe.io',
      'Obtenha sua API Key',
      'Configure em: Fiscal → Configurações → Integração NF-e',
      'Faça upload do Certificado Digital A1',
    ],
  },
  {
    icon: DollarSign, cor: 'green',
    title: '2. Boletos/PIX (Asaas)',
    steps: [
      'Crie conta em Asaas.com',
      'Ative sua conta (necessita CNPJ e documentos)',
      'Obtenha API Key em: Integrações → Sua Chave de API',
      'Configure em: Financeiro → Configurações → Gateway de Pagamento',
    ],
  },
  {
    icon: MessageCircle, cor: 'emerald',
    title: '3. WhatsApp Business (Evolution API)',
    steps: [
      'Opção 1: Hospede sua própria Evolution API',
      'Opção 2: Use serviço gerenciado (diversos no mercado)',
      'Configure URL e API Key',
      'Escaneie QR Code para conectar seu WhatsApp',
      'Configure em: Integrações → WhatsApp Business',
    ],
  },
];

export default function IntegracaoInstrucoes() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base">Como Configurar as Integrações</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {INSTRUCTIONS.map((inst, idx) => {
            const Icon = inst.icon;
            return (
              <div key={idx} className={`flex items-start gap-3 p-3 bg-${inst.cor}-50 rounded-lg border border-${inst.cor}-200`}>
                <Icon className={`w-5 h-5 text-${inst.cor}-600 flex-shrink-0 mt-0 />
                <div>
                  <p className={`font-semibold text-${inst.cor}-900`}>{inst.title}</p>
                  <p className={`text-sm text-${inst.cor}-700 mt-1`}>
                    {inst.steps.map((s, i) => <React.Fragment key={i}>• {s}<br/></React.Fragment>)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}