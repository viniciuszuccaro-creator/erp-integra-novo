import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export default function TabCondicoesComerciais({ fornecedor, prazoMedioEntrega, canEdit }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Condições Padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Condição de Pagamento:</span>
            <span className="font-semibold">{fornecedor.condicao_pagamento || '30 dias'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Prazo Médio de Entrega:</span>
            <span className="font-semibold">{Math.round(prazoMedioEntrega)} dias</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Desconto Médio:</span>
            <span className="font-semibold">{fornecedor.percentual_desconto || 0}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tabela de Preço:</span>
            <span className="font-semibold">{fornecedor.tabela_preco || 'Padrão'}</span>
          </div>
        </CardContent>
      </Card>

      {fornecedor.observacoes_contratuais && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Observações Contratuais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{fornecedor.observacoes_contratuais}</p>
          </CardContent>
        </Card>
      )}

      {canEdit('compras', 'fornecedores') && (
        <Button className="w-full">
          <Edit className="w-4 h-4 mr-2" />
          Editar Condições Comerciais
        </Button>
      )}
    </div>
  );
}