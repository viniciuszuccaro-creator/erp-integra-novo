import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Save, Trash2, Power, PowerOff, DollarSign, Building2, TrendingUp, Target } from "lucide-react";
import FormWrapper from "@/components/common/FormWrapper";
import useRepresentanteForm from "./representante/useRepresentanteForm";
import RepresentanteTabDadosGerais from "./representante/RepresentanteTabDadosGerais";
import RepresentanteTabComissao from "./representante/RepresentanteTabComissao";
import RepresentanteTabPagamento from "./representante/RepresentanteTabPagamento";
import RepresentanteTabPerformance from "./representante/RepresentanteTabPerformance";
import RepresentanteTabClientes from "./representante/RepresentanteTabClientes";

/**
 * V21.1.2 - REFACTORED (Regra-Mãe)
 * 760 → ~100 linhas
 * Lógica em useRepresentanteForm, abas em /representante/
 */
export default function RepresentanteFormCompleto({ representante: representanteProp, item, data, isOpen, onClose, onSuccess, windowMode = false, onSave, onSubmit }) {
  const {
    representante, formData, setFormData, activeTab, setActiveTab, contextoValido,
    podeCriar, podeEditar, podeExcluir, regioes, clientesIndicados, totais,
    saveMutation, deleteMutation, handleSave, handleExcluir, handleAlternarStatus,
    handleDadosCNPJ, handleDadosCEP, ConfirmExcluirDialog, onCloseNorm
  } = useRepresentanteForm({ representante: representanteProp, item, data, onSuccess, onClose, onSave, onSubmit });

  const content = (
    <FormWrapper onSubmit={handleSave} externalData={formData}>
      <div className="border-b pb-4 px-6 pt-6 flex-shrink-0 bg-white sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-purple-600" />{representante?.id ? 'Editar Representante' : 'Novo Representante'}</h2>
            {representante?.id && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={formData.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{formData.status}</Badge>
                <Badge variant="outline">{formData.tipo_representante}</Badge>
                {formData.tipo_pessoa === 'Pessoa Física' && formData.cpf && <span className="text-sm text-slate-600">{formData.cpf}</span>}
                {formData.tipo_pessoa === 'Pessoa Jurídica' && formData.cnpj && <span className="text-sm text-slate-600">{formData.cnpj}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {representante?.id && (
              <>
                <Button variant="outline" onClick={handleAlternarStatus} disabled={!podeEditar || !contextoValido} data-permission="Cadastros.Representante.alterarStatus" data-sensitive className={formData.status === 'Ativo' ? 'border-orange-300' : 'border-green-300'}>
                  {formData.status === 'Ativo' ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
                </Button>
                <Button variant="destructive" onClick={handleExcluir} disabled={deleteMutation.isPending || !podeExcluir || !contextoValido} data-permission="Cadastros.Representante.excluir" data-sensitive>
                  <Trash2 className="w-4 h-4 mr-2" />{deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </>
            )}
            <Button onClick={handleSave} disabled={saveMutation.isPending || !contextoValido || (representante?.id ? !podeEditar : !podeCriar)} data-permission="Cadastros.Representante.salvar" data-sensitive className="bg-purple-600 hover:bg-purple-700">
              <Save className="w-4 h-4 mr-2" />{saveMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-5 flex-shrink-0 px-6 bg-slate-50">
          <TabsTrigger value="dados-gerais"><Users className="w-3 h-3 mr-1" />Dados Gerais</TabsTrigger>
          <TabsTrigger value="comissao"><DollarSign className="w-3 h-3 mr-1" />Comissão</TabsTrigger>
          <TabsTrigger value="pagamento"><Building2 className="w-3 h-3 mr-1" />Pagamento</TabsTrigger>
          <TabsTrigger value="performance" disabled={!representante?.id}><TrendingUp className="w-3 h-3 mr-1" />Performance</TabsTrigger>
          <TabsTrigger value="clientes" disabled={!representante?.id}><Target className="w-3 h-3 mr-1" />Clientes</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            <TabsContent value="dados-gerais" className="space-y-4 m-0 mt-4"><RepresentanteTabDadosGerais formData={formData} setFormData={setFormData} regioes={regioes} handleDadosCNPJ={handleDadosCNPJ} handleDadosCEP={handleDadosCEP} /></TabsContent>
            <TabsContent value="comissao" className="space-y-4 m-0 mt-4"><RepresentanteTabComissao formData={formData} setFormData={setFormData} /></TabsContent>
            <TabsContent value="pagamento" className="space-y-4 m-0 mt-4"><RepresentanteTabPagamento formData={formData} setFormData={setFormData} /></TabsContent>
            <TabsContent value="performance" className="space-y-4 m-0 mt-4"><RepresentanteTabPerformance clientesIndicados={clientesIndicados} totais={totais} formData={formData} representante={representante} /></TabsContent>
            <TabsContent value="clientes" className="space-y-4 m-0 mt-4"><RepresentanteTabClientes clientesIndicados={clientesIndicados} /></TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </FormWrapper>
  );

  if (windowMode) return <div className="w-full h-full flex flex-col bg-white">{content}<ConfirmExcluirDialog /></div>;

  return (
    <Dialog open={isOpen} onOpenChange={onCloseNorm}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] flex flex-col p-0 overflow-hidden">{content}<ConfirmExcluirDialog /></DialogContent>
    </Dialog>
  );
}