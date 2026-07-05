import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, DollarSign, Plus, Edit, Trash2, Download, Upload } from "lucide-react";

export default function TabDocumentosPagamentos({
  fornecedor,
  contasPagar,
  valorPendente,
  valorPago,
  showDocumentoDialog,
  setShowDocumentoDialog,
  documentoForm,
  setDocumentoForm,
  onAdicionarDocumento,
  onRemoverDocumento,
  canEdit
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600">A Pagar</p>
            <p className="text-2xl font-bold text-orange-600">R$ {valorPendente.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-500 mt-1">{contasPagar.filter(c => c.status === 'Pendente').length} conta(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600">Pago</p>
            <p className="text-2xl font-bold text-green-600">R$ {valorPago.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-500 mt-1">{contasPagar.filter(c => c.status === 'Pago').length} pagamento(s)</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Documentos Vinculados
          </h3>
          {canEdit('compras', 'fornecedores') && (
            <Dialog open={showDocumentoDialog} onOpenChange={setShowDocumentoDialog}>
              <DialogTrigger asChild>
                <Button size="sm" data-permission="Compras.Fornecedor.editar" data-action="Compras.Fornecedor.adicionarDocumento">
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
                    <Select value={documentoForm.tipo} onValueChange={(v) => setDocumentoForm({ ...documentoForm, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Input value={documentoForm.nome_arquivo} onChange={(e) => setDocumentoForm({ ...documentoForm, nome_arquivo: e.target.value })} />
                  </div>
                  <div>
                    <Label>Data de Validade</Label>
                    <Input type="date" value={documentoForm.data_validade} onChange={(e) => setDocumentoForm({ ...documentoForm, data_validade: e.target.value })} />
                  </div>
                  <div>
                    <Label>Observação</Label>
                    <Textarea value={documentoForm.observacao} onChange={(e) => setDocumentoForm({ ...documentoForm, observacao: e.target.value })} />
                  </div>
                  <Button data-permission="Compras.Fornecedor.editar" onClick={onAdicionarDocumento} className="w-full">Adicionar</Button>
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
                    {doc.observacao && <p className="text-xs text-slate-500 mt-1">{doc.observacao}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" title="Download"><Download className="w-4 h-4" /></Button>
                    {canEdit('compras', 'fornecedores') && (
                      <Button size="sm" variant="ghost" onClick={() => onRemoverDocumento(index)} data-permission="Compras.Fornecedor.excluir" data-action="Compras.Fornecedor.removerDocumento">
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

      <Card>
        <CardHeader><CardTitle className="text-lg">Formas de Pagamento</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-600">Forma Principal:</span>
            <span className="font-semibold">{fornecedor.forma_pagamento_preferencial || 'Transferência Bancária'}</span>
          </div>
          {fornecedor.dados_bancarios && (
            <>
              <div className="flex justify-between"><span className="text-slate-600">Banco:</span><span className="font-semibold">{fornecedor.dados_bancarios.banco || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Agência:</span><span className="font-semibold">{fornecedor.dados_bancarios.agencia || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Conta:</span><span className="font-semibold">{fornecedor.dados_bancarios.conta || '-'}</span></div>
            </>
          )}
          {canEdit('compras', 'fornecedores') && (
            <Button className="w-full mt-4" data-permission="Compras.Fornecedor.editar" data-action="Compras.Fornecedor.editarBancario">
              <Edit className="w-4 h-4 mr-2" />
              Editar Dados Bancários
            </Button>
          )}
        </CardContent>
      </Card>

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
                  <TableCell><Badge variant={conta.status === 'Pago' ? 'default' : 'secondary'}>{conta.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}