import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";

/** Sub-componente: Aba Contato e Endereço do Fornecedor */
export default function FornecedorTabContato({ formData, setFormData, handleDadosCEP }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
      <div><Label htmlFor="telefone">Telefone</Label><Input id="telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} /></div>
      <div className="col-span-2"><Label htmlFor="contato_responsavel">Contato Responsável</Label><Input id="contato_responsavel" value={formData.contato_responsavel} onChange={(e) => setFormData({ ...formData, contato_responsavel: e.target.value })} placeholder="Nome do responsável" /></div>
      <div><Label htmlFor="cep">CEP</Label><Input id="cep" value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} placeholder="00000-000" /></div>
      <div><Label>&nbsp;</Label><BotaoBuscaAutomatica tipo="cep" valor={formData.cep} onDadosEncontrados={handleDadosCEP} disabled={!formData.cep || formData.cep.replace(/\D/g, '').length < 8} /></div>
      <div className="col-span-2"><Label htmlFor="endereco">Endereço Completo</Label><Input id="endereco" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} placeholder="Rua, Número, Bairro" /></div>
      <div><Label htmlFor="cidade">Cidade</Label><Input id="cidade" value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} /></div>
      <div><Label htmlFor="estado">Estado</Label><Input id="estado" value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} maxLength={2} placeholder="SP" /></div>
    </div>
  );
}