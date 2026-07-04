import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, DollarSign, Plus, Calculator, Sparkles, Package, Search, X, Save, Factory, Award, Boxes, TrendingUp, CheckCircle2, Trash2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import TabelaPrecoCalculoTab from "@/components/cadastros/TabelaPrecoCalculoTab";
import TabelaPrecoItensTab from "@/components/cadastros/TabelaPrecoItensTab";

/**
 * V21.0 - TABELA DE PREÇO RECONSTRUÍDA
 * ✅ Filtros por Setor + Grupo + Marca (Dupla Classificação)
 * ✅ Multiempresa e compartilhamento
 * ✅ IA PriceBrain 3.0 com análise de mercado
 * ✅ Histórico de alterações
 */
export default function TabelaPrecoFormCompleto({ tabela, onSubmit, windowMode = false }) {
  const queryClient = useQueryClient();
  const [salvando, setSalvando] = useState(false);
  const [user, setUser] = useState(null);
  const {
    empresaAtual,
    grupoAtual,
    filterInContext,
    createInContext,
    updateInContext,
    deleteInContext
  } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeCriar = canCreate("Cadastros", "Tabela de Preco") || canCreate("Cadastros", "TabelaPreco") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Tabela de Preco") || canEdit("Cadastros", "TabelaPreco") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Tabela de Preco") || canDelete("Cadastros", "TabelaPreco") || canDelete("Cadastros", null);
  
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const [formData, setFormData] = useState({
    nome: tabela?.nome || '',
    descricao: tabela?.descricao || '',
    tipo: tabela?.tipo || 'Padrão',
    data_inicio: tabela?.data_inicio || new Date().toISOString().split('T')[0],
    data_fim: tabela?.data_fim || '',
    ativo: tabela?.ativo !== undefined ? tabela.ativo : true,
    empresa_id: tabela?.empresa_id || empresaAtual?.id || user?.empresa_selecionada_id || '',
    group_id: tabela?.group_id || groupId || '',
    compartilhar_grupo: tabela?.compartilhar_grupo || false
  });

  const [activeTab, setActiveTab] = useState('config');
  const [modoInclusao, setModoInclusao] = useState('lote');
  const [calculando, setCalculando] = useState(false);
  const [searchProduto, setSearchProduto] = useState('');
  const [itensTabela, setItensTabela] = useState([]);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', contextKey],
    queryFn: () => filterInContext('Produto', {}, 'descricao', 500),
    enabled: contextoValido,
  });

  const { data: setoresAtividade = [] } = useQuery({
    queryKey: ['setores-atividade', contextKey],
    queryFn: () => filterInContext('SetorAtividade', {}, 'nome', 200),
    enabled: contextoValido,
  });

  const { data: gruposProduto = [] } = useQuery({
    queryKey: ['grupos-produto', contextKey],
    queryFn: () => filterInContext('GrupoProduto', {}, 'nome', 200),
    enabled: contextoValido,
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas', contextKey],
    queryFn: () => filterInContext('Marca', {}, 'nome', 200),
    enabled: contextoValido,
  });

  const { data: itensExistentes = [] } = useQuery({
    queryKey: ['tabela-preco-itens', tabela?.id, contextKey],
    queryFn: () => tabela?.id 
      ? filterInContext('TabelaPrecoItem', { tabela_preco_id: tabela.id }, 'produto_descricao', 1000)
      : Promise.resolve([]),
    enabled: !!tabela?.id && contextoValido
  });

  useEffect(() => {
    if (itensExistentes.length > 0) {
      setItensTabela(itensExistentes);
    }
  }, [itensExistentes]);

  const [filtroLote, setFiltroLote] = useState({
    setor_id: '',
    grupo_id: '',
    marca_id: '',
    ncm: '',
    curva_abc: '',
    eh_bitola: ''
  });

  const [regraCalculo, setRegraCalculo] = useState({
    base: 'custo_medio',
    tipo: 'markup',
    valor: 30,
    aplicar_por_setor: false,
    markup_por_setor: {}
  });

  const handleAdicionarProdutoIndividual = (produto) => {
    if (itensTabela.some(i => i.produto_id === produto.id)) {
      toast.error('Produto já incluído na tabela');
      return;
    }

    const custoBase = produto.custo_medio || produto.custo_aquisicao || 0;
    const precoVenda = produto.preco_venda || custoBase * 1.3;
    const margem = custoBase > 0 ? ((precoVenda - custoBase) / custoBase * 100) : 0;
    
    const novoItem = {
      produto_id: produto.id,
      produto_descricao: produto.descricao,
      produto_codigo: produto.codigo || '',
      setor_atividade_nome: produto.setor_atividade_nome || '',
      grupo_produto_nome: produto.grupo_produto_nome || '',
      marca_nome: produto.marca_nome || '',
      custo_base: custoBase,
      preco: precoVenda,
      desconto_maximo_percentual: 10,
      margem_percentual: margem
    };

    setItensTabela(prev => [...prev, novoItem]);
    toast.success(`✅ ${produto.descricao} adicionado`);
    setSearchProduto('');
  };

  const handleAdicionarProdutosLote = () => {
    const produtosFiltrados = produtos.filter(p => {
      if (filtroLote.setor_id && p.setor_atividade_id !== filtroLote.setor_id) return false;
      if (filtroLote.grupo_id && p.grupo_produto_id !== filtroLote.grupo_id) return false;
      if (filtroLote.marca_id && p.marca_id !== filtroLote.marca_id) return false;
      if (filtroLote.ncm && !p.ncm?.includes(filtroLote.ncm)) return false;
      if (filtroLote.curva_abc && p.classificacao_abc !== filtroLote.curva_abc) return false;
      if (filtroLote.eh_bitola && p.eh_bitola !== (filtroLote.eh_bitola === 'true')) return false;
      return true;
    });

    const novosItens = produtosFiltrados
      .filter(p => !itensTabela.some(i => i.produto_id === p.id))
      .map(p => {
        const custoBase = p.custo_medio || p.custo_aquisicao || 0;
        const precoVenda = p.preco_venda || custoBase * 1.3;
        const margem = custoBase > 0 ? ((precoVenda - custoBase) / custoBase * 100) : 0;
        
        return {
          produto_id: p.id,
          produto_descricao: p.descricao,
          produto_codigo: p.codigo || '',
          setor_atividade_nome: p.setor_atividade_nome || '',
          grupo_produto_nome: p.grupo_produto_nome || '',
          marca_nome: p.marca_nome || '',
          custo_base: custoBase,
          preco: precoVenda,
          desconto_maximo_percentual: 10,
          margem_percentual: margem
        };
      });

    setItensTabela(prev => [...prev, ...novosItens]);
    toast.success(`✅ ${novosItens.length} produtos adicionados`);
  };

  const handleRecalcularPrecos = () => {
    setCalculando(true);

    const itensAtualizados = itensTabela.map(item => {
      let custoBase = item.custo_base;

      if (regraCalculo.base === 'custo_medio') {
        const produtoAtual = produtos.find(p => p.id === item.produto_id);
        custoBase = produtoAtual?.custo_medio || item.custo_base;
      }

      let markup = regraCalculo.valor;
      
      if (regraCalculo.aplicar_por_setor && item.setor_atividade_nome) {
        markup = regraCalculo.markup_por_setor[item.setor_atividade_nome] || regraCalculo.valor;
      }

      let novoPreco = custoBase;

      switch (regraCalculo.tipo) {
        case 'markup':
          novoPreco = custoBase * (1 + markup / 100);
          break;
        case 'margem':
          novoPreco = custoBase / (1 - markup / 100);
          break;
        case 'valor_fixo':
          novoPreco = custoBase + markup;
          break;
      }

      const margem = custoBase > 0 ? ((novoPreco - custoBase) / custoBase * 100) : 0;

      return {
        ...item,
        custo_base: custoBase,
        preco: novoPreco,
        margem_percentual: margem
      };
    });

    setItensTabela(itensAtualizados);
    setCalculando(false);
    toast.success(`✅ ${itensAtualizados.length} preços recalculados`);
  };

  const handleSugerirPrecosIA = async () => {
    if (itensTabela.length === 0) {
      toast.error('Adicione produtos à tabela primeiro');
      return;
    }

    setCalculando(true);

    try {
      const amostra = itensTabela.slice(0, 15).map(i => ({
        descricao: i.produto_descricao,
        setor: i.setor_atividade_nome,
        grupo: i.grupo_produto_nome,
        marca: i.marca_nome,
        custo_base: i.custo_base,
        preco_atual: i.preco,
        margem_atual: i.margem_percentual
      }));

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o PriceBrain 3.0, IA especialista em precificação estratégica V21.0.

Analise esta amostra de produtos da tabela "${formData.nome}" (tipo: ${formData.tipo}):

${JSON.stringify(amostra, null, 2)}

CONTEXTO V21.0:
- Produtos classificados por Setor + Grupo + Marca (dupla classificação)
- Tipo de tabela: ${formData.tipo}
- Data início: ${formData.data_inicio}

MISSÃO:
1. Analise margem por SETOR (Revenda vs Fábrica vs Almoxarifado)
2. Considere GRUPO (Bitolas vendem com margem menor, produtos acabados com margem maior)
3. Avalie MARCA (marcas premium permitem markup maior)
4. Detecte oportunidades de cross-sell

RETORNE:
- markup_sugerido_geral: markup base (%)
- markup_por_setor: objeto com markup específico por setor {Revenda: 25, Fábrica: 35}
- estrategia: explicação da estratégia (max 200 chars)
- produtos_promocao: IDs de produtos para promoção
- observacoes: insights (max 150 chars)`,
        response_json_schema: {
          type: "object",
          properties: {
            markup_sugerido_geral: { type: "number" },
            markup_por_setor: { 
              type: "object",
              additionalProperties: { type: "number" }
            },
            estrategia: { type: "string" },
            produtos_promocao: { 
              type: "array",
              items: { type: "string" }
            },
            observacoes: { type: "string" }
          }
        }
      });

      const itensAtualizados = itensTabela.map(item => {
        const custoBase = item.custo_base;
        const markupSetor = resultado.markup_por_setor[item.setor_atividade_nome] || resultado.markup_sugerido_geral;
        const novoPreco = custoBase * (1 + markupSetor / 100);
        const margem = ((novoPreco - custoBase) / custoBase * 100);

        return {
          ...item,
          preco: novoPreco,
          preco_sugerido_ia: novoPreco,
          margem_percentual: margem,
          markup_aplicado_ia: markupSetor,
          sugestao_ia: resultado.produtos_promocao.includes(item.produto_id) 
            ? '🎯 Giro baixo - promoção recomendada' 
            : null
        };
      });

      setItensTabela(itensAtualizados);
      toast.success(`✨ IA PriceBrain 3.0: ${resultado.estrategia}`);
      
      if (resultado.observacoes) {
        setTimeout(() => {
          toast.info(`💡 ${resultado.observacoes}`);
        }, 1500);
      }

      setRegraCalculo(prev => ({
        ...prev,
        aplicar_por_setor: true,
        markup_por_setor: resultado.markup_por_setor
      }));
    } catch (error) {
      toast.error('❌ Erro ao consultar IA: ' + error.message);
    } finally {
      setCalculando(false);
    }
  };

  const handleRemoverItem = (idx) => {
    setItensTabela(prev => prev.filter((_, i) => i !== idx));
    toast.success('Item removido');
  };

  const handleExcluir = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir a tabela "${formData.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    if (!podeExcluir) {
      toast.error('Seu perfil nao permite excluir tabelas de preco');
      return;
    }
    if (tabela?.id) {
      await deleteInContext('TabelaPreco', tabela.id);
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
    }
    if (onSubmit) {
      onSubmit({ ...formData, _action: 'delete' });
    }
  };

  const handleAlternarStatus = () => {
    const novoStatus = formData.ativo ? false : true;
    setFormData({ ...formData, ativo: novoStatus });
  };

  const handleSalvar = async () => {
    if (!formData.nome || !formData.tipo || !formData.data_inicio) {
      toast.error('❌ Preencha: Nome, Tipo e Data Início');
      return;
    }

    if (!contextoValido) {
      toast.error('Selecione um grupo ou empresa antes de salvar a tabela de preco');
      return;
    }
    if (tabela?.id ? !podeEditar : !podeCriar) {
      toast.error('Seu perfil nao permite salvar tabelas de preco');
      return;
    }

    setSalvando(true);

    try {
      const dadosTabela = {
        ...formData,
        empresa_id: empresaAtual?.id || formData.empresa_id || user?.empresa_selecionada_id || user?.empresa_id,
        group_id: groupId || formData.group_id,
        criado_por: user?.email || 'sistema'
      };

      let tabelaId = tabela?.id;
      
      if (!tabelaId) {
        const tabelaCriada = await createInContext('TabelaPreco', dadosTabela);
        tabelaId = tabelaCriada.id;
        console.log('✅ Tabela criada:', tabelaId);
      } else {
        await updateInContext('TabelaPreco', tabelaId, dadosTabela);
        console.log('✅ Tabela atualizada:', tabelaId);
      }

      if (tabela?.id && itensExistentes.length > 0) {
        console.log('🗑️ Deletando itens antigos...');
        for (const itemAntigo of itensExistentes) {
          await deleteInContext('TabelaPrecoItem', itemAntigo.id);
        }
      }

      if (itensTabela.length > 0) {
        console.log('💾 Salvando', itensTabela.length, 'produtos...');
        for (const item of itensTabela) {
          const itemData = {
            tabela_preco_id: tabelaId,
            produto_id: item.produto_id,
            produto_descricao: item.produto_descricao,
            produto_codigo: item.produto_codigo || '',
            setor_atividade_nome: item.setor_atividade_nome || '',
            grupo_produto_nome: item.grupo_produto_nome || '',
            marca_nome: item.marca_nome || '',
            custo_base: Number(item.custo_base) || 0,
            preco: Number(item.preco) || 0,
            desconto_maximo_percentual: Number(item.desconto_maximo_percentual) || 0,
            margem_percentual: Number(item.margem_percentual) || 0,
            markup_aplicado_ia: item.markup_aplicado_ia || null
          };
          
          await createInContext('TabelaPrecoItem', itemData);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tabelas-preco'] });
      queryClient.invalidateQueries({ queryKey: ['tabelas-preco-itens'] });
      queryClient.invalidateQueries({ queryKey: ['tabela-preco-itens'] });
      
      toast.success(`✅ Tabela "${formData.nome}" salva com ${itensTabela.length} produtos!`);
      
      if (onSubmit) {
        onSubmit({ _salvamentoCompleto: true });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error('❌ Erro ao salvar: ' + error.message);
    } finally {
      setSalvando(false);
    }
  };

  const produtosFiltrados = produtos.filter(p => 
    !itensTabela.some(i => i.produto_id === p.id) &&
    (searchProduto === '' || p.descricao.toLowerCase().includes(searchProduto.toLowerCase()))
  );

  const podeAvancar = formData.nome && formData.tipo && formData.data_inicio;

  const produtosDisponiveis = produtos.filter(p => {
    if (filtroLote.setor_id && p.setor_atividade_id !== filtroLote.setor_id) return false;
    if (filtroLote.grupo_id && p.grupo_produto_id !== filtroLote.grupo_id) return false;
    if (filtroLote.marca_id && p.marca_id !== filtroLote.marca_id) return false;
    if (filtroLote.ncm && !p.ncm?.includes(filtroLote.ncm)) return false;
    if (filtroLote.curva_abc && p.classificacao_abc !== filtroLote.curva_abc) return false;
    if (filtroLote.eh_bitola && p.eh_bitola !== (filtroLote.eh_bitola === 'true')) return false;
    return !itensTabela.some(i => i.produto_id === p.id);
  });

  const content = (
    <div className={`space-y-4 flex flex-col ${windowMode ? 'h-full p-6' : ''}`}>
      <Alert className="border-purple-300 bg-purple-50">
        <Sparkles className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          🚀 <strong>V21.0:</strong> Tabela de Preço reconstruída com Dupla Classificação, Multiempresa e IA PriceBrain 3.0
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">
            <DollarSign className="w-4 h-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="itens" disabled={!podeAvancar}>
            <Package className="w-4 h-4 mr-2" />
            Produtos ({itensTabela.length})
          </TabsTrigger>
          <TabsTrigger value="calculo" disabled={itensTabela.length === 0}>
            <Calculator className="w-4 h-4 mr-2" />
            IA + Motor
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="config" className="space-y-4 mt-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-bold text-blue-900">⚙️ Identificação da Tabela</h3>

                <div>
                  <Label>Nome da Tabela *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Ex: Atacado SP, Varejo Nacional, Tabela Obra"
                    required
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Detalhes sobre aplicação desta tabela"
                  />
                </div>

                <div>
                  <Label>Tipo de Tabela *</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Padrão">Padrão</SelectItem>
                      <SelectItem value="Atacado">Atacado</SelectItem>
                      <SelectItem value="Varejo">Varejo</SelectItem>
                      <SelectItem value="Obra">Obra/Projeto</SelectItem>
                      <SelectItem value="Marketplace">Marketplace</SelectItem>
                      <SelectItem value="Promocional">Promocional</SelectItem>
                      <SelectItem value="VIP">VIP/Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data Início *</Label>
                    <Input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label>Data Fim (Opcional)</Label>
                    <Input
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                    />
                    <p className="text-xs text-slate-500 mt-1">Deixe vazio para vigência indeterminada</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <Label>Compartilhar com Grupo</Label>
                    <p className="text-xs text-slate-500">Todas empresas do grupo podem usar</p>
                  </div>
                  <Switch
                    checked={formData.compartilhar_grupo}
                    onCheckedChange={(v) => setFormData({...formData, compartilhar_grupo: v})}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <Label>Tabela Ativa</Label>
                    <p className="text-xs text-slate-500">Disponível para uso em pedidos</p>
                  </div>
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(v) => setFormData({...formData, ativo: v})}
                  />
                </div>

                {podeAvancar && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-sm text-green-900">
                      ✅ Configuração OK! Avance para "Produtos" ou salve apenas a estrutura.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itens" className="space-y-4 mt-4">
            <TabelaPrecoItensTab
              modoInclusao={modoInclusao}
              setModoInclusao={setModoInclusao}
              searchProduto={searchProduto}
              setSearchProduto={setSearchProduto}
              produtosFiltrados={produtosFiltrados}
              handleAdicionarProdutoIndividual={handleAdicionarProdutoIndividual}
              filtroLote={filtroLote}
              setFiltroLote={setFiltroLote}
              setoresAtividade={setoresAtividade}
              gruposProduto={gruposProduto}
              marcas={marcas}
              handleAdicionarProdutosLote={handleAdicionarProdutosLote}
              produtosDisponiveis={produtosDisponiveis}
              produtos={produtos}
              itensTabela={itensTabela}
              handleRemoverItem={handleRemoverItem}
            />
          </TabsContent>

          <TabsContent value="calculo" className="space-y-4 mt-4">
            <TabelaPrecoCalculoTab
              regraCalculo={regraCalculo}
              setRegraCalculo={setRegraCalculo}
              calculando={calculando}
              itensTabela={itensTabela}
              handleRecalcularPrecos={handleRecalcularPrecos}
              handleSugerirPrecosIA={handleSugerirPrecosIA}
            />
          </TabsContent>
        </div>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t bg-white p-4 -mx-6 -mb-6 sticky bottom-0">
        <div className="text-sm">
          <p className="font-semibold text-slate-900">
            {itensTabela.length} produtos na tabela
          </p>
          {itensTabela.length > 0 && (
            <p className="text-xs text-slate-600">
              Margem média: {(itensTabela.reduce((sum, i) => sum + (i.margem_percentual || 0), 0) / itensTabela.length).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {tabela && (
            <>
              <Button
                type="button"
                variant="outline"
                data-permission="Cadastros.TabelaPreco.alterarStatus"
                onClick={handleAlternarStatus}
                disabled={!podeEditar || !contextoValido}
                className={formData.ativo ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
              >
                {formData.ativo ? (
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
                data-permission="Cadastros.TabelaPreco.excluir"
                onClick={handleExcluir}
                disabled={!podeExcluir || !contextoValido}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
            <Button 
              type="button" 
              onClick={handleSalvar}
              disabled={salvando || !podeAvancar || !contextoValido || (tabela?.id ? !podeEditar : !podeCriar)} 
              className="bg-green-600 hover:bg-green-700 min-w-[180px]"
              data-permission="Comercial.TabelaPreco.editar"
            >
            {salvando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!salvando && <Save className="w-4 h-4 mr-2" />}
            {tabela ? 'Salvar Alterações' : 'Criar Tabela'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white overflow-auto">{content}</div>;
  }

  return content;
}