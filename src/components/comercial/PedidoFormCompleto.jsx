import React, { useState, useEffect, Suspense } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PedidoHeader from './pedido/PedidoHeader';
import PedidoTabsNav from './pedido/PedidoTabsNav';
import PedidoValidationAlerts from './pedido/PedidoValidationAlerts';
import {
  User,
  Package,
  Factory,
  Scissors,
  Truck,
  DollarSign,
  FileText,
  Shield,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useOrigemPedido } from '@/components/lib/useOrigemPedido';
import ProtectedSection from '@/components/security/ProtectedSection';
import useContextoVisual from '@/components/lib/useContextoVisual';

// Validações avançadas movidas para ./pedido/pedidoSchema

// Componentes das Etapas
const WizardEtapa1Cliente = React.lazy(() => import('./wizard/WizardEtapa1Cliente'));
const ItensRevendaTab = React.lazy(() => import('./ItensRevendaTab'));
const ArmadoPadraoTab = React.lazy(() => import('./ArmadoPadraoTab'));
const CorteDobraIATab = React.lazy(() => import('./CorteDobraIATab'));
const HistoricoClienteTab = React.lazy(() => import('./HistoricoClienteTab')); // NOVO V21.1
const LogisticaEntregaTab = React.lazy(() => import('./LogisticaEntregaTab'));
const FechamentoFinanceiroTab = React.lazy(() => import('./FechamentoFinanceiroTab'));
const ArquivosProjetosTab = React.lazy(() => import('./ArquivosProjetosTab'));
const AuditoriaAprovacaoTab = React.lazy(() => import('./AuditoriaAprovacaoTab'));
import AutomacaoFluxoPedido from './AutomacaoFluxoPedido';
import PedidoFooterAcoes from './pedido/PedidoFooterAcoes';
import { pedidoCompletoSchema } from './pedido/pedidoSchema';
import { getDefaultPedidoValues } from './pedido/pedidoDefaults';
import useTotais from './pedido/hooks/useTotais';
import usePedidoValidacoes from './pedido/hooks/usePedidoValidacoes';
import FormWrapper from "@/components/common/FormWrapper";
import PedidoTabsContainer from './pedido/PedidoTabsContainer';

/**
 * V21.1.2-R1 - Pedido Form Completo - PATCH OFICIAL
 * Modal agora SEMPRE max-w-[90vw] max-h-[95vh]
 * Todas as abas com scroll funcionando
 * Aba Histórico expandida com Top 20 produtos + Auditoria
 * Suporte multi-instância (múltiplos modais abertos)
 * 
 * REGRA-MÃE: NUNCA APAGAR - APENAS ACRESCENTAR
 */
function PedidoFormCompleto({ pedido, clientes = [], onSubmit, onCancel, windowMode = false, contexto = 'erp', criacaoManual = true }) {
  const [activeTab, setActiveTab] = useState('identificacao');
  const [salvando, setSalvando] = useState(false); // V21.5: Anti-duplicação
  
  // V21.6 FINAL: Hook de detecção AUTOMÁTICA OBRIGATÓRIA
  const { origemPedido, bloquearEdicao } = useOrigemPedido();
  const { carimbarContexto, grupoAtual, empresaAtual } = useContextoVisual();
  
  // ETAPA 1 — Validação Obrigatória de Multiempresa
  useEffect(() => {
    if (!grupoAtual?.id || (contexto !== 'grupo' && !empresaAtual?.id)) {
      toast.error('Erro: Contexto de grupo/empresa não definido. Operação bloqueada.');
      onCancel?.();
    }
  }, [grupoAtual, empresaAtual, contexto]);
  
  const defaultValues = { ...getDefaultPedidoValues(pedido), ...(pedido || {}) };

  const [formData, setFormData] = useState(defaultValues);

  // RHF + Zod (Etapa 2)
  const { handleSubmit: rhfHandleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pedidoCompletoSchema),
    defaultValues
  });

  useEffect(() => { reset(formData); }, [formData, reset]);
  
  // V21.6 FINAL: SEMPRE aplicar origem detectada automaticamente
  useEffect(() => {
    if (origemPedido) {
      setFormData(prev => ({ ...prev, origem_pedido: origemPedido }));
      console.log('Origem automatica aplicada:', origemPedido, '| Bloqueado:', bloquearEdicao);
    }
  }, [origemPedido, bloquearEdicao]);

  const [validacoes, setValidacoes] = useState({
    identificacao: false,
    itens: false,
    logistica: false,
    financeiro: false
  });

  // Calcular progresso
  useEffect(() => {
    const etapasCompletas = Object.values(validacoes).filter(Boolean).length;
    const progresso = (etapasCompletas / 4) * 100;
    setFormData(prev => ({ ...prev, percentual_conclusao_wizard: progresso }));
  }, [validacoes]);

  usePedidoValidacoes(formData, setValidacoes);

  useTotais(formData, setFormData);

    const canSolicitarAprovacao = (formData?.status_aprovacao !== 'aprovado') && (validacoes.identificacao && validacoes.itens);

    const solicitarAprovacao = async () => {
      try {
        const { data: solicitacao } = await base44.functions.invoke('solicitacoesAprovacao', {
          action: 'create',
          group_id: formData.group_id || null,
          empresa_id: formData.empresa_id || null,
          tipo_solicitacao: 'pedido_aprovacao',
          entidade_alvo: 'Pedido',
          entidade_alvo_id: formData.id || `temp_${Date.now()}`,
          dados_propostos: { status_aprovacao: 'pendente', status: 'Aguardando Aprovação' },
          justificativa: formData.justificativa_desconto || 'Solicitação de aprovação do pedido'
        });
        try { await base44.entities.AuditLog.create({ acao: 'Aprovação', modulo: 'Comercial', entidade: 'Pedido', registro_id: formData?.id, descricao: `Solicitada aprovação do pedido (#${solicitacao?.id || ''})`, data_hora: new Date().toISOString() }); } catch (e) { console.error('[PedidoForm] Falha ao auditar solicitação de aprovação:', e?.message || e); }
      } catch (e) { console.error('[comercial] catch:', e); }
    };

    const handleSubmit = async () => {
    if (!formData || salvando) return;
    
    if (!validacoes.identificacao) {
      toast.error('Erro: Complete os dados de identificação');
      setActiveTab('identificacao');
      return;
    }

    if (!validacoes.itens) {
      toast.error('Erro: Adicione pelo menos um item ao pedido');
      setActiveTab('revenda');
      return;
    }

    // Validação avançada (Etapa 2) + carimbo multiempresa
    const stamped = carimbarContexto(formData, 'empresa_id');
    const parsed = pedidoCompletoSchema.safeParse(stamped);
    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
      toast.error('Erro: Erros de validação', { description: msg });
      return;
    }
    const empresaId = parsed.data.empresa_id || formData.empresa_id;

    setSalvando(true);

    try {
      // V21.5: BAIXAR ESTOQUE SE STATUS FOR APROVADO (migrado para função backend)
      if (formData.status === 'Aprovado' && formData.itens_revenda?.length > 0) {
        await base44.functions.invoke('applyOrderStockMovements', {
          pedido: carimbarContexto(formData, 'empresa_id')
        });
        toast.success('Pedido salvo e estoque baixado!');
      }
      
      // ETAPA 4: Validar aprovação de desconto
      if (formData.desconto_geral_pedido_percentual > 0) {
        const custoTotal = formData.valor_produtos * 0.7;
        const valorComDesconto = formData.valor_produtos * (1 - formData.desconto_geral_pedido_percentual / 100);
        const margemAposDesconto = ((valorComDesconto - custoTotal) / custoTotal) * 100;
        const margemMinima = 10;

        if (margemAposDesconto < margemMinima && formData.status !== 'Aprovado') {
          // Cria solicitação de aprovação de desconto (backend)
          try {
            const { data: solicitacao } = await base44.functions.invoke('solicitacoesAprovacao', {
              action: 'create',
              group_id: formData.group_id || null,
              empresa_id: formData.empresa_id || null,
              tipo_solicitacao: 'desconto_pedido',
              entidade_alvo: 'Pedido',
              entidade_alvo_id: formData.id || `temp_${Date.now()}`,
              dados_propostos: {
                desconto_geral_pedido_percentual: formData.desconto_geral_pedido_percentual,
                desconto_geral_pedido_valor: formData.desconto_geral_pedido_valor || 0,
                margem_aplicada_vendedor: margemAposDesconto,
                margem_minima_produto: margemMinima
              },
              justificativa: formData.justificativa_desconto || 'Ajuste comercial abaixo da margem mínima'
            });
            toast.info('Aviso: Solicitação de aprovação enviada', { description: `#${solicitacao?.id || ''}` });
          } catch (e) {
            toast.error('Não foi possível abrir a solicitação de aprovação');
          }

          // Mantém o pedido aguardando aprovação e salva rascunho
          await onSubmit(carimbarContexto({
            ...formData,
            status_aprovacao: 'pendente',
            margem_minima_produto: margemMinima,
            margem_aplicada_vendedor: margemAposDesconto,
            desconto_solicitado_percentual: formData.desconto_geral_pedido_percentual,
            status: 'Aguardando Aprovação'
          }, 'empresa_id'));
          return;
        }
      }

      await onSubmit(carimbarContexto(formData, 'empresa_id'));
    } finally {
      setSalvando(false);
    }
  };


  const abas = [
    { 
      id: 'identificacao', 
      label: 'Identificação', 
      icon: User, 
      valido: validacoes.identificacao 
    },
    { 
      id: 'revenda', 
      label: 'Itens Revenda', 
      icon: Package, 
      count: formData?.itens_revenda?.length || 0 
    },
    { 
      id: 'armado', 
      label: 'Armado Padrão', 
      icon: Factory, 
      count: formData?.itens_armado_padrao?.length || 0 
    },
    { 
      id: 'corte', 
      label: 'Corte e Dobra', 
      icon: Scissors, 
      count: formData?.itens_corte_dobra?.length || 0 
    },
    { 
      id: 'historico', // NOVO V21.1
      label: 'Histórico', 
      icon: Clock,
      novo: true
    },
    { 
      id: 'logistica', 
      label: 'Logística', 
      icon: Truck, 
      valido: validacoes.logistica,
      count: formData?.etapas_entrega?.length || 0
    },
    { 
      id: 'financeiro', 
      label: 'Financeiro', 
      icon: DollarSign, 
      valido: validacoes.financeiro 
    },
    { 
      id: 'arquivos', 
      label: 'Arquivos', 
      icon: FileText, 
      count: formData?.projetos_ia?.length || 0 
    },
    { 
      id: 'auditoria', 
      label: 'Auditoria', 
      icon: Shield 
    }
  ];

  // Proteção adicional: não renderizar até formData estar pronto
  if (!formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusTransferFooter = ['Pronto para Faturar','Em Expedição','Em Trânsito'];
  const isFaturadoFooter = formData?.status === 'Faturado';
  const isTransferidoFooter = statusTransferFooter.includes(formData?.status);
  const isLockedFooter = isFaturadoFooter || (isTransferidoFooter && !formData?.__liberado_gerencia);

  const content = (
    <FormWrapper schema={pedidoCompletoSchema} defaultValues={formData} externalData={formData} onSubmit={rhfHandleSubmit(handleSubmit)} className="w-full h-full">
      <div className="w-full h-full flex flex-col bg-white">
      {/* Header - FIXO */}
      <PedidoHeader formData={formData} pedido={pedido} />

      {/* Tabs - FIXO (extraído para componente) */}
      <PedidoTabsContainer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        formData={formData}
        setFormData={setFormData}
        clientes={clientes}
        bloquearEdicao={bloquearEdicao}
        validacoes={validacoes}
        errors={errors}
        pedido={pedido}
      />

      {/* Footer com Ações - FIXO */}
      <PedidoFooterAcoes
          valorTotal={formData?.valor_total || 0}
          pesoTotalKg={formData?.peso_total_kg || 0}
          etapasCount={formData?.etapas_entrega?.length || 0}
          salvando={salvando}
          canSalvarRascunho={!isLockedFooter && (validacoes.identificacao && validacoes.itens)}
          canFecharCompleto={!isLockedFooter && (validacoes.identificacao && validacoes.itens)}
          canFecharEnviarEntrega={!isLockedFooter && (validacoes.identificacao && validacoes.itens)}
          canSalvarAlteracoes={!isLockedFooter && (validacoes.identificacao && validacoes.itens)}
          canCriarPedido={!isLockedFooter && (validacoes.identificacao && validacoes.itens)}
          canSolicitarAprovacao={!isLockedFooter && canSolicitarAprovacao}
          onSolicitarAprovacao={solicitarAprovacao}
          onCancelar={onCancel}
          onSalvarRascunho={async () => {
           if (salvando) return;
           setSalvando(true);
           try {
             const stamped = carimbarContexto({ ...formData, status: 'Rascunho' }, 'empresa_id');
             const parsed = pedidoCompletoSchema.safeParse(stamped);
             if (!parsed.success) {
               const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
               toast.error('Erro: Erros de validação', { description: msg });
               return;
             }
             await onSubmit(parsed.data);
             toast.success('Rascunho salvo!');
             onCancel();
           } finally { setSalvando(false); }
         }}
         onFecharCompleto={async () => {
           if (salvando) return;
           setSalvando(true);
           try {
             const stamped = carimbarContexto({ ...formData, status: 'Aprovado' }, 'empresa_id');
             const parsed = pedidoCompletoSchema.safeParse(stamped);
             if (!parsed.success) {
               const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
               toast.error('Erro: Erros de validação', { description: msg });
               setSalvando(false);
               return;
             }
             const pedidoSalvo = await onSubmit(parsed.data);
             setSalvando(false);
             onCancel();
             setTimeout(() => {
               if (window.__currentOpenWindow) {
                 window.__currentOpenWindow(
                   AutomacaoFluxoPedido,
                   { pedido: pedidoSalvo || { ...formData, id: formData.id, status: 'Aprovado' }, windowMode: true },
                   { title: `Automação - Pedido ${formData.numero_pedido}`, width: 1200, height: 700 }
                 );
               }
             }, 150);
           } catch (e) { setSalvando(false); toast.error('Erro: Erro ao salvar pedido'); }
         }}
         onFecharEnviarEntrega={async () => {
           if (salvando) return;
           setSalvando(true);
           try {
             const stamped = carimbarContexto({ ...formData, status: 'Pronto para Faturar' }, 'empresa_id');
             const parsed = pedidoCompletoSchema.safeParse(stamped);
             if (!parsed.success) {
               const msg = parsed.error.issues.map(i => `• ${i.message}`).join('\n');
               toast.error('Erro: Erros de validação', { description: msg });
             } else {
               await onSubmit(parsed.data);
               toast.success('Pedido fechado e pronto para faturar!');
             }
           } finally { setSalvando(false); }
         }}
         onSalvarAlteracoes={async () => {
           if (salvando) return;
           setSalvando(true);
           try { await onSubmit(carimbarContexto(formData, 'empresa_id')); toast.success('Alterações salvas!'); onCancel(); }
           finally { setSalvando(false); }
         }}
         onCriarPedido={rhfHandleSubmit(handleSubmit)}
       />

    </div>
  </FormWrapper>
  );

  if (windowMode) {
    return content;
  }

  return content;
}
export default React.memo(PedidoFormCompleto);