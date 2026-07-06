import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Building2, Award, Send, ShoppingCart } from "lucide-react";

export default function CotacaoComparativoDialog({ comparativoModal, setComparativoModal, gerarOrdemCompraMutation, hasPermission, toast }) {
  if (!comparativoModal) return null;
  const melhorProposta = [...comparativoModal.propostas].sort((a, b) => a.valor_total - b.valor_total)[0];
  const propostas = comparativoModal.propostas || [];
  const menorPreco = propostas.length ? Math.min(...propostas.map((p) => p.valor_total)) : 0;
  const maiorPreco = propostas.length ? Math.max(...propostas.map((p) => p.valor_total)) : 0;
  const menorPrazo = propostas.length ? Math.min(...propostas.map((p) => p.prazo_entrega)) : 0;
  const economia = maiorPreco - menorPreco;

  return (
    <Dialog open={!!comparativoModal} onOpenChange={() => setComparativoModal(null)}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-600" />Comparativo de Propostas - {comparativoModal.numero_cotacao}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div><p className="text-xs text-slate-600">Itens Cotados</p><p className="text-lg font-bold">{comparativoModal.itens.length}</p></div>
                <div><p className="text-xs text-slate-600">Propostas Recebidas</p><p className="text-lg font-bold text-cyan-600">{comparativoModal.propostas_recebidas}/{comparativoModal.fornecedores_convidados}</p></div>
                <div><p className="text-xs text-slate-600">Data Limite</p><p className="text-lg font-bold">{new Date(comparativoModal.data_limite).toLocaleDateString("pt-BR")}</p></div>
              </div>
            </CardContent>
          </Card>

          {propostas.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Comparativo de Propostas</h3>
              {propostas.map((proposta, idx) => {
                const ehMelhor = proposta.fornecedor_id === melhorProposta.fornecedor_id;
                return (
                  <Card key={idx} className={`border-2 ${ehMelhor ? "border-green-400 bg-green-50/50" : "border-slate-200"}`}>
                    <CardHeader className={ehMelhor ? "bg-green-50 border-b border-green-200" : "bg-slate-50 border-b"}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-5 h-5 text-cyan-600" />
                            <CardTitle className="text-lg">{proposta.fornecedor_nome}</CardTitle>
                            {ehMelhor && <Badge className="bg-green-600 text-white"><Award className="w-3 h-3 mr-1" />Melhor Oferta</Badge>}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-600">Enviada em {new Date(proposta.data_proposta).toLocaleDateString("pt-BR")}</span>
                            <Badge variant="outline">Prazo: {proposta.prazo_entrega} dias</Badge>
                            <Badge variant="outline">{proposta.forma_pagamento}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Valor Total</p>
                          <p className={`text-2xl font-bold ${ehMelhor ? "text-green-600" : "text-slate-900"}`}>R$ {proposta.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Produto</TableHead><TableHead className="text-right">Preço Unit.</TableHead><TableHead className="text-right">Valor Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {proposta.itens.map((item, itemIdx) => (
                            <TableRow key={itemIdx}>
                              <TableCell className="font-medium">{item.produto_descricao}</TableCell>
                              <TableCell className="text-right">R$ {item.preco_unitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell className="text-right font-semibold">R$ {item.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {proposta.observacoes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-xs text-blue-700 font-medium mb-1">Observações:</p>
                          <p className="text-sm text-blue-900">{proposta.observacoes}</p>
                        </div>
                      )}
                      <div className="flex justify-end gap-3 mt-4">
                        <Button data-permission="Compras.CotacaoComparativo.gerar" variant="outline" size="sm" onClick={() => toast({ title: "📧 E-mail Enviado", description: `Solicitação de esclarecimentos enviada para ${proposta.fornecedor_nome}` })}>
                          <Send className="w-4 h-4 mr-2" />Solicitar Esclarecimentos
                        </Button>
                        {hasPermission("Compras", "Cotacao", "gerar_oc") && (
                          <Button data-permission="Compras.CotacaoComparativo.gerar" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => gerarOrdemCompraMutation.mutate(proposta)} disabled={gerarOrdemCompraMutation.isPending}>
                            <ShoppingCart className="w-4 h-4 mr-2" />{gerarOrdemCompraMutation.isPending ? "Gerando..." : "Gerar Ordem de Compra"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              <Card className="border-0 shadow-md bg-gradient-to-r from-slate-50 to-blue-50">
                <CardHeader><CardTitle className="text-base">📊 Análise Comparativa</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Menor Preço</p>
                      <p className="text-xl font-bold text-green-600">R$ {menorPreco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-500 mt-1">{propostas.find((p) => p.valor_total === menorPreco)?.fornecedor_nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Menor Prazo</p>
                      <p className="text-xl font-bold text-blue-600">{menorPrazo} dias</p>
                      <p className="text-xs text-slate-500 mt-1">{propostas.find((p) => p.prazo_entrega === menorPrazo)?.fornecedor_nome}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Economia vs Maior</p>
                      <p className="text-xl font-bold text-purple-600">R$ {economia.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-500 mt-1">{maiorPreco > 0 ? ((economia / maiorPreco) * 100).toFixed(1) : 0}% de diferença</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <Send className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Aguardando Propostas</h3>
                <p className="text-slate-500">Cotação enviada para {comparativoModal.fornecedores_convidados} fornecedores</p>
                <p className="text-sm text-slate-400 mt-2">As propostas aparecerão aqui conforme forem recebidas</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}