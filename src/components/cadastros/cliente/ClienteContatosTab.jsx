import React from "react";
import GerenciarContatosClienteForm from "@/components/cadastros/GerenciarContatosClienteForm";

export default function ClienteContatosTab({ formData, setFormData }) {
  return (
    <GerenciarContatosClienteForm
      contatos={formData.contatos || []}
      onChange={(novosContatos) => setFormData({ ...formData, contatos: novosContatos })}
    />
  );
}