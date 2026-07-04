import React, { useState, useEffect, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  User, Phone, MapPin, DollarSign, FileText, Clock, Paperclip,
  Save, ExternalLink, Trash2, Power, PowerOff
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import GerenciarContatosClienteForm from "./GerenciarContatosClienteForm";
import GerenciarEnderecosClienteForm from "./GerenciarEnderecosClienteForm";
import ClienteDadosGeraisTab from "./cliente/ClienteDadosGeraisTab";
import ClienteFinanceiroTab from "./cliente/ClienteFinanceiroTab";
import ClienteFiscalTab from "./cliente/ClienteFiscalTab";

const HistoricoOrigemCliente = React.lazy(() => import("@/components/comercial/HistoricoOrigemCliente"));
const TimelineCliente = React.lazy(() => import("@/components/cliente/TimelineCliente").then(m => ({ default: m.default || m.TimelineCliente })));
const ResumoHistorico = React.lazy(() => import("@/components/cliente/TimelineCliente").then(m => ({ default: m.ResumoHistorico })));

export default function CadastroClienteCompleto({ cliente: clienteProp, item, data, isOpen, onClose, onSuccess, windowMode = false, onSubmit, onSave }) {
  const cliente = clienteProp || item || data || null;
  const onCloseNorm = onClose || onSave || onSubmit;
  const [activeTab, setActiveTab] = useState("dados-gerais");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, filterInContext, createInContext, updateInContext, deleteInContext } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeCriar = canCreate("Cadastros", "Cliente") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Cliente") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Cliente") || canDelete("Cadastros", null);

  const [formData, setFormData] = useState(cliente || {
    tipo: "Pessoa Física", status: "Prospect", nome: "", razao_social: "", nome_fantasia: "",
    cpf: "", cnpj: "", rg: "", inscricao_estadual: "", inscricao_municipal: "",
    endereco_principal: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", latitude: null, longitude: null },
    contatos: [], locais_entrega: [],
    condicao_comercial: { tabela_preco_id: "", forma_pagamento_padrao_id: "", percentual_desconto: 0, condicao_pagamento: "À Vista", limite_credito: 0, limite_credito_utilizado: 0, situacao_credito: "OK" },
    configuracao_fiscal: { regime_tributario: "Simples Nacional", cfop_padrao_venda: "5102", contribuinte_icms: true, tipo_contribuinte: "1 - Contribuinte", isento_ipi: false, isento_icms: false },
    documentos: [], vendedor_responsavel: "", vendedor_responsavel_id: "", observacoes: "",
    empresa_id: empresaAtual?.id, group_id: groupId
  });

  const { data: tabelasPreco = [] } = useQuery({ queryKey: ['tabelas-preco', contextKey], queryFn: () => filterInContext('TabelaPreco', {}, 'nome', 200), enabled: contextoValido });
  const { data: formasPagamento = [] } = useQuery({ queryKey: ['formas-pagamento', contextKey], queryFn: () => filterInContext('FormaPagamento', {}, 'nome', 200), enabled: contextoValido });
  const { data: colaboradores = [] } = useQuery({ queryKey: ['colaboradores', contextKey], queryFn: () => filterInContext('Colaborador', { status: 'Ativo' }, 'nome_completo', 200), enabled: contextoValido });
  const { data: regioes = [] } = useQuery({ queryKey: ['regioes', contextKey], queryFn: () => filterInContext('RegiaoAtendimento', {}, 'nome', 200), enabled: contextoValido });
  const { data: representantes = [] } = useQuery({ queryKey: ['representantes', contextKey], queryFn: () => filterInContext('Representante', { status: 'Ativo' }, 'nome', 200), enabled: contextoValido });

  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const user = await base44.auth.me();
        setUsuarioLogado(user);
        if (!cliente?.id && !formData.vendedor_responsavel_id && user) {
          const col = colaboradores.find(c => c.email === user.email);
          if (col) setFormData(prev => ({ ...prev, vendedor_responsavel_id: col.id, vendedor_responsavel: col.nome_completo }));
        }
      } catch (_) {}
    };
    carregarUsuario();
  }, [colaboradores, cliente?.id]);

  const { data: ultimaNF } = useQuery({
    queryKey: ['ultima-nf-cliente', cliente?.id, contextKey],
    queryFn: () => filterInContext('NotaFiscal', { cliente_fornecedor_id: cliente.id }, '-data_emissao', 1),
    enabled: !!cliente?.id && contextoValido,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (!contextoValido) throw new Error("Selecione um grupo ou empresa antes de salvar o cliente.");
      const payload = { ...data, ...(empresaAtual?.id && !data.empresa_id ? { empresa_id: empresaAtual.id } : {}), ...(groupId && !data.group_id ? { group_id: groupId } : {}) };
      if (cliente?.id) {
        if (!podeEditar) throw new Error("Seu perfil não permite editar clientes.");
        return updateInContext('Cliente', cliente.id, payload);
      }
      if (!podeCriar) throw new Error("Seu perfil não permite criar clientes.");
      return createInContext('Cliente', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: `✅ Cliente ${cliente?.id ? 'atualizado' : 'criado'} com sucesso!` });
      if (onSuccess) onSuccess();
      if (onSubmit) onSubmit(formData);
      if (onCloseNorm) onCloseNorm();
    },
    onError: (error) => { toast({ title: "❌ Erro ao salvar cliente", description: error.message, variant: "destructive" }); }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!podeExcluir) throw new Error("Seu perfil não permite excluir clientes.");
      return deleteInContext('Cliente', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: "✅ Cliente excluído com sucesso!" });
      if (onSuccess) onSuccess();
      if (onCloseNorm) onCloseNorm();
    },
    onError: (error) => { toast({ title: "❌ Erro ao excluir cliente", description: error.message, variant: "destructive" }); }
  });

  const handleSave = () => saveMutation.mutate(formData);

  useEffect(() => {
    if (cliente?.id) {
      setFormData({
        ...cliente,
        contatos: cliente.contatos || [],
        locais_entrega: cliente.locais_entrega || [],
        condicao_comercial: cliente.condicao_comercial || { tabela_preco_id: "", forma_pagamento_padrao_id: "", percentual_desconto: 0, condicao_pagamento: "À Vista", limite_credito: 0, limite_credito_utilizado: 0, situacao_credito: "OK" },
        configuracao_fiscal: cliente.configuracao_fiscal || { regime_tributario: "Simples Nacional", cfop_padrao_venda: "5102", contribuinte_icms: true, tipo_contribuinte: "1 - Contribuinte", isento_ipi: false, isento_icms: false },
        documentos: cliente.documentos || []
      });
    }
  }, [cliente?.id]);

  const content = (
    <>
      {/* HEADER */}
      <div className="border-b pb-4 px-6 pt-6 flex-shrink-0 bg-white sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {cliente?.id ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            {cliente?.id && (
              <div className="flex items-center gap-2 mt-2">
                <Badge className={
                  formData.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                  formData.status === 'Prospect' ? 'bg-blue-100 text-blue-700' :
                  formData.status === 'Bloqueado' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }>{formData.status}</Badge>
                <span className="text-sm text-slate-600">{formData.tipo === 'Pessoa Física' ? formData.cpf : formData.cnpj}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cliente?.id && (
              <>
                <Button
                  type="button" variant="outline"
                  data-permission="Cadastros.Cliente.alterarStatus" data-sensitive="true"
                  onClick={async () => {
                    const statusAnterior = formData.status;
                    const novoStatus = formData.status === 'Ativo' ? 'Inativo' : 'Ativo';
                    setFormData({ ...formData, status: novoStatus });
                    try {
                      await base44.entities.AuditLog.create({
                        usuario: usuarioLogado?.full_name || 'Usuário', usuario_id: usuarioLogado?.id,
                        empresa_id: empresaAtual?.id, group_id: grupoAtual?.id,
                        acao: 'Edição', modulo: 'Cadastros', tipo_auditoria: 'entidade_sensivel', entidade: 'Cliente',
                        registro_id: cliente?.id, descricao: `Status: ${statusAnterior} → ${novoStatus}`,
                        dados_antes: { status: statusAnterior }, dados_depois: { status: novoStatus },
                        data_hora: new Date().toISOString()
                      });
                    } catch (_) {}
                  }}
                  className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
                >
                  {formData.status === 'Ativo' ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
                </Button>
                <Button
                  type="button" variant="destructive"
                  data-permission="Cadastros.Cliente.excluir" data-sensitive="true"
                  onClick={async () => {
                    if (!window.confirm(`Excluir o cliente "${formData.nome}"? Esta ação não pode ser desfeita.`)) return;
                    try {
                      await base44.entities.AuditLog.create({
                        usuario: usuarioLogado?.full_name || 'Usuário', usuario_id: usuarioLogado?.id,
                        empresa_id: empresaAtual?.id, group_id: grupoAtual?.id,
                        acao: 'Exclusão', modulo: 'Cadastros', tipo_auditoria: 'entidade_sensivel', entidade: 'Cliente',
                        registro_id: cliente?.id, descricao: `Cliente "${formData.nome}" — Excluído`,
                        dados_antes: { status: formData.status, nome: formData.nome }, data_hora: new Date().toISOString()
                      });
                    } catch (_) {}
                    deleteMutation.mutate(cliente.id);
                  }}
                  disabled={deleteMutation.isPending || !podeExcluir || !contextoValido}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </>
            )}
            <Button
              data-permission="Cadastros.Cliente.criar"
              onClick={async () => {
                try {
                  await base44.entities.AuditLog.create({
                    usuario: usuarioLogado?.full_name || 'Usuário', usuario_id: usuarioLogado?.id,
                    empresa_id: empresaAtual?.id, group_id: grupoAtual?.id,
                    acao: cliente?.id ? 'Edição' : 'Criação', modulo: 'Cadastros', tipo_auditoria: 'entidade', entidade: 'Cliente',
                    registro_id: cliente?.id, descricao: `Cliente "${formData.nome}" — ${cliente?.id ? 'Atualizado' : 'Criado'}`,
                    data_hora: new Date().toISOString()
                  });
                } catch (_) {}
                handleSave();
              }}
              data-permission="Cadastros.Cliente.salvar" data-sensitive="true"
              disabled={saveMutation.isPending || !contextoValido || (cliente?.id ? !podeEditar : !podeCriar)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-7 flex-shrink-0 px-6 bg-slate-50">
          <TabsTrigger value="dados-gerais" className="text-xs"><User className="w-3 h-3 mr-1" />Dados Gerais</TabsTrigger>
          <TabsTrigger value="contatos" className="text-xs"><Phone className="w-3 h-3 mr-1" />Contatos</TabsTrigger>
          <TabsTrigger value="enderecos" className="text-xs"><MapPin className="w-3 h-3 mr-1" />Endereços</TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs"><DollarSign className="w-3 h-3 mr-1" />Financeiro</TabsTrigger>
          <TabsTrigger value="fiscal" className="text-xs"><FileText className="w-3 h-3 mr-1" />Fiscal</TabsTrigger>
          <TabsTrigger value="historico" className="text-xs" disabled={!cliente?.id}><Clock className="w-3 h-3 mr-1" />Histórico</TabsTrigger>
          <TabsTrigger value="anexos" className="text-xs"><Paperclip className="w-3 h-3 mr-1" />Anexos</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">

            {/* ABA 1: Dados Gerais — ClienteDadosGeraisTab */}
            <TabsContent value="dados-gerais" className="m-0 mt-4">
              <ClienteDadosGeraisTab
                formData={formData} setFormData={setFormData}
                regioes={regioes} colaboradores={colaboradores} representantes={representantes}
              />
            </TabsContent>

            {/* ABA 2: Contatos */}
            <TabsContent value="contatos" className="m-0 mt-4">
              <GerenciarContatosClienteForm
                contatos={formData.contatos || []}
                onChange={(novosContatos) => setFormData({ ...formData, contatos: novosContatos })}
              />
            </TabsContent>

            {/* ABA 3: Endereços */}
            <TabsContent value="enderecos" className="m-0 mt-4">
              <GerenciarEnderecosClienteForm
                enderecos={formData.locais_entrega || []}
                onChange={(novosEnderecos) => setFormData({ ...formData, locais_entrega: novosEnderecos })}
              />
            </TabsContent>

            {/* ABA 4: Financeiro — ClienteFinanceiroTab */}
            <TabsContent value="financeiro" className="m-0 mt-4">
              <ClienteFinanceiroTab
                formData={formData} setFormData={setFormData}
                tabelasPreco={tabelasPreco} formasPagamento={formasPagamento}
              />
            </TabsContent>

            {/* ABA 5: Fiscal — ClienteFiscalTab */}
            <TabsContent value="fiscal" className="m-0 mt-4">
              <ClienteFiscalTab formData={formData} setFormData={setFormData} ultimaNF={ultimaNF} />
            </TabsContent>

            {/* ABA 6: Histórico */}
            <TabsContent value="historico" className="m-0 mt-4">
              {cliente?.id ? (
                <div className="space-y-6">
                  <Suspense fallback={<div className="h-24 rounded-xl bg-slate-100 animate-pulse" />}>
                    <ResumoHistorico clienteId={cliente.id} />
                  </Suspense>
                  <Suspense fallback={<div className="h-16 bg-slate-100 rounded animate-pulse" />}>
                    <HistoricoOrigemCliente clienteId={cliente.id} compact={false} />
                  </Suspense>
                  <Suspense fallback={<div className="h-24 rounded-xl bg-slate-100 animate-pulse" />}>
                    <TimelineCliente clienteId={cliente.id} showFilters={true} />
                  </Suspense>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Salve o cliente primeiro para ver o histórico</p>
                </div>
              )}
            </TabsContent>

            {/* ABA 7: Anexos */}
            <TabsContent value="anexos" className="space-y-6 m-0 mt-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Paperclip className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 mb-2">Upload de Documentos</p>
                <p className="text-sm text-slate-500 mb-4">Arraste arquivos ou clique para fazer upload</p>
                <Button variant="outline">Selecionar Arquivos</Button>
              </div>
              {formData.documentos && formData.documentos.length > 0 && (
                <div className="space-y-2">
                  {formData.documentos.map((doc, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.nome_arquivo}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">{doc.tipo}</Badge>
                                {doc.data_upload && <span className="text-xs text-slate-500">{new Date(doc.data_upload).toLocaleDateString('pt-BR')}</span>}
                              </div>
                            </div>
                          </div>
                          {doc.url_arquivo && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(doc.url_arquivo, '_blank')}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

          </div>
        </ScrollArea>
      </Tabs>
    </>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-white">{content}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCloseNorm}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full flex flex-col p-0 overflow-hidden">
        {content}
      </DialogContent>
    </Dialog>
  );
}