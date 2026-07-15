import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Shield, Settings, AlertTriangle, Building2 } from "lucide-react";
import useConfigFiscal from "./config-fiscal/useConfigFiscal";
import FiscalTabProvedor from "./config-fiscal/FiscalTabProvedor";
import FiscalTabCertificado from "./config-fiscal/FiscalTabCertificado";
import FiscalTabSeries from "./config-fiscal/FiscalTabSeries";
import FiscalTabImpostos from "./config-fiscal/FiscalTabImpostos";

/**
 * REFACTORED (Regra-Mãe): 688 → ~70 linhas
 * Hook em useConfigFiscal, abas em /config-fiscal/
 */
export default function ConfigFiscalAutomatica({ empresaId, groupId }) {
  const { empresa, config, formData, setFormData, salvarMutation, certificadoValido, diasRestantes } = useConfigFiscal({ empresaId, groupId });

  if (!empresaId) {
    return (
      <Card><CardContent className="p-12 text-center text-slate-500"><Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>Selecione uma empresa para configurar</p></CardContent></Card>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); salvarMutation.mutate(); }} className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-bold text-lg text-blue-900">{empresa?.nome_fantasia || empresa?.razao_social}</p>
              <p className="text-sm text-blue-700">CNPJ: {empresa?.cnpj} | IE: {empresa?.inscricao_estadual || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {diasRestantes !== null && diasRestantes < 30 && (
        <Alert variant={diasRestantes < 0 ? "destructive" : "default"} className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            {diasRestantes < 0 ? <p className="font-semibold text-red-900">⚠️ Certificado VENCIDO há {Math.abs(diasRestantes)} dias!</p> : <p className="font-semibold text-orange-900">⚠️ Certificado expira em {diasRestantes} dias</p>}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="provedor">
        <TabsList className="bg-white border">
          <TabsTrigger value="provedor"><FileText className="w-4 h-4 mr-2" />Provedor NF-e</TabsTrigger>
          <TabsTrigger value="certificado"><Shield className="w-4 h-4 mr-2" />Certificado</TabsTrigger>
          <TabsTrigger value="series"><Settings className="w-4 h-4 mr-2" />Séries e Numeração</TabsTrigger>
          <TabsTrigger value="impostos"><FileText className="w-4 h-4 mr-2" />Alíquotas e CFOP</TabsTrigger>
        </TabsList>
        <TabsContent value="provedor" className="space-y-4"><FiscalTabProvedor formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="certificado" className="space-y-4"><FiscalTabCertificado formData={formData} setFormData={setFormData} certificadoValido={certificadoValido} diasRestantes={diasRestantes} /></TabsContent>
        <TabsContent value="series" className="space-y-4"><FiscalTabSeries formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="impostos" className="space-y-4"><FiscalTabImpostos formData={formData} setFormData={setFormData} /></TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={salvarMutation.isPending || !empresaId} data-sensitive="true" className="bg-green-600 hover:bg-green-700 min-w-[200px]">
          {salvarMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  );
}