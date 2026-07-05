import React from "react";
import { Users } from "lucide-react";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import CadastroClienteCompleto from "@/components/cadastros/CadastroClienteCompleto";

export default function ClientesTab({ windowMode = false }) {
  return (
    <div className="w-full h-full">
      <VisualizadorUniversalEntidade
        nomeEntidade="Cliente"
        tituloDisplay="Clientes"
        icone={Users}
        camposPrincipais={["nome","razao_social","cnpj","cpf","status","email","telefone","endereco_principal"]}
        componenteEdicao={CadastroClienteCompleto}
        queryKey={["clientes"]}
        windowMode={windowMode}
      />
    </div>
  );
}