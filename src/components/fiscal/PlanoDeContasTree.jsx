import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, Plus, Edit, TrendingUp, TrendingDown } from "lucide-react";

/**
 * Componente de Plano de Contas em árvore hierárquica
 */
export default function PlanoDeContasTree({ empresaId }) {
  const [expandido, setExpandido] = useState({});
  const [search, setSearch] = useState("");

  const { data: contas = [] } = useRLSQuery(
    'PlanoDeContas', {}, 'codigo', 200,
    { enabled: !!empresaId }
  );

  const toggleExpand = (contaId) => {
    setExpandido(prev => ({ ...prev, [contaId]: !prev[contaId] }));
  };

  const buildTree = (contas, parentId = null) => {
    return contas
      .filter(c => c.conta_superior_id === parentId)
      .sort((a, b) => a.codigo_conta.localeCompare(b.codigo_conta));
  };

  const renderConta = (conta, nivel = 0) => {
    const filhos = buildTree(contas, conta.id);
    const temFilhos = filhos.length > 0;
    const estaExpandido = expandido[conta.id];

    const matchSearch = search === "" || 
      conta.codigo_conta.toLowerCase().includes(search.toLowerCase()) ||
      conta.descricao_conta.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch && search !== "") return null;

    return (
      <div key={conta.id}>
        <div
          className={`flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer ${
            nivel === 0 ? 'font-bold' : ''
          }`}
          style={{ paddingLeft: `${nivel * 24 + 8}px` }}
          onClick={() => temFilhos && toggleExpand(conta.id)}
        >
          {temFilhos ? (
            estaExpandido ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )
          ) : (
            <div className="w-4"></div>
          )}

          <span className="font-mono text-sm text-slate-600 min-w-[120px]">
            {conta.codigo_conta}
          </span>

          <span className="flex-1 text-sm">{conta.descricao_conta}</span>

          <Badge variant="outline" className="text-xs">
            {conta.tipo}
          </Badge>

          {conta.saldo_atual !== 0 && (
            <Badge className={conta.saldo_atual > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              R$ {Math.abs(conta.saldo_atual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Badge>
          )}

          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Edit className="w-3 h-3" />
          </Button>
        </div>

        {temFilhos && estaExpandido && (
          <div>
            {filhos.map(filho => renderConta(filho, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  const contasRaiz = buildTree(contas, null);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Buscar conta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          {contasRaiz.length > 0 ? (
            contasRaiz.map(conta => renderConta(conta, 0))
          ) : (
            <div className="text-center py-12 text-slate-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma conta cadastrada</p>
              <p className="text-sm mt-2">Crie o plano de contas da empresa</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}