import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Send, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import NotificacoesAutomaticas from '../sistema/NotificacoesAutomaticas';

/**
 * Régua de Cobrança Inteligente
 * Envia cobranças automáticas baseadas em dias de atraso
 */
export default function ReguaCobrancaIA({ empresaId, windowMode = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [executando, setExecutando] = useState(false);
  const [ativa, setAtiva] = useState(true);

  const { data: titulosVencidos = [] } = useQuery({
    queryKey: ['titulos-vencidos', empresaId],
    queryFn: async () => {
      const todas = await base44.entities.ContaReceber.filter({
        empresa_id: empresaId,
        status: 'Pendente'
      }, '-data_vencimento');

      const hoje = new Date();
      return todas.filter(t => {
        const vencimento = new Date(t.data_vencimento);
        return vencimento < hoje;
      });
    },
    enabled: !!empresaId
  });

  const executarReguaMutation = useMutation({
    mutationFn: async () => {
      const hoje = new Date();
      const acoes = [];

      for (const titulo of titulosVencidos) {
        const diasAtraso = Math.floor(
          (hoje - new Date(titulo.data_vencimento)) / (1000 * 60 * 60 * 24)
        );

        let acao = null;

        // REGRA 1: Até 3 dias - WhatsApp amigável
        if (diasAtraso >= 1 && diasAtraso <= 3) {
          acao = {
            tipo: 'whatsapp_lembrete',
            titulo,
            diasAtraso,
            tom: 'amigável',
            mensagem: `Olá! Notamos que o título ${titulo.numero_documento || titulo.descricao} venceu há ${diasAtraso} dia(s). Segue link para pagamento via PIX.`
          };
        }

        // REGRA 2: 4-10 dias - WhatsApp firme + E-mail
        if (diasAtraso >= 4 && diasAtraso <= 10) {
          acao = {
            tipo: 'whatsapp_email_cobranca',
            titulo,
            diasAtraso,
            tom: 'firme',
            mensagem: `Título ${titulo.numero_documento} vencido há ${diasAtraso} dias. Solicitamos regularização urgente. Valor: R$ ${titulo.valor.toFixed(2)}`
          };
        }

        // REGRA 3: >10 dias - Criar interação CRM para vendedor ligar
        if (diasAtraso > 10) {
          acao = {
            tipo: 'criar_interacao_crm',
            titulo,
            diasAtraso,
            tom: 'cobrança',
            mensagem: `Título com ${diasAtraso} dias de atraso. Contato telefônico necessário.`
          };

          // Criar interação no CRM
          await base44.entities.Interacao.create({
            tipo: 'Ligação',
            titulo: `Cobrança - Título Vencido há ${diasAtraso} dias`,
            descricao: `Cliente: ${titulo.cliente}. Valor: R$ ${titulo.valor.toFixed(2)}. Urgente: entrar em contato.`,
            data_interacao: new Date().toISOString(),
            cliente_id: titulo.cliente_id,
            group_id: titulo.group_id,
            empresa_id: titulo.empresa_id,
            cliente_nome: titulo.cliente,
            responsavel: titulo.vendedor || 'Financeiro',
            status: 'Agendado',
            prioridade: 'Alta',
            resultado: 'Sem Resposta'
          });
        }

        if (acao) {
          acoes.push(acao);

          // Simular envio (em produção, chamaria API real)
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      return acoes;
    },
    onSuccess: (acoes) => {
      queryClient.invalidateQueries({ queryKey: ['titulos-vencidos'] });
      queryClient.invalidateQueries({ queryKey: ['interacoes'] });
      toast({
        title: `✅ Régua Executada!`,
        description: `${acoes.length} ação(ões) de cobrança processada(s)`
      });
    }
  });

  const handleExecutar = () => {
    setExecutando(true);
    executarReguaMutation.mutate();
    setTimeout(() => setExecutando(false), 2000);
  };

  // NOVO: Executar régua automaticamente
  useEffect(() => {
    if (ativa) {
      const interval = setInterval(() => {
        executarReguaAutomatica();
      }, 60 * 60 * 1000); // A cada 1 hora

      return () => clearInterval(interval);
    }
  }, [ativa, empresaId]); // Add empresaId to dependencies

  const executarReguaAutomatica = async () => {
    if (!empresaId) return; // Ensure empresaId is available for automatic execution
    try {
      const hoje = new Date();
      
      // Buscar títulos pendentes
      const titulosPendentes = await base44.entities.ContaReceber.filter({
        status: 'Pendente',
        empresa_id: empresaId
      }, '-data_vencimento', 100);

      for (const titulo of titulosPendentes) {
        const vencimento = new Date(titulo.data_vencimento);
        const diasAteVencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        const diasAposVencimento = Math.ceil((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));

        // Regra 1: 3 dias antes do vencimento
        if (diasAteVencimento === 3) {
          await NotificacoesAutomaticas.notificarCobrancaVencendo(titulo, 3);
        }

        // Regra 2: No vencimento
        if (diasAteVencimento === 0) {
          await NotificacoesAutomaticas.notificarCobrancaVencendo(titulo, 0);
        }

        // Regra 3: 5 dias após vencimento
        if (diasAposVencimento === 5) {
          await base44.entities.ContaReceber.update(titulo.id, {
            status: 'Atrasado'
          });
          
          await NotificacoesAutomaticas.notificarCobrancaVencendo(titulo, -5); // Use negative for 'after'
        }

        // Regra 4: 15 dias após - Notificação mais incisiva (CRM interaction could be added here)
        if (diasAposVencimento === 15) {
          await base44.entities.ContaReceber.update(titulo.id, {
            status: 'Atrasado'
          });
          // Example: Create an interaction for sales or finance to follow up
          await base44.entities.Interacao.create({
            tipo: 'Email',
            titulo: `Cobrança Incisiva - Título Vencido há 15 dias`,
            descricao: `Enviar e-mail mais firme para ${titulo.cliente} sobre título ${titulo.numero_documento} (R$ ${titulo.valor?.toLocaleString('pt-BR')}) vencido há 15 dias.`,
            data_interacao: new Date().toISOString(),
            cliente_id: titulo.cliente_id,
            group_id: titulo.group_id,
            empresa_id: titulo.empresa_id,
            cliente_nome: titulo.cliente,
            responsavel: titulo.vendedor || 'Financeiro',
            status: 'Agendado',
            prioridade: 'Média',
            resultado: 'Sem Resposta'
          });
        }

        // Regra 5: 30 dias após - Alerta crítico
        if (diasAposVencimento === 30) {
          await base44.entities.Notificacao.create({
            titulo: '🚨 Título Vencido há 30 dias',
            mensagem: `Título vencido há 30 dias!\n\nCliente: ${titulo.cliente}\nValor: R$ ${titulo.valor?.toLocaleString('pt-BR')}\nVencimento: ${vencimento.toLocaleDateString('pt-BR')}\n\nAção recomendada: Contato urgente ou negativação`,
            tipo: 'urgente',
            categoria: 'Financeiro',
            group_id: titulo.group_id,
            empresa_id: titulo.empresa_id,
            prioridade: 'Urgente',
            destinatario_email: 'financeiro@empresa.com',
            entidade_relacionada: 'ContaReceber',
            registro_id: titulo.id
          });
        }
      }

      console.log('✅ Régua de Cobrança IA executada:', titulosPendentes.length, 'títulos processados');
      // Invalidate queries to reflect status changes if any
      queryClient.invalidateQueries({ queryKey: ['titulos-vencidos', empresaId] });
      queryClient.invalidateQueries({ queryKey: ['interacoes'] });
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });


    } catch (error) {
      console.error('Erro na Régua de Cobrança Automática:', error);
    }
  };

  // Agrupar por faixa de atraso (for manual execution display)
  const hoje = new Date();
  const ate3Dias = titulosVencidos.filter(t => {
    const dias = Math.floor((hoje - new Date(t.data_vencimento)) / (1000 * 60 * 60 * 24));
    return dias >= 1 && dias <= 3;
  });

  const de4a10Dias = titulosVencidos.filter(t => {
    const dias = Math.floor((hoje - new Date(t.data_vencimento)) / (1000 * 60 * 60 * 24));
    return dias >= 4 && dias <= 10;
  });

  const acima10Dias = titulosVencidos.filter(t => {
    const dias = Math.floor((hoje - new Date(t.data_vencimento)) / (1000 * 60 * 60 * 24));
    return dias > 10;
  });

  const content = (
    <Card className="border-purple-200 bg-purple-50 min-h-[200px]">
      <CardHeader className="bg-white/80 border-b px-3 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Régua de Cobrança IA
            {ativa && (
              <Badge className="bg-green-600 text-white animate-pulse text-xs px-2 py-0.5">
                ATIVA
              </Badge>
            )}
          </CardTitle>
          <Button
            onClick={() => setAtiva(!ativa)}
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
          >
            {ativa ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 space-y-3">
        {titulosVencidos.length === 0 ? (
          <div className="text-center py-8 text-green-600">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">Nenhum título vencido!</p>
            <p className="text-sm">Situação financeira em dia</p>
          </div>
        ) : (
          <>
            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-blue-200 bg-blue-50 min-h-[90px]">
                <CardContent className="p-3 text-center flex flex-col justify-center h-full">
                  <p className="text-xs text-blue-700">1-3 dias</p>
                  <p className="text-xl font-bold text-blue-900">{ate3Dias.length}</p>
                  <p className="text-xs text-blue-600">WhatsApp</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50 min-h-[90px]">
                <CardContent className="p-3 text-center flex flex-col justify-center h-full">
                  <p className="text-xs text-orange-700">4-10 dias</p>
                  <p className="text-xl font-bold text-orange-900">{de4a10Dias.length}</p>
                  <p className="text-xs text-orange-600">Multi-canal</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50 min-h-[90px]">
                <CardContent className="p-3 text-center flex flex-col justify-center h-full">
                  <p className="text-xs text-red-700">&gt;10 dias</p>
                  <p className="text-xl font-bold text-red-900">{acima10Dias.length}</p>
                  <p className="text-xs text-red-600">CRM</p>
                </CardContent>
              </Card>
            </div>

            {/* Ações Automáticas */}
            <Alert className="border-purple-300 bg-purple-50">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <AlertDescription className="text-xs">
                <p className="font-semibold text-purple-900 mb-1">Ações programadas:</p>
                <ul className="text-xs text-purple-800 space-y-0.5">
                  {ate3Dias.length > 0 && (
                    <li>✓ {ate3Dias.length} WhatsApp com PIX</li>
                  )}
                  {de4a10Dias.length > 0 && (
                    <li>✓ {de4a10Dias.length} Multi-canal</li>
                  )}
                  {acima10Dias.length > 0 && (
                    <li>✓ {acima10Dias.length} CRM</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>

            {/* Botão Executar */}
            <Button
              onClick={handleExecutar}
              disabled={executando || executarReguaMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 h-9"
            >
              {executando ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                  Executando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Executar Régua
                </>
              )}
            </Button>

            <p className="text-xs text-center text-slate-500">
              Automático a cada 1h • Manual sob demanda
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col overflow-auto">
        <div className="p-6 flex-1">
          {content}
        </div>
      </div>
    );
  }

  return content;
}