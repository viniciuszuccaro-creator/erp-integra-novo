import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Save, Star, Trash2, Power, PowerOff } from "lucide-react";
import useFornecedorForm from "./fornecedor/useFornecedorForm";
import FornecedorTabDadosGerais from "./fornecedor/FornecedorTabDadosGerais";
import FornecedorTabContato from "./fornecedor/FornecedorTabContato";
import FornecedorTabAvaliacoes from "./fornecedor/FornecedorTabAvaliacoes";

/**
 * REFACTORED (Regra-Mãe): 683 → ~75 linhas
 * Hook em useFornecedorForm, abas em /fornecedor/
 */
export default function CadastroFornecedorCompleto({ fornecedor: fornecedorProp, item, data, isOpen, onClose, onSuccess, windowMode = false, onSubmit, onSave }) {
  const {
    fornecedor, formData, setFormData, activeTab, setActiveTab, contextoValido, podeCriar, podeEditar, podeExcluir,
    saveMutation, deleteMutation, handleExcluir, handleAlternarStatus, handleSave, handleDadosCNPJ, handleDadosCEP, handleDadosRNTRC, ConfirmExcluirDialog
  } = useFornecedorForm({ fornecedor: fornecedorProp, item, data, onClose, onSuccess, onSubmit, onSave });

  const content = (
    <>
      <div className="border-b pb-4 px-6 pt-6 flex-shrink-0 bg-white sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-cyan-600" />{fornecedor?.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
            {fornecedor?.id && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={formData.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{formData.status}</Badge>
                <span className="text-sm text-slate-600">{formData.cnpj}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {fornecedor?.id && (
              <>
                <Button type="button" variant="outline" data-sensitive onClick={handleAlternarStatus} disabled={!contextoValido} className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}>
                  {formData.status === 'Ativo' ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
                </Button>
                <Button type="button" variant="destructive" data-sensitive onClick={handleExcluir} disabled={deleteMutation.isPending || !podeExcluir || !contextoValido}>
                  <Trash2 className="w-4 h-4 mr-2" />{deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </>
            )}
            <Button onClick={handleSave} data-sensitive disabled={saveMutation.isPending || !contextoValido || (fornecedor?.id ? !podeEditar : !podeCriar)} className="bg-cyan-600 hover:bg-cyan-700">
              <Save className="w-4 h-4 mr-2" />{saveMutation.isPending ? 'Salvando...' : 'Salvar Fornecedor'}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0 px-6 bg-slate-50">
          <TabsTrigger value="dados-gerais" className="text-xs"><Building2 className="w-3 h-3 mr-1" />Dados Gerais</TabsTrigger>
          <TabsTrigger value="contato" className="text-xs"><Phone className="w-3 h-3 mr-1" />Contato e Endereço</TabsTrigger>
          <TabsTrigger value="avaliacoes" className="text-xs" disabled={!fornecedor?.id}><Star className="w-3 h-3 mr-1" />Avaliações</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
            <TabsContent value="dados-gerais" className="space-y-6 m-0 mt-4">
              <FornecedorTabDadosGerais formData={formData} setFormData={setFormData} fornecedor={fornecedor} handleDadosCNPJ={handleDadosCNPJ} handleDadosRNTRC={handleDadosRNTRC} />
            </TabsContent>
            <TabsContent value="contato" className="space-y-6 m-0 mt-4">
              <FornecedorTabContato formData={formData} setFormData={setFormData} handleDadosCEP={handleDadosCEP} />
            </TabsContent>
            <TabsContent value="avaliacoes" className="m-0 mt-4">
              <FornecedorTabAvaliacoes formData={formData} fornecedor={fornecedor} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </>
  );

  if (windowMode) return <div className="w-full h-full flex flex-col bg-white">{content}<ConfirmExcluirDialog /></div>;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full overflow-hidden flex flex-col p-0">{content}<ConfirmExcluirDialog /></DialogContent>
    </Dialog>
  );
}