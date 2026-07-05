import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Factory, AlertCircle } from "lucide-react";

/**
 * Step 4 do GerarOPModal: Confirmação de conclusão
 */
export default function GerarOPStepConcluido({ opsGeradas, onFechar }) {
  return (
    <div className="space-y-6">
      <Card className="p-8 text-center bg-green-50 border-green-200">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">OP Gerada com Sucesso!</h3>
        <p className="text-green-800 mb-4">Uma Ordem de Produção foi criada e vinculada ao pedido.</p>
        <Badge className="bg-green-600 text-lg px-4 py-2">Pedido agora em: {opsGeradas[0]?.status}</Badge>
      </Card>

      <div>
        <h3 className="font-semibold mb-3">OP Criada:</h3>
        <div className="space-y-2">
          {opsGeradas.map((op, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Factory className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{op.numero_op}</p>
                    <p className="text-sm text-slate-600">Total de {op.itens_total} itens de produção</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-700">{op.status}</Badge>
                  <p className="text-xs text-slate-500 mt-1">Peso total planejado: {op.peso_teorico_total_kg.toFixed(0)} kg</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Próximos Passos:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Acesse o módulo Produção para acompanhar a OP criada.</li>
              <li>Verifique os materiais necessários e o status do estoque.</li>
              <li>Inicie a produção e registre o progresso das etapas.</li>
              <li>Ao concluir, marque a OP como "Concluída".</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" onClick={onFechar} data-permission="Producao.OrdemProducao.criar" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-4 h-4 mr-2" />
          Concluir
        </Button>
      </div>
    </div>
  );
}