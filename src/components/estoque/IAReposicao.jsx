
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';

/**
 * IA de Reposição de Estoque
 * Prevê consumo e sugere quantidades ideais de compra
 */
export default function IAReposicao({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, filterInContext, createInContext } = useContextoVisual();
  const { canCreate, canEdit } = usePermissions();
  const contextKey = empresaId || empresaAtual?.id || grupoAtual?.id || 'sem-contexto';
  const contextoValido = contextKey !== 'sem-contexto';
  const podeAnalisar = canEdit('Estoque', 'IA Reposição') || canEdit('Estoque', 'IA Reposicao') || canEdit('Estoque', 'Produtos');
  const podeSolicitar = canCreate('Estoque', 'Solicitações Compra') || canCreate('Estoque', 'Solicitacoes Compra') || canCreate('Compras', 'Solicitações') || canCreate('Compras', 'Solicitacoes');
  const [analisando, setAnalisando] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-ia-reposicao', contextKey],
    queryFn: () => filterInContext('Produto', {}, '-updated_date', 1000),
    enabled: contextoValido,
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ['movimentacoes-estoque-ia-reposicao', contextKey],
    queryFn: () => filterInContext('MovimentacaoEstoque', {}, '-data_movimentacao', 500),
    enabled: contextoValido,
  });

  const analisarMutation = useMutation({
    mutationFn: async () => {
      if (!contextoValido) throw new Error('Selecione um grupo ou empresa antes de analisar reposicao.');
      if (!podeAnalisar) throw new Error('Sem permissao para executar analise de reposicao.');
      setAnalisando(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sugestoesGeradas = [];

      produtos
        .filter(p => (!empresaId || p.empresa_id === empresaId) && p.status === 'Ativo')
        .forEach(produto => {
          const disponivel = (produto.estoque_atual || 0) - (produto.estoque_reservado || 0);
          const minimo = produto.estoque_minimo || 0;

          // Calcular consumo médio dos últimos 30 dias
          const hoje = new Date();
          const ha30Dias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

          const saidas = movimentacoes.filter(m =>
            m.produto_id === produto.id &&
            m.tipo_movimento === 'saida' &&
            new Date(m.data_movimentacao) >= ha30Dias
          );

          const consumoTotal = saidas.reduce((sum, m) => sum + (m.quantidade || 0), 0);
          const consumoMedioDiario = consumoTotal / 30;
          const consumoProjetado30Dias = consumoMedioDiario * 30;

          // Se disponível < mínimo OU se consumo projetado > disponível
          if (disponivel < minimo || consumoProjetado30Dias > disponivel) {
            const quantidadeSugerida = Math.ceil(
              Math.max(
                minimo - disponivel,
                consumoProjetado30Dias - disponivel
              )
            );

            sugestoesGeradas.push({
              produto_id: produto.id,
              produto_descricao: produto.descricao,
              produto_codigo: produto.codigo,
              estoque_atual: produto.estoque_atual,
              estoque_disponivel: disponivel,
              estoque_minimo: minimo,
              consumo_medio_diario: consumoMedioDiario.toFixed(2),
              consumo_projetado_30d: consumoProjetado30Dias.toFixed(2),
              quantidade_sugerida: quantidadeSugerida,
              criticidade: disponivel < minimo ? 'alta' : 'media',
              motivo: disponivel < minimo 
                ? 'Estoque abaixo do mínimo'
                : 'Consumo projetado excede disponível'
            });
          }
        });

      setSugestoes(sugestoesGeradas.sort((a, b) => 
        (b.criticidade === 'alta' ? 1 : 0) - (a.criticidade === 'alta' ? 1 : 0)
      ));

      setAnalisando(false);
      return sugestoesGeradas;
    },
    onSuccess: (sugestoesGeradas) => {
      toast({
        title: '✅ Análise Concluída!',
        description: `${sugestoesGeradas.length} produto(s) precisam de reposição`
      });
    }
  });

  const gerarSolicitacaoMutation = useMutation({
    mutationFn: async (sugestao) => {
      if (!podeSolicitar) throw new Error('Sem permissao para gerar solicitacao de compra.');
      return await createInContext('SolicitacaoCompra', {
        numero_solicitacao: `SC-${Date.now()}`,
        data_solicitacao: new Date().toISOString().split('T')[0],
        solicitante: 'Sistema IA',
        setor: 'Estoque',
        produto_id: sugestao.produto_id,
        produto_descricao: sugestao.produto_descricao,
        quantidade_solicitada: sugestao.quantidade_sugerida,
        unidade_medida: 'UN',
        justificativa: `${sugestao.motivo}. Consumo médio: ${sugestao.consumo_medio_diario}/dia. Projeção 30 dias: ${sugestao.consumo_projetado_30d}.`,
        prioridade: sugestao.criticidade === 'alta' ? 'Urgente' : 'Média',
        status: 'Pendente'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-compra'] });
      toast({ title: '✅ Solicitação de compra gerada!' });
    }
  });

  return (
    <div className="space-y-4">
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            IA de Reposição Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => analisarMutation.mutate()}
            disabled={analisando || !contextoValido || !podeAnalisar}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {analisando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analisando Consumo...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analisar Necessidade de Reposição
              </>
            )}
          </Button>

          {sugestoes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-purple-900">
                  {sugestoes.length} produto(s) necessitam reposição
                </p>
                <Badge className="bg-purple-600">
                  {sugestoes.filter(s => s.criticidade === 'alta').length} crítico(s)
                </Badge>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sugestoes.map((sug, idx) => (
                  <Card 
                    key={idx}
                    className={`border ${
                      sug.criticidade === 'alta' 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-orange-300 bg-orange-50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{sug.produto_descricao}</p>
                            {sug.criticidade === 'alta' && (
                              <Badge className="bg-red-600 text-xs">Urgente</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Disponível: {sug.estoque_disponivel} | Mínimo: {sug.estoque_minimo}
                          </p>
                          <p className="text-xs text-slate-600">
                            Consumo médio: {sug.consumo_medio_diario}/dia
                          </p>
                          <p className="text-xs text-blue-600 font-semibold mt-2">
                            📦 Sugestão: Comprar {sug.quantidade_sugerida} unidades
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => gerarSolicitacaoMutation.mutate(sug)}
                          disabled={gerarSolicitacaoMutation.isPending || !contextoValido || !podeSolicitar}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Solicitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {sugestoes.length === 0 && !analisando && (
            <div className="text-center py-8 text-purple-600">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Clique em "Analisar" para verificar necessidades</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
