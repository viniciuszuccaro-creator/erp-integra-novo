import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  DollarSign, 
  TrendingUp,
  Package,
  X,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * V21.1.2 - WINDOW MODE READY
 * P2: Multi-tenant — usa filterInContext
 */
export default function DetalhesFornecedor({ fornecedor, onClose, windowMode = false }) {
  const [activeTab, setActiveTab] = useState("historico");
  const [showDocumentoDialog, setShowDocumentoDialog] = useState(false);
  const [documentoForm, setDocumentoForm] = useState({
    tipo: "Contrato Social",
    nome_arquivo: "",
    data_validade: "",
    observacao: ""
  });

  const queryClient = useQueryClient();
  const { canEdit } = usePermissions();
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  // Buscar dados relacionados
  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra-fornecedor', fornecedor.id, contextoKey],
    queryFn: () => filterInContext('OrdemCompra', { fornecedor_id: fornecedor.id }),
    enabled: !!fornecedor.id && !!contextoKey
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['notas-entrada-fornecedor', fornecedor.id, contextoKey],
    queryFn: () => filterInContext('NotaFiscal', { 
      cliente_fornecedor_id: fornecedor.id,
      tipo: 'NF-e (Entrada)'
    }),
    enabled: !!fornecedor.id && !!contextoKey
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contas-pagar-fornecedor', fornecedor.id, contextoKey],
    queryFn: () => filterInContext('ContaPagar', { fornecedor_id: fornecedor.id }),
    enabled: !!fornecedor.id && !!contextoKey
  });

  const updateFornecedorMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Fornecedor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      toast.success("Fornecedor atualizado com sucesso!");
    },
  });

  // Cálculos
  const totalCompras = ordensCompra
    .filter(o => o.status !== 'Cancelada')
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);
  
  const valorPendente = contasPagar
    .filter(c => c.status === 'Pendente')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const valorPago = contasPagar
    .filter(c => c.status === 'Pago')
    .reduce((sum, c) => sum + (c.valor || 0), 0);

  const prazoMedioEntrega = ordensCompra.length > 0
    ? ordensCompra
        .filter(o => o.lead_time_real > 0)
        .reduce((sum, o) => sum + o.lead_time_real, 0) / ordensCompra.filter(o => o.lead_time_real > 0).length
    : (fornecedor.prazo_entrega_padrao || 0);

  const handleAdicionarDocumento = () => {
    const novosDocumentos = [...(fornecedor.documentos || []), { ...documentoForm, data_upload: new Date().toISOString() }];
    updateFornecedorMutation.mutate({
      id: fornecedor.id,
      data: { ...fornecedor, documentos: novosDocumentos }
    });
    setShowDocumentoDialog(false);
    setDocumentoForm({
      tipo: "Contrato Social",
      nome_arquivo: "",
      data_validade: "",
      observacao: ""
    });
  };

  const handleRemoverDocumento = (index) => {
    const documentosAtualizados = (fornecedor.documentos || []).filter((_, idx) => idx !== index);
    updateFornecedorMutation.mutate({
      id: fornecedor.id,
      data: { ...fornecedor, documentos: documentosAtualizados }
    });
  };

  const content = (
    <div className={windowMode ? 'w-full h-full overflow-auto bg-white p-4' : ''}>
      <Card className={windowMode ? 'border shadow-sm' : 'border-0 shadow-none m-4'}>
        <CardHeader className="border-b bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{fornecedor.nome}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                {fornecedor.categoria} • {fornecedor.cnpj || '-'}
              </p>
            </div>
            {!windowMode && (
              <Button variant="ghost" size="icon" onClick={onClose} data-permission="Compras.Fornecedor.visualizar" data-action="Compras.Fornecedor.fechar">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="historico">
                <FileText className="w-4 h-4 mr-2" />
                Histórico de Compras
              </TabsTrigger>
              <TabsTrigger value="condicoes">
                <TrendingUp className="w-4 h-4 mr-2" />
                Condições Comerciais
              </TabsTrigger>
              <TabsTrigger value="documentos">
                <DollarSign className="w-4 h-4 mr-2" />
                Documentos e Pagamentos
              </TabsTrigger>
            </TabsList>

            {/* ABA 1: HISTÓRICO DE COMPRAS */}
            <TabsContent value="historico" className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-600">Ordens de Compras</p>
                    <p className="text-2xl font-bold text-cyan-600">{ordensCompra.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-600">Total Comprado</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {totalCompras.toLocaleString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-600">NF-e Entrada</p>
                    <p className="text-2xl font-bold text-indigo-600">{notasFiscais.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Ordens */}
              {ordensCompra.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyan-600" />
                    Ordens de Compra Recentes
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº OC</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Produto Principal</TableHead>
                        <TableHead>Centro de Custo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordensCompra.slice(0, 10).map(ordem => (
                        <TableRow key={ordem.id}>
                          <TableCell className="font-medium">{ordem.numero_oc}</TableCell>
                          <TableCell>{new Date(ordem.data_solicitacao).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>R$ {ordem.valor_total?.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge>{ordem.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {ordem.itens?.[0]?.descricao || '-'}
                          </TableCell>
                          <TableCell>{ordem.centro_custo || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma ordem de compra realizada</p>
                </div>
              )}
            </TabsContent>

            {/* ABA 2: CONDIÇÕES COMERCIAIS */}
            <TabsContent value="condicoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Condições Padrão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Condição de Pagamento:</span>
                    <span className="font-semibold">
                      {fornecedor.condicao_pagamento || '30 dias'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Prazo Médio de Entrega:</span>
                    <span className="font-semibold">
                      {Math.round(prazoMedioEntrega)} dias
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Desconto Médio:</span>
                    <span className="font-semibold">
                      {fornecedor.percentual_desconto || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tabela de Preço:</span>
                    <span className="font-semibold">
                      {fornecedor.tabela_preco || 'Padrão'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {fornecedor.observacoes_contratuais && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações Contratuais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {fornecedor.observacoes_contratuais}
                    </p>
                  </CardContent>
                </Card>
              )}

              {canEdit('compras', 'fornecedores') && (
                <Button className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Condições Comerciais
                </Button>
              )}
            </TabsContent>

            {/* ABA 3: DOCUMENTOS E PAGAMENTOS */}
            <TabsContent value="documentos" className="space-y-6">
              {/* Resumo Financeiro */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-600">A Pagar</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {valorPendente.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {contasPagar.filter(c => c.status === 'Pendente').length} conta(s)
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-600">Pago</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {valorPago.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {contasPagar.filter(c => c.status === 'Pago').length} pagamento(s)
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Documentos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Documentos Vinculados
                  </h3>
                  {canEdit('compras', 'fornecedores') && (
                    <Dialog open={showDocumentoDialog} onOpenChange={setShowDocumentoDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Documento
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Documento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Tipo</Label>
                            <Select
                              value={documentoForm.tipo}
                              onValueChange={(v) => setDocumentoForm({...documentoForm, tipo: v})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Contrato Social">Contrato Social</SelectItem>
                                <SelectItem value="Certidão Negativa">Certidão Negativa</SelectItem>
                                <SelectItem value="Inscrição Estadual">Inscrição Estadual</SelectItem>
                                <SelectItem value="Comprovante Endereço">Comprovante Endereço</SelectItem>
                                <SelectItem value="Referência Comercial">Referência Comercial</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Nome do Arquivo</Label>
                            <Input
                              value={documentoForm.nome_arquivo}
                              onChange={(e) => setDocumentoForm({...documentoForm, nome_arquivo: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Data de Validade</Label>
                            <Input
                              type="date"
                              value={documentoForm.data_validade}
                              onChange={(e) => setDocumentoForm({...documentoForm, data_validade: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Observação</Label>
                            <Textarea
                              value={documentoForm.observacao}
                              onChange={(e) => setDocumentoForm({...documentoForm, observacao: e.target.value})}
                            />
                          </div>
                          <Button data-permission="Compras.Fornecedor.editar" onClick={handleAdicionarDocumento} className="w-full">
                            Adicionar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="grid gap-3">
                  {(fornecedor.documentos || []).map((doc, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              <p className="font-medium">{doc.tipo}</p>
                              {doc.data_validade && (
                                <Badge variant="outline" className="text-xs">
                                  Validade: {new Date(doc.data_validade).toLocaleDateString('pt-BR')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{doc.nome_arquivo}</p>
                            {doc.observacao && (
                              <p className="text-xs text-slate-500 mt-1">{doc.observacao}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" title="Download">
                              <Download className="w-4 h-4" />
                            </Button>
                            {canEdit('compras', 'fornecedores') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoverDocumento(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!fornecedor.documentos || fornecedor.documentos.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      <Upload className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nenhum documento vinculado</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Formas de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Formas de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Forma Principal:</span>
                    <span className="font-semibold">
                      {fornecedor.forma_pagamento_preferencial || 'Transferência Bancária'}
                    </span>
                  </div>
                  {fornecedor.dados_bancarios && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Banco:</span>
                        <span className="font-semibold">{fornecedor.dados_bancarios.banco || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Agência:</span>
                        <span className="font-semibold">{fornecedor.dados_bancarios.agencia || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Conta:</span>
                        <span className="font-semibold">{fornecedor.dados_bancarios.conta || '-'}</span>
                      </div>
                    </>
                  )}
                  {canEdit('compras', 'fornecedores') && (
                    <Button className="w-full mt-4">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Dados Bancários
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Histórico de Pagamentos */}
              {contasPagar.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Histórico de Pagamentos
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contasPagar.slice(0, 10).map(conta => (
                        <TableRow key={conta.id}>
                          <TableCell>{conta.descricao}</TableCell>
                          <TableCell>{new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}</TableCell>
                          <TableCell>R$ {conta.valor?.toLocaleString('pt-BR')}</TableCell>
                          <TableCell>
                            <Badge variant={conta.status === 'Pago' ? 'default' : 'secondary'}>
                              {conta.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  if (windowMode) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-slate-50"
    >
      {content}
    </motion.div>
  );
}