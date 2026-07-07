import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWindow } from '@/components/lib/useWindow';
import useContextoVisual from '@/components/lib/useContextoVisual';
import useRLSQuery from '@/components/lib/useRLSQuery';
import usePermissions from '@/components/lib/usePermissions';
import { Plus, CreditCard, DollarSign, Zap, CheckCircle2, BarChart3, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';
import FormaPagamentoFormCompleto from './FormaPagamentoFormCompleto';
import GestorGatewaysPagamento from './GestorGatewaysPagamento';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FormasPagamentoAnalyticsTab from './forma-pagamento/FormasPagamentoAnalyticsTab';
import FormasPagamentoTabela from './forma-pagamento/FormasPagamentoTabela';
import FormasPagamentoIntegracaoTab from './forma-pagamento/FormasPagamentoIntegracaoTab';

export default function GestorFormasPagamento({ windowMode = false }) {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todas');
  const [abaAtiva, setAbaAtiva] = useState('gestao');
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const { openWindow } = useWindow();
  const { empresaAtual, grupoAtual, filterInContext, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || 'sem-contexto';
  const contextoValido = contextKey !== 'sem-contexto';
  const podeCriar = canCreate('Cadastros', 'FormaPagamento') || canCreate('Cadastros', null);
  const podeEditar = canEdit('Cadastros', 'FormaPagamento') || canEdit('Cadastros', null);
  const podeExcluir = canDelete('Cadastros', 'FormaPagamento') || canDelete('Cadastros', null);

  const { data: formasPagamento = [], isLoading } = useRLSQuery('FormaPagamento', {}, 'ordem_exibicao', 200, { enabled: contextoValido });

  // Buscar dados para analytics
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-analytics', contextKey],
    queryFn: () => filterInContext('Pedido', {}, '-created_date', 500),
    enabled: contextoValido,
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contas-receber-analytics', contextKey],
    queryFn: () => filterInContext('ContaReceber', {}, '-created_date', 500),
    enabled: contextoValido,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      if (!podeExcluir) throw new Error('Sem permissÃ£o para excluir.');
      return deleteInContext('FormaPagamento', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
      toast.success('✅ Forma de pagamento excluída!');
    }
  });

  const toggleAtivaMutation = useMutation({
    mutationFn: ({ id, ativa }) => {
      if (!contextoValido || !podeEditar) throw new Error('Sem contexto ou permissÃ£o para alterar status.');
      return updateInContext('FormaPagamento', id, { ativa });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
      toast.success('✅ Status atualizado!');
    }
  });

  const formasFiltradas = formasPagamento
    .filter(f => filtroStatus === 'todas' || (filtroStatus === 'ativas' ? f.ativa : !f.ativa))
    .filter(f => 
      f.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      f.tipo?.toLowerCase().includes(busca.toLowerCase()) ||
      f.codigo?.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => (a.ordem_exibicao || 0) - (b.ordem_exibicao || 0));

  const handleNova = () => {
    openWindow(FormaPagamentoFormCompleto, {
      windowMode: true,
      onSubmit: async (data) => {
        try {
          if (!contextoValido || !podeCriar) throw new Error('Sem contexto ou permissÃ£o para criar.');
          await createInContext('FormaPagamento', data);
          queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
          toast.success('✅ Forma criada!');
        } catch (error) {
          toast.error('❌ Erro: ' + error.message);
        }
      }
    }, {
      title: '🏦 Nova Forma de Pagamento',
      width: 900,
      height: 700
    });
  };

  const handleEditar = (forma) => {
    openWindow(FormaPagamentoFormCompleto, {
      formaPagamento: forma,
      windowMode: true,
      onSubmit: async (data) => {
        try {
          if (!contextoValido || !podeEditar) throw new Error('Sem contexto ou permissÃ£o para editar.');
          await updateInContext('FormaPagamento', forma.id, data);
          queryClient.invalidateQueries({ queryKey: ['formas-pagamento'] });
          toast.success('✅ Forma atualizada!');
        } catch (error) {
          toast.error('❌ Erro: ' + error.message);
        }
      }
    }, {
      title: `✏️ Editar: ${forma.descricao}`,
      width: 900,
      height: 700
    });
  };

  // Analytics de uso
  const analisarUso = () => {
    const usoPorForma = {};
    formasPagamento.forEach(f => {
      const usoPedidos = pedidos.filter(p => p.forma_pagamento === f.descricao).length;
      const usoContas = contasReceber.filter(c => c.forma_recebimento === f.descricao).length;
      usoPorForma[f.descricao] = {
        forma: f,
        total_usos: usoPedidos + usoContas,
        pedidos: usoPedidos,
        contas: usoContas
      };
    });
    return Object.values(usoPorForma).sort((a, b) => b.total_usos - a.total_usos);
  };

  const dadosAnalytics = analisarUso();
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6"}><div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <strong>🏦 Gestão Centralizada V21.8:</strong> Formas configuradas aqui aparecem em PDV, Pedidos, Contas a Receber/Pagar, Portal e E-commerce
        </AlertDescription>
      </Alert>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-4 w-full bg-slate-100">
          <TabsTrigger value="gestao">
            <CreditCard className="w-4 h-4 mr-2" />
            Gestão
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="gateways">
            <Sparkles className="w-4 h-4 mr-2" />
            Gateways
          </TabsTrigger>
          <TabsTrigger value="integracao">
            <Zap className="w-4 h-4 mr-2" />
            Integração
          </TabsTrigger>
        </TabsList>

        {/* ABA: GESTÃO */}
        <TabsContent value="gestao" className="space-y-6 mt-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Formas de Pagamento</h2>
          <p className="text-sm text-slate-600">Configuração centralizada de métodos de pagamento</p>
        </div>
        <Button data-permission="Cadastros.FormaPagamento.criar" onClick={handleNova} disabled={!contextoValido || !podeCriar} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Forma
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total</p>
                <p className="text-2xl font-bold">{formasPagamento.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">{formasPagamento.filter(f => f.ativa).length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">PDV</p>
                <p className="text-2xl font-bold text-purple-600">{formasPagamento.filter(f => f.disponivel_pdv).length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">E-commerce</p>
                <p className="text-2xl font-bold text-orange-600">{formasPagamento.filter(f => f.disponivel_ecommerce).length}</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Buscar por nome, tipo ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-md"
            />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="todas">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="inativas">Inativas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* TABELA */}
      <FormasPagamentoTabela
        formasFiltradas={formasFiltradas}
        toggleAtivaMutation={toggleAtivaMutation}
        handleEditar={handleEditar}
        confirm={confirm}
        deleteMutation={deleteMutation}
        podeEditar={podeEditar}
        podeExcluir={podeExcluir}
        contextoValido={contextoValido}
      />
        </TabsContent>

        {/* ABA: ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <FormasPagamentoAnalyticsTab dadosAnalytics={dadosAnalytics} formasPagamento={formasPagamento} />
        </TabsContent>

        {/* ABA: GATEWAYS */}
        <TabsContent value="gateways" className="space-y-6 mt-6">
          <GestorGatewaysPagamento windowMode={false} />
        </TabsContent>

        {/* ABA: INTEGRAÇÃO */}
        <TabsContent value="integracao" className="space-y-6 mt-6">
          <FormasPagamentoIntegracaoTab formasPagamento={formasPagamento} />
        </TabsContent>
      </Tabs>
    </div></div>
  );
}