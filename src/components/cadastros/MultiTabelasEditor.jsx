import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Calculator, Loader2, Package, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.1.2 - EDITOR MULTI-TABELAS
 * Permite selecionar várias tabelas e aplicar regras de recálculo em todas simultaneamente
 */
export default function MultiTabelasEditor({ isOpen, onClose, tabelas }) {
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const [tabelasSelecionadas, setTabelasSelecionadas] = useState([]);
  const [aplicando, setAplicando] = useState(false);
  
  const [regraGlobal, setRegraGlobal] = useState({
    base: 'custo_medio',
    tipo: 'markup',
    valor: 30
  });

  const toggleTabela = (tabelaId) => {
    if (tabelasSelecionadas.includes(tabelaId)) {
      setTabelasSelecionadas(prev => prev.filter(id => id !== tabelaId));
    } else {
      setTabelasSelecionadas(prev => [...prev, tabelaId]);
    }
  };

  const handleSelecionarTodas = () => {
    if (tabelasSelecionadas.length === tabelas.length) {
      setTabelasSelecionadas([]);
    } else {
      setTabelasSelecionadas(tabelas.map(t => t.id));
    }
  };

  const handleAplicarRegra = async () => {
    if (tabelasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma tabela');
      return;
    }

    setAplicando(true);

    try {
      let totalItensAtualizados = 0;

      for (const tabelaId of tabelasSelecionadas) {
        // Buscar itens da tabela
        const itens = await base44.entities.TabelaPrecoItem.filter({ tabela_preco_id: tabelaId });
        
        // Buscar produtos para pegar custo atualizado
        const produtoIds = itens.map(i => i.produto_id);
        const produtos = await filterInContext('Produto', {}, 'descricao', 999);
        const produtosMap = {};
        produtos.forEach(p => produtosMap[p.id] = p);

        // Recalcular cada item
        for (const item of itens) {
          const produto = produtosMap[item.produto_id];
          if (!produto) continue;

          let custoBase = item.custo_base || 0;

          // Atualizar custo base se necessário
          if (regraGlobal.base === 'custo_medio') {
            custoBase = produto.custo_medio || produto.custo_aquisicao || custoBase;
          } else if (regraGlobal.base === 'custo_aquisicao') {
            custoBase = produto.custo_aquisicao || custoBase;
          }

          // Calcular novo preço
          let novoPreco = custoBase;

          switch (regraGlobal.tipo) {
            case 'markup':
              novoPreco = custoBase * (1 + regraGlobal.valor / 100);
              break;
            case 'margem':
              novoPreco = custoBase / (1 - regraGlobal.valor / 100);
              break;
            case 'valor_fixo':
              novoPreco = custoBase + regraGlobal.valor;
              break;
            case 'percentual_aumento':
              novoPreco = item.preco_base * (1 + regraGlobal.valor / 100);
              break;
          }

          const margem = custoBase > 0 ? ((novoPreco - custoBase) / custoBase * 100) : 0;

          // Atualizar item
          await base44.entities.TabelaPrecoItem.update(item.id, {
            custo_base: custoBase,
            preco_base: novoPreco,
            preco_com_desconto: novoPreco * (1 - (item.percentual_desconto || 0) / 100),
            margem_percentual: margem,
            preco_anterior: item.preco_base,
            data_ultima_alteracao: new Date().toISOString(),
            motivo_alteracao: `Recálculo multi-tabela: ${regraGlobal.tipo} ${regraGlobal.valor}${regraGlobal.tipo.includes('percentual') || regraGlobal.tipo === 'markup' || regraGlobal.tipo === 'margem' ? '%' : ''}`
          });

          totalItensAtualizados++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tabelas-preco-itens'] });
      toast.success(`✅ ${totalItensAtualizados} itens atualizados em ${tabelasSelecionadas.length} tabelas`);
      onClose();
    } catch (error) {
      toast.error('❌ Erro ao aplicar regra: ' + error.message);
    } finally {
      setAplicando(false);
    }
  };

  const handleAplicarIAGlobal = async () => {
    if (tabelasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma tabela');
      return;
    }

    setAplicando(true);

    try {
      const tabelasNomes = tabelas
        .filter(t => tabelasSelecionadas.includes(t.id))
        .map(t => t.nome)
        .join(', ');

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o PriceBrain 2.0, especialista em precificação estratégica multi-canal.

Analise as seguintes tabelas de preço que serão atualizadas em lote:
${tabelasNomes}

Considerando:
- Diferentes canais de venda (varejo, atacado, obra, marketplace)
- Necessidade de manter competitividade
- Preservar margem mínima de 15%
- Sazonalidade e estratégias de mercado

Retorne UMA regra de markup geral otimizada que possa ser aplicada em todas as tabelas selecionadas.

Responda com:
- markup_sugerido: percentual de markup recomendado (%)
- estrategia: explicação da estratégia
- observacoes: insights importantes`,
        response_json_schema: {
          type: "object",
          properties: {
            markup_sugerido: { type: "number" },
            estrategia: { type: "string" },
            observacoes: { type: "string" }
          }
        }
      });

      setRegraGlobal({
        ...regraGlobal,
        tipo: 'markup',
        valor: resultado.markup_sugerido
      });

      toast.success(`✨ PriceBrain: ${resultado.estrategia}`);
      
      if (resultado.observacoes) {
        setTimeout(() => {
          toast.info(`💡 ${resultado.observacoes}`);
        }, 1500);
      }
    } catch (error) {
      toast.error('❌ Erro ao consultar IA: ' + error.message);
    } finally {
      setAplicando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Edição Multi-Tabela V21.1.2
          </DialogTitle>
        </DialogHeader>

        <Alert className="border-purple-200 bg-purple-50">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900">
            🚀 <strong>Novo V21.1.2:</strong> Selecione múltiplas tabelas e aplique a mesma regra de recálculo em todas simultaneamente
          </AlertDescription>
        </Alert>

        {/* SELEÇÃO DE TABELAS */}
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Selecionar Tabelas</CardTitle>
              <Button size="sm" variant="outline" onClick={handleSelecionarTodas}>
                {tabelasSelecionadas.length === tabelas.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 max-h-60 overflow-y-auto">
            {tabelas.map(tabela => (
              <div 
                key={tabela.id}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                  tabelasSelecionadas.includes(tabela.id) ? 'bg-green-50 border-green-300' : 'hover:bg-slate-50'
                }`}
              >
                <Checkbox
                  checked={tabelasSelecionadas.includes(tabela.id)}
                  onCheckedChange={() => toggleTabela(tabela.id)}
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{tabela.nome}</p>
                  <div className="flex gap-3 text-xs text-slate-600 mt-1">
                    <Badge variant="outline" className="text-xs">{tabela.tipo}</Badge>
                    <span>{tabela.ativo ? '✅ Ativa' : '❌ Inativa'}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CONFIGURAR REGRA */}
        <Card>
          <CardHeader className="bg-blue-50 border-b pb-3">
            <CardTitle className="text-base">Configurar Regra Global</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Base de Cálculo</Label>
                <Select value={regraGlobal.base} onValueChange={(v) => setRegraGlobal({...regraGlobal, base: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custo_medio">Custo Médio</SelectItem>
                    <SelectItem value="custo_aquisicao">Último Custo</SelectItem>
                    <SelectItem value="atual">Manter Custo Atual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tipo de Ajuste</Label>
                <Select value={regraGlobal.tipo} onValueChange={(v) => setRegraGlobal({...regraGlobal, tipo: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markup">Markup sobre Custo (%)</SelectItem>
                    <SelectItem value="margem">Margem Desejada (%)</SelectItem>
                    <SelectItem value="percentual_aumento">Aumento sobre Preço Atual (%)</SelectItem>
                    <SelectItem value="valor_fixo">Adicionar Valor (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Valor</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={regraGlobal.valor}
                  onChange={(e) => setRegraGlobal({...regraGlobal, valor: parseFloat(e.target.value) || 0})}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAplicarRegra}
                disabled={aplicando || tabelasSelecionadas.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {aplicando ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4 mr-2" />
                )}
                Aplicar em {tabelasSelecionadas.length} Tabela(s)
              </Button>

              <Button
                type="button"
                onClick={handleAplicarIAGlobal}
                disabled={aplicando || tabelasSelecionadas.length === 0}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {aplicando ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Sugerir com IA
              </Button>
            </div>

            <p className="text-xs text-center text-slate-600">
              {regraGlobal.tipo === 'markup' && `Preço = Custo × (1 + ${regraGlobal.valor}%)`}
              {regraGlobal.tipo === 'margem' && `Preço = Custo ÷ (1 - ${regraGlobal.valor}%)`}
              {regraGlobal.tipo === 'percentual_aumento' && `Preço = Preço Atual × (1 + ${regraGlobal.valor}%)`}
              {regraGlobal.tipo === 'valor_fixo' && `Preço = Custo + R$ ${regraGlobal.valor}`}
            </p>
          </CardContent>
        </Card>

        {/* PREVIEW */}
        {tabelasSelecionadas.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Tabelas que serão atualizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {tabelas.filter(t => tabelasSelecionadas.includes(t.id)).map(tabela => (
                  <div key={tabela.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="font-semibold text-sm">{tabela.nome}</p>
                      <p className="text-xs text-slate-600">{tabela.tipo}</p>
                    </div>
                    <Badge className="bg-green-600">Será atualizada</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}