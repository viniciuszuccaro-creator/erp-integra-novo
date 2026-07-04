import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssinaturaEletronicaModal from "@/components/AssinaturaEletronicaModal";
import { useToast } from "@/components/ui/use-toast";
import { useWindow } from "@/components/lib/useWindow";
import ContratoForm from "@/components/contratos/ContratoForm";
import ContratoViewDialog from "@/components/contratos/ContratoViewDialog";
import ContratoHistoryDialog from "@/components/contratos/ContratoHistoryDialog";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  PenTool,
  Bell,
  RefreshCw,
  Receipt,
  History,
  Zap
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ContratosKPIs from "@/components/contratos/ContratosKPIs";
import ContratosIAPanel from "@/components/contratos/ContratosIAPanel";
import SemEmpresaBanner from "@/components/common/SemEmpresaBanner";
import IAContextualModulo from "@/components/ia/IAContextualModulo";

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingContrato, setViewingContrato] = useState(null);
  const [assinaturaModalOpen, setAssinaturaModalOpen] = useState(false);
  const [contratoParaAssinar, setContratoParaAssinar] = useState(null);
  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [contratoHistorico, setContratoHistorico] = useState(null);
  const [activeTab, setActiveTab] = useState("todos");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let initial = params.get('tab');
    if (!initial) { try { initial = localStorage.getItem('Contratos_tab'); } catch {} }
    if (initial) setActiveTab(initial);
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.replaceState({}, '', url.toString());
    try { localStorage.setItem('Contratos_tab', value); } catch {}
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const { empresaAtual, filterInContext } = useContextoVisual();

  // P1: formData removido — criação/edição via ContratoForm no openWindow

  const { grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  // P2: contexto obrigatório antes de qualquer query
  const contextoValido = !!(empresaAtual?.id || groupId);

  const { data: contratos = [] } = useQuery({
    queryKey: ['contratos', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Contrato', {}, '-created_date'),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: contextoValido,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Cliente', {}, '-created_date'),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: contextoValido,
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Fornecedor', {}, '-created_date'),
    staleTime: 60000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: contextoValido,
  });

  // Multiempresa: usar dados diretos (queries já filtradas pelo contexto)
  const contratosContexto = contratos;
  const clientesFiltrados = clientes;
  const fornecedoresFiltrados = fornecedores;

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  // Helper functions for alerts - defined here to have access to user and toast
  const enviarAlerta = async (contrato, tipo, dias) => {
    try {
      await base44.entities.Notificacao.create({
        titulo: `⚠️ Contrato Vencendo: ${contrato.numero_contrato}`,
        mensagem: `O contrato "${contrato.objeto}" com ${contrato.parte_contratante} vence em ${dias} dias.\n\nData de vencimento: ${new Date(contrato.data_fim).toLocaleDateString('pt-BR')}\n\n${contrato.renovacao_automatica ? '✓ Renovação automática ativada' : '⚠️ Renovação manual necessária'}`,
        tipo: dias <= 7 ? 'urgente' : 'aviso',
        categoria: 'Sistema',
        prioridade: dias <= 7 ? 'Urgente' : 'Alta',
        destinatario_email: user?.email,
        link_acao: window.location.href,
        entidade_relacionada: 'Contrato',
        registro_id: contrato.id
      });

      const novaDataAlerta = new Date();
      novaDataAlerta.setDate(novaDataAlerta.getDate() + 7);

      // Create a copy of the contract object to avoid direct mutation of cached data
      const updatedContrato = {
        ...contrato,
        proximo_alerta_vencimento: novaDataAlerta.toISOString().split('T')[0],
        alertas_enviados: [
          ...(contrato.alertas_enviados || []),
          {
            tipo,
            data_envio: new Date().toISOString(),
            destinatario: user?.email,
            enviado: true
          }
        ]
      };

      await base44.entities.Contrato.update(contrato.id, updatedContrato);
      // Manually update the cache to reflect changes immediately without full re-fetch
      queryClient.setQueryData(['contratos'], (oldContratos) => 
        oldContratos.map(c => c.id === contrato.id ? updatedContrato : c)
      );

      toast({
        title: "🔔 Alerta Automático",
        description: `Contrato ${contrato.numero_contrato} vence em ${dias} dias`
      });
    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
      toast({
        title: "❌ Erro ao enviar alerta",
        description: `Não foi possível enviar alerta para ${contrato.numero_contrato}.`,
        variant: "destructive",
      });
    }
  };

  const enviarAlertaReajuste = async (contrato, dias) => {
    try {
      await base44.entities.Notificacao.create({
        titulo: `📈 Reajuste de Contrato: ${contrato.numero_contrato}`,
        mensagem: `O contrato "${contrato.objeto}" com ${contrato.parte_contratante} tem reajuste programado em ${dias} dias.\n\nData do reajuste: ${new Date(contrato.data_proximo_reajuste).toLocaleDateString('pt-BR')}\nÍndice: ${contrato.indice_reajuste}\nValor atual: R$ ${contrato.valor_mensal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        tipo: 'info',
        categoria: 'Sistema',
        prioridade: 'Normal',
        destinatario_email: user?.email,
        link_acao: window.location.href,
        entidade_relacionada: 'Contrato',
        registro_id: contrato.id
      });

      const novaDataAlerta = new Date();
      novaDataAlerta.setDate(novaDataAlerta.getDate() + 7);

      // Create a copy of the contract object to avoid direct mutation of cached data
      const updatedContrato = {
        ...contrato,
        proximo_alerta_reajuste: novaDataAlerta.toISOString().split('T')[0],
        alertas_enviados: [
          ...(contrato.alertas_enviados || []),
          {
            tipo: 'Reajuste',
            data_envio: new Date().toISOString(),
            destinatario: user?.email,
            enviado: true
          }
        ]
      };

      await base44.entities.Contrato.update(contrato.id, updatedContrato);
      // Manually update the cache to reflect changes immediately without full re-fetch
      queryClient.setQueryData(['contratos'], (oldContratos) => 
        oldContratos.map(c => c.id === contrato.id ? updatedContrato : c)
      );
      
      toast({
        title: "🔔 Alerta de Reajuste",
        description: `Contrato ${contrato.numero_contrato} terá reajuste em ${dias} dias`
      });
    } catch (error) {
      console.error('Erro ao enviar alerta de reajuste:', error);
      toast({
        title: "❌ Erro ao enviar alerta de reajuste",
        description: `Não foi possível enviar alerta de reajuste para ${contrato.numero_contrato}.`,
        variant: "destructive",
      });
    }
  };

  // Sistema de Alertas Automáticos
  useEffect(() => {
    if (!user || contratos.length === 0) return;

    const verificarAlertas = async () => {
      const hoje = new Date();
      
      for (const contrato of contratos) {
        if (contrato.status !== 'Vigente') continue;

        // Alerta de Vencimento
        if (contrato.data_fim) {
          const dataFim = new Date(contrato.data_fim);
          const diasParaVencimento = Math.floor((dataFim - hoje) / (1000 * 60 * 60 * 24));
          const diasAvisoVencimento = contrato.prazo_aviso_renovacao || 30;

          if (diasParaVencimento <= diasAvisoVencimento && diasParaVencimento > 0) {
            const proximoAlerta = contrato.proximo_alerta_vencimento 
              ? new Date(contrato.proximo_alerta_vencimento)
              : null;

            if (!proximoAlerta || (hoje.getTime() - proximoAlerta.getTime()) >= 7 * 24 * 60 * 60 * 1000) {
              await enviarAlerta(contrato, 'Vencimento', diasParaVencimento);
            }
          }
        }

        // Alerta de Reajuste
        if (contrato.data_proximo_reajuste) {
          const dataReajuste = new Date(contrato.data_proximo_reajuste);
          const diasParaReajuste = Math.floor((dataReajuste - hoje) / (1000 * 60 * 60 * 24));

          if (diasParaReajuste <= 30 && diasParaReajuste > 0) {
            const proximoAlerteReajuste = contrato.proximo_alerta_reajuste
              ? new Date(contrato.proximo_alerta_reajuste)
              : null;

            if (!proximoAlerteReajuste || (hoje.getTime() - proximoAlerteReajuste.getTime()) >= 7 * 24 * 60 * 60 * 1000) {
              await enviarAlertaReajuste(contrato, diasParaReajuste);
            }
          }
        }
      }
    };

    const interval = setInterval(verificarAlertas, 3600000); // Checks every hour (3.6 million ms)
    verificarAlertas(); // Checks immediately upon component load/user/contratos changes

    return () => clearInterval(interval);
  }, [contratos, user, toast]);

  // Geração Automática de Cobranças
  const gerarCobrancasMutation = useMutation({
    mutationFn: async (contrato) => {
      if (!contrato.gerar_cobranca_automatica || contrato.status !== 'Vigente') {
        throw new Error('Cobranca automática não ativa ou contrato não vigente.');
      }
      
      const hoje = new Date();
      let ultimaCobrancaData = contrato.ultima_cobranca_gerada 
        ? new Date(contrato.ultima_cobranca_gerada)
        : new Date(contrato.data_inicio);
      
      // If data_inicio is in the future, don't generate yet.
      if (new Date(contrato.data_inicio) > hoje) {
        return { gerado: false, motivo: 'Contrato ainda não iniciou' };
      }

      // Adjust ultimaCobrancaData to be within the last month for comparison
      // If ultimaCobrancaData is too old, we consider the current month's potential charge
      const tempUltimaCobranca = new Date(ultimaCobrancaData);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      if (tempUltimaCobranca < oneMonthAgo) {
          ultimaCobrancaData = new Date(hoje.getFullYear(), hoje.getMonth() -1, contrato.dia_vencimento || 1);
      }

      // Calculate the intended due date for the current month
      const currentMonthDueDate = new Date(hoje.getFullYear(), hoje.getMonth(), contrato.dia_vencimento || 1);
      
      // If a charge has already been generated for this month, skip
      if (ultimaCobrancaData.getMonth() === hoje.getMonth() && ultimaCobrancaData.getFullYear() === hoje.getFullYear()) {
          return { gerado: false, motivo: 'Cobrança para o mês atual já gerada' };
      }

      // Check if current date is past the due date for this month to generate
      if (hoje < currentMonthDueDate) {
          return { gerado: false, motivo: 'Ainda não é o dia de vencimento para gerar a cobrança' };
      }

      // Criar conta a receber
      const contaReceber = await base44.entities.ContaReceber.create({
        descricao: `Mensalidade ${contrato.objeto} - ${contrato.numero_contrato}`,
        cliente: contrato.parte_contratante,
        empresa_id: contrato.empresa_id || empresaAtual?.id,
        group_id: contrato.group_id || null,
        // Assuming parte_contratante_id exists or can be derived from clients/fornecedores
        // For now, it's missing in formData, should be added if needed for relation
        valor: contrato.valor_mensal,
        data_emissao: hoje.toISOString().split('T')[0],
        data_vencimento: currentMonthDueDate.toISOString().split('T')[0],
        status: 'Pendente',
        forma_recebimento: contrato.forma_pagamento,
        numero_documento: `BOL-${contrato.numero_contrato}-${hoje.getMonth() + 1}${hoje.getFullYear()}`,
        observacoes: `Gerado automaticamente do contrato ${contrato.numero_contrato}`
      });

      // Update contract
      const proximaCobrancaCalculated = new Date(hoje.getFullYear(), hoje.getMonth() + 1, contrato.dia_vencimento || 1);

      const updatedContrato = {
        ...contrato,
        ultima_cobranca_gerada: hoje.toISOString().split('T')[0],
        proxima_cobranca: proximaCobrancaCalculated.toISOString().split('T')[0],
        contas_geradas_ids: [...(contrato.contas_geradas_ids || []), contaReceber.id]
      };

      await base44.entities.Contrato.update(contrato.id, updatedContrato);

      // Manually update the cache to reflect changes immediately without full re-fetch
      queryClient.setQueryData(['contratos'], (oldContratos) => 
        oldContratos.map(c => c.id === contrato.id ? updatedContrato : c)
      );

      return { gerado: true, conta: contaReceber };
    },
    onSuccess: async (result) => {
      // Invalidate specific queries only if an actual charge was generated
      if (result.gerado) {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          acao: 'Criação',
          modulo: 'Contratos',
          entidade: 'ContaReceber',
          registro_id: result.conta?.id,
          descricao: `Cobrança gerada do contrato ${result.conta?.numero_documento || ''}`,
        });
        queryClient.invalidateQueries({ queryKey: ['contratos'] });
        queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
        toast({
          title: "✅ Cobrança Gerada!",
          description: `Boleto ${result.conta.numero_documento} criado automaticamente`
        });
      } else {
        toast({
          title: "ℹ️ Geração de Cobrança",
          description: result.motivo,
          variant: "default",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao Gerar Cobrança",
        description: error.message || "Não foi possível gerar a cobrança.",
        variant: "destructive",
      });
    }
  });

  // Renovação Automática
  const renovarContratoMutation = useMutation({
    mutationFn: async (contrato) => {
      const hoje = new Date();
      // Ensure data_fim is always after data_inicio for calculation
      const dataFimAtual = new Date(contrato.data_fim);
      // P1: window.confirm removido — ação direta com auditoria
      if (dataFimAtual > hoje) {
        // Contrato ainda vigente: renovação manual permitida sem confirmação de browser
      }


      const novaDataInicio = new Date(contrato.data_fim);
      novaDataInicio.setDate(novaDataInicio.getDate() + 1); // Day after current end date
      
      const novaDataFim = new Date(novaDataInicio);
      novaDataFim.setMonth(novaDataFim.getMonth() + contrato.vigencia_meses); // Add vigencia_meses

      // Calcular reajuste se houver
      let novoValorMensal = contrato.valor_mensal;
      let percentualReajusteAplicado = 0;

      if (contrato.percentual_reajuste && contrato.percentual_reajuste > 0) {
        percentualReajusteAplicado = contrato.percentual_reajuste;
        novoValorMensal = contrato.valor_mensal * (1 + percentualReajusteAplicado / 100);
      }

      const novoValorTotal = novoValorMensal * contrato.vigencia_meses;

      // Registrar no histórico
      const historicoRenovacao = {
        data_renovacao: hoje.toISOString().split('T')[0],
        valor_anterior: contrato.valor_mensal,
        valor_novo: novoValorMensal,
        percentual_reajuste: percentualReajusteAplicado,
        indice_utilizado: contrato.indice_reajuste,
        usuario: user?.full_name || 'Sistema',
        observacao: contrato.renovacao_automatica ? 'Renovação automática' : 'Renovação manual'
      };

      // Calcular próximo reajuste (1 ano após a nova data de início)
      const proximoReajuste = new Date(novaDataInicio);
      proximoReajuste.setFullYear(proximoReajuste.getFullYear() + 1);

      const updatedContrato = {
        ...contrato,
        data_inicio: novaDataInicio.toISOString().split('T')[0],
        data_fim: novaDataFim.toISOString().split('T')[0],
        valor_mensal: novoValorMensal,
        valor_total: novoValorTotal,
        data_proximo_reajuste: proximoReajuste.toISOString().split('T')[0],
        status: 'Vigente', // Reset status to Vigente upon renewal
        historico_renovacoes: [...(contrato.historico_renovacoes || []), historicoRenovacao],
        proximo_alerta_vencimento: null, // Reset alert date
        proximo_alerta_reajuste: null,   // Reset alert date
        ultima_cobranca_gerada: null,    // Reset last charge date if needed for new cycle
        proxima_cobranca: null,          // Recalculate based on new data_inicio
      };

      await base44.entities.Contrato.update(contrato.id, updatedContrato);
      queryClient.setQueryData(['contratos'], (oldContratos) => 
        oldContratos.map(c => c.id === contrato.id ? updatedContrato : c)
      );

      return { contrato, novoValorMensal, percentualReajusteAplicado };
    },
    onSuccess: async ({ contrato, novoValorMensal, percentualReajusteAplicado }) => {
      await base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        acao: 'Renovação',
        modulo: 'Contratos',
        entidade: 'Contrato',
        registro_id: contrato?.id,
        descricao: `Contrato ${contrato?.numero_contrato || ''} renovado`,
      });
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      
      toast({
        title: "✅ Contrato Renovado!",
        description: `${contrato.numero_contrato} renovado ${percentualReajusteAplicado > 0 ? `com reajuste de ${percentualReajusteAplicado}%` : 'sem reajuste'}`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao Renovar Contrato",
        description: error.message || "Não foi possível renovar o contrato.",
        variant: "destructive",
      });
    }
  });

  // P1: createMutation/updateMutation removidos — criação/edição via openWindow callback

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contrato.delete(id),
    onSuccess: async (_res, id) => {
    await base44.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id,
      acao: 'Exclusão',
      modulo: 'Contratos',
      entidade: 'Contrato',
      registro_id: id,
      empresa_id: empresaAtual?.id || null,
      group_id: groupId || null,
      descricao: `Contrato excluído`,
    });
    queryClient.invalidateQueries({ queryKey: ['contratos'] });
    setViewingContrato(null);
    setContratoParaExcluir(null);
    toast({
      title: "✅ Contrato Excluído",
      description: "O contrato foi removido"
    });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao Excluir Contrato",
        description: error.message || "Não foi possível excluir o contrato.",
        variant: "destructive",
      });
    }
  });

  // P1: resetForm/handleSubmit/handleEdit removidos — edição via openWindow(ContratoForm)

  const [contratoParaExcluir, setContratoParaExcluir] = useState(null);

  const handleDelete = (contrato) => {
    // P1/P3: inline confirm em vez de window.confirm
    setContratoParaExcluir(contrato);
  };

  const confirmarExclusao = () => {
    if (contratoParaExcluir) {
      deleteMutation.mutate(contratoParaExcluir.id);
      setContratoParaExcluir(null);
    }
  };

  const abrirAssinatura = (contrato) => {
    setContratoParaAssinar(contrato);
    setAssinaturaModalOpen(true);
  };

  const podeAssinar = (contrato) => {
    return contrato.status === 'Aguardando Assinatura' || 
           (contrato.status === 'Vigente' && !contrato.assinado);
  };

  const calcularDiasParaVencimento = (dataFim) => {
    const hoje = new Date();
    const vencimento = new Date(dataFim);
    const diff = Math.floor((vencimento - hoje) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredContratos = contratosContexto.filter(c => {
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = (
      c.numero_contrato?.toLowerCase().includes(searchLower) ||
      c.parte_contratante?.toLowerCase().includes(searchLower) ||
      c.objeto?.toLowerCase().includes(searchLower) ||
      c.titulo?.toLowerCase().includes(searchLower) ||
      c.descricao?.toLowerCase().includes(searchLower) ||
      c.tipo?.toLowerCase().includes(searchLower) ||
      c.status?.toLowerCase().includes(searchLower) ||
      c.responsavel_empresa?.toLowerCase().includes(searchLower) ||
      c.forma_pagamento?.toLowerCase().includes(searchLower) ||
      c.indice_reajuste?.toLowerCase().includes(searchLower) ||
      c.observacoes?.toLowerCase().includes(searchLower)
    );

    if (!searchMatch) return false;

    if (activeTab === "todos") return true;
    if (activeTab === "proximos") {
      const diasVencer = c.data_fim ? calcularDiasParaVencimento(c.data_fim) : -1;
      return diasVencer > 0 && diasVencer <= 60 && c.status === 'Vigente';
    }
    return c.status === activeTab;
  });

  const contratosPorStatus = {
    vigentes: contratosContexto.filter(c => c.status === 'Vigente'),
    aguardando: contratosContexto.filter(c => c.status === 'Aguardando Assinatura'),
    vencidos: contratosContexto.filter(c => c.status === 'Vencido'),
    proximosVencer: contratosContexto.filter(c => {
      if (c.status !== 'Vigente' || !c.data_fim) return false;
      const dias = calcularDiasParaVencimento(c.data_fim);
      return dias <= 60 && dias > 0;
    })
  };

  // valorTotalContratos usada internamente pelo ContratosKPIs via prop

  const statusColors = {
    'Rascunho': 'bg-gray-100 text-gray-700',
    'Aguardando Assinatura': 'bg-yellow-100 text-yellow-700',
    'Vigente': 'bg-green-100 text-green-700',
    'Vencido': 'bg-red-100 text-red-700',
    'Rescindido': 'bg-orange-100 text-orange-700',
    'Renovado': 'bg-blue-100 text-blue-700'
  };

  const tipoColors = {
    'Cliente': 'bg-blue-50 text-blue-700',
    'Fornecedor': 'bg-purple-50 text-purple-700',
    'Prestação de Serviço': 'bg-indigo-50 text-indigo-700',
    'Locação': 'bg-orange-50 text-orange-700',
    'Parceria': 'bg-green-50 text-green-700',
    'Outro': 'bg-gray-50 text-gray-700'
  };

  return (
    <div className="h-full w-full p-6 lg:p-8 space-y-6 overflow-auto">
      <SemEmpresaBanner modulo="Gestão de Contratos" />
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              Gestão de Contratos
            </h1>
            <p className="text-slate-600 mt-1">Contratos inteligentes com alertas, assinatura eletrônica e cobrança automática</p>
          </div>
          <div className="mt-2"><IAContextualModulo modulo="Contratos" compact /></div>
        </div>

        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          data-permission="Contratos.Contrato.criar"
          onClick={() => openWindow(ContratoForm, {
            windowMode: true,
            clientes,
            fornecedores,
            onSubmit: async (data) => {
              try {
                const dataProximoReajuste = new Date(data.data_inicio);
                dataProximoReajuste.setFullYear(dataProximoReajuste.getFullYear() + 1);
                const proximaCobranca = new Date(data.data_inicio);
                proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
                proximaCobranca.setDate(data.dia_vencimento || 1);
                await base44.entities.Contrato.create({
                  ...data,
                  empresa_id: data.empresa_id || empresaAtual?.id,
                  group_id: data.group_id || groupId,
                  data_proximo_reajuste: dataProximoReajuste.toISOString().split('T')[0],
                  proxima_cobranca: proximaCobranca.toISOString().split('T')[0],
                  historico_renovacoes: [],
                  alertas_enviados: [],
                  contas_geradas_ids: []
                });
                queryClient.invalidateQueries({ queryKey: ['contratos'] });
                toast({ title: "✅ Contrato criado!" });
              } catch (error) {
                toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
              }
            }
          }, {
            title: '📄 Novo Contrato',
            width: 1100,
            height: 700
          })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>

        {/* P1: Formulário inline removido — criação/edição via ContratoForm no openWindow */}
      </div>

      {/* KPIs */}
      <ContratosKPIs contratos={contratosContexto} />

      {/* Painel IA */}
      <ContratosIAPanel contratos={contratosContexto} />

      {/* Abas de Navegação */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="todos">Todos ({contratosContexto.length})</TabsTrigger>
          <TabsTrigger value="Vigente">Vigentes ({contratosPorStatus.vigentes.length})</TabsTrigger>
          <TabsTrigger value="Aguardando Assinatura">Aguardando Assinatura ({contratosPorStatus.aguardando.length})</TabsTrigger>
          <TabsTrigger value="proximos">Próximos a Vencer ({contratosPorStatus.proximosVencer.length})</TabsTrigger>
          <TabsTrigger value="Vencido">Vencidos ({contratosPorStatus.vencidos.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Buscar por número, contratante, objeto, tipo, status, responsável, forma pagamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Parte Contratante</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.map((contrato) => {
                  const diasVencer = contrato.data_fim ? calcularDiasParaVencimento(contrato.data_fim) : -1;
                  return (
                    <TableRow key={contrato.id}>
                      <TableCell className="font-medium">{contrato.numero_contrato}</TableCell>
                      <TableCell>
                        <Badge className={tipoColors[contrato.tipo]}>{contrato.tipo}</Badge>
                      </TableCell>
                      <TableCell>{contrato.parte_contratante}</TableCell>
                      <TableCell className="max-w-xs truncate">{contrato.objeto}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {contrato.data_inicio && new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                          {contrato.data_fim && new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                          {diasVencer > 0 && diasVencer <= 60 && contrato.status === 'Vigente' && (
                            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              Vence em {diasVencer} dias
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        R$ {contrato.valor_mensal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={statusColors[contrato.status]}>{contrato.status}</Badge>
                          {contrato.assinado && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              ✓ Assinado
                            </Badge>
                          )}
                          {contrato.renovacao_automatica && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              🔄 Auto-renova
                            </Badge>
                          )}
                          {contrato.gerar_cobranca_automatica && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              💳 Auto-cobrança
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button variant="ghost" size="icon" data-permission="Contratos.Contrato.ver" onClick={() => setViewingContrato(contrato)} title="Ver detalhes">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-permission="Contratos.Contrato.editar"
                            onClick={() => openWindow(ContratoForm, {
                              contrato,
                              windowMode: true,
                              clientes,
                              fornecedores,
                              onSubmit: async (data) => {
                                try {
                                  await base44.entities.Contrato.update(contrato.id, {
                                    ...data,
                                    empresa_id: data.empresa_id || empresaAtual?.id,
                                    group_id: data.group_id || groupId,
                                  });
                                  queryClient.invalidateQueries({ queryKey: ['contratos'] });
                                  toast({ title: "✅ Contrato atualizado!" });
                                } catch (error) {
                                  toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                                }
                              }
                            }, {
                              title: `✏️ Editar: ${contrato.numero_contrato}`,
                              width: 1100,
                              height: 700
                            })}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {podeAssinar(contrato) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              data-permission="Contratos.Contrato.assinar"
                              onClick={() => abrirAssinatura(contrato)}
                              title="Assinar Eletronicamente"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <PenTool className="w-4 h-4" />
                            </Button>
                          )}
                          {contrato.gerar_cobranca_automatica && contrato.status === 'Vigente' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              data-permission="Contratos.Cobranca.criar"
                              onClick={() => gerarCobrancasMutation.mutate(contrato)}
                              title="Gerar Cobrança Manualmente"
                              className="text-purple-600 hover:text-purple-700"
                              disabled={gerarCobrancasMutation.isPending}
                            >
                              <Receipt className="w-4 h-4" />
                            </Button>
                          )}
                          {(contrato.status === 'Vigente' && diasVencer <= 0) || (contrato.status === 'Vencido' && contrato.renovacao_automatica) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              data-permission="Contratos.Contrato.renovar"
                              onClick={() => renovarContratoMutation.mutate(contrato)}
                              title="Renovar Contrato"
                              className="text-green-600 hover:text-green-700"
                              disabled={renovarContratoMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          {(contrato.historico_renovacoes?.length > 0 || contrato.alertas_enviados?.length > 0) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              data-permission="Contratos.Contrato.visualizar"
                              onClick={() => {
                                setContratoHistorico(contrato);
                                setHistoricoDialogOpen(true);
                              }}
                              title="Ver Histórico"
                              className="text-indigo-600"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" data-permission="Contratos.Contrato.excluir" onClick={() => handleDelete(contrato)} className="text-red-600 hover:text-red-700" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredContratos.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum contrato encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* P1: Dialogs extraídos para componentes — ContratoViewDialog e ContratoHistoryDialog */}
      <ContratoViewDialog contrato={viewingContrato} onClose={() => setViewingContrato(null)} />
      <ContratoHistoryDialog contrato={contratoHistorico} open={historicoDialogOpen} onOpenChange={setHistoricoDialogOpen} />

      {/* P1: Dialog inline de confirmação de exclusão */}
      <Dialog open={!!contratoParaExcluir} onOpenChange={() => setContratoParaExcluir(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 text-sm">
            Deseja realmente excluir o contrato <strong>{contratoParaExcluir?.numero_contrato}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setContratoParaExcluir(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={confirmarExclusao} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Assinatura */}
      {contratoParaAssinar && (
        <AssinaturaEletronicaModal
          isOpen={assinaturaModalOpen}
          onClose={() => {
            setAssinaturaModalOpen(false);
            setContratoParaAssinar(null);
            queryClient.invalidateQueries({ queryKey: ['contratos'] });
          }}
          documento={contratoParaAssinar}
          tipo="contrato"
          onAssinado={(assinatura) => {
            console.log('Contrato assinado:', assinatura);
            // The invalidateQueries above will handle re-fetching and updating UI
          }}
        />
      )}
    </div>
  );
}