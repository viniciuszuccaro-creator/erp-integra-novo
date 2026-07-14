import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  FileText, Plus, Search, Bell, Edit, Trash2, PenTool, RefreshCw, Receipt, History,
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ContratosKPIs from "@/components/contratos/ContratosKPIs";
import ContratosIAPanel from "@/components/contratos/ContratosIAPanel";
import SemEmpresaBanner from "@/components/common/SemEmpresaBanner";
import IAContextualModulo from "@/components/ia/IAContextualModulo";
import { useContratoActions } from "@/components/contratos/useContratoActions";
import ProtectedSection from "@/components/security/ProtectedSection";
import RBACButton from "@/components/lib/RBACButton";

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingContrato, setViewingContrato] = useState(null);
  const [assinaturaModalOpen, setAssinaturaModalOpen] = useState(false);
  const [contratoParaAssinar, setContratoParaAssinar] = useState(null);
  const [historicoDialogOpen, setHistoricoDialogOpen] = useState(false);
  const [contratoHistorico, setContratoHistorico] = useState(null);
  const [activeTab, setActiveTab] = useState("todos");
  const [contratoParaExcluir, setContratoParaExcluir] = useState(null);

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
  const { empresaAtual, filterInContext, grupoAtual, createInContext, updateInContext } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = !!(empresaAtual?.id || groupId);

  const { data: contratos = [] } = useQuery({
    queryKey: ['contratos', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Contrato', {}, '-created_date'),
    staleTime: 60000, gcTime: 300000,
    refetchOnWindowFocus: false, refetchOnReconnect: false, retry: false,
    enabled: contextoValido,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Cliente', {}, '-created_date'),
    staleTime: 60000, gcTime: 300000,
    refetchOnWindowFocus: false, refetchOnReconnect: false, retry: false,
    enabled: contextoValido,
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Fornecedor', {}, '-created_date'),
    staleTime: 60000, gcTime: 300000,
    refetchOnWindowFocus: false, refetchOnReconnect: false, retry: false,
    enabled: contextoValido,
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const contratosContexto = contratos;

  // Lógica de negócios extraída para useContratoActions (Regra-Mãe regra 3)
  const { gerarCobrancasMutation, renovarContratoMutation, deleteMutation } = useContratoActions({
    contratos: contratosContexto, empresaAtual, groupId, user
  });

  const handleDelete = (contrato) => setContratoParaExcluir(contrato);
  const confirmarExclusao = () => {
    if (contratoParaExcluir) { deleteMutation.mutate(contratoParaExcluir.id); setContratoParaExcluir(null); }
  };
  const abrirAssinatura = (contrato) => { setContratoParaAssinar(contrato); setAssinaturaModalOpen(true); };
  const podeAssinar = (contrato) => contrato.status === 'Aguardando Assinatura' || (contrato.status === 'Vigente' && !contrato.assinado);
  const calcularDiasParaVencimento = (dataFim) => Math.floor((new Date(dataFim) - new Date()) / (1000 * 60 * 60 * 24));

  const filteredContratos = contratosContexto.filter(c => {
    const s = searchTerm.toLowerCase();
    const searchMatch = (
      c.numero_contrato?.toLowerCase().includes(s) || c.parte_contratante?.toLowerCase().includes(s) ||
      c.objeto?.toLowerCase().includes(s) || c.titulo?.toLowerCase().includes(s) ||
      c.descricao?.toLowerCase().includes(s) || c.tipo?.toLowerCase().includes(s) ||
      c.status?.toLowerCase().includes(s) || c.responsavel_empresa?.toLowerCase().includes(s) ||
      c.forma_pagamento?.toLowerCase().includes(s) || c.indice_reajuste?.toLowerCase().includes(s) ||
      c.observacoes?.toLowerCase().includes(s)
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

  const statusColors = {
    'Rascunho': 'bg-gray-100 text-gray-700',
    'Aguardando Assinatura': 'bg-yellow-100 text-yellow-700',
    'Vigente': 'bg-green-100 text-green-700',
    'Vencido': 'bg-red-100 text-red-700',
    'Rescindido': 'bg-orange-100 text-orange-700',
    'Renovado': 'bg-blue-100 text-blue-700'
  };
  const tipoColors = {
    'Cliente': 'bg-blue-50 text-blue-700', 'Fornecedor': 'bg-purple-50 text-purple-700',
    'Prestação de Serviço': 'bg-indigo-50 text-indigo-700', 'Locação': 'bg-orange-50 text-orange-700',
    'Parceria': 'bg-green-50 text-green-700', 'Outro': 'bg-gray-50 text-gray-700'
  };

  if (!contextoValido) {
    return (
      <ProtectedSection module="Contratos" action="visualizar">
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border rounded-xl p-6 text-center">
            <p className="text-lg font-semibold">Selecione uma empresa para continuar</p>
            <p className="text-slate-500 mt-1">Use o seletor de empresa no topo para habilitar os dados de contratos.</p>
          </div>
        </div>
      </ProtectedSection>
    );
  }

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

        <RBACButton
          module="Contratos"
          section="Contrato"
          action="criar"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => openWindow(ContratoForm, {
            windowMode: true, clientes, fornecedores,
            onSubmit: async (data) => {
              try {
                const dataProximoReajuste = new Date(data.data_inicio);
                dataProximoReajuste.setFullYear(dataProximoReajuste.getFullYear() + 1);
                const proximaCobranca = new Date(data.data_inicio);
                proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
                proximaCobranca.setDate(data.dia_vencimento || 1);
                await createInContext('Contrato', {
                  ...data,
                  empresa_id: data.empresa_id || empresaAtual?.id,
                  group_id: data.group_id || groupId,
                  data_proximo_reajuste: dataProximoReajuste.toISOString().split('T')[0],
                  proxima_cobranca: proximaCobranca.toISOString().split('T')[0],
                  historico_renovacoes: [], alertas_enviados: [], contas_geradas_ids: []
                });
                queryClient.invalidateQueries({ queryKey: ['contratos'] });
                toast({ title: "✅ Contrato criado!" });
              } catch (error) {
                toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
              }
            }
          }, { title: '📄 Novo Contrato', width: 1100, height: 700 })}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Contrato
        </RBACButton>
      </div>

      <ContratosKPIs contratos={contratosContexto} />
      <ContratosIAPanel contratos={contratosContexto} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="todos">Todos ({contratosContexto.length})</TabsTrigger>
          <TabsTrigger value="Vigente">Vigentes ({contratosPorStatus.vigentes.length})</TabsTrigger>
          <TabsTrigger value="Aguardando Assinatura">Aguardando Assinatura ({contratosPorStatus.aguardando.length})</TabsTrigger>
          <TabsTrigger value="proximos">Próximos a Vencer ({contratosPorStatus.proximosVencer.length})</TabsTrigger>
          <TabsTrigger value="Vencido">Vencidos ({contratosPorStatus.vencidos.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input placeholder="Buscar por número, contratante, objeto, tipo, status, responsável, forma pagamento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contratos</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead><TableHead>Tipo</TableHead><TableHead>Parte Contratante</TableHead>
                  <TableHead>Objeto</TableHead><TableHead>Vigência</TableHead><TableHead>Valor Mensal</TableHead>
                  <TableHead>Status</TableHead><TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContratos.map((contrato) => {
                  const diasVencer = contrato.data_fim ? calcularDiasParaVencimento(contrato.data_fim) : -1;
                  return (
                    <TableRow key={contrato.id}>
                      <TableCell className="font-medium">{contrato.numero_contrato}</TableCell>
                      <TableCell><Badge className={tipoColors[contrato.tipo]}>{contrato.tipo}</Badge></TableCell>
                      <TableCell>{contrato.parte_contratante}</TableCell>
                      <TableCell className="max-w-xs truncate">{contrato.objeto}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {contrato.data_inicio && new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                          {contrato.data_fim && new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                          {diasVencer > 0 && diasVencer <= 60 && contrato.status === 'Vigente' && (
                            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <Bell className="w-3 h-3" /> Vence em {diasVencer} dias
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
                          {contrato.assinado && <Badge className="bg-green-100 text-green-700 text-xs">✓ Assinado</Badge>}
                          {contrato.renovacao_automatica && <Badge className="bg-blue-100 text-blue-700 text-xs">🔄 Auto-renova</Badge>}
                          {contrato.gerar_cobranca_automatica && <Badge className="bg-purple-100 text-purple-700 text-xs">💳 Auto-cobrança</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <RBACButton module="Contratos" section="Contrato" action="visualizar" variant="ghost" size="icon" onClick={() => setViewingContrato(contrato)} title="Ver detalhes">
                            <FileText className="w-4 h-4" />
                          </RBACButton>
                          <RBACButton module="Contratos" section="Contrato" action="editar" variant="ghost" size="icon"
                            onClick={() => openWindow(ContratoForm, {
                              contrato, windowMode: true, clientes, fornecedores,
                              onSubmit: async (data) => {
                                try {
                                  await updateInContext('Contrato', contrato.id, {
                                    ...data, empresa_id: data.empresa_id || empresaAtual?.id, group_id: data.group_id || groupId,
                                  });
                                  queryClient.invalidateQueries({ queryKey: ['contratos'] });
                                  toast({ title: "✅ Contrato atualizado!" });
                                } catch (error) {
                                  toast({ title: "❌ Erro", description: error.message, variant: "destructive" });
                                }
                              }
                            }, { title: `✏️ Editar: ${contrato.numero_contrato}`, width: 1100, height: 700 })} title="Editar">
                            <Edit className="w-4 h-4" />
                          </RBACButton>
                          {podeAssinar(contrato) && (
                            <RBACButton module="Contratos" section="Contrato" action="assinar" variant="ghost" size="icon" onClick={() => abrirAssinatura(contrato)} title="Assinar Eletronicamente" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <PenTool className="w-4 h-4" />
                            </RBACButton>
                          )}
                          {contrato.gerar_cobranca_automatica && contrato.status === 'Vigente' && (
                            <RBACButton module="Contratos" section="Cobranca" action="criar" variant="ghost" size="icon" onClick={() => gerarCobrancasMutation.mutate(contrato)} title="Gerar Cobrança" className="text-purple-600 hover:text-purple-700" disabled={gerarCobrancasMutation.isPending}>
                              <Receipt className="w-4 h-4" />
                            </RBACButton>
                          )}
                          {((contrato.status === 'Vigente' && diasVencer <= 0) || (contrato.status === 'Vencido' && contrato.renovacao_automatica)) && (
                            <RBACButton module="Contratos" section="Contrato" action="renovar" variant="ghost" size="icon" onClick={() => renovarContratoMutation.mutate(contrato)} title="Renovar Contrato" className="text-green-600 hover:text-green-700" disabled={renovarContratoMutation.isPending}>
                              <RefreshCw className="w-4 h-4" />
                            </RBACButton>
                          )}
                          {(contrato.historico_renovacoes?.length > 0 || contrato.alertas_enviados?.length > 0) && (
                            <RBACButton module="Contratos" section="Contrato" action="visualizar" variant="ghost" size="icon" onClick={() => { setContratoHistorico(contrato); setHistoricoDialogOpen(true); }} title="Ver Histórico" className="text-indigo-600">
                              <History className="w-4 h-4" />
                            </RBACButton>
                          )}
                          <RBACButton module="Contratos" section="Contrato" action="excluir" variant="ghost" size="icon" onClick={() => handleDelete(contrato)} className="text-red-600 hover:text-red-700" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </RBACButton>
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

      <ContratoViewDialog contrato={viewingContrato} onClose={() => setViewingContrato(null)} />
      <ContratoHistoryDialog contrato={contratoHistorico} open={historicoDialogOpen} onOpenChange={setHistoricoDialogOpen} />

      <Dialog open={!!contratoParaExcluir} onOpenChange={() => setContratoParaExcluir(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-slate-600 text-sm">
            Deseja realmente excluir o contrato <strong>{contratoParaExcluir?.numero_contrato}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <RBACButton module="Contratos" section="Contrato" action="cancelar" variant="outline" onClick={() => setContratoParaExcluir(null)}>Cancelar</RBACButton>
            <RBACButton module="Contratos" section="Contrato" action="excluir" className="bg-red-600 hover:bg-red-700" onClick={confirmarExclusao} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </RBACButton>
          </div>
        </DialogContent>
      </Dialog>

      {contratoParaAssinar && (
        <AssinaturaEletronicaModal
          isOpen={assinaturaModalOpen}
          onClose={() => { setAssinaturaModalOpen(false); setContratoParaAssinar(null); queryClient.invalidateQueries({ queryKey: ['contratos'] }); }}
          documento={contratoParaAssinar} tipo="contrato"
          onAssinado={() => {}}
        />
      )}
    </div>
  );
}