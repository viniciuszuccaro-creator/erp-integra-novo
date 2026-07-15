import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Calculator } from "lucide-react";
import { toast } from "sonner";

export default function FreteCard({
  formData,
  setFormData,
  freteGratis,
  onCalcularFrete,
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" />
            Informações de Frete
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onCalcularFrete}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calcular Frete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Tipo de Logística *</Label>
            <select
              value={formData?.tipo_frete || "CIF"}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, tipo_frete: e.target.value }));
                if (e.target.value === "Retirada") {
                  setFormData((prev) => ({ ...prev, valor_frete: 0 }));
                  toast.info("💡 RETIRADA - cliente buscará no local");
                } else {
                  toast.info("💡 ENTREGA - será enviado ao cliente");
                }
              }}
              className="w-full p-2 border rounded-lg"
            >
              <option value="CIF">🚚 ENTREGA - CIF (Por nossa conta)</option>
              <option value="FOB">🚚 ENTREGA - FOB (Por conta do cliente)</option>
              <option value="Retirada">📦 RETIRADA no local</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {formData?.tipo_frete === "Retirada"
                ? "📦 Cliente retirará o pedido na empresa"
                : "🚚 Pedido será entregue no endereço"}
            </p>
          </div>

          <div>
            <Label>Valor do Frete</Label>
            <Input
              type="number"
              step="0.01"
              value={freteGratis ? 0 : formData?.valor_frete || 0}
              onChange={(e) =>
                !freteGratis &&
                setFormData((prev) => ({ ...prev, valor_frete: parseFloat(e.target.value) || 0 }))
              }
              disabled={freteGratis}
              className={freteGratis ? "bg-green-50 font-bold text-green-600" : ""}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Previsão Entrega</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const diasProducao =
                    (formData?.itens_armado_padrao?.length || 0) > 0 ||
                    (formData?.itens_corte_dobra?.length || 0) > 0
                      ? 7
                      : 2;
                  const diasFrete = 3;
                  const dataEntrega = new Date();
                  dataEntrega.setDate(dataEntrega.getDate() + diasProducao + diasFrete);
                  setFormData((prev) => ({
                    ...prev,
                    data_prevista_entrega: dataEntrega.toISOString().split("T")[0],
                  }));
                  toast.success(`📅 Data sugerida: +${diasProducao} dias produção + ${diasFrete} dias frete`);
                }}
                className="h-6 text-xs"
              >
                Sugerir
              </Button>
            </div>
            <Input
              type="date"
              value={formData?.data_prevista_entrega || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, data_prevista_entrega: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Janela de Entrega - Início</Label>
            <Input
              type="time"
              value={formData?.endereco_entrega_principal?.horario_inicio || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    horario_inicio: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div>
            <Label>Janela de Entrega - Fim</Label>
            <Input
              type="time"
              value={formData?.endereco_entrega_principal?.horario_fim || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    horario_fim: e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}