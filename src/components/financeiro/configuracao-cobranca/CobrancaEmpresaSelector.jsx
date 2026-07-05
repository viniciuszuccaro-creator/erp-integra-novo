import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle } from "lucide-react";

/**
 * Lista de empresas para seleção na configuração de cobrança
 * Extraído de ConfiguracaoCobranca.jsx
 */
export default function CobrancaEmpresaSelector({ empresas, configsExistentes, empresaSelecionada, onSelecionar }) {
  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-base">Selecione a Empresa</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-3">
          {empresas.map(empresa => {
            const config = configsExistentes.find(c => c.empresa_id === empresa.id);
            const estaConfigurada = config && config.ativo;
            return (
              <Card key={empresa.id}
                className={`cursor-pointer transition-all ${
                  empresaSelecionada?.id === empresa.id
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : estaConfigurada
                      ? 'border-2 border-green-300 hover:border-green-500'
                      : 'border hover:border-slate-300'
                }`}
                onClick={() => onSelecionar(empresa)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold">{empresa.nome_fantasia || empresa.razao_social}</p>
                        <p className="text-xs text-slate-600">CNPJ: {empresa.cnpj}</p>
                      </div>
                    </div>
                    {estaConfigurada && (
                      <Badge className="bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />Configurado
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}