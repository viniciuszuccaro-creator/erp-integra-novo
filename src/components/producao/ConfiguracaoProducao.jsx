import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Unlock, Save, Settings, Package, TrendingDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useConfigProducao from "./useConfigProducao";
import ProducaoTabPerdas from "./ProducaoTabPerdas";
import ProducaoTabAutomacao from "./ProducaoTabAutomacao";
import ProducaoTabEstoque from "./ProducaoTabEstoque";

export default function ConfiguracaoProducao({ empresaId }) {
  const { toast } = useToast();
  const { config, produtos, formData, setFormData, saveMutation, toggleBloquear, isAdmin, isDisabled } = useConfigProducao({ empresaId });

  const handleSalvar = () => {
    if (config?.bloqueado_edicao && !isAdmin) { toast({ title: "❌ Acesso Negado", description: "Configurações bloqueadas por administrador", variant: "destructive" }); return; }
    saveMutation.mutate(formData);
  };

  return (
    <Tabs defaultValue="perdas" className="space-y-6">
      <TabsList className="bg-white border shadow-sm">
        <TabsTrigger value="perdas"><TrendingDown className="w-4 h-4 mr-2" />Perdas e Custos</TabsTrigger>
        <TabsTrigger value="automacao"><Settings className="w-4 h-4 mr-2" />Automação</TabsTrigger>
        <TabsTrigger value="estoque"><Package className="w-4 h-4 mr-2" />Integração Estoque</TabsTrigger>
      </TabsList>

      <TabsContent value="perdas" className="space-y-6">
        {config?.bloqueado_edicao ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Configurações Bloqueadas</p>
                <p className="text-sm text-red-700">Bloqueado por {config.bloqueado_por} em {new Date(config.bloqueado_em).toLocaleString("pt-BR")}</p>
              </div>
            </div>
            {isAdmin && <Button data-permission="Producao.Configuracao.bloquear" onClick={() => toggleBloquear.mutate(false)} variant="outline" className="border-red-300"><Unlock className="w-4 h-4 mr-2" />Desbloquear</Button>}
          </div>
        ) : isAdmin ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Unlock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Configurações Desbloqueadas</p>
                <p className="text-sm text-blue-700">Todos os usuários podem editar estas configurações</p>
              </div>
            </div>
            <Button data-permission="Producao.Configuracao.bloquear" onClick={() => toggleBloquear.mutate(true)} variant="outline" className="border-blue-300"><Lock className="w-4 h-4 mr-2" />Bloquear Edição</Button>
          </div>
        ) : null}
        <ProducaoTabPerdas formData={formData} setFormData={setFormData} isDisabled={isDisabled} />
      </TabsContent>

      <TabsContent value="automacao" className="space-y-6">
        <ProducaoTabAutomacao formData={formData} setFormData={setFormData} isDisabled={isDisabled} />
      </TabsContent>

      <TabsContent value="estoque" className="space-y-6">
        <ProducaoTabEstoque formData={formData} setFormData={setFormData} isDisabled={isDisabled} produtos={produtos} />
      </TabsContent>

      {config?.historico_alteracoes?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Histórico de Alterações</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {config.historico_alteracoes.slice(-10).reverse().map((registro, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded border text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{registro.campo}</p>
                      <p className="text-slate-600">
                        De: <span className="font-mono">{typeof registro.valor_anterior === "boolean" ? (registro.valor_anterior ? "Sim" : "Não") : registro.valor_anterior?.toString()}</span> →
                        Para: <span className="font-mono text-green-600">{typeof registro.valor_novo === "boolean" ? (registro.valor_novo ? "Sim" : "Não") : registro.valor_novo?.toString()}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{new Date(registro.data).toLocaleString("pt-BR")}</p>
                      <p className="text-xs text-slate-600">{registro.usuario}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button data-permission="Producao.ConfiguracaoProducao.salvar" onClick={handleSalvar} disabled={isDisabled || saveMutation.isPending} className="bg-green-600 hover:bg-green-700 min-w-[200px]">
          <Save className="w-4 h-4 mr-2" />{saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </Tabs>
  );
}