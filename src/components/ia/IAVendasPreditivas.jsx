import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target, Zap, Brain, Mail } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { useUser } from '@/components/lib/UserContext';
import { toast } from 'sonner';

/**
 * IA de Vendas Preditivas
 * Identifica clientes propensos à recompra
 */
export default function IAVendasPreditivas({ empresaId }) {
  const [previsoes, setPrevisoes] = useState([]);
  const [analisando, setAnalisando] = useState(false);
  const { contexto, empresaAtual, grupoAtual, filterInContext } = useContextoVisual();
  const { user } = useUser();
  const eId = empresaId || (contexto === 'grupo' ? null : empresaAtual?.id);
  const gId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || (() => {
    try { return localStorage.getItem('group_atual_id'); } catch { return null; }
  })();
  const contextoValido = !!(eId || gId);

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', 'ia-vendas-preditivas', eId || 'sem', gId || 'sem'],
    queryFn: () => filterInContext('Cliente', {}, 'nome', 1000),
    enabled: contextoValido,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', 'ia-vendas-preditivas', eId || 'sem', gId || 'sem'],
    queryFn: () => filterInContext('Pedido', {}, '-data_pedido', 500),
    enabled: contextoValido,
  });

  const analisarProbabilidadeRecompra = async () => {
    if (!contextoValido) {
      toast.error('Selecione um grupo ou empresa antes de executar a analise.');
      return;
    }

    setAnalisando(true);

    const hoje = new Date();
    const previsoesGeradas = [];

    clientes
      .filter(c => c.status === 'Ativo' && c.data_ultima_compra)
      .forEach(cliente => {
        const pedidosCliente = pedidos.filter(p => p.cliente_id === cliente.id);
        
        if (pedidosCliente.length < 2) return;

        // Calcular ciclo médio de compra
        const datas = pedidosCliente
          .map(p => new Date(p.data_pedido))
          .sort((a, b) => a - b);

        const intervalos = [];
        for (let i = 1; i < datas.length; i++) {
          const dias = Math.floor((datas[i] - datas[i-1]) / (1000 * 60 * 60 * 24));
          intervalos.push(dias);
        }

        const cicloMedio = intervalos.reduce((sum, i) => sum + i, 0) / intervalos.length;
        const diasDesdeUltima = Math.floor(
          (hoje - new Date(cliente.data_ultima_compra)) / (1000 * 60 * 60 * 24)
        );

        // Calcular probabilidade
        const fatorCiclo = (diasDesdeUltima / cicloMedio) * 100;
        let probabilidade = Math.min(100, Math.max(0, fatorCiclo));

        // Ajustes baseados em outros fatores
        if (cliente.classificacao_abc === 'A') probabilidade += 10;
        if (cliente.score_pagamento > 90) probabilidade += 5;
        if (diasDesdeUltima > cicloMedio * 1.5) probabilidade -= 20;

        probabilidade = Math.min(100, Math.max(0, probabilidade));

        if (probabilidade >= 60) {
          previsoesGeradas.push({
            cliente_id: cliente.id,
            cliente_nome: cliente.nome,
            probabilidade: probabilidade.toFixed(0),
            ciclo_medio_dias: cicloMedio.toFixed(0),
            dias_desde_ultima: diasDesdeUltima,
            ticket_medio: cliente.ticket_medio || 0,
            produtos_preferidos: cliente.produtos_mais_comprados?.slice(0, 3) || [],
            temperatura: probabilidade > 80 ? 'Quente' : probabilidade > 60 ? 'Morno' : 'Frio'
          });
        }
      });

    setPrevisoes(previsoesGeradas.sort((a, b) => b.probabilidade - a.probabilidade));
    try {
      await base44.entities.LogsIA.create({
        tipo_ia: 'IA_Vendas_Preditivas',
        contexto_execucao: 'Comercial',
        entidade_relacionada: 'Cliente',
        resultado: 'Automatico',
        confianca_ia: 82,
        dados_entrada: { clientes: clientes.length, pedidos: pedidos.length },
        dados_saida: { previsoes: previsoesGeradas.length },
        empresa_id: eId || null,
        group_id: gId || null,
      });
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Sistema',
        usuario_id: user?.id || null,
        empresa_id: eId || null,
        group_id: gId || null,
        acao: 'Analise',
        modulo: 'IA',
        entidade: 'IA_Vendas_Preditivas',
        descricao: 'Analise de probabilidade de recompra executada',
        dados_novos: { previsoes: previsoesGeradas.length },
        sucesso: true,
        data_hora: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('[IA] Falha ao registrar log de vendas preditivas:', error);
    }
    setAnalisando(false);
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="border-b bg-white/80">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-5 h-5 text-purple-600" />
          IA de Vendas Preditivas
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          Clientes com alta probabilidade de recompra
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Button
          onClick={analisarProbabilidadeRecompra}
          disabled={analisando || !contextoValido}
          className="w-full bg-purple-600 hover:bg-purple-700"
          data-action="IA.VendasPreditivas.analisar"
        >
          {analisando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Analisando Padrões...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analisar Probabilidade de Recompra
            </>
          )}
        </Button>

        {previsoes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-purple-900">
                {previsoes.length} cliente(s) detectado(s)
              </p>
              <Badge className="bg-purple-600">
                Alta Conversão
              </Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {previsoes.map((prev, idx) => {
                const temperaturaConfig = {
                  'Quente': { cor: 'red', bgClass: 'bg-red-50', borderClass: 'border-red-300' },
                  'Morno': { cor: 'orange', bgClass: 'bg-orange-50', borderClass: 'border-orange-300' },
                  'Frio': { cor: 'blue', bgClass: 'bg-blue-50', borderClass: 'border-blue-300' }
                };

                const config = temperaturaConfig[prev.temperatura];

                return (
                  <Card key={idx} className={`${config.bgClass} ${config.borderClass}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{prev.cliente_nome}</p>
                          <p className="text-xs text-slate-600">
                            Ciclo médio: {prev.ciclo_medio_dias} dias | Há {prev.dias_desde_ultima} dias sem comprar
                          </p>
                        </div>
                        <Badge className={`bg-${config.cor}-600`}>
                          {prev.probabilidade}%
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Target className="w-3 h-3" />
                        <span>Ticket Médio: R$ {prev.ticket_medio.toLocaleString('pt-BR')}</span>
                      </div>

                      {prev.produtos_preferidos.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-600 mb-1">Produtos Preferidos:</p>
                          <div className="flex gap-1 flex-wrap">
                            {prev.produtos_preferidos.map((prod, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {prod.descricao}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        size="sm"
                        className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={async () => {
                          try {
                            await base44.entities.Campanha.create({
                              nome: `Recompra — ${prev.cliente_nome}`,
                              tipo: 'Recompra',
                              status: 'Ativa',
                              descricao: `IA detectou probabilidade ${prev.probabilidade}% de recompra. Ciclo médio ${prev.ciclo_medio_dias}d.`,
                              empresa_id: eId || null,
                              group_id: gId || null,
                              clientes_alvo_ids: [prev.cliente_id],
                              criada_por_ia: true,
                            });
                            toast.success(`Campanha criada para ${prev.cliente_nome}!`);
                          } catch {
                            toast.error('Erro ao criar campanha.');
                          }
                        }}
                        data-action="IA.VendasPreditivas.campanha.criar"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Criar Campanha Direcionada
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {previsoes.length === 0 && !analisando && (
          <div className="text-center py-8 text-purple-600">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Clique em "Analisar" para identificar oportunidades</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}