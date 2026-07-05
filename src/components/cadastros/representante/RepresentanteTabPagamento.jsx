import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Sub-componente extraído de RepresentanteFormCompleto.jsx
 * Aba Pagamento: dados bancários e PIX.
 */
export default function RepresentanteTabPagamento({ formData, setFormData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Forma de Pagamento Preferencial</Label>
        <Select value={formData.forma_pagamento_comissao} onValueChange={(v) => setFormData({ ...formData, forma_pagamento_comissao: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="PIX">PIX</SelectItem><SelectItem value="Transferência">Transferência</SelectItem><SelectItem value="Boleto">Boleto</SelectItem><SelectItem value="Dinheiro">Dinheiro</SelectItem><SelectItem value="Crédito em Conta">Crédito em Conta</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label>Tipo de Chave PIX</Label>
        <Select value={formData.dados_bancarios?.tipo_pix || "CPF"} onValueChange={(v) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, tipo_pix: v } })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="CPF">CPF</SelectItem><SelectItem value="CNPJ">CNPJ</SelectItem><SelectItem value="E-mail">E-mail</SelectItem><SelectItem value="Telefone">Telefone</SelectItem><SelectItem value="Aleatória">Aleatória</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="col-span-2"><Label>Chave PIX</Label><Input value={formData.dados_bancarios?.pix_chave || ""} onChange={(e) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, pix_chave: e.target.value } })} placeholder="Digite a chave PIX" /></div>
      <div><Label>Banco</Label><Input value={formData.dados_bancarios?.banco || ""} onChange={(e) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, banco: e.target.value } })} placeholder="Ex: 001 - Banco do Brasil" /></div>
      <div><Label>Agência</Label><Input value={formData.dados_bancarios?.agencia || ""} onChange={(e) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, agencia: e.target.value } })} /></div>
      <div><Label>Conta</Label><Input value={formData.dados_bancarios?.conta || ""} onChange={(e) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, conta: e.target.value } })} /></div>
      <div><Label>Tipo de Conta</Label>
        <Select value={formData.dados_bancarios?.tipo_conta || "Corrente"} onValueChange={(v) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, tipo_conta: v } })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="Corrente">Corrente</SelectItem><SelectItem value="Poupança">Poupança</SelectItem></SelectContent>
        </Select>
      </div>
    </div>
  );
}