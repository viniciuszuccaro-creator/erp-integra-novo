import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";

/**
 * Sub-componente extraído de RepresentanteFormCompleto.jsx
 * Aba Pagamento: dados bancários e PIX.
 */
export default function RepresentanteTabPagamento({ formData, setFormData }) {
  const { formasPagamento, bancos, isLoading: loadingFormas } = useFormasPagamento();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Forma de Pagamento Preferencial</Label>
        <Select value={formData.forma_pagamento_comissao} onValueChange={(v) => setFormData({ ...formData, forma_pagamento_comissao: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]">
            {loadingFormas && <SelectItem value="_loading" disabled>Carregando...</SelectItem>}
            {!loadingFormas && formasPagamento.length === 0 && <SelectItem value="_empty" disabled>Nenhuma forma cadastrada</SelectItem>}
            {formasPagamento.map((f) => (
              <SelectItem key={f.id} value={f.descricao || f.tipo}>{f.descricao || f.tipo}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Tipo de Chave PIX</Label>
        <Select value={formData.dados_bancarios?.tipo_pix || "CPF"} onValueChange={(v) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, tipo_pix: v } })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="CPF">CPF</SelectItem><SelectItem value="CNPJ">CNPJ</SelectItem><SelectItem value="E-mail">E-mail</SelectItem><SelectItem value="Telefone">Telefone</SelectItem><SelectItem value="Aleatória">Aleatória</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="col-span-2"><Label>Chave PIX</Label><Input value={formData.dados_bancarios?.pix_chave || ""} onChange={(e) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, pix_chave: e.target.value } })} placeholder="Digite a chave PIX" /></div>
      <div><Label>Banco</Label>
        <Select value={formData.dados_bancarios?.banco || ""} onValueChange={(v) => setFormData({ ...formData, dados_bancarios: { ...formData.dados_bancarios, banco: v } })}>
          <SelectTrigger><SelectValue placeholder="Selecione o banco" /></SelectTrigger><SelectContent className="z-[99999]">
            {bancos.map((b) => (
              <SelectItem key={b.id} value={b.codigo_banco ? `${b.codigo_banco} - ${b.nome_banco || b.nome}` : (b.nome_banco || b.nome)}>
                {b.codigo_banco ? `${b.codigo_banco} - ${b.nome_banco || b.nome}` : (b.nome_banco || b.nome)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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