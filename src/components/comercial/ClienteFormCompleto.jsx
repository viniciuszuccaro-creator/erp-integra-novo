import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, CreditCard, MapPin, FileText, Paperclip, History } from "lucide-react";
import FormWrapper from "@/components/common/FormWrapper";
import { clienteCompletoSchema } from './cliente/clienteCompletoSchema';
import useClienteForm from './cliente/useClienteForm';

const PrincipalTab = React.lazy(() => import("@/components/comercial/cliente/PrincipalTab"));
const ComercialTab = React.lazy(() => import("@/components/comercial/cliente/ComercialTab"));
const EntregaTab = React.lazy(() => import("@/components/comercial/cliente/EntregaTab"));
const FiscalTab = React.lazy(() => import("@/components/comercial/cliente/FiscalTab"));
const DocumentosTab = React.lazy(() => import("@/components/comercial/cliente/DocumentosTab"));
const HistoricoTab = React.lazy(() => import("@/components/comercial/cliente/HistoricoTab"));

/**
 * REFACTORED (Regra-Mãe): 521 → ~80 linhas
 * Lógica em useClienteForm, abas já delegadas em /cliente/
 */
function ClienteFormCompleto({ cliente, onSubmit, isSubmitting, onCancel }) {
  const {
    activeTab, setActiveTab, formData, setFormData, buscandoCep, buscandoCnpj,
    buscarCep, buscarCnpj, adicionarContato, removerContato, adicionarLocalEntrega, removerLocalEntrega,
    geocodificarEndereco, handleUploadDocumento, removerDocumento, handleSubmit
  } = useClienteForm({ cliente, onSubmit, onCancel });

  if (!formData) return null;

  return (
    <FormWrapper schema={clienteCompletoSchema} onSubmit={handleSubmit} externalData={formData} className="space-y-4 w-full h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="principal"><User className="w-4 h-4 mr-2" />Principal</TabsTrigger>
          <TabsTrigger value="comercial"><CreditCard className="w-4 h-4 mr-2" />Comercial</TabsTrigger>
          <TabsTrigger value="entrega"><MapPin className="w-4 h-4 mr-2" />Entrega</TabsTrigger>
          <TabsTrigger value="fiscal"><FileText className="w-4 h-4 mr-2" />Fiscal</TabsTrigger>
          <TabsTrigger value="documentos"><Paperclip className="w-4 h-4 mr-2" />Documentos</TabsTrigger>
          <TabsTrigger value="historico"><History className="w-4 h-4 mr-2" />Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="principal" className="space-y-4">
          <Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}>
            <PrincipalTab formData={formData} setFormData={setFormData} buscarCep={buscarCep} buscandoCep={buscandoCep} buscarCnpj={buscarCnpj} buscandoCnpj={buscandoCnpj} adicionarContato={adicionarContato} removerContato={removerContato} />
          </Suspense>
        </TabsContent>
        <TabsContent value="comercial" className="space-y-4">
          <Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><ComercialTab formData={formData} setFormData={setFormData} /></Suspense>
        </TabsContent>
        <TabsContent value="entrega" className="space-y-4">
          <Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><EntregaTab locaisEntrega={formData.locais_entrega || []} onAddLocal={adicionarLocalEntrega} onRemoveLocal={removerLocalEntrega} onGeocode={geocodificarEndereco} formData={formData} setFormData={setFormData} /></Suspense>
        </TabsContent>
        <TabsContent value="fiscal" className="space-y-4">
          <Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><FiscalTab formData={formData} setFormData={setFormData} /></Suspense>
        </TabsContent>
        <TabsContent value="documentos" className="space-y-4">
          <Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><DocumentosTab formData={formData} setFormData={setFormData} handleUploadDocumento={handleUploadDocumento} removerDocumento={removerDocumento} /></Suspense>
        </TabsContent>
        <TabsContent value="historico" className="space-y-4">
          <Suspense fallback={<div className="h-24 rounded-md bg-slate-100 animate-pulse" />}><HistoricoTab cliente={cliente} formData={formData} /></Suspense>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white/80 backdrop-blur z-10">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" data-permission="Cadastros.Cliente.salvar" data-sensitive disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : cliente ? 'Atualizar Cliente' : 'Cadastrar Cliente'}</Button>
      </div>
    </FormWrapper>
  );
}

export default React.memo(ClienteFormCompleto);