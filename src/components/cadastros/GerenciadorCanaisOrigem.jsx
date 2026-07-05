import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePermissions } from '@/components/lib/usePermissions';
import { Activity, CheckCircle, Settings, Bolt, Shield, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import ExportButton from '@/components/ExportButton';
import CanalOrigemCard from './canais-origem/CanalOrigemCard';
import CanaisInsightsPanel from './canais-origem/CanaisInsightsPanel';

const ORIGEM_MAP = {
  'ERP': 'Manual', 'Site': 'Site', 'E-commerce': 'E-commerce', 'Chatbot': 'Chatbot',
  'WhatsApp': 'WhatsApp', 'Portal Cliente': 'Portal', 'Marketplace': 'Marketplace', 'API': 'API', 'App Mobile': 'App',
};

export default function GerenciadorCanaisOrigem({ windowMode = false }) {
  const { user } = usePermissions();
  const queryClient = useQueryClient();
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: parametros = [], isLoading } = useQuery({
    queryKey: ['parametros-origem-pedido', contextoKey],
    queryFn: () => filterInContext('ParametroOrigemPedido', {}, '-created_date', 999),
    initialData: [], enabled: !!contexto,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-ultimos', contextoKey],
    queryFn: () => filterInContext('Pedido', {}, '-created_date', 200),
    initialData: [],
  });

  const toggleAtivo = useMutation({
    mutationFn: ({ id, ativo }) => base44.entities.ParametroOrigemPedido.update(id, { ativo }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['parametros-origem-pedido'] }); toast.success('Status atualizado!'); },
  });

  const calcularMetricas = (param) => {
    const origemEsperada = ORIGEM_MAP[param.canal] || param.canal;
    const pedidosCanal = pedidos.filter(p => (ORIGEM_MAP[p.origem_pedido] || p.origem_pedido) === param.canal || p.origem_pedido === origemEsperada);
    const totalPedidos = pedidosCanal.length;
    const valorTotal = pedidosCanal.reduce((sum, p) => sum + (p.valor_total || 0), 0);
    const ultimos7dias = pedidosCanal.filter(p => (new Date() - new Date(p.created_date)) / (1000 * 60 * 60 * 24) <= 7).length;
    return { totalPedidos, valorTotal, ultimos7dias };
  };

  const containerClass = windowMode ? 'w-full h-full overflow-auto p-6' : '';

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;

  const canaisAtivos = parametros.filter(p => p.ativo);
  const canaisAutomaticos = parametros.filter(p => p.tipo_criacao === 'Automático' || p.tipo_criacao === 'Misto');

  const kpis = [
    { label: 'Total Canais', value: parametros.length, cor: 'text-blue-600', icon: Settings },
    { label: 'Canais Ativos', value: canaisAtivos.length, cor: 'text-green-600', icon: CheckCircle },
    { label: 'Automáticos', value: canaisAutomaticos.length, cor: 'text-purple-600', icon: Bolt },
    { label: 'Pedidos (últimos 200)', value: pedidos.length, cor: 'text-orange-600', icon: Activity },
  ];

  const insights = [];
  const canaisSemAtividade = parametros.filter(p => p.ativo && calcularMetricas(p).ultimos7dias === 0);
  if (canaisSemAtividade.length > 0) insights.push({ tipo: 'warning', texto: `⚠️ ${canaisSemAtividade.length} canal(is) ativo(s) sem pedidos nos últimos 7 dias - considere desativar ou investigar` });
  const canaisManuaisComVolume = parametros.filter(p => p.tipo_criacao === 'Manual' && calcularMetricas(p).totalPedidos > 10);
  if (canaisManuaisComVolume.length > 0) insights.push({ tipo: 'info', texto: `🤖 ${canaisManuaisComVolume.length} canal(is) manual(is) com alto volume - considere implementar automação (tipo Misto)` });
  const taxaAutomacao = parametros.length > 0 ? (canaisAutomaticos.length / parametros.length) * 100 : 0;
  if (taxaAutomacao < 50) insights.push({ tipo: 'info', texto: `📊 Taxa de automação: ${taxaAutomacao.toFixed(0)}% - você pode aumentar convertendo canais manuais em automáticos` });
  else insights.push({ tipo: 'success', texto: `✅ Taxa de automação: ${taxaAutomacao.toFixed(0)}% - excelente nível de automação!` });
  const canaisBloqueados = parametros.filter(p => p.bloquear_edicao_automatico).length;
  if (canaisBloqueados === parametros.length && parametros.length > 0) insights.push({ tipo: 'success', texto: `🔒 100% dos canais automáticos estão com bloqueio ativo - máxima segurança de rastreamento` });

  return (
    <div className={containerClass}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">{kpi.label}</p>
                    <p className={`text-2xl font-bold ${kpi.cor}`}>{kpi.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${kpi.cor} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {canaisAtivos.length === 0 && (
        <Alert className="mb-6 border-orange-300 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <AlertDescription className="text-sm text-orange-800">⚠️ Nenhum canal está ativo! Ative pelo menos um canal para começar a rastrear origens de pedidos.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" />Canais Configurados</h3>
          <ExportButton data={parametros.map(p => calcularMetricas(p))} filename="canais-origem-status" className="bg-green-600 hover:bg-green-700" data-permission="Cadastros.CanalOrigem.exportar">
            <Download className="w-4 h-4 mr-2" />Exportar Status
          </ExportButton>
        </div>
        <div className="space-y-2">
          {parametros.map(param => (
            <CanalOrigemCard
              key={param.id}
              param={param}
              metricas={calcularMetricas(param)}
              onToggle={(checked) => {
                if (user?.role !== 'admin') { toast.error('Apenas administradores podem alterar status de canais'); return; }
                toggleAtivo.mutate({ id: param.id, ativo: checked });
              }}
              isPending={toggleAtivo.isPending}
              isAdmin={user?.role === 'admin'}
            />
          ))}
        </div>
      </div>

      <CanaisInsightsPanel insights={insights} />

      {user?.role === 'admin' && (
        <Card className="mt-6 border-slate-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-base font-semibold mb-2">
              <Shield className="w-5 h-5 text-slate-600" />Controle de Acesso
            </div>
            <Alert>
              <AlertDescription className="text-sm text-slate-600">
                👤 Apenas <strong>Administradores</strong> podem ativar/desativar canais e modificar configurações de origem. Vendedores podem apenas visualizar os canais configurados.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}