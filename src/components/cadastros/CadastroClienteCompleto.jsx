import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MapPin, DollarSign, FileText, Clock, Paperclip, Save, Trash2, Power, PowerOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";

import ClienteDadosGeraisTab from "./cliente/ClienteDadosGeraisTab";
import ClienteContatosTab from "./cliente/ClienteContatosTab";
import ClienteEnderecosTab from "./cliente/ClienteEnderecosTab";
import ClienteFinanceiroTab from "./cliente/ClienteFinanceiroTab";
import ClienteFiscalTab from "./cliente/ClienteFiscalTab";
import ClienteHistoricoTab from "./cliente/ClienteHistoricoTab";
import ClienteAnexosTab from "./cliente/ClienteAnexosTab";

export default function CadastroClienteCompleto({ cliente: clienteProp, item, data, isOpen, onClose, onSuccess, windowMode = false, onSubmit, onSave }) {
  const cliente = clienteProp || item || data || null;
  const onCloseNorm = onClose || onSave || onSubmit;
  const [activeTab, setActiveTab] = useState("dados-gerais");
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    empresaAtual, grupoAtual,
    filterInContext, createInContext, updateInContext, deleteInContext
  } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";

  const podeCriar = canCreate("Cadastros", "Cliente") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "Cliente") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "Cliente") || canDelete("Cadastros", null);

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [formData, setFormData] = useState(cliente || {
    tipo: "Pessoa Física", status: "Prospect",
    nome: "", razao_social: "", nome_fantasia: "",
    cpf: "", cnpj: "", rg: "",
    inscricao_estadual: "", inscricao_municipal: "",
    regiao_atendimento: "Sudeste",
    endereco_principal: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", latitude: null, longitude: null, mapa_url: "" },
    contatos: [], locais_entrega: [],
    condicao_comercial: { tabela_preco_id: "", forma_pagamento_padrao_id: "", percentual_desconto: 0, condicao_pagamento: "À Vista", limite_credito: 0, limite_credito_utilizado: 0, situacao_credito: "OK" },
    configuracao_fiscal: { regime_tributario: "Simples Nacional", cfop_padrao_venda: "5102", contribuinte_icms: true, tipo_contribuinte: "1 - Contribuinte", isento_ipi: false, isento_icms: false },
    documentos: [],
    vendedor_responsavel: "", vendedor_responsavel_id: "",
    observacoes: "",
    empresa_id: empresaAtual?.id,
    group_id: groupId
  });

  const { data: tabelasPreco = [] } = useQuery({
    queryKey: ['tabelas-preco', contextKey],
    queryFn: () => filterInContext('TabelaPreco', {}, 'nome', 200),
    enabled: contextoValido,
  });

  const { data: formasPagamento = [] } = useQuery({
    queryKey: ['formas-pagamento', contextKey],
    queryFn: () => filterInContext('FormaPagamento', {}, 'nome', 200),
    enabled: contextoValido,
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ['colaboradores', contextKey],
    queryFn: () => filterInContext('Colaborador', { status: 'Ativo' }, 'nome_completo', 200),
    enabled: contextoValido,
  });

  const { data: regioes = [] } = useQuery({
    queryKey: ['regioes', contextKey],
    queryFn: () => filterInContext('RegiaoAtendimento', {}, 'nome', 200),
    enabled: contextoValido,
  });

  const { data: representantes = [] } = useQuery({
    queryKey: ['representantes', contextKey],
    queryFn: () => filterInContext('Representante', { status: 'Ativo' }, 'nome', 200),
    enabled: contextoValido,
  });

  const { data: ultimaNF } = useQuery({
    queryKey: ['ultima-nf-cliente', cliente?.id, contextKey],
    queryFn: () => filterInContext('NotaFiscal', { cliente_fornecedor_id: cliente.id }, '-data_emissao', 1, 'empresa_faturamento_id'),
    enabled: !!cliente?.id && contextoValido,
  });

  useEffect(() => {
    base44.auth.me().then(user => {
      setUsuarioLogado(user);
      if (!cliente?.id && !formData.vendedor_responsavel_id && user) {
        const colab = colaboradores.find(c => c.email === user.email);
        if (colab) {
          setFormData(prev => ({
            ...prev,
            vendedor_responsavel_id: colab.id,
            vendedor_responsavel: colab.nome_completo
          }));
        }
      }
    }).catch(() => {});
  }, [colaboradores, cliente?.id]);

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

  const calcularSituacaoCredito = () => {
    const limite = formData.condicao_comercial?.limite_credito || 0;
    const utilizado = formData.condicao_comercial?.limite_credito_utilizado || 0;
    const pct = limite > 0 ? (utilizado / limite) * 100 : 0;
    if (formData.status === 'Bloqueado' || pct >= 90) return 'Bloqueado';
    if (pct >= 70) return 'Alerta';
    return 'OK';
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (!contextoValido) throw new Error("Selecione um grupo ou empresa antes de salvar o cliente.");
      const payload = {
        ...data,
        ...(empresaAtual?.id && !data.empresa_id ? { empresa_id: empresaAtual.id } : {}),
        ...(groupId && !data.group_id ? { group_id: groupId } : {})
      };
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
    onError: (error) => {
      toast({ title: "❌ Erro ao salvar cliente", description: error.message, variant: "destructive" });
    }
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
    onError: (error) => {
      toast({ title: "❌ Erro ao excluir cliente", description: error.message, variant: "destructive" });
    }
  });

  const handleSave = async () => {
    // AUDITORIA: Salvar
    try {
      await base44.entities.AuditLog.create({
        usuario: usuarioLogado?.full_name || 'Usuário', usuario_id: usuarioLogado?.id,
        empresa_id: empresaAtual?.id, group_id: groupId,
        acao: cliente?.id ? 'Edição' : 'Criação', modulo: 'Cadastros', tipo_auditoria: 'entidade', entidade: 'Cliente',
        registro_id: cliente?.id, descricao: `Cliente "${formData.nome}" — ${cliente?.id ? 'Atualizado' : 'Criado'}`,
        data_hora: new Date().toISOString()
      });
    } catch (_) {}
    setIsSaving(true);
    saveMutation.mutate(formData);
  };

  const handleExcluir = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o cliente "${formData.nome}"? Esta ação não pode ser desfeita.`)) return;
    // AUDITORIA: Exclusão
    try {
      await base44.entities.AuditLog.create({
        usuario: usuarioLogado?.full_name || 'Usuário', usuario_id: usuarioLogado?.id,
        empresa_id: empresaAtual?.id, group_id: groupId,
        acao: 'Exclusão', modulo: 'Cadastros', tipo_auditoria: 'entidade_sensivel', entidade: 'Cliente',
        registro_id: cliente?.id, descricao: `Cliente "${formData.nome}" — Excluído`,
        dados_antes: { status: formData.status, nome: formData.nome }, data_hora: new Date().toISOString()
      });
    } catch (_) {}
    deleteMutation.mutate(cliente.id);
  };

  const handleAlternarStatus = async () => {
    const statusAnterior = formData.status;
    const novoStatus = formData.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setFormData({ ...formData, status: novoStatus });
    // AUDITORIA: Alteração de Status
    try {
      await base44.entities.AuditLog.create({
        usuario: usuarioLogado?.full_name || 'Usuário', usuario_id: usuarioLogado?.id,
        empresa_id: empresaAtual?.id, group_id: groupId,
        acao: 'Edição', modulo: 'Cadastros', tipo_auditoria: 'entidade_sensivel', entidade: 'Cliente',
        registro_id: cliente?.id, descricao: `Status alterado: ${statusAnterior} → ${novoStatus}`,
        dados_antes: { status: statusAnterior }, dados_depois: { status: novoStatus }, data_hora: new Date().toISOString()
      });
    } catch (_) {}
  };

  const content = (
    <>
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
                  formData.status === 'Bloqueado' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {formData.status}
                </Badge>
                <span className="text-sm text-slate-600">
                  {formData.tipo === 'Pessoa Física' ? formData.cpf : formData.cnpj}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cliente?.id && (
              <>
                <Button
                  type="button" variant="outline"
                  data-permission="Cadastros.Cliente.alterarStatus" data-sensitive="true"
                  onClick={handleAlternarStatus}
                  className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
                >
                  {formData.status === 'Ativo' ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
                </Button>
                <Button
                  type="button" variant="destructive"
                  data-permission="Cadastros.Cliente.excluir" data-sensitive="true"
                  onClick={handleExcluir}
                  disabled={deleteMutation.isPending || !podeExcluir || !contextoValido}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </>
            )}
            <Button
              onClick={handleSave}
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
            <TabsContent value="dados-gerais" className="m-0 mt-4">
              <ClienteDadosGeraisTab formData={formData} setFormData={setFormData} regioes={regioes} colaboradores={colaboradores} representantes={representantes} />
            </TabsContent>
            <TabsContent value="contatos" className="m-0 mt-4">
              <ClienteContatosTab formData={formData} setFormData={setFormData} />
            </TabsContent>
            <TabsContent value="enderecos" className="m-0 mt-4">
              <ClienteEnderecosTab formData={formData} setFormData={setFormData} />
            </TabsContent>
            <TabsContent value="financeiro" className="m-0 mt-4">
              <ClienteFinanceiroTab formData={formData} setFormData={setFormData} tabelasPreco={tabelasPreco} formasPagamento={formasPagamento} calcularSituacaoCredito={calcularSituacaoCredito} />
            </TabsContent>
            <TabsContent value="fiscal" className="m-0 mt-4">
              <ClienteFiscalTab formData={formData} setFormData={setFormData} ultimaNF={ultimaNF} />
            </TabsContent>
            <TabsContent value="historico" className="m-0 mt-4">
              <ClienteHistoricoTab cliente={cliente} />
            </TabsContent>
            <TabsContent value="anexos" className="m-0 mt-4">
              <ClienteAnexosTab formData={formData} setFormData={setFormData} />
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