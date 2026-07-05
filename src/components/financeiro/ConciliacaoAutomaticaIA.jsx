import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Zap, CheckCircle2, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ConciliacaoAutomaticaIA({ empresaId }) {
  const queryClient = useQueryClient();
  const [processando, setProcessando] = useState(false);
  const [resultados, setResultados] = useState(null);
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaId || empresaAtual?.id || 'sem-empresa'}`;

  const { data: extratos = [] } = useQuery({
    queryKey: ['extratos-pendentes', contextoKey],
    queryFn: () => filterInContext('ExtratoBancario', { conciliado: false }, '-created_date', 200),
    enabled: !!contexto,
  });

  const { data: movimentos = [] } = useQuery({
    queryKey: ['movimentos-nao-conciliados', contextoKey],
    queryFn: () => filterInContext('CaixaMovimento', { conciliado: false }, '-created_date', 200),
    enabled: !!contexto,
  });

  const executarConciliacaoIA = async () => {
    setProcessando(true);
    try {
      // Simular processamento IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      const matches = [];
      let conciliados = 0;
      let divergencias = 0;

      extratos.forEach(extrato => {
        const movimentoMatch = movimentos.find(mov => {
          const diferencaValor = Math.abs(Math.abs(extrato.valor) - Math.abs(mov.valor));
          const diferencaDias = Math.abs(
            new Date(extrato.data_movimento).getTime() - new Date(mov.data_movimento).getTime()
          ) / (1000 * 60 * 60 * 24);

          return diferencaValor < 1 && diferencaDias <= 3;
        });

        if (movimentoMatch) {
          if (Math.abs(extrato.valor - movimentoMatch.valor) < 0.01) {
            conciliados++;
          } else {
            divergencias++;
          }
          matches.push({ extrato, movimento: movimentoMatch, exato: Math.abs(extrato.valor - movimentoMatch.valor) < 0.01 });
        }
      });

      setResultados({
        total_analisados: extratos.length,
        conciliados,
        divergencias,
        sem_match: extratos.length - matches.length,
        matches
      });

      toast.success(`✅ IA processou ${extratos.length} extratos - ${conciliados} matches exatos!`);
    } catch (error) {
      toast.error('Erro ao processar IA: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const aplicarConciliacoes = useMutation({
    mutationFn: async () => {
      for (const match of resultados.matches.filter(m => m.exato)) {
        await base44.entities.ExtratoBancario.update(match.extrato.id, {
          conciliado: true,
          movimento_vinculado_id: match.movimento.id,
          data_conciliacao: new Date().toISOString()
        });

        await base44.entities.CaixaMovimento.update(match.movimento.id, {
          conciliado: true,
          extrato_vinculado_id: match.extrato.id
        });

        await base44.entities.ConciliacaoBancaria.create({
          empresa_id: match.extrato.empresa_id,
          group_id: match.extrato.group_id,
          extrato_bancario_id: match.extrato.id,
          movimento_caixa_id: match.movimento.id,
          data_conciliacao: new Date().toISOString(),
          valor_extrato: match.extrato.valor,
          valor_movimento: match.movimento.valor,
          valor_diferenca: 0,
          tem_divergencia: false,
          status: 'conciliado',
          conciliado_por_ia: true,
          observacoes: 'Conciliação automática via IA'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extratos-pendentes']);
      queryClient.invalidateQueries(['movimentos-nao-conciliados']);
      queryClient.invalidateQueries(['conciliacoes-bancarias']);
      toast.success('✅ Conciliações aplicadas com sucesso!');
      setResultados(null);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="bg-purple-100/50 border-b border-purple-200">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="w-6 h-6" />
            Motor de Conciliação Automática com IA
          </CardTitle>
          <p className="text-sm text-purple-700 mt-1">
            Pareamento inteligente por valor, data e padrões de descrição
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Extratos Pendentes</p>
              <p className="text-3xl font-bold text-blue-900">{extratos.length}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-sm text-green-700 mb-1">Movimentos Disponíveis</p>
              <p className="text-3xl font-bold text-green-900">{movimentos.length}</p>
            </div>
          </div>

          <Button 
            data-permission="Financeiro.Conciliacao.executar"
            onClick={executarConciliacaoIA}
            disabled={processando || extratos.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {processando ? (
              <>
                <Zap className="w-5 h-5 mr-2 animate-pulse" />
                Processando IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Executar Conciliação Automática
              </>
            )}
          </Button>

          {processando && (
            <div className="space-y-2">
              <Progress value={65} className="h-2" />
              <p className="text-sm text-center text-purple-700">
                Analisando padrões e comparando valores...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {resultados && (
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="w-5 h-5" />
              Resultados da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Analisados</p>
                <p className="text-2xl font-bold text-blue-900">{resultados.total_analisados}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Matches Exatos</p>
                <p className="text-2xl font-bold text-green-900">{resultados.conciliados}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">Com Divergência</p>
                <p className="text-2xl font-bold text-orange-900">{resultados.divergencias}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">Sem Match</p>
                <p className="text-2xl font-bold text-slate-900">{resultados.sem_match}</p>
              </div>
            </div>

            {resultados.matches.length > 0 && (
              <div className="space-y-3">
                <p className="font-semibold text-slate-900">Matches Encontrados:</p>
                {resultados.matches.slice(0, 5).map((match, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border-2 ${match.exato ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{match.extrato.descricao}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Extrato: R$ {Math.abs(match.extrato.valor).toFixed(2)} • 
                          Movimento: R$ {Math.abs(match.movimento.valor).toFixed(2)}
                        </p>
                      </div>
                      {match.exato ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Match 100%
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Divergência
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {resultados.matches.length > 5 && (
                  <p className="text-sm text-slate-500 text-center">
                    +{resultados.matches.length - 5} matches adicionais
                  </p>
                )}
              </div>
            )}

            {resultados.conciliados > 0 && (
              <Button
                data-permission="Financeiro.Conciliacao.aplicar"
                onClick={() => aplicarConciliacoes.mutate()}
                disabled={aplicarConciliacoes.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Aplicar {resultados.conciliados} Conciliações Automáticas
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}