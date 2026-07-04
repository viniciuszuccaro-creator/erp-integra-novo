import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Package, Upload, Calculator, CheckCircle2, AlertTriangle, FileText, Factory, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";
import ProtectedField from "@/components/security/ProtectedField";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";

/**
 * V21.6 - EVOLUÇÃO DO CADASTRO DE PRODUTOS
 * ✅ Toggle "Preencher manualmente" (ignorar IA)
 * ✅ Campos de peso líquido/bruto + dimensões (frete/e-commerce)
 * ✅ Suporte para cadastro via NF-e e em lote (botões preparados)
 * ✅ NOVO: Botão "Enviar para Produção" - converte produtos de Revenda para Matéria-Prima
 * V22.0: REGRA MESTRE DE CONVERSÃO DE UNIDADES
 * Este formulário é o HUB central que define como o produto pode ser vendido/comprado
 */
export default function ProdutoForm({ produto, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(() => {
    if (produto) {
      return {
        ...produto,
        unidades_secundarias: produto.unidades_secundarias || ['KG'],
        fatores_conversao: produto.fatores_conversao || {
          kg_por_peca: 0,
          kg_por_metro: 0,
          metros_por_peca: 0,
          peca_por_ton: 0,
          kg_por_ton: 1000
        },
        // V21.1.2: NOVOS CAMPOS
        peso_liquido_kg: produto.peso_liquido_kg || 0,
        peso_bruto_kg: produto.peso_bruto_kg || 0,
        altura_cm: produto.altura_cm || 0,
        largura_cm: produto.largura_cm || 0,
        comprimento_cm: produto.comprimento_cm || 0
      };
    }
    
    return {
      descricao: '',
      codigo: '',
      tipo_item: 'Revenda',
      grupo: 'Outros',
      eh_bitola: false,
      peso_teorico_kg_m: 0,
      bitola_diametro_mm: 0,
      tipo_aco: 'CA-50',
      comprimento_barra_padrao_m: 12,
      unidade_principal: 'KG',
      unidades_secundarias: ['KG'],
      fatores_conversao: {
        kg_por_peca: 0,
        kg_por_metro: 0,
        metros_por_peca: 0,
        peca_por_ton: 0,
        kg_por_ton: 1000
      },
      foto_produto_url: '',
      custo_aquisicao: 0,
      preco_venda: 0,
      estoque_minimo: 0,
      ncm: '',
      cest: '',
      unidade_medida: '',
      status: 'Ativo',
      // V21.1.2: NOVOS CAMPOS
      peso_liquido_kg: 0,
      peso_bruto_kg: 0,
      altura_cm: 0,
      largura_cm: 0,
      comprimento_cm: 0
    };
  });

  const [iaSugestao, setIaSugestao] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [calculoConversao, setCalculoConversao] = useState(null);
  const [sugestoesIA, setSugestoesIA] = useState({});
  
  // V21.1.2: NOVO TOGGLE
  const [modoManual, setModoManual] = useState(false);
  const debounceTimeoutRef = useRef(null);

  // V22.0: Recalcular fatores quando mudam campos-chave
  useEffect(() => {
    if (formData.eh_bitola) {
      recalcularFatoresConversao();
    }
  }, [formData.peso_teorico_kg_m, formData.comprimento_barra_padrao_m, formData.eh_bitola]);

  // V21.1.2: Calcular volume automaticamente
  useEffect(() => {
    if (formData.altura_cm > 0 && formData.largura_cm > 0 && formData.comprimento_cm > 0) {
      const volume_m3 = (formData.altura_cm * formData.largura_cm * formData.comprimento_cm) / 1000000;
      setFormData(prev => ({ ...prev, volume_m3 }));
    } else if (formData.volume_m3 !== 0) {
        setFormData(prev => ({ ...prev, volume_m3: 0 }));
    }
  }, [formData.altura_cm, formData.largura_cm, formData.comprimento_cm, formData.volume_m3]);

  // V22.1: Self-Healing automático (debounced)
  useEffect(() => {
    if (modoManual) {
      setIaSugestao(null);
      return;
    }
    if ((formData.descricao || '').length >= 5) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        analisarDescricaoIA(formData.descricao);
      }, 700);
    } else {
      setIaSugestao(null);
    }
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [formData.descricao, modoManual]);

  // V22.0: MOTOR DE CONVERSÃO AUTOMÁTICA
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

  // IA de Classificação Mestra (V18.0 + V22.0 Melhorado)
  const analisarDescricaoIA = async (descricao) => {
    if (!descricao || descricao.length < 5) return;
    
    setProcessandoIA(true);
    
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta descrição de produto: "${descricao}".

Se for uma bitola de aço (ex: "Barra 8mm 12m CA-50", "Vergalhão 10mm"), retorne:
- eh_bitola: true
- peso_teorico_kg_m: peso teórico em kg/m (tabela oficial):
  * 6.3mm = 0.245 kg/m
  * 8mm = 0.395 kg/m
  * 10mm = 0.617 kg/m
  * 12.5mm = 0.963 kg/m
  * 16mm = 1.578 kg/m
  * 20mm = 2.466 kg/m
  * 25mm = 3.853 kg/m
  * 32mm = 6.313 kg/m
- bitola_diametro_mm: diâmetro em mm
- tipo_aco: CA-25, CA-50 ou CA-60
- ncm: "7214.20.00" (vergalhões)
- grupo_produto: "Bitola"
- comprimento_barra_m: 12 (padrão)
- unidade_principal: "KG"
- unidades_secundarias: ["PÇ", "KG", "MT"] (sempre essas 3 para bitolas)

Caso contrário, sugira:
- grupo_produto adequado
- ncm provável
- unidade_principal e unidades_secundarias apropriadas`,
        response_json_schema: {
          type: "object",
          properties: {
            eh_bitola: { type: "boolean" },
            peso_teorico_kg_m: { type: "number" },
            bitola_diametro_mm: { type: "number" },
            tipo_aco: { type: "string" },
            ncm: { type: "string" },
            grupo_produto: { type: "string" },
            comprimento_barra_m: { type: "number" },
            unidade_principal: { type: "string" },
            unidades_secundarias: {
              type: "array",
              items: { type: "string" }
            },
            explicacao: { type: "string" }
          }
        }
      });

      setIaSugestao(resultado);
      toast.success('✨ IA analisou o produto!');
    } catch (error) {
      toast.error('Erro ao processar IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const aplicarSugestaoIA = () => {
    if (!iaSugestao || modoManual) return;
    
    setFormData(prev => ({
      ...prev,
      eh_bitola: iaSugestao.eh_bitola || false,
      peso_teorico_kg_m: iaSugestao.peso_teorico_kg_m || 0,
      bitola_diametro_mm: iaSugestao.bitola_diametro_mm || 0,
      tipo_aco: iaSugestao.tipo_aco || 'CA-50',
      ncm: iaSugestao.ncm || '',
      grupo: iaSugestao.grupo_produto || prev.grupo,
      comprimento_barra_padrao_m: iaSugestao.comprimento_barra_m || 12,
      unidade_principal: iaSugestao.unidade_principal || 'KG',
      unidades_secundarias: iaSugestao.unidades_secundarias || ['KG']
    }));
    
    toast.success('✅ Sugestões aplicadas!');
    setIaSugestao(null);
  };

  // Upload de Foto do Produto
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

  // Toggle de unidades secundárias
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

  // NOVO: Handler para busca automática de NCM
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

  // V21.6: NOVO - Enviar para Produção
  const enviarParaProducao = () => {
    setFormData(prev => ({ 
      ...prev, 
      tipo_item: 'Matéria-Prima Produção',
      setor_atividade_id: 'setor-fabrica-001',
      setor_atividade_nome: 'Fábrica'
    }));
    setModoManual(false);
    toast.success('🏭 Produto movido para Produção!', {
      description: 'Lembre-se de salvar as alterações'
    });
  };

  const produtoSchema = z.object({
    descricao: z.string().min(3, 'Descrição é obrigatória'),
    unidades_secundarias: z.array(z.string()).min(1, 'Selecione pelo menos 1 unidade'),
    eh_bitola: z.boolean().optional().default(false),
    peso_teorico_kg_m: z.number().optional().transform(v => v ?? 0)
  }).refine((data) => !data.eh_bitola || (data.peso_teorico_kg_m || 0) > 0, {
    message: 'Bitolas precisam ter peso teórico preenchido'
  });

  const handleSubmit = async (_, __) => {
    onSubmit(formData);
  };

  return (
    <FormWrapper schema={produtoSchema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className="space-y-6 w-full h-full">
      {/* V21.1.2: TOGGLE MODO MANUAL */}
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-blue-900">🤖 Assistência de IA</p>
              <p className="text-xs text-blue-700">A IA pode sugerir NCM, grupo, bitola e unidades automaticamente</p>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Preencher manualmente (ignorar IA)</Label>
              <Switch
                checked={modoManual}
                onCheckedChange={setModoManual}
              />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* SEÇÃO 1: Identificação */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-purple-900">
            <Package className="w-5 h-5" />
            Identificação do Produto
          </h3>

          <div>
            <Label>Descrição do Produto *</Label>
            <div className="flex gap-2">
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))}
                placeholder="Ex: Vergalhão 8mm 12m CA-50"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => analisarDescricaoIA(formData.descricao)}
                disabled={processandoIA || modoManual}
              >
                {processandoIA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">✨ IA preenche automaticamente NCM, peso e unidades</p>
          </div>

          {iaSugestao && !modoManual && (
            <Alert className="border-purple-300 bg-purple-100">
              <AlertDescription>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm text-purple-900 mb-1">🤖 IA Classificou:</p>
                    <p className="text-xs text-purple-800">{iaSugestao.explicacao}</p>
                    <div className="text-xs text-purple-700 mt-2 space-y-1">
                      {iaSugestao.eh_bitola && <p>• <strong>É bitola:</strong> Sim</p>}
                      {iaSugestao.peso_teorico_kg_m > 0 && <p>• <strong>Peso Teórico (kg/m):</strong> {iaSugestao.peso_teorico_kg_m}</p>}
                      {iaSugestao.bitola_diametro_mm > 0 && <p>• <strong>Diâmetro (mm):</strong> {iaSugestao.bitola_diametro_mm}</p>}
                      {iaSugestao.tipo_aco && <p>• <strong>Tipo de Aço:</strong> {iaSugestao.tipo_aco}</p>}
                      {iaSugestao.ncm && <p>• <strong>NCM:</strong> {iaSugestao.ncm}</p>}
                      {iaSugestao.grupo_produto && <p>• <strong>Grupo:</strong> {iaSugestao.grupo_produto}</p>}
                      {iaSugestao.unidade_principal && <p>• <strong>Unidade Principal:</strong> {iaSugestao.unidade_principal}</p>}
                      {iaSugestao.unidades_secundarias && iaSugestao.unidades_secundarias.length > 0 && (
                        <p>• <strong>Unidades Habilitadas:</strong> {iaSugestao.unidades_secundarias.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" data-permission="Cadastros.Produto.editar" onClick={aplicarSugestaoIA} className="bg-purple-600">
                    Aplicar Tudo
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {modoManual && iaSugestao && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-sm text-orange-900">
                ℹ️ <strong>Modo Manual Ativo:</strong> IA encontrou sugestões, mas não as aplicará automaticamente.
                Você pode revisar: {iaSugestao.explicacao}
              </AlertDescription>
            </Alert>
          )}

          {processandoIA && !modoManual && (formData.descricao || '').length >= 5 && !iaSugestao && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="flex items-center text-sm text-blue-900">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Analisando descrição com IA...</span>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código/SKU</Label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({...prev, codigo: e.target.value}))}
                placeholder="SKU-001"
              />
            </div>

            <div>
              <Label>Tipo de Item</Label>
              <Select value={formData.tipo_item} onValueChange={(v) => {
                setFormData(prev => ({...prev, tipo_item: v}));
                if (v === 'Matéria-Prima Produção') {
                  setModoManual(false);
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revenda">Revenda</SelectItem>
                  <SelectItem value="Matéria-Prima Produção">Matéria-Prima Produção</SelectItem>
                  <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* V21.6: NOVO BOTÃO - ENVIAR PARA PRODUÇÃO */}
          {formData.tipo_item !== 'Matéria-Prima Produção' && (
            <Alert className="border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-orange-900 mb-1">🏭 Usar este produto na Produção?</p>
                    <p className="text-xs text-orange-700">
                      Converte para Matéria-Prima e habilita uso em Ordens de Produção
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
                    onClick={enviarParaProducao}
                  >
                    <Factory className="w-4 h-4 mr-2" />
                    Enviar para Produção
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {formData.tipo_item === 'Matéria-Prima Produção' && (
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <AlertDescription className="text-sm text-green-900">
                ✅ <strong>Produto configurado para Produção</strong> - Disponível em Ordens de Produção e Fábrica
              </AlertDescription>
            </Alert>
          )}

          {/* UPLOAD DE FOTO - V22.0 */}
          <div>
            <Label>Foto do Produto</Label>
            <div className="flex items-center gap-4">
              {formData.foto_produto_url && (
                <img src={formData.foto_produto_url} alt="Produto" className="w-20 h-20 object-cover rounded border" />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFoto}
                  className="hidden"
                  id="foto-upload"
                />
                <label htmlFor="foto-upload">
                  <Button type="button" variant="outline" size="sm" disabled={uploadingFoto} asChild>
                    <span>
                      {uploadingFoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {formData.foto_produto_url ? 'Alterar Foto' : 'Upload Foto'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">📸 Usada em Pedidos, E-commerce e Portal</p>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: É BITOLA? */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-dashed">
        <div>
          <Label className="text-base font-semibold">É uma Bitola de Aço?</Label>
          <p className="text-xs text-slate-500">Habilita campos específicos e conversão PÇ ↔ KG ↔ MT</p>
        </div>
        <Switch
          checked={formData.eh_bitola}
          onCheckedChange={(v) => {
            setFormData(prev => ({...prev, eh_bitola: v}));
            if (v) {
              setFormData(prev => ({
                ...prev,
                unidade_principal: 'KG',
                unidades_secundarias: ['PÇ', 'KG', 'MT'],
                tipo_item: 'Matéria-Prima Produção'
              }));
            }
          }}
        />
      </div>

      {/* SEÇÃO 3: CAMPOS DE BITOLA */}
      {formData.eh_bitola && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-blue-900">📏 Especificações da Bitola</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Diâmetro (mm) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.bitola_diametro_mm}
                  onChange={(e) => setFormData(prev => ({...prev, bitola_diametro_mm: parseFloat(e.target.value) || 0}))}
                  placeholder="8.0"
                />
              </div>

              <div>
                <Label>Peso Teórico (kg/m) *</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.peso_teorico_kg_m}
                  onChange={(e) => setFormData(prev => ({...prev, peso_teorico_kg_m: parseFloat(e.target.value) || 0}))}
                  placeholder="0.395"
                />
                <p className="text-xs text-slate-500 mt-1">Tabela oficial ABNT</p>
              </div>

              <div>
                <Label>Tipo de Aço</Label>
                <Select value={formData.tipo_aco} onValueChange={(v) => setFormData(prev => ({...prev, tipo_aco: v}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA-25">CA-25</SelectItem>
                    <SelectItem value="CA-50">CA-50</SelectItem>
                    <SelectItem value="CA-60">CA-60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label>Comprimento Padrão da Barra (metros)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.comprimento_barra_padrao_m}
                  onChange={(e) => setFormData(prev => ({...prev, comprimento_barra_padrao_m: parseFloat(e.target.value) || 12}))}
                  placeholder="12"
                />
                <p className="text-xs text-slate-500 mt-1">🔧 Usado para calcular kg_por_peca automaticamente</p>
              </div>
            </div>

            {/* V22.0: PREVIEW DE CONVERSÃO */}
            {calculoConversao && (
              <Alert className="border-green-300 bg-green-50">
                <Calculator className="w-4 h-4 text-green-700" />
                <AlertDescription>
                  <p className="font-semibold text-sm text-green-900 mb-2">✅ Conversões Calculadas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                    <p>• 1 PÇ (barra) = <strong>{calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
                    <p>• 1 MT = <strong>{calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
                    <p>• 1 TON = <strong>{calculoConversao.peca_por_ton.toFixed(1)} PÇ</strong></p>
                    <p>• 1 PÇ = <strong>{calculoConversao.metros_por_peca} MT</strong></p>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    💡 Essas conversões serão usadas em Vendas, Compras e Estoque automaticamente
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* SEÇÃO 4: UNIDADES - V22.0 CRÍTICO */}
      <Card className="border-indigo-300 bg-indigo-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            V22.0: Unidades e Conversões
          </h3>

          <Alert className="border-indigo-400 bg-indigo-100">
            <AlertDescription className="text-sm text-indigo-900">
              🎯 <strong>REGRA MESTRE:</strong> As unidades selecionadas aqui estarão disponíveis em Vendas, Compras e Movimentações
            </AlertDescription>
          </Alert>

          <div>
            <Label>Unidade Principal (Relatórios e Dashboard)</Label>
            <Select value={formData.unidade_principal} onValueChange={(v) => setFormData(prev => ({...prev, unidade_principal: v}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">Unidade (UN)</SelectItem>
                <SelectItem value="PÇ">Peça (PÇ)</SelectItem>
                <SelectItem value="KG">Quilograma (KG)</SelectItem>
                <SelectItem value="MT">Metro (MT)</SelectItem>
                <SelectItem value="TON">Tonelada (TON)</SelectItem>
                <SelectItem value="CX">Caixa (CX)</SelectItem>
                <SelectItem value="LT">Litro (LT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unidades Habilitadas (Multi-Select) *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
              {['UN', 'PÇ', 'KG', 'MT', 'TON', 'CX', 'BARRA'].map(unidade => (
                <Badge
                  key={unidade}
                  className={`cursor-pointer transition-all ${
                    (formData.unidades_secundarias || []).includes(unidade)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  onClick={() => toggleUnidadeSecundaria(unidade)}
                >
                  {(formData.unidades_secundarias || []).includes(unidade) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {unidade}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ✅ Selecionadas: {(formData.unidades_secundarias || []).join(', ')}
            </p>
          </div>

          {/* V22.0: Visualização de Como Será Usado */}
          {formData.unidades_secundarias && formData.unidades_secundarias.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm text-blue-900">
                <p className="font-semibold mb-2">📦 Como será usado nos módulos:</p>
                <div className="space-y-1 text-xs">
                  <p>• <strong>Vendas:</strong> Dropdown terá opções: {formData.unidades_secundarias.join(', ')}</p>
                  <p>• <strong>Compras:</strong> Dropdown terá opções: {formData.unidades_secundarias.join(', ')}</p>
                  <p>• <strong>Estoque:</strong> Saldo sempre em KG (conversão automática)</p>
                  <p>• <strong>NF-e:</strong> Unidade do pedido + equivalente KG</p>
                  {formData.tipo_item === 'Matéria-Prima Produção' && (
                    <p className="text-orange-700 font-semibold">• <strong>Produção:</strong> ✅ Disponível em OPs</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO 5: Precificação */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-green-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            💰 Precificação
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <ProtectedField module="Estoque" submodule="Produto" tab="Precificacao" field="custo_aquisicao" action="visualizar" asText>
              <div>
                <Label>Custo Aquisição</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_aquisicao}
                  onChange={(e) => setFormData(prev => ({...prev, custo_aquisicao: parseFloat(e.target.value) || 0}))}
                  placeholder="0.00"
                />
              </div>
            </ProtectedField>

            <div>
              <Label>Preço Venda</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.preco_venda}
                onChange={(e) => setFormData(prev => ({...prev, preco_venda: parseFloat(e.target.value) || 0}))}
                placeholder="0.00"
              />
            </div>

            <ProtectedField module="Estoque" submodule="Produto" tab="Precificacao" field="margem_percentual" action="visualizar" asText>
              <div>
                <Label>Margem (%)</Label>
                <Input
                  type="number"
                  value={formData.custo_aquisicao > 0 ? (((formData.preco_venda - formData.custo_aquisicao) / formData.custo_aquisicao) * 100).toFixed(2) : 0}
                  disabled
                  className="bg-slate-100"
                />
              </div>
            </ProtectedField>
          </div>
        </CardContent>
      </Card>

      {/* V21.1.2: NOVA SEÇÃO - PESO E DIMENSÕES (FRETE/E-COMMERCE) */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-orange-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Peso e Dimensões (Logística & E-commerce)
          </h3>

          <Alert className="border-orange-300 bg-orange-100">
            <AlertDescription className="text-xs text-orange-900">
              📦 <strong>Usado em:</strong> Cálculo de frete, cubagem de caminhão, catálogo de marketplace (ML, Shopee), Portal do Cliente
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Peso Líquido (kg)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.peso_liquido_kg}
                onChange={(e) => setFormData(prev => ({...prev, peso_liquido_kg: parseFloat(e.target.value) || 0}))}
                placeholder="0.000"
              />
              <p className="text-xs text-slate-500 mt-1">Peso do produto sem embalagem</p>
            </div>

            <div>
              <Label>Peso Bruto (kg)</Label>
              <Input
                type="number"
                step="0.001"
                value={formData.peso_bruto_kg}
                onChange={(e) => setFormData(prev => ({...prev, peso_bruto_kg: parseFloat(e.target.value) || 0}))}
                placeholder="0.000"
              />
              <p className="text-xs text-slate-500 mt-1">Peso com embalagem</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.altura_cm}
                onChange={(e) => setFormData(prev => ({...prev, altura_cm: parseFloat(e.target.value) || 0}))}
                placeholder="0.0"
              />
            </div>

            <div>
              <Label>Largura (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.largura_cm}
                onChange={(e) => setFormData(prev => ({...prev, largura_cm: parseFloat(e.target.value) || 0}))}
                placeholder="0.0"
              />
            </div>

            <div>
              <Label>Comprimento (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={formData.comprimento_cm}
                onChange={(e) => setFormData(prev => ({...prev, comprimento_cm: parseFloat(e.target.value) || 0}))}
                placeholder="0.0"
              />
            </div>

            <div>
              <Label>Volume (m³)</Label>
              <Input
                type="number"
                value={formData.volume_m3?.toFixed(6) || 0}
                disabled
                className="bg-slate-100"
              />
              <p className="text-xs text-slate-500 mt-1">Calculado automaticamente</p>
            </div>
          </div>

          {formData.volume_m3 > 0 && (
            <Alert className="border-green-300 bg-green-50">
              <AlertDescription className="text-xs text-green-900">
                ✅ <strong>Cubagem:</strong> {formData.volume_m3.toFixed(6)} m³ por unidade
                {formData.peso_bruto_kg > 0 && ` • Peso taxado: ${Math.max(formData.peso_bruto_kg, formData.volume_m3 * 300).toFixed(2)} kg`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* SEÇÃO: FISCAL */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Configuração Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="ncm">NCM (Código Fiscal)</Label>
              <Input
                id="ncm"
                value={formData.ncm || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, ncm: e.target.value }))}
                placeholder="00000000"
                maxLength={8}
              />
              {sugestoesIA.ncm_info && (
                <p className="text-xs text-blue-600 mt-1">
                  ℹ️ {sugestoesIA.ncm_info}
                </p>
              )}
            </div>

            <div>
              <BotaoBuscaAutomatica
                tipo="ncm"
                valor={formData.ncm}
                onDadosEncontrados={handleDadosNCM}
                disabled={!formData.ncm || formData.ncm.length !== 8}
              >
                Buscar NCM
              </BotaoBuscaAutomatica>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cest">CEST</Label>
              <Input
                id="cest"
                value={formData.cest || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cest: e.target.value }))}
                placeholder="00.000.00"
                maxLength={10}
              />
            </div>
            <div>
              <Label htmlFor="unidade_medida">Unidade de Medida Fiscal</Label>
              <Input
                id="unidade_medida"
                value={formData.unidade_medida || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, unidade_medida: e.target.value }))}
                placeholder="UN, KG, M"
              />
            </div>
          </div>

          <div>
            <Label>Status do Produto</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({...prev, status: v}))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Descontinuado">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>

      {/* V22.0: RESUMO FINAL */}
      {formData.eh_bitola && calculoConversao && (
        <Alert className="border-purple-300 bg-purple-100">
          <AlertDescription>
            <p className="font-semibold text-sm text-purple-900 mb-2">🎯 Resumo da Configuração:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-800">
              <p>✅ Produto: <strong>{formData.descricao || 'Não informado'}</strong></p>
              <p>✅ Unidade Principal: <strong>{formData.unidade_principal}</strong></p>
              <p>✅ Venda/Compra em: <strong>{(formData.unidades_secundarias || []).join(', ')}</strong></p>
              <p>✅ Estoque sempre em: <strong>KG</strong></p>
              <p>✅ 1 Peça = <strong>{calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
              <p>✅ 1 Metro = <strong>{calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </FormWrapper>
  );
}