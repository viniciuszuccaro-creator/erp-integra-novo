import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FormasPagamentoIntegracaoTab({ formasPagamento }) {
  const formasOnline = formasPagamento.filter(f => f.gerar_cobranca_online);

  return (
    <div className="space-y-6 w-full h-full">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="bg-blue-100 border-b border-blue-200">
          <CardTitle className="text-blue-900">Status de Integração</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {formasOnline.map(forma => (
              <div key={forma.id} className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{forma.icone}</span>
                    <div>
                      <p className="font-semibold">{forma.descricao}</p>
                      <p className="text-xs text-slate-500">{forma.tipo}</p>
                    </div>
                  </div>
                  {forma.integracao_obrigatoria ? (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Integração Ativa
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-600">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Opcional
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {formasOnline.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhuma forma configurada para cobrança online</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="text-purple-900">Guia de Configuração</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm mb-1">1️⃣ PIX</p>
              <p className="text-xs text-slate-600">Configure um banco com suporte a PIX e ative "Gerar Cobrança Online"</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-sm mb-1">2️⃣ Boleto</p>
              <p className="text-xs text-slate-600">Configure um banco com suporte a Boleto e vincule à forma de pagamento</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="font-semibold text-sm mb-1">3️⃣ Cartão</p>
              <p className="text-xs text-slate-600">Configure gateway de pagamento para processar cartões de crédito/débito</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}