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
          { id: "gerar-aprovar", key: "gerar_op_ao_aprovar", box: "bg-green-50 border-green-200", check: "text-green-600 focus:ring-green-500", title: "text-green-900", descClass: "text-green-700", label: "Gerar OP automaticamente ao aprovar pedido", desc: "Quando o pedido for aprovado, todos os itens de produção viram OP automaticamente." },
          { id: "gerar-faturar", key: "gerar_op_ao_faturar", box: "bg-blue-50 border-blue-200", check: "text-blue-600 focus:ring-blue-500", title: "text-blue-900", descClass: "text-blue-700", label: "Gerar OP automaticamente ao faturar pedido", desc: "Quando a NF-e for emitida, gera as OPs pendentes." },
          { id: "permitir-sem-pedido", key: "permitir_op_sem_pedido", box: "bg-purple-50 border-purple-200", check: "text-purple-600 focus:ring-purple-500", title: "text-purple-900", descClass: "text-purple-700", label: "Permitir criação de OP sem pedido", desc: "Permite criar OPs manuais (produção interna, testes, manutenção)." },
          { id: "gerar-etiqueta", key: "gerar_etiqueta_automatica", box: "bg-amber-50 border-amber-200", check: "text-amber-600 focus:ring-amber-500", title: "text-amber-900", descClass: "text-amber-700", label: "Gerar etiquetas automaticamente ao criar OP", desc: "Gera etiquetas com QR Code para cada peça (função preparada)." },
        ].map(({ id, key, box, check, title, descClass, label, desc }) => (
          <div key={id} className={`flex items-center gap-3 p-4 ${box} rounded border`}>
            <input type="checkbox" id={id} checked={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
              disabled={isDisabled} className={`w-4 h-4 ${check} bg-gray-100 border-gray-300 rounded`} />
            <div>
              <label htmlFor={id} className={`font-semibold ${title} cursor-pointer`}>{label}</label>
              <p className={`text-sm ${descClass}`}>{desc}</p>
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