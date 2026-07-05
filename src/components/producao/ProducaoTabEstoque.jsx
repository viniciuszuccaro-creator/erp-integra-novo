import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Package, AlertTriangle } from "lucide-react";

export default function ProducaoTabEstoque({ formData, setFormData, isDisabled, produtos }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-base"><Package className="w-5 h-5 text-green-600" />Integração com Estoque</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="text-base mb-3 block">Modo de Integração com Estoque *</Label>
            <Select value={formData.modo_integracao_estoque} onValueChange={(v) => setFormData({ ...formData, modo_integracao_estoque: v })} disabled={isDisabled}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione o modo de integração..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reserva"><div className="py-1"><p className="font-semibold">Somente Reserva</p><p className="text-xs text-slate-600">Reserva material mas não baixa automaticamente.</p></div></SelectItem>
                <SelectItem value="reserva_baixa"><div className="py-1"><p className="font-semibold">Reserva + Baixa na Conclusão</p><p className="text-xs text-slate-600">Reserva ao criar e baixa quando concluir OP.</p></div></SelectItem>
                <SelectItem value="manual"><div className="py-1"><p className="font-semibold">Baixa Manual por Apontamento</p><p className="text-xs text-slate-600">Operador informa consumo real no apontamento.</p></div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          {[
            { id: "produto_arame_recozido_id", label: "Produto Padrão: Arame Recozido 18", filter: "arame", desc: "Produto usado para baixa automática de arame recozido." },
            { id: "produto_sucata_id", label: "Produto Padrão: Sucata/Retalho", filter: "sucata", desc: "Produto usado para registrar sobras e refugo.", filterAlt: "retalho" },
          ].map(({ id, label, filter, filterAlt, desc }) => (
            <div key={id}>
              <Label htmlFor={id}>{label}</Label>
              <Select value={formData[id]} onValueChange={(v) => setFormData({ ...formData, [id]: v })} disabled={isDisabled}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione o produto..." /></SelectTrigger>
                <SelectContent>
                  {produtos.filter((p) => p.descricao?.toLowerCase().includes(filter) || (filterAlt && p.descricao?.toLowerCase().includes(filterAlt))).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.codigo ? `${p.codigo} - ` : ""}{p.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 mt-1">{desc}</p>
            </div>
          ))}
          <Separator />
          {[
            { id: "exigir-bitola", key: "exigir_bitola_cadastrada", color: "orange", label: "Exigir bitola cadastrada no estoque", desc: "Não permite criar OP com bitola que não existe no cadastro de produtos." },
            { id: "bloquear-sem-estoque", key: "bloquear_op_sem_estoque", color: "red", label: "Bloquear liberação de OP sem estoque disponível", desc: 'OP fica com status "Aguardando Matéria-Prima" se não tiver material.' },
            { id: "baixa-maior", key: "permitir_baixa_maior_teorico", color: "purple", label: "Permitir baixa de estoque maior que o teórico", desc: "Permite consumo real maior que o planejado (útil para retrabalhos)." },
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
        </CardContent>
      </Card>
      <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
        <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-yellow-600" /><p className="font-semibold text-yellow-900">Atenção - Integração com Estoque</p></div>
        <p className="text-sm text-yellow-800">As configurações de estoque afetam diretamente a disponibilidade de material para produção. Se ativar "Bloquear sem estoque", pedidos podem ficar parados aguardando compra.</p>
      </div>
    </div>
  );
}