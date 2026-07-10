import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, DollarSign, Save, Package, Calculator, Sparkles, CheckCircle2, Trash2, Power, PowerOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TabelaPrecoCalculoTab from "@/components/cadastros/TabelaPrecoCalculoTab";
import TabelaPrecoItensTab from "@/components/cadastros/TabelaPrecoItensTab";
import useTabelaPrecoForm from "./tabela-preco/useTabelaPrecoForm";

/**
 * V21.0 - REFACTORED (Regra-Mãe)
 * 691 → ~90 linhas
 * Lógica em useTabelaPrecoForm, abas já delegadas em TabelaPrecoCalculoTab/TabelaPrecoItensTab
 */
export default function TabelaPrecoFormCompleto({ tabela, onSubmit, windowMode = false }) {
  const {
    formData, setFormData, activeTab, setActiveTab, modoInclusao, setModoInclusao,
    calculando, searchProduto, setSearchProduto, itensTabela, filtroLote, setFiltroLote,
    regraCalculo, setRegraCalculo, produtos, setoresAtividade, gruposProduto, marcas,
    produtosFiltrados, produtosDisponiveis, podeAvancar, contextoValido, podeCriar, podeEditar, podeExcluir, salvando,
    handleAdicionarProdutoIndividual, handleAdicionarProdutosLote, handleRecalcularPrecos, handleSugerirPrecosIA,
    handleRemoverItem, handleExcluir, handleAlternarStatus, handleSalvar, ConfirmExcluirDialog
  } = useTabelaPrecoForm({ tabela, onSubmit });

  const content = (
    <div className={`space-y-4 flex flex-col ${windowMode ? 'h-full p-6' : ''}`}>
      <Alert className="border-purple-300 bg-purple-50"><Sparkles className="w-4 h-4 text-purple-600" /><AlertDescription className="text-sm text-purple-900">🚀 <strong>V21.0:</strong> Tabela de Preço reconstruída com Dupla Classificação, Multiempresa e IA PriceBrain 3.0</AlertDescription></Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config"><DollarSign className="w-4 h-4 mr-2" />Configuração</TabsTrigger>
          <TabsTrigger value="itens" disabled={!podeAvancar}><Package className="w-4 h-4 mr-2" />Produtos ({itensTabela.length})</TabsTrigger>
          <TabsTrigger value="calculo" disabled={itensTabela.length === 0}><Calculator className="w-4 h-4 mr-2" />IA + Motor</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {/* Aba Config */}
          <TabsContent value="config" className="space-y-4 mt-4">
            <Card className="border-blue-200 bg-blue-50"><CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-blue-900">⚙️ Identificação da Tabela</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Código</Label><Input value={formData.codigo || '— auto —'} readOnly className="bg-slate-100 text-slate-500" placeholder="— auto —" /></div>
                <div className="col-span-2"><Label>Nome da Tabela *</Label><Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} placeholder="Ex: Atacado SP, Varejo Nacional, Tabela Obra" required /></div>
              </div>
              <div><Label>Descrição</Label><Input value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Detalhes sobre aplicação desta tabela" /></div>
              <div><Label>Tipo de Tabela *</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Padrão">Padrão</SelectItem><SelectItem value="Atacado">Atacado</SelectItem><SelectItem value="Varejo">Varejo</SelectItem>
                    <SelectItem value="Obra">Obra/Projeto</SelectItem><SelectItem value="Marketplace">Marketplace</SelectItem><SelectItem value="Promocional">Promocional</SelectItem><SelectItem value="VIP">VIP/Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data Início *</Label><Input type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} required /></div>
                <div><Label>Data Fim (Opcional)</Label><Input type="date" value={formData.data_fim} onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })} /><p className="text-xs text-slate-500 mt-1">Deixe vazio para vigência indeterminada</p></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded border"><div><Label>Compartilhar com Grupo</Label><p className="text-xs text-slate-500">Todas empresas do grupo podem usar</p></div><Switch checked={formData.compartilhar_grupo} onCheckedChange={(v) => setFormData({ ...formData, compartilhar_grupo: v })} /></div>
              <div className="flex items-center justify-between p-3 bg-white rounded border"><div><Label>Tabela Ativa</Label><p className="text-xs text-slate-500">Disponível para uso em pedidos</p></div><Switch checked={formData.ativo} onCheckedChange={(v) => setFormData({ ...formData, ativo: v })} /></div>
              {podeAvancar && <Alert className="border-green-200 bg-green-50"><CheckCircle2 className="w-4 h-4 text-green-600" /><AlertDescription className="text-sm text-green-900">✅ Configuração OK! Avance para "Produtos" ou salve apenas a estrutura.</AlertDescription></Alert>}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="itens" className="space-y-4 mt-4">
            <TabelaPrecoItensTab modoInclusao={modoInclusao} setModoInclusao={setModoInclusao} searchProduto={searchProduto} setSearchProduto={setSearchProduto} produtosFiltrados={produtosFiltrados}
              handleAdicionarProdutoIndividual={handleAdicionarProdutoIndividual} filtroLote={filtroLote} setFiltroLote={setFiltroLote}
              setoresAtividade={setoresAtividade} gruposProduto={gruposProduto} marcas={marcas} handleAdicionarProdutosLote={handleAdicionarProdutosLote}
              produtosDisponiveis={produtosDisponiveis} produtos={produtos} itensTabela={itensTabela} handleRemoverItem={handleRemoverItem} />
          </TabsContent>

          <TabsContent value="calculo" className="space-y-4 mt-4">
            <TabelaPrecoCalculoTab regraCalculo={regraCalculo} setRegraCalculo={setRegraCalculo} calculando={calculando} itensTabela={itensTabela} handleRecalcularPrecos={handleRecalcularPrecos} handleSugerirPrecosIA={handleSugerirPrecosIA} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer fixo */}
      <div className="flex items-center justify-between pt-4 border-t bg-white p-4 -mx-6 -mb-6 sticky bottom-0">
        <div className="text-sm">
          <p className="font-semibold text-slate-900">{itensTabela.length} produtos na tabela</p>
          {itensTabela.length > 0 && <p className="text-xs text-slate-600">Margem média: {(itensTabela.reduce((sum, i) => sum + (i.margem_percentual || 0), 0) / itensTabela.length).toFixed(1)}%</p>}
        </div>
        <div className="flex gap-2">
          {tabela && (
            <>
              <Button type="button" variant="outline" data-permission="Cadastros.TabelaPreco.alterarStatus" onClick={handleAlternarStatus} disabled={!podeEditar || !contextoValido} className={formData.ativo ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}>
                {formData.ativo ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
              </Button>
              <Button type="button" variant="destructive" data-permission="Cadastros.TabelaPreco.excluir" onClick={handleExcluir} disabled={!podeExcluir || !contextoValido}><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>
            </>
          )}
          <Button type="button" data-permission="Comercial.TabelaPreco.salvar" onClick={handleSalvar} disabled={salvando || !podeAvancar || !contextoValido || (tabela?.id ? !podeEditar : !podeCriar)} className="bg-green-600 hover:bg-green-700 min-w-[180px]" data-permission="Comercial.TabelaPreco.editar">
            {salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{!salvando && <Save className="w-4 h-4 mr-2" />}{tabela ? 'Salvar Alterações' : 'Criar Tabela'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (windowMode) return <div className="w-full h-full bg-white overflow-auto">{content}</div>;
  return <>{content}<ConfirmExcluirDialog /></>;
}