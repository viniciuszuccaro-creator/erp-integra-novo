import React, { useState, useEffect, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Sparkles, Package, Upload, Calculator, 
  CheckCircle2, AlertTriangle, FileText, Globe, 
  TrendingUp, ArrowRightLeft, ShoppingCart, Image, Warehouse,
  Trash2, Power, PowerOff, Save
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import FormWrapper from "@/components/common/FormWrapper";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";
const HistoricoProduto = React.lazy(() => import("./HistoricoProduto"));
const FiscalContabilSection = React.lazy(() => import("./produto/FiscalContabilSection"));
const EstoqueAvancadoSection = React.lazy(() => import("./produto/EstoqueAvancadoSection"));
const PrecosSection = React.lazy(() => import("./produto/PrecosSection"));
const PesoDimensoesSection = React.lazy(() => import("./produto/PesoDimensoesSection"));
import useProdutoIA from "./produto/useProdutoIA";
import { buildInitialFormData } from "./produto/useProdutoFormState";
import DadosGeraisTab from "./produto/DadosGeraisTab";
import ConversoesTab from "./produto/ConversoesTab";
import EcommerceTab from "./produto/EcommerceTab";

/**
 * V21.4 ETAPA 2/3 COMPLETA - CADASTRO COMPLETO DE PRODUTOS
 * ✅ Aba 1: Dados Gerais + TRIPLA CLASSIFICAÇÃO (Setor + Grupo + Marca)
 * ✅ Aba 2: Conversões (unidades, fatores)
 * ✅ Aba 3: Dimensões & Peso (frete/e-commerce)
 * ✅ Aba 4: E-Commerce & IA
 * ✅ Aba 5: Fiscal e Contábil (NOVO)
 * ✅ Aba 6: Estoque Avançado (NOVO)
 * ✅ Aba 7: Histórico (se edição)
 */
function ProdutoFormV22_Completo({ produto, onSubmit, onSuccess, isSubmitting, windowMode = false, closeSelf }) {
  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [user, setUser] = useState(null);
  const {
    empresaAtual,
    grupoAtual,
    carimbarContexto,
    filterInContext,
    createInContext,
    updateInContext,
    deleteInContext
  } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeCriar = canCreate("Cadastros", "Produto") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Produto") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Produto") || canDelete("Cadastros", null);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };
    loadUser();
  }, []);

  const [formData, setFormData] = useState(() => buildInitialFormData(produto));

  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [calculoConversao, setCalculoConversao] = useState(null);
  const [modoManual, setModoManual] = useState(false);
  const {
    iaSugestao, setIaSugestao, processandoIA, sugestoesIA, setSugestoesIA,
    gerandoDescricaoSEO, gerandoImagem,
    analisarDescricaoIA, aplicarSugestaoIA, gerarDescricaoSEO, gerarImagemIA
  } = useProdutoIA({ formData, setFormData });

  // V22.0: Query de produtos para auto-incremento
  const { data: todosProdutos = [] } = useQuery({
    queryKey: ['produtos-codes-sample', contextKey],
    queryFn: () => filterInContext('Produto', {}, '-created_date', 100),
    staleTime: 300000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: !produto && abaAtiva === 'dados-gerais' && contextoValido,
  });

  useEffect(() => {
    if (!produto && !formData.codigo && Array.isArray(todosProdutos)) {
      const ultimoCodigo = todosProdutos
        .map(p => p.codigo)
        .filter(c => c && /^\d+$/.test(c))
        .map(c => parseInt(c))
        .sort((a, b) => b - a)[0] || 0;
      const proximoCodigo = (ultimoCodigo + 1).toString().padStart(4, '0');
      setFormData(prev => ({ ...prev, codigo: proximoCodigo }));
    }
  }, [todosProdutos, produto, formData.codigo]);

  // V21.2 FASE 2: Queries dos estruturantes
  const { data: setores = [] } = useQuery({
    queryKey: ['setores-atividade', contextKey],
    queryFn: () => filterInContext('SetorAtividade', {}, 'nome', 200),
    staleTime: 300000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: abaAtiva === 'dados-gerais' && contextoValido,
  });

  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos-produto', contextKey],
    queryFn: () => filterInContext('GrupoProduto', {}, 'nome', 200),
    staleTime: 300000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: abaAtiva === 'dados-gerais' && contextoValido,
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas', contextKey],
    queryFn: () => filterInContext('Marca', {}, 'nome', 200),
    staleTime: 300000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: abaAtiva === 'dados-gerais' && contextoValido,
  });

  const { data: locaisEstoque = [] } = useQuery({
    queryKey: ['locais-estoque', contextKey],
    queryFn: () => filterInContext('LocalEstoque', {}, 'nome', 200),
    staleTime: 300000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: abaAtiva === 'estoque-avancado' && contextoValido,
  });

  const { data: planoContas = [] } = useQuery({
    queryKey: ['plano-contas', contextKey],
    queryFn: () => filterInContext('PlanoDeContas', {}, 'codigo', 500),
    staleTime: 300000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    enabled: abaAtiva === 'fiscal-contabil' && contextoValido,
  });

  useEffect(() => {
    if (formData.eh_bitola) {
      recalcularFatoresConversao();
    }
  }, [formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m, formData.eh_bitola]);

  useEffect(() => {
    if (formData.altura_cm > 0 && formData.largura_cm > 0 && formData.comprimento_cm > 0) {
      const volume_m3 = (formData.altura_cm * formData.largura_cm * formData.comprimento_cm) / 1000000;
      setFormData(prev => ({ ...prev, volume_m3 }));
    }
  }, [formData.altura_cm, formData.largura_cm, formData.comprimento_cm]);

  const recalcularFatoresConversao = () => {
    const pesoKgM = formData.peso_teorico_kg_m || 0;
    const comprimentoM = formData.comprimento_barra_padrao_m || 12;
    
    const kgPorPeca = pesoKgM * comprimentoM;
    const pecaPorTon = kgPorPeca > 0 ? (1000 / kgPorPeca) : 0;
    
    const novosFatores = {
      kg_por_metro: pesoKgM,
      kg_por_peca: kgPorPeca,
      metros_por_peca: comprimentoM,
      peca_por_ton: pecaPorTon,
      kg_por_ton: 1000
    };

    setFormData(prev => ({
      ...prev,
      fatores_conversao: novosFatores
    }));

    setCalculoConversao(novosFatores);
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFoto(true);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_produto_url: file_url });
      toast.success('✅ Foto carregada!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploadingFoto(false);
    }
  };

  const toggleUnidadeSecundaria = (unidade) => {
    const unidades = formData.unidades_secundarias || [];
    if (unidades.includes(unidade)) {
      setFormData(prev => ({
        ...prev,
        unidades_secundarias: unidades.filter(u => u !== unidade)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        unidades_secundarias: [...unidades, unidade]
      }));
    }
  };

  const handleDadosNCM = (dados) => {
    setFormData((prev) => ({
      ...prev,
      unidade_medida: dados.unidade || prev.unidade_medida,
      cest: dados.cest || prev.cest
    }));

    setSugestoesIA((prev) => ({
      ...prev,
      ncm_info: `${dados.descricao}${dados.obs ? ' - ' + dados.obs : ''}`,
      aliquotas: dados
    }));

    toast.success("NCM encontrado!", { description: dados.descricao });
  };

  const submitProduto = async () => {
    if (!formData.descricao) {
      toast.error('Preencha a descrição do produto');
      return;
    }

    if (!contextoValido) {
      toast.error('Selecione um grupo ou empresa antes de salvar o produto');
      return;
    }
    if (produto?.id ? !podeEditar : !podeCriar) {
      toast.error('Seu perfil nao permite salvar produtos');
      return;
    }

    if (formData.codigo && !produto?.id) {
      try {
        const produtosExistentes = await filterInContext('Produto', { codigo: formData.codigo }, '-created_date', 1);
        if (produtosExistentes.length > 0) {
          toast.error(`❌ Código "${formData.codigo}" já existe em outro produto`);
          setAbaAtiva('dados-gerais');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar código duplicado:', error);
      }
    }

    if (!formData.setor_atividade_id) {
      toast.error('Selecione o Setor de Atividade');
      setAbaAtiva('dados-gerais');
      return;
    }

    if (!formData.grupo_produto_id) {
      toast.error('Selecione o Grupo de Produto');
      setAbaAtiva('dados-gerais');
      return;
    }

    if (!formData.marca_id) {
      toast.error('Selecione a Marca');
      setAbaAtiva('dados-gerais');
      return;
    }

    if (!formData.unidades_secundarias || formData.unidades_secundarias.length === 0) {
      toast.error('Selecione pelo menos 1 unidade de venda/compra');
      setAbaAtiva('conversoes');
      return;
    }

    if (formData.eh_bitola && formData.peso_teorico_kg_m === 0) {
      toast.error('Bitolas precisam ter peso teórico preenchido');
      setAbaAtiva('dados-gerais');
      return;
    }

    const dadosBase = {
      ...formData,
      unidade_medida: formData.unidade_principal || formData.unidade_medida || 'KG',
      tributacao: {
        icms_cst: formData.tributacao.icms_cst || '',
        icms_aliquota: formData.tributacao.icms_aliquota || 0,
        pis_cst: formData.tributacao.pis_cst || '',
        pis_aliquota: formData.tributacao.pis_aliquota || 0,
        cofins_cst: formData.tributacao.cofins_cst || '',
        cofins_aliquota: formData.tributacao.cofins_aliquota || 0,
        ipi_cst: formData.tributacao.ipi_cst || '',
        ipi_aliquota: formData.tributacao.ipi_aliquota || 0
      }
    };

    const dadosSubmit = carimbarContexto(dadosBase, 'empresa_id');

    try {
      if (produto?.id) {
        await updateInContext('Produto', produto.id, dadosSubmit);
        toast.success('✅ Produto atualizado com sucesso!');
      } else {
        await createInContext('Produto', dadosSubmit);
        toast.success('✅ Produto criado com sucesso!');
      }
      if (onSuccess) onSuccess();
      if (onSubmit) onSubmit(dadosSubmit);
      if (typeof closeSelf === 'function') closeSelf();
    } catch (error) {
      toast.error('❌ Erro ao salvar produto: ' + error.message);
    }
  };

  const unifiedSubmit = submitProduto;

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const handleExcluir = () => {
    if (!podeExcluir) {
      toast.error('Seu perfil nao permite excluir produtos');
      return;
    }
    setConfirmandoExclusao(true);
  };

  const confirmarExclusao = () => {
    setConfirmandoExclusao(false);
    if (produto?.id) {
      deleteInContext('Produto', produto.id)
        .then(() => {
          toast.success('Produto excluido com sucesso!');
          if (onSuccess) onSuccess();
          if (typeof closeSelf === 'function') closeSelf();
        })
        .catch((error) => toast.error('Erro ao excluir produto: ' + error.message));
      return;
    }
    if (onSubmit) {
      onSubmit({ ...formData, _action: 'delete' });
    }
  };

  const handleAlternarStatus = () => {
    const novoStatus = formData.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setFormData({ ...formData, status: novoStatus });
  };

  const totalAbas = 7; // SEMPRE 7 abas - ETAPA 4 COMPLETA

  const content = (
    <FormWrapper onSubmit={unifiedSubmit} externalData={formData} className={`w-full h-full overflow-auto p-6 space-y-6`}>
      {/* TOGGLE MODO MANUAL */}
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-blue-900">🤖 Assistência de IA</p>
              <p className="text-xs text-blue-700">A IA pode sugerir NCM, grupo, bitola e unidades automaticamente</p>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Preencher manualmente</Label>
              <Switch
                checked={modoManual}
                onCheckedChange={setModoManual}
              />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* ABAS DO FORMULÁRIO - 7 ABAS ETAPA 4 */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-7 w-full bg-slate-100">
          <TabsTrigger value="dados-gerais">
            <Package className="w-4 h-4 mr-1" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="conversoes">
            <Calculator className="w-4 h-4 mr-1" />
            Conversões
          </TabsTrigger>
          <TabsTrigger value="dimensoes">
            <Package className="w-4 h-4 mr-1" />
            Peso/Dim
          </TabsTrigger>
          <TabsTrigger value="ecommerce">
            <Globe className="w-4 h-4 mr-1" />
            E-Commerce
          </TabsTrigger>
          <TabsTrigger value="fiscal-contabil">
            <FileText className="w-4 h-4 mr-1" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="estoque-avancado">
            <Warehouse className="w-4 h-4 mr-1" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="historico">
            <TrendingUp className="w-4 h-4 mr-1" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: DADOS GERAIS */}
        <TabsContent value="dados-gerais" className="space-y-6">
          <DadosGeraisTab
            formData={formData} setFormData={setFormData} produto={produto}
            todosProdutos={todosProdutos}
            setores={setores} grupos={grupos} marcas={marcas}
            iaSugestao={iaSugestao} modoManual={modoManual} processandoIA={processandoIA}
            analisarDescricaoIA={analisarDescricaoIA} aplicarSugestaoIA={aplicarSugestaoIA}
            gerarImagemIA={gerarImagemIA} gerandoImagem={gerandoImagem}
            uploadingFoto={uploadingFoto} handleUploadFoto={handleUploadFoto}
            calculoConversao={calculoConversao}
            carimbarContexto={carimbarContexto}
            createInContext={createInContext} updateInContext={updateInContext}
            deleteInContext={deleteInContext}
            contextoValido={contextoValido}
            podeCriar={podeCriar} podeEditar={podeEditar} podeExcluir={podeExcluir}
          />

          {/* PRECIFICAÇÃO */}
          <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}>
            <PrecosSection formData={formData} setFormData={setFormData} />
          </Suspense>

          {/* STATUS */}
          <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-lg">
            <CardContent className="p-4">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({...prev, status: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: CONVERSÕES */}
        <TabsContent value="conversoes" className="space-y-6">
          <ConversoesTab
            formData={formData} setFormData={setFormData}
            toggleUnidadeSecundaria={toggleUnidadeSecundaria}
            calculoConversao={calculoConversao}
          />
        </TabsContent>

        {/* ABA 3: DIMENSÕES E PESO */}
        <TabsContent value="dimensoes" className="space-y-6">
          <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}> 
            <PesoDimensoesSection formData={formData} setFormData={setFormData} />
          </Suspense>
        </TabsContent>

        {/* ABA 4: E-COMMERCE */}
        <TabsContent value="ecommerce" className="space-y-6">
          <EcommerceTab
            formData={formData} setFormData={setFormData}
            modoManual={modoManual}
            gerarDescricaoSEO={gerarDescricaoSEO}
            gerandoDescricaoSEO={gerandoDescricaoSEO}
          />
        </TabsContent>

        {/* ABA 5: FISCAL E CONTÁBIL */}
        <TabsContent value="fiscal-contabil" className="space-y-6">
          <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}> 
            <FiscalContabilSection 
              formData={formData}
              setFormData={setFormData}
              sugestoesIA={sugestoesIA}
              handleDadosNCM={handleDadosNCM}
              planoContas={planoContas}
            />
          </Suspense>
        </TabsContent>

        {/* ABA 6: ESTOQUE AVANÇADO */}
        <TabsContent value="estoque-avancado" className="space-y-6">
          <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}> 
            <EstoqueAvancadoSection 
              formData={formData}
              setFormData={setFormData}
              locaisEstoque={locaisEstoque}
            />
          </Suspense>
        </TabsContent>

        {/* ABA 7: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-6">
          {produto ? (
                        <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}> 
                          <HistoricoProduto produtoId={produto.id} produto={produto} />
                        </Suspense>
          ) : (
            <Card className="border-blue-200 bg-white/60 backdrop-blur-md shadow-lg">
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-slate-600">O histórico estará disponível após criar o produto</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex items-center justify-between pt-4 border-t sticky bottom-0 bg-white">
        <div className="flex gap-2">
          {produto && (
            <>
              <Button
                type="button"
                variant="outline"
                data-permission="Cadastros.Produto.alterarStatus"
                data-sensitive
                onClick={handleAlternarStatus}
                disabled={!podeEditar || !contextoValido}
                className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
              >
                {formData.status === 'Ativo' ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Inativar
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="destructive"
                data-permission="Cadastros.Produto.excluir"
                data-sensitive
                onClick={handleExcluir}
                disabled={!podeExcluir || !contextoValido}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </div>
        <Button type="submit" data-permission="Cadastros.Produto.salvar" data-sensitive disabled={isSubmitting || !contextoValido || (produto?.id ? !podeEditar : !podeCriar)} className="bg-purple-600 hover:bg-purple-700 px-8">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {!isSubmitting && <Save className="w-4 h-4 mr-2" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}

export default React.memo(ProdutoFormV22_Completo);