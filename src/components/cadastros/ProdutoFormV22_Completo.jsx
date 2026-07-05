import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Package, Calculator, FileText, Globe, TrendingUp, Warehouse, Trash2, Power, PowerOff, Save } from "lucide-react";
import FormWrapper from "@/components/common/FormWrapper";
import useProdutoForm from "./produto/useProdutoForm";
const HistoricoProduto = React.lazy(() => import("./HistoricoProduto"));
const FiscalContabilSection = React.lazy(() => import("./produto/FiscalContabilSection"));
const EstoqueAvancadoSection = React.lazy(() => import("./produto/EstoqueAvancadoSection"));
const PrecosSection = React.lazy(() => import("./produto/PrecosSection"));
const PesoDimensoesSection = React.lazy(() => import("./produto/PesoDimensoesSection"));
const DadosGeraisTab = React.lazy(() => import("./produto/DadosGeraisTab"));
const ConversoesTab = React.lazy(() => import("./produto/ConversoesTab"));
const EcommerceTab = React.lazy(() => import("./produto/EcommerceTab"));

/**
 * REFACTORED (Regra-Mãe): 584 → ~120 linhas
 * Lógica em useProdutoForm, abas já delegadas em /produto/
 */
function ProdutoFormV22_Completo({ produto, onSubmit, onSuccess, isSubmitting, windowMode = false, closeSelf }) {
  const {
    abaAtiva, setAbaAtiva, formData, setFormData, contextoValido, podeCriar, podeEditar, podeExcluir,
    iaSugestao, processandoIA, sugestoesIA, gerandoDescricaoSEO, gerandoImagem,
    analisarDescricaoIA, aplicarSugestaoIA, gerarDescricaoSEO, gerarImagemIA,
    todosProdutos, setores, grupos, marcas, locaisEstoque, planoContas,
    uploadingFoto, calculoConversao, modoManual, setModoManual,
    handleUploadFoto, toggleUnidadeSecundaria, handleDadosNCM,
    submitProduto, handleExcluir, handleAlternarStatus
  } = useProdutoForm({ produto, onSubmit, onSuccess, closeSelf });

  const content = (
    <FormWrapper onSubmit={submitProduto} externalData={formData} className="w-full h-full overflow-auto p-6 space-y-6">
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-blue-900">🤖 Assistência de IA</p>
              <p className="text-xs text-blue-700">A IA pode sugerir NCM, grupo, bitola e unidades automaticamente</p>
            </div>
            <div className="flex items-center gap-3"><Label className="text-sm">Preencher manualmente</Label><Switch checked={modoManual} onCheckedChange={setModoManual} /></div>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-7 w-full bg-slate-100">
          <TabsTrigger value="dados-gerais"><Package className="w-4 h-4 mr-1" />Dados Gerais</TabsTrigger>
          <TabsTrigger value="conversoes"><Calculator className="w-4 h-4 mr-1" />Conversões</TabsTrigger>
          <TabsTrigger value="dimensoes"><Package className="w-4 h-4 mr-1" />Peso/Dim</TabsTrigger>
          <TabsTrigger value="ecommerce"><Globe className="w-4 h-4 mr-1" />E-Commerce</TabsTrigger>
          <TabsTrigger value="fiscal-contabil"><FileText className="w-4 h-4 mr-1" />Fiscal</TabsTrigger>
          <TabsTrigger value="estoque-avancado"><Warehouse className="w-4 h-4 mr-1" />Estoque</TabsTrigger>
          <TabsTrigger value="historico"><TrendingUp className="w-4 h-4 mr-1" />Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dados-gerais" className="space-y-6">
          <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}>
            <DadosGeraisTab formData={formData} setFormData={setFormData} produto={produto} todosProdutos={todosProdutos} setores={setores} grupos={grupos} marcas={marcas} iaSugestao={iaSugestao} modoManual={modoManual} processandoIA={processandoIA} analisarDescricaoIA={analisarDescricaoIA} aplicarSugestaoIA={aplicarSugestaoIA} gerarImagemIA={gerarImagemIA} gerandoImagem={gerandoImagem} uploadingFoto={uploadingFoto} handleUploadFoto={handleUploadFoto} calculoConversao={calculoConversao} contextoValido={contextoValido} podeCriar={podeCriar} podeEditar={podeEditar} podeExcluir={podeExcluir} />
          </Suspense>
          <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}><PrecosSection formData={formData} setFormData={setFormData} /></Suspense>
          <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-lg"><CardContent className="p-4"><Label>Status</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem><SelectItem value="Descontinuado">Descontinuado</SelectItem></SelectContent></Select>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="conversoes" className="space-y-6"><Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}><ConversoesTab formData={formData} setFormData={setFormData} toggleUnidadeSecundaria={toggleUnidadeSecundaria} calculoConversao={calculoConversao} /></Suspense></TabsContent>
        <TabsContent value="dimensoes" className="space-y-6"><Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}><PesoDimensoesSection formData={formData} setFormData={setFormData} /></Suspense></TabsContent>
        <TabsContent value="ecommerce" className="space-y-6"><Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}><EcommerceTab formData={formData} setFormData={setFormData} modoManual={modoManual} gerarDescricaoSEO={gerarDescricaoSEO} gerandoDescricaoSEO={gerandoDescricaoSEO} /></Suspense></TabsContent>
        <TabsContent value="fiscal-contabil" className="space-y-6"><Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}><FiscalContabilSection formData={formData} setFormData={setFormData} sugestoesIA={sugestoesIA} handleDadosNCM={handleDadosNCM} planoContas={planoContas} /></Suspense></TabsContent>
        <TabsContent value="estoque-avancado" className="space-y-6"><Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}><EstoqueAvancadoSection formData={formData} setFormData={setFormData} locaisEstoque={locaisEstoque} /></Suspense></TabsContent>
        <TabsContent value="historico" className="space-y-6">
          {produto ? (<Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}><HistoricoProduto produtoId={produto.id} produto={produto} /></Suspense>) : (<Card className="border-blue-200 bg-white/60 backdrop-blur-md shadow-lg"><CardContent className="p-12 text-center"><TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" /><p className="text-slate-600">O histórico estará disponível após criar o produto</p></CardContent></Card>)}
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-white">
        <div className="flex gap-2">
          {produto && (
            <>
              <Button type="button" variant="outline" data-permission="Cadastros.Produto.alterarStatus" data-sensitive onClick={handleAlternarStatus} disabled={!podeEditar || !contextoValido} className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}>
                {formData.status === 'Ativo' ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
              </Button>
              <Button type="button" variant="destructive" data-permission="Cadastros.Produto.excluir" data-sensitive onClick={handleExcluir} disabled={!podeExcluir || !contextoValido}><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>
            </>
          )}
        </div>
        <Button type="submit" data-permission="Cadastros.Produto.salvar" data-sensitive disabled={isSubmitting || !contextoValido || (produto?.id ? !podeEditar : !podeCriar)} className="bg-purple-600 hover:bg-purple-700 px-8">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{!isSubmitting && <Save className="w-4 h-4 mr-2" />}{produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) return <div className="w-full h-full bg-white">{content}</div>;
  return content;
}

export default React.memo(ProdutoFormV22_Completo);