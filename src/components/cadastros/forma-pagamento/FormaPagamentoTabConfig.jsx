import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CreditCard, Landmark } from "lucide-react";

/**
 * Sub-componente: Aba Config da Forma de Pagamento
 * Escopo multiempresa, gateway/banco, disponibilidade PDV/E-commerce.
 */
export default function FormaPagamentoTabConfig({ formData, setFormData, bancos, gateways, contextoAtual }) {
  return (
    <div className="space-y-4">
      <Card className="border-purple-200 bg-purple-50"><CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2"><Building2 className="w-4 h-4 text-purple-600" /><Label className="font-semibold">Escopo Multiempresa</Label></div>
        <p className="text-xs text-slate-600 mb-3">Contexto: {contextoAtual === 'grupo' ? '🏢 Grupo Empresarial' : '🏪 Empresa Individual'}</p>
      </CardContent></Card>
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div><Label className="font-semibold">Gerar Cobrança Online</Label><p className="text-xs text-slate-500">Requer integração com gateway (Boleto/PIX)</p></div>
        <Switch checked={formData.gerar_cobranca_online} onCheckedChange={(v) => setFormData({ ...formData, gerar_cobranca_online: v })} />
      </div>
      {formData.gerar_cobranca_online && (
        <>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div><Label className="font-semibold">Usar Gateway de Pagamento</Label><p className="text-xs text-slate-500">Processador externo (Pagar.me, Stripe) ao invés de banco direto</p></div>
            <Switch checked={formData.usa_gateway || false} onCheckedChange={(v) => setFormData({ ...formData, usa_gateway: v, banco_vinculado_id: v ? '' : formData.banco_vinculado_id, gateway_pagamento_id: v ? formData.gateway_pagamento_id : '' })} />
          </div>
          {formData.usa_gateway ? (
            <div><Label>Gateway de Pagamento *</Label>
              <Select value={formData.gateway_pagamento_id || ''} onValueChange={(v) => { const gateway = gateways.find(g => g.id === v); setFormData({ ...formData, gateway_pagamento_id: v, gateway_pagamento_nome: gateway?.nome || '' }); }}>
                <SelectTrigger><SelectValue placeholder="Selecione o gateway..." /></SelectTrigger>
                <SelectContent>{gateways.map(g => <SelectItem key={g.id} value={g.id}><CreditCard className="w-4 h-4 inline mr-2" />{g.nome} ({g.provedor}) - {g.ambiente}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Configure gateways em Cadastros → Financeiro → Gateways de Pagamento</p>
            </div>
          ) : bancos.length > 0 && (
            <div><Label>Banco Vinculado (Boleto/PIX Bancário)</Label>
              <Select value={formData.banco_vinculado_id || ''} onValueChange={(v) => setFormData({ ...formData, banco_vinculado_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o banco..." /></SelectTrigger>
                <SelectContent>{bancos.map(banco => <SelectItem key={banco.id} value={banco.id}><Landmark className="w-4 h-4 inline mr-2" />{banco.nome_banco} - Ag: {banco.agencia} Conta: {banco.numero_conta}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
        </>
      )}
      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div><Label className="font-semibold">Integração Obrigatória</Label><p className="text-xs text-slate-500">Bloquear uso sem integração ativa</p></div>
        <Switch checked={formData.integracao_obrigatoria} onCheckedChange={(v) => setFormData({ ...formData, integracao_obrigatoria: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"><div><Label className="font-semibold">Disponível no PDV</Label><p className="text-xs text-slate-500">Aparece no Caixa PDV</p></div><Switch checked={formData.disponivel_pdv} onCheckedChange={(v) => setFormData({ ...formData, disponivel_pdv: v })} /></div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"><div><Label className="font-semibold">Disponível no E-commerce</Label><p className="text-xs text-slate-500">Aparece no Site/Portal</p></div><Switch checked={formData.disponivel_ecommerce} onCheckedChange={(v) => setFormData({ ...formData, disponivel_ecommerce: v })} /></div>
      </div>
      <div><Label>Observações</Label><Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} placeholder="Observações sobre uso desta forma de pagamento..." rows={3} /></div>
    </div>
  );
}