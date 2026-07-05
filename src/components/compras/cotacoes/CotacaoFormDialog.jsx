import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, AlertCircle, Award } from "lucide-react";

export default function CotacaoFormDialog({
  dialogOpen, setDialogOpen, formCotacao, setFormCotacao,
  handleSubmit, adicionarItem, removerItem, toggleFornecedor,
  produtos, fornecedores, criarCotacaoMutation,
}) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nova Cotação de Compras</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Descrição da Cotação *</Label>
            <Input value={formCotacao.descricao} onChange={(e) => setFormCotacao({ ...formCotacao, descricao: e.target.value })} placeholder="Ex: Cotação de Bitolas - Lote Fevereiro" required />
          </div>
          <div>
            <Label>Data Limite para Respostas *</Label>
            <Input type="date" value={formCotacao.data_limite_resposta} onChange={(e) => setFormCotacao({ ...formCotacao, data_limite_resposta: e.target.value })} required />
          </div>
          <div>
            <div className="flex justify-between items-center mb-3">
              <Label>Itens para Cotação *</Label>
              <Button type="button" size="sm" variant="outline" data-permission="Compras.Cotacao.criar" onClick={adicionarItem}>
                <Plus className="w-4 h-4 mr-2" />Adicionar Item
              </Button>
            </div>
            <div className="space-y-3">
              {formCotacao.itens.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-start p-3 bg-slate-50 rounded-lg">
                  <div className="col-span-5">
                    <Select value={item.produto_descricao} onValueChange={(value) => {
                      const novosItens = [...formCotacao.itens]; novosItens[idx].produto_descricao = value; setFormCotacao({ ...formCotacao, itens: novosItens });
                    }}>
                      <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                      <SelectContent>
                        {produtos.map((p) => (<SelectItem key={p.id} value={p.descricao}>{p.codigo} - {p.descricao}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.quantidade} onChange={(e) => {
                      const novosItens = [...formCotacao.itens]; novosItens[idx].quantidade = parseFloat(e.target.value); setFormCotacao({ ...formCotacao, itens: novosItens });
                    }} placeholder="Qtd" />
                  </div>
                  <div className="col-span-2">
                    <Select value={item.unidade} onValueChange={(value) => {
                      const novosItens = [...formCotacao.itens]; novosItens[idx].unidade = value; setFormCotacao({ ...formCotacao, itens: novosItens });
                    }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">UN</SelectItem><SelectItem value="KG">KG</SelectItem>
                        <SelectItem value="MT">MT</SelectItem><SelectItem value="LT">LT</SelectItem><SelectItem value="CX">CX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input value={item.observacoes} onChange={(e) => {
                      const novosItens = [...formCotacao.itens]; novosItens[idx].observacoes = e.target.value; setFormCotacao({ ...formCotacao, itens: novosItens });
                    }} placeholder="Obs" />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {formCotacao.itens.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removerItem(idx)} data-permission="Compras.Cotacao.editar" className="text-red-600">×</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-3 block">Fornecedores Convidados * (selecione ao menos 2)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
              {fornecedores.filter((f) => f.status === "Ativo").map((fornecedor) => (
                <div key={fornecedor.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <Checkbox checked={formCotacao.fornecedores_selecionados.includes(fornecedor.id)} onCheckedChange={() => toggleFornecedor(fornecedor.id)} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{fornecedor.nome}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Badge variant="outline" className="text-xs">{fornecedor.categoria}</Badge>
                      {fornecedor.nota_media > 0 && (<span className="flex items-center gap-1"><Award className="w-3 h-3 text-amber-500" />{fornecedor.nota_media.toFixed(1)}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {formCotacao.fornecedores_selecionados.length < 2 && (
              <p className="text-xs text-orange-600 mt-2"><AlertCircle className="w-3 h-3 inline mr-1" />Selecione ao menos 2 fornecedores para cotação</p>
            )}
          </div>
          <div>
            <Label>Observações Gerais</Label>
            <Textarea value={formCotacao.observacoes_gerais} onChange={(e) => setFormCotacao({ ...formCotacao, observacoes_gerais: e.target.value })} placeholder="Condições especiais, prazos, formas de pagamento..." rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" data-permission="Compras.Cotacao.criar" disabled={criarCotacaoMutation.isPending || formCotacao.fornecedores_selecionados.length < 2} className="bg-cyan-600 hover:bg-cyan-700">
              <Send className="w-4 h-4 mr-2" />{criarCotacaoMutation.isPending ? "Enviando..." : "Criar e Enviar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}