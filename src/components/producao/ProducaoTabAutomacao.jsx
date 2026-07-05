import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export default function ProducaoTabAutomacao({ formData, setFormData, isDisabled }) {
  return (
    <Card>
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center gap-2 text-base"><Settings className="w-5 h-5 text-blue-600" />Geração Automática de OP</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {[
          { id: "gerar-aprovar", key: "gerar_op_ao_aprovar", color: "green", label: "Gerar OP automaticamente ao aprovar pedido", desc: "Quando o pedido for aprovado, todos os itens de produção viram OP automaticamente." },
          { id: "gerar-faturar", key: "gerar_op_ao_faturar", color: "blue", label: "Gerar OP automaticamente ao faturar pedido", desc: "Quando a NF-e for emitida, gera as OPs pendentes." },
          { id: "permitir-sem-pedido", key: "permitir_op_sem_pedido", color: "purple", label: "Permitir criação de OP sem pedido", desc: "Permite criar OPs manuais (produção interna, testes, manutenção)." },
          { id: "gerar-etiqueta", key: "gerar_etiqueta_automatica", color: "amber", label: "Gerar etiquetas automaticamente ao criar OP", desc: "Gera etiquetas com QR Code para cada peça (função preparada)." },
        ].map(({ id, key, color, label, desc }) => (
          <div key={id} className={`flex items-center gap-3 p-4 bg-${color}-50 rounded border border-${color}-200`}>
            <input type="checkbox" id={id} checked={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
              disabled={isDisabled} className={`w-4 h-4 text-${color}-600 bg-gray-100 border-gray-300 rounded focus:ring-${color}-500`} />
            <div>
              <label htmlFor={id} className={`font-semibold text-${color}-900 cursor-pointer`}>{label}</label>
              <p className={`text-sm text-${color}-700`}>{desc}</p>
            </div>
          </div>
        ))}
        <div>
          <Label htmlFor="prazo_padrao_op_dias">Prazo Padrão de OP (dias)</Label>
          <Input id="prazo_padrao_op_dias" type="number" min="1" value={formData.prazo_padrao_op_dias}
            onChange={(e) => setFormData({ ...formData, prazo_padrao_op_dias: parseInt(e.target.value) || 0 })} disabled={isDisabled} className="mt-2" />
          <p className="text-sm text-slate-500 mt-1">Prazo padrão em dias para conclusão da OP (usado se não vier do pedido).</p>
        </div>
      </CardContent>
    </Card>
  );
}