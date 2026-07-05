import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ExternalLink, Building2 } from "lucide-react";
import SearchInput from "@/components/ui/SearchInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IconeAcessoFornecedor from "@/components/cadastros/IconeAcessoFornecedor";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useContextoVisual from "@/components/lib/useContextoVisual";
import VisualizadorUniversalEntidade from "@/components/cadastros/VisualizadorUniversalEntidadeV24";
import CadastroFornecedorCompleto from "@/components/cadastros/CadastroFornecedorCompleto";

export default function FornecedoresTab({ fornecedores, windowMode = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  
  const { estaNoGrupo, empresasDoGrupo } = useContextoVisual();

  const filteredFornecedores = fornecedores.filter(f => {
    const matchSearch = f.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       f.cnpj?.includes(searchTerm);
    const matchStatus = selectedStatus === "todos" || f.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const obterNomeEmpresa = (empresaId) => {
    if (!empresaId) return '-';
    const empresa = empresasDoGrupo.find(e => e.id === empresaId);
    return empresa?.nome_fantasia || empresa?.razao_social || '-';
  };

  const content = (
    <div className="w-full h-full">
      <VisualizadorUniversalEntidade
        nomeEntidade="Fornecedor"
        tituloDisplay="Fornecedores"
        icone={Package}
        camposPrincipais={["nome","razao_social","cnpj","categoria","status","telefone","email"]}
        componenteEdicao={CadastroFornecedorCompleto}
        queryKey={["fornecedores"]}
        windowMode={windowMode}
      />
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-cyan-50 overflow-auto p-1.5">{content}</div>;
  }

  return content;
}