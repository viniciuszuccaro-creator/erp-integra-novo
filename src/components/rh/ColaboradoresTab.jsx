import React from "react";
import { Users } from "lucide-react";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import ColaboradorForm from "@/components/rh/ColaboradorForm";

export default function ColaboradoresTab({ windowMode = false }) {
  return (
    <div className="w-full h-full">
      <VisualizadorUniversalEntidade
        nomeEntidade="Colaborador"
        tituloDisplay="Colaboradores"
        icone={Users}
        camposPrincipais={["nome_completo","cpf","email","cargo","departamento","status"]}
        componenteEdicao={ColaboradorForm}
        queryKey={["colaboradores"]}
        windowMode={windowMode}
      />
    </div>
  );
}