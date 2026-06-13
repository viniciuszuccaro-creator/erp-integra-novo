import React from "react";
import GerenciarEnderecosClienteForm from "@/components/cadastros/GerenciarEnderecosClienteForm";

export default function ClienteEnderecosTab({ formData, setFormData }) {
  return (
    <GerenciarEnderecosClienteForm
      enderecos={formData.locais_entrega || []}
      onChange={(novosEnderecos) => setFormData({ ...formData, locais_entrega: novosEnderecos })}
    />
  );
}