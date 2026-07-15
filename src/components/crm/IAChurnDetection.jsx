import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Sparkles, TrendingDown, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.1 - IA de Detecção de Churn
 * Analisa clientes A/B sem movimento e cria Oportunidades
 */
export default function IAChurnDetection({ clientes = [] }) {
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const queryClient = useQueryClient();
  const { filterInContext, createInContext } = useContextoVisual();

  const executarAnaliseChurn = async () => {
    setExecutando(true);
    setResultado(null);

    try {
      const clientesRisco = [];
      const hoje = new Date();

      // Filtrar clientes A e B sem movimento > 30 dias
      for (const cliente of clientes) {
        if (!cliente.classificacao_abc || !['A', 'B'].includes(cliente.classificacao_abc)) continue;
        if (cliente.status !== 'Ativo') continue;

        const diasSemCompra = cliente.dias_sem_comprar || 0;
        const valorHistorico = cliente.valor_compras_12meses || 0;

        if (diasSemCompra > 30 && valorHistorico > 5000) {
          clientesRisco.push({
            ...cliente,
            motivo_risco: diasSemCompra > 90 ? 'Crítico - 90+ dias' :
                          diasSemCompra > 60 ? 'Alto - 60+ dias' :
                          'Médio - 30+ dias',
            prioridade_crm: diasSemCompra > 90 ? 'Urgente' : 'Alta'
          });
        }
      }

      // Criar oportunidades de reativação
      const oportunidadesCriadas = [];

      for (const cliente of clientesRisco.slice(0, 10)) { // Limitar a 10 por execução
        // Verificar se já existe oportunidade aberta
        const oppExistente = await filterInContext('Oportunidade', {
          cliente_id: cliente.id,
          status: { $in: ['Aberto', 'Em Andamento'] }
        });

        if (oppExistente.length === 0) {
          const novaOpp = await createInContext('Oportunidade', {
            titulo: `⚠️ Risco Churn - ${cliente.nome_fantasia || cliente.nome}`,
            descricao: `Cliente classe ${cliente.classificacao_abc} sem comprar há ${cliente.dias_sem_comprar} dias. Valor histórico: R$ ${cliente.valor_compras_12meses.toLocaleString('pt-BR')}`,
            cliente_id: cliente.id,
            cliente_nome: cliente.nome_fantasia || cliente.nome,
            cliente_email: cliente.contatos?.find(c => c.tipo === 'Email')?.valor,
            cliente_telefone: cliente.contatos?.find(c => c.tipo === 'WhatsApp')?.valor,
            origem: 'IA Churn',
            responsavel: cliente.vendedor_responsavel || 'Vendedor Principal',
            responsavel_id: cliente.vendedor_responsavel_id,
            etapa: 'Reativação',
            valor_estimado: Math.round(cliente.ticket_medio || cliente.valor_compras_12meses / 12),
            probabilidade: 40,
            temperatura: 'Morno',
            data_abertura: new Date().toISOString().split('T')[0],
            data_previsao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Aberto',
            score: 60,
            proxima_acao: `Contatar cliente - Risco de churn (${cliente.dias_sem_comprar} dias sem compra)`,
            data_proxima_acao: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            observacoes: `🤖 Criado automaticamente pela IA de Churn Detection.\n\nMotivo: ${cliente.motivo_risco}\nClassificação ABC: ${cliente.classificacao_abc}\nÚltima compra: ${new Date(cliente.data_ultima_compra).toLocaleDateString('pt-BR')}`
          });

          oportunidadesCriadas.push(novaOpp);
        }
      }

      setResultado({
        total_analisados: clientes.length,
        clientes_risco: clientesRisco.length,
        oportunidades_criadas: oportunidadesCriadas.length,
        lista_criadas: oportunidadesCriadas
      });

      queryClient.invalidateQueries({ queryKey: ['oportunidades'] });

      toast.success(`🧠 IA detectou ${clientesRisco.length} clientes em risco - ${oportunidadesCriadas.length} oportunidades criadas`);

    } catch (error) {
      toast.error('Erro na análise de churn');
      console.error('[components/crm/IAChurnDetection.jsx] Error:', error);
    } finally {
      setExecutando(false);
    }
  };

  return (
    <Card className="border-orange-300 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader className="bg-white/80 border-b">
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertTriangle className="w-6 h-6 text-orange-600" />
          IA de Detecção de Churn
        </CardTitle>
        <p className="text-sm text-orange-700 mt-1">
          Analisa clientes A/B sem movimento e cria oportunidades automáticas de reativação
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div>
            <p className="font-semibold text-slate-900 mb-1">Executar Análise de Churn</p>
            <p className="text-xs text-slate-600">
              Detecta clientes classe A/B com + de 30 dias sem compra
            </p>
          </div>
          <Button
            onClick={executarAnaliseChurn}
            disabled={executando}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {executando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Executar IA
              </>
            )}
          </Button>
        </div>

        {resultado && (
          <Alert className="border-green-300 bg-green-50">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-green-900">✅ Análise Concluída!</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-green-700">Clientes Analisados</p>
                    <p className="text-xl font-bold text-green-900">{resultado.total_analisados}</p>
                  </div>
                  <div>
                    <p className="text-orange-700">Em Risco</p>
                    <p className="text-xl font-bold text-orange-600">{resultado.clientes_risco}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Oportunidades Criadas</p>
                    <p className="text-xl font-bold text-blue-600">{resultado.oportunidades_criadas}</p>
                  </div>
                </div>

                {resultado.oportunidades_criadas > 0 && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <p className="text-xs text-slate-600 mb-2">Oportunidades criadas:</p>
                    <div className="space-y-1">
                      {resultado.lista_criadas.slice(0, 5).map((opp, idx) => (
                        <p key={idx} className="text-xs text-slate-700">
                          • {opp.cliente_nome} - {opp.dias_sem_contato || 0} dias
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}