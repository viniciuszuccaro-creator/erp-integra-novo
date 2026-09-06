import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";

/**
 * Hook extraído de Contratos.jsx (Regra-Mãe regra 3).
 * Centraliza: alertas automáticos, cobrança automática, renovação e exclusão.
 */
export function useContratoActions({ contratos, empresaAtual, groupId, user }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();

  // ---- Alertas automáticos de vencimento e reajuste ----
  const enviarAlerta = async (contrato, tipo, dias) => {
    try {
      await createInContext('Notificacao', {
        titulo: `⚠️ Contrato Vencendo: ${contrato.numero_contrato}`,
        mensagem: `O contrato "${contrato.objeto}" com ${contrato.parte_contratante} vence em ${dias} dias.\n\nData de vencimento: ${new Date(contrato.data_fim).toLocaleDateString('pt-BR')}\n\n${contrato.renovacao_automatica ? '✓ Renovação automática ativada' : '⚠️ Renovação manual necessária'}`,
        tipo: dias <= 7 ? 'urgente' : 'aviso',
        categoria: 'Sistema',
        prioridade: dias <= 7 ? 'Urgente' : 'Alta',
        destinatario_email: user?.email,
        link_acao: typeof window !== 'undefined' ? window.location.href : '',
        entidade_relacionada: 'Contrato',
        registro_id: contrato.id,
        group_id: groupId || contrato.group_id || null,
        empresa_id: contrato.empresa_id || empresaAtual?.id || null
      });

      const novaDataAlerta = new Date();
      novaDataAlerta.setDate(novaDataAlerta.getDate() + 7);

      const updatedContrato = {
        ...contrato,
        proximo_alerta_vencimento: novaDataAlerta.toISOString().split('T')[0],
        alertas_enviados: [...(contrato.alertas_enviados || []), { tipo, data_envio: new Date().toISOString(), destinatario: user?.email, enviado: true }]
      };

      await updateInContext('Contrato', contrato.id, updatedContrato);
      queryClient.setQueryData(['contratos'], (old) => old?.map(c => c.id === contrato.id ? updatedContrato : c) || []);
      toast({ title: "🔔 Alerta Automático", description: `Contrato ${contrato.numero_contrato} vence em ${dias} dias` });
    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
      toast({ title: "❌ Erro ao enviar alerta", description: `Não foi possível enviar alerta para ${contrato.numero_contrato}.`, variant: "destructive" });
    }
  };

  const enviarAlertaReajuste = async (contrato, dias) => {
    try {
      await createInContext('Notificacao', {
        titulo: `📈 Reajuste de Contrato: ${contrato.numero_contrato}`,
        mensagem: `O contrato "${contrato.objeto}" com ${contrato.parte_contratante} tem reajuste programado em ${dias} dias.\n\nData do reajuste: ${new Date(contrato.data_proximo_reajuste).toLocaleDateString('pt-BR')}\nÍndice: ${contrato.indice_reajuste}\nValor atual: R$ ${contrato.valor_mensal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        tipo: 'info', categoria: 'Sistema', prioridade: 'Normal',
        destinatario_email: user?.email,
        link_acao: typeof window !== 'undefined' ? window.location.href : '',
        entidade_relacionada: 'Contrato', registro_id: contrato.id,
        group_id: groupId || contrato.group_id || null,
        empresa_id: contrato.empresa_id || empresaAtual?.id || null
      });

      const novaDataAlerta = new Date();
      novaDataAlerta.setDate(novaDataAlerta.getDate() + 7);

      const updatedContrato = {
        ...contrato,
        proximo_alerta_reajuste: novaDataAlerta.toISOString().split('T')[0],
        alertas_enviados: [...(contrato.alertas_enviados || []), { tipo: 'Reajuste', data_envio: new Date().toISOString(), destinatario: user?.email, enviado: true }]
      };

      await updateInContext('Contrato', contrato.id, updatedContrato);
      queryClient.setQueryData(['contratos'], (old) => old?.map(c => c.id === contrato.id ? updatedContrato : c) || []);
      toast({ title: "🔔 Alerta de Reajuste", description: `Contrato ${contrato.numero_contrato} terá reajuste em ${dias} dias` });
    } catch (error) {
      console.error('Erro ao enviar alerta de reajuste:', error);
      toast({ title: "❌ Erro ao enviar alerta de reajuste", description: `Não foi possível enviar alerta de reajuste para ${contrato.numero_contrato}.`, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!user || !contratos || contratos.length === 0) return;
    const verificarAlertas = async () => {
      const hoje = new Date();
      for (const contrato of contratos) {
        if (contrato.status !== 'Vigente') continue;
        if (contrato.data_fim) {
          const dataFim = new Date(contrato.data_fim);
          const diasParaVencimento = Math.floor((dataFim - hoje) / (1000 * 60 * 60 * 24));
          const diasAvisoVencimento = contrato.prazo_aviso_renovacao || 30;
          if (diasParaVencimento <= diasAvisoVencimento && diasParaVencimento > 0) {
            const proximoAlerta = contrato.proximo_alerta_vencimento ? new Date(contrato.proximo_alerta_vencimento) : null;
            if (!proximoAlerta || (hoje.getTime() - proximoAlerta.getTime()) >= 7 * 24 * 60 * 60 * 1000) {
              await enviarAlerta(contrato, 'Vencimento', diasParaVencimento);
            }
          }
        }
        if (contrato.data_proximo_reajuste) {
          const dataReajuste = new Date(contrato.data_proximo_reajuste);
          const diasParaReajuste = Math.floor((dataReajuste - hoje) / (1000 * 60 * 60 * 24));
          if (diasParaReajuste <= 30 && diasParaReajuste > 0) {
            const proximoAlerteReajuste = contrato.proximo_alerta_reajuste ? new Date(contrato.proximo_alerta_reajuste) : null;
            if (!proximoAlerteReajuste || (hoje.getTime() - proximoAlerteReajuste.getTime()) >= 7 * 24 * 60 * 60 * 1000) {
              await enviarAlertaReajuste(contrato, diasParaReajuste);
            }
          }
        }
      }
    };
    const interval = setInterval(verificarAlertas, 3600000);
    verificarAlertas();
    return () => clearInterval(interval);
  }, [contratos, user]);

  // ---- Geração automática de cobranças ----
  const gerarCobrancasMutation = useMutation({
    mutationFn: async (contrato) => {
      // Regra-Mãe 5: validação dupla RBAC + contexto na persistência (fail-closed)
      if (!canCreate('Contratos')) throw new Error('Sem permissão para gerar cobranças de contratos.');
      if (!contrato.gerar_cobranca_automatica || contrato.status !== 'Vigente') {
        throw new Error('Cobrança automática não ativa ou contrato não vigente.');
      }
      if (!contrato.group_id && !groupId) throw new Error('Contrato sem contexto de grupo — operação bloqueada.');
      const hoje = new Date();
      let ultimaCobrancaData = contrato.ultima_cobranca_gerada ? new Date(contrato.ultima_cobranca_gerada) : new Date(contrato.data_inicio);
      if (new Date(contrato.data_inicio) > hoje) return { gerado: false, motivo: 'Contrato ainda não iniciou' };

      const tempUltimaCobranca = new Date(ultimaCobrancaData);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      if (tempUltimaCobranca < oneMonthAgo) {
        ultimaCobrancaData = new Date(hoje.getFullYear(), hoje.getMonth() - 1, contrato.dia_vencimento || 1);
      }

      const currentMonthDueDate = new Date(hoje.getFullYear(), hoje.getMonth(), contrato.dia_vencimento || 1);
      if (ultimaCobrancaData.getMonth() === hoje.getMonth() && ultimaCobrancaData.getFullYear() === hoje.getFullYear()) {
        return { gerado: false, motivo: 'Cobrança para o mês atual já gerada' };
      }
      if (hoje < currentMonthDueDate) {
        return { gerado: false, motivo: 'Ainda não é o dia de vencimento para gerar a cobrança' };
      }

      const contaReceber = await createInContext('ContaReceber', {
        descricao: `Mensalidade ${contrato.objeto} - ${contrato.numero_contrato}`,
        cliente: contrato.parte_contratante,
        empresa_id: contrato.empresa_id || empresaAtual?.id,
        group_id: contrato.group_id || groupId || null,
        valor: contrato.valor_mensal,
        data_emissao: hoje.toISOString().split('T')[0],
        data_vencimento: currentMonthDueDate.toISOString().split('T')[0],
        status: 'Pendente',
        forma_recebimento: contrato.forma_pagamento,
        numero_documento: `BOL-${contrato.numero_contrato}-${hoje.getMonth() + 1}${hoje.getFullYear()}`,
        observacoes: `Gerado automaticamente do contrato ${contrato.numero_contrato}`
      });

      const proximaCobrancaCalculated = new Date(hoje.getFullYear(), hoje.getMonth() + 1, contrato.dia_vencimento || 1);
      const updatedContrato = {
        ...contrato,
        ultima_cobranca_gerada: hoje.toISOString().split('T')[0],
        proxima_cobranca: proximaCobrancaCalculated.toISOString().split('T')[0],
        contas_geradas_ids: [...(contrato.contas_geradas_ids || []), contaReceber.id]
      };
      await updateInContext('Contrato', contrato.id, updatedContrato);
      queryClient.setQueryData(['contratos'], (old) => old?.map(c => c.id === contrato.id ? updatedContrato : c) || []);
      return { gerado: true, conta: contaReceber };
    },
    onSuccess: async (result) => {
      if (result.gerado) {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário', usuario_id: user?.id,
          acao: 'Criação', modulo: 'Contratos', entidade: 'ContaReceber', registro_id: result.conta?.id,
          descricao: `Cobrança gerada do contrato ${result.conta?.numero_documento || ''}`,
          empresa_id: empresaAtual?.id || null, group_id: groupId || null,
        });
        queryClient.invalidateQueries({ queryKey: ['contratos'] });
        queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
        toast({ title: "✅ Cobrança Gerada!", description: `Boleto ${result.conta.numero_documento} criado automaticamente` });
      } else {
        toast({ title: "ℹ️ Geração de Cobrança", description: result.motivo });
      }
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao Gerar Cobrança", description: error.message || "Não foi possível gerar a cobrança.", variant: "destructive" });
    }
  });

  // ---- Renovação automática ----
  const renovarContratoMutation = useMutation({
    mutationFn: async (contrato) => {
      // Regra-Mãe 5: validação dupla RBAC + contexto na persistência (fail-closed)
      if (!canEdit('Contratos')) throw new Error('Sem permissão para renovar contratos.');
      if (!contrato.group_id && !groupId) throw new Error('Contrato sem contexto de grupo — operação bloqueada.');
      const hoje = new Date();
      const novaDataInicio = new Date(contrato.data_fim);
      novaDataInicio.setDate(novaDataInicio.getDate() + 1);
      const novaDataFim = new Date(novaDataInicio);
      novaDataFim.setMonth(novaDataFim.getMonth() + contrato.vigencia_meses);

      let novoValorMensal = contrato.valor_mensal;
      let percentualReajusteAplicado = 0;
      if (contrato.percentual_reajuste && contrato.percentual_reajuste > 0) {
        percentualReajusteAplicado = contrato.percentual_reajuste;
        novoValorMensal = contrato.valor_mensal * (1 + percentualReajusteAplicado / 100);
      }
      const novoValorTotal = novoValorMensal * contrato.vigencia_meses;

      const historicoRenovacao = {
        data_renovacao: hoje.toISOString().split('T')[0],
        valor_anterior: contrato.valor_mensal, valor_novo: novoValorMensal,
        percentual_reajuste: percentualReajusteAplicado, indice_utilizado: contrato.indice_reajuste,
        usuario: user?.full_name || 'Sistema', observacao: contrato.renovacao_automatica ? 'Renovação automática' : 'Renovação manual'
      };
      const proximoReajuste = new Date(novaDataInicio);
      proximoReajuste.setFullYear(proximoReajuste.getFullYear() + 1);

      const updatedContrato = {
        ...contrato, data_inicio: novaDataInicio.toISOString().split('T')[0], data_fim: novaDataFim.toISOString().split('T')[0],
        valor_mensal: novoValorMensal, valor_total: novoValorTotal, data_proximo_reajuste: proximoReajuste.toISOString().split('T')[0],
        status: 'Vigente', historico_renovacoes: [...(contrato.historico_renovacoes || []), historicoRenovacao],
        proximo_alerta_vencimento: null, proximo_alerta_reajuste: null,
        ultima_cobranca_gerada: null, proxima_cobranca: null,
      };
      await updateInContext('Contrato', contrato.id, updatedContrato);
      queryClient.setQueryData(['contratos'], (old) => old?.map(c => c.id === contrato.id ? updatedContrato : c) || []);
      return { contrato: updatedContrato, novoValorMensal, percentualReajusteAplicado, valorAnterior: contrato.valor_mensal, vigenciaAnterior: { data_inicio: contrato.data_inicio, data_fim: contrato.data_fim } };
    },
    onSuccess: async ({ contrato, novoValorMensal, percentualReajusteAplicado, valorAnterior, vigenciaAnterior }) => {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário', usuario_id: user?.id,
        acao: 'Renovação', modulo: 'Contratos', entidade: 'Contrato', registro_id: contrato?.id,
        descricao: `Contrato ${contrato?.numero_contrato || ''} renovado`,
        dados_anteriores: { valor_mensal: valorAnterior, ...vigenciaAnterior },
        dados_novos: { valor_mensal: novoValorMensal, percentual_reajuste: percentualReajusteAplicado, data_inicio: contrato?.data_inicio, data_fim: contrato?.data_fim },
        empresa_id: contrato?.empresa_id || empresaAtual?.id || null, group_id: contrato?.group_id || groupId || null,
      });
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: "✅ Contrato Renovado!", description: `${contrato.numero_contrato} renovado ${percentualReajusteAplicado > 0 ? `com reajuste de ${percentualReajusteAplicado}%` : 'sem reajuste'}` });
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao Renovar Contrato", description: error.message || "Não foi possível renovar o contrato.", variant: "destructive" });
    }
  });

  // ---- Exclusão ----
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Regra-Mãe 5: validação dupla RBAC + contexto na persistência (fail-closed)
      if (!canDelete('Contratos')) throw new Error('Sem permissão para excluir contratos.');
      const antes = contratos?.find(c => c.id === id) || null;
      if (antes && !antes.group_id && !groupId) throw new Error('Contrato sem contexto de grupo — operação bloqueada.');
      await deleteInContext('Contrato', id);
      return { id, antes };
    },
    onSuccess: async ({ id, antes }) => {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário', usuario_id: user?.id,
        acao: 'Exclusão', modulo: 'Contratos', entidade: 'Contrato', registro_id: id,
        empresa_id: antes?.empresa_id || empresaAtual?.id || null, group_id: antes?.group_id || groupId || null,
        descricao: `Contrato excluído`,
        dados_anteriores: antes ? { numero_contrato: antes.numero_contrato, objeto: antes.objeto, parte_contratante: antes.parte_contratante, valor_mensal: antes.valor_mensal, status: antes.status } : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      toast({ title: "✅ Contrato Excluído", description: "O contrato foi removido" });
    },
    onError: (error) => {
      toast({ title: "❌ Erro ao Excluir Contrato", description: error.message || "Não foi possível excluir o contrato.", variant: "destructive" });
    }
  });

  return { gerarCobrancasMutation, renovarContratoMutation, deleteMutation };
}

export default useContratoActions;