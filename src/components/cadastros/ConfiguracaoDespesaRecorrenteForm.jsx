import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Repeat, DollarSign, Calendar, Bell, Users } from "lucide-react";
import useDespesaRecorrenteForm from "./despesa-recorrente/useDespesaRecorrenteForm";
import DespesaRecorrenteTabGeral from "./despesa-recorrente/DespesaRecorrenteTabGeral";
import DespesaRecorrenteTabRecorrencia from "./despesa-recorrente/DespesaRecorrenteTabRecorrencia";
import DespesaRecorrenteTabAutomacao from "./despesa-recorrente/DespesaRecorrenteTabAutomacao";
import DespesaRecorrenteTabRateio from "./despesa-recorrente/DespesaRecorrenteTabRateio";

export default function ConfiguracaoDespesaRecorrenteForm({ config, windowMode = false, onSubmit }) {
  const {
    formData, setFormData, handleSubmit,
    tiposDespesa, empresas, fornecedores, centrosCusto, planoContas, centrosResultado, formasPagamento
  } = useDespesaRecorrenteForm(config, onSubmit);

  return (
    <div className={windowMode ? "w-full h-full flex flex-col" : ""}>
      <form onSubmit={handleSubmit} className={windowMode ? "flex-1 flex flex-col overflow-hidden" : ""}>
        <div className={windowMode ? "flex-1 overflow-auto p-6" : ""}>
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="geral"><DollarSign className="w-4 h-4 mr-2" />Geral</TabsTrigger>
              <TabsTrigger value="recorrencia"><Calendar className="w-4 h-4 mr-2" />Recorrência</TabsTrigger>
              <TabsTrigger value="automacao"><Repeat className="w-4 h-4 mr-2" />Automação</TabsTrigger>
              <TabsTrigger value="rateio"><Users className="w-4 h-4 mr-2" />Rateio</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-4">
              <DespesaRecorrenteTabGeral
                formData={formData} setFormData={setFormData}
                tiposDespesa={tiposDespesa} empresas={empresas} fornecedores={fornecedores}
                centrosCusto={centrosCusto} planoContas={planoContas}
                centrosResultado={centrosResultado} formasPagamento={formasPagamento}
              />
            </TabsContent>

            <TabsContent value="recorrencia" className="space-y-4 mt-4">
              <DespesaRecorrenteTabRecorrencia formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="automacao" className="space-y-4 mt-4">
              <DespesaRecorrenteTabAutomacao formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="rateio" className="space-y-4 mt-4">
              <DespesaRecorrenteTabRateio formData={formData} setFormData={setFormData} empresas={empresas} />
            </TabsContent>
          </Tabs>
        </div>

        <div className={windowMode ? "border-t bg-slate-50 p-4" : "mt-6"}>
          <div className="flex justify-end gap-3">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" data-action="Cadastros.ConfiguracaoDespesaRecorrente.salvar" data-sensitive="true">
              <Repeat className="w-4 h-4 mr-2" />
              {config ? 'Atualizar Configuração' : 'Criar Configuração'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}