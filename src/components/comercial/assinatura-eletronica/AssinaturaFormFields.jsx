import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Campos do formulário de dados do assinante (nome, CPF, email, cargo).
 */
export default function AssinaturaFormFields({ dadosAssinatura, setDadosAssinatura }) {
  const update = (field) => (e) =>
    setDadosAssinatura(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Nome Completo *</Label>
        <Input
          value={dadosAssinatura.nome_completo}
          onChange={update("nome_completo")}
          required
        />
      </div>
      <div>
        <Label>CPF *</Label>
        <Input
          value={dadosAssinatura.cpf}
          onChange={update("cpf")}
          placeholder="000.000.000-00"
          required
        />
      </div>
      <div>
        <Label>E-mail</Label>
        <Input
          type="email"
          value={dadosAssinatura.email}
          onChange={update("email")}
        />
      </div>
      <div>
        <Label>Cargo</Label>
        <Input
          value={dadosAssinatura.cargo}
          onChange={update("cargo")}
          placeholder="Ex: Diretor"
        />
      </div>
    </div>
  );
}