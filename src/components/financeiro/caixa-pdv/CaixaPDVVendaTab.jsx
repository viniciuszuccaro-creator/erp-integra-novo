import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Trash2, Plus, Truck, Store, ShoppingCart } from "lucide-react";

export default function CaixaPDVVendaTab({
  carrinho, setCarrinho, clienteSelecionado, setClienteSelecionado,
  buscaProduto, setBuscaProduto, buscaCliente, setBuscaCliente,
  produtosFiltrados, clientesFiltrados,
  desconto, setDesconto, tipoDesconto, setTipoDesconto,
  acrescimo, setAcrescimo, tipoAcrescimo, setTipoAcrescimo,
  emitirNFe, setEmitirNFe, emitirRecibo, setEmitirRecibo, emitirBoleto, setEmitirBoleto,
  tipoEntrega, setTipoEntrega,
  formasPagamentoVenda, setFormasPagamentoVenda, formasPDV, obterConfiguracao,
  subtotal, valorDesconto, valorAcrescimo, totalVenda, totalPago, troco,
  finalizarVenda, controlesDesabilitados
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* PRODUTOS */}
      <Card>
        <CardHeader className="pb-3">
          <Input placeholder="🔍 Buscar produto..." value={buscaProduto} onChange={(e) => setBuscaProduto(e.target.value)} disabled={controlesDesabilitados} />
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-auto">
          <div className="grid grid-cols-2 gap-2">
            {produtosFiltrados.map(p => (
              <button key={p.id} onClick={() => {
                if (controlesDesabilitados) return;
                const existe = carrinho.find(i => i.id === p.id);
                if (existe) setCarrinho(carrinho.map(i => i.id === p.id ? {...i, quantidade: i.quantidade + 1} : i));
                else setCarrinho([...carrinho, {...p, quantidade: 1}]);
              }} disabled={controlesDesabilitados} className="p-3 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 bg-white text-left">
                <p className="font-semibold text-sm truncate">{p.descricao}</p>
                <p className="font-bold text-blue-600 text-lg">R$ {(p.preco_venda || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500">Estoque: {p.estoque_atual || 0}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CARRINHO */}
      <Card>
        <CardHeader className="pb-3"><p className="font-bold">🛒 Carrinho ({carrinho.length})</p></CardHeader>
        <CardContent className="space-y-3">
          <div className="max-h-[280px] overflow-auto space-y-2">
            {carrinho.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Carrinho vazio</p>
              </div>
            ) : (
              carrinho.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border">
                  <div className="flex-1 mr-2">
                    <p className="text-sm font-medium truncate">{item.descricao}</p>
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="outline" data-permission="Financeiro.CaixaPDV.editar" disabled={controlesDesabilitados} onClick={() => setCarrinho(carrinho.map(i => i.id === item.id ? {...i, quantidade: i.quantidade - 1} : i).filter(i => i.quantidade > 0))} className="h-7 w-7 p-0">-</Button>
                      <span className="font-bold w-8 text-center">{item.quantidade}</span>
                      <Button size="sm" variant="outline" data-permission="Financeiro.CaixaPDV.editar" disabled={controlesDesabilitados} onClick={() => setCarrinho(carrinho.map(i => i.id === item.id ? {...i, quantidade: i.quantidade + 1} : i))} className="h-7 w-7 p-0">+</Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">R$ {item.preco_venda.toFixed(2)}</p>
                    <p className="font-bold text-blue-600">R$ {(item.preco_venda * item.quantidade).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-3 space-y-3">
            {/* CLIENTE */}
            <div>
              <Label className="text-xs">Cliente</Label>
              <Input placeholder="Buscar cliente..." value={buscaCliente} onChange={(e) => setBuscaCliente(e.target.value)} className="h-8" disabled={controlesDesabilitados} />
              {buscaCliente && clientesFiltrados.length > 0 && (
                <div className="max-h-24 overflow-auto border rounded mt-1 bg-white">
                  {clientesFiltrados.map(c => (
                    <button key={c.id} onClick={() => { setClienteSelecionado(c); setBuscaCliente(''); }} className="w-full p-2 hover:bg-blue-50 text-left text-sm">{c.nome}</button>
                  ))}
                </div>
              )}
              {clienteSelecionado && <Badge className="mt-1">{clienteSelecionado.nome}</Badge>}
            </div>

            <div className="flex justify-between border-b pb-2">
              <span className="text-sm">Subtotal:</span>
              <span className="font-bold">R$ {subtotal.toFixed(2)}</span>
            </div>

            {/* DESCONTO/ACRESCIMO */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Desconto</Label>
                <div className="flex gap-1">
                  <Input type="number" step="0.01" value={desconto} onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)} className="h-8" />
                  <Select value={tipoDesconto} onValueChange={setTipoDesconto}>
                    <SelectTrigger className="h-8 w-14"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="valor">R$</SelectItem><SelectItem value="percentual">%</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Acréscimo</Label>
                <div className="flex gap-1">
                  <Input type="number" step="0.01" value={acrescimo} onChange={(e) => setAcrescimo(parseFloat(e.target.value) || 0)} className="h-8" />
                  <Select value={tipoAcrescimo} onValueChange={setTipoAcrescimo}>
                    <SelectTrigger className="h-8 w-14"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="valor">R$</SelectItem><SelectItem value="percentual">%</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">TOTAL:</span>
              <span className="text-2xl font-bold text-blue-600">R$ {totalVenda.toFixed(2)}</span>
            </div>

            {/* TIPO ENTREGA */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
              <CardContent className="p-3 space-y-2">
                <Label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Tipo de Entrega
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button data-permission="Financeiro.CaixaPDVVenda.criar" type="button" variant={tipoEntrega === "Retirada" ? "default" : "outline"} onClick={() => setTipoEntrega("Retirada")} className={`h-16 flex-col gap-1 ${tipoEntrega === "Retirada" ? "bg-blue-600 hover:bg-blue-700" : ""}`}>
                    <Store className="w-6 h-6" /><span className="text-xs font-semibold">RETIRADA</span>
                  </Button>
                  <Button data-permission="Financeiro.CaixaPDVVenda.criar" type="button" variant={tipoEntrega === "Entrega" ? "default" : "outline"} onClick={() => setTipoEntrega("Entrega")} className={`h-16 flex-col gap-1 ${tipoEntrega === "Entrega" ? "bg-blue-600 hover:bg-blue-700" : ""}`}>
                    <Truck className="w-6 h-6" /><span className="text-xs font-semibold">ENTREGA</span>
                  </Button>
                </div>
                {tipoEntrega === "Entrega" && !clienteSelecionado && <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-xs text-yellow-900">⚠️ Selecione um cliente para criar a entrega automaticamente</div>}
                {tipoEntrega === "Entrega" && clienteSelecionado && <div className="bg-green-100 border border-green-300 rounded p-2 text-xs text-green-900">✅ Entrega criada automaticamente</div>}
              </CardContent>
            </Card>

            {/* OPÇÕES */}
            <div className="space-y-1 p-2 bg-slate-50 rounded">
              <div className="flex items-center gap-2"><Checkbox checked={emitirRecibo} onCheckedChange={setEmitirRecibo} id="recibo" /><Label htmlFor="recibo" className="text-sm">Emitir Recibo</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={emitirNFe} onCheckedChange={setEmitirNFe} id="nfe" /><Label htmlFor="nfe" className="text-sm">Emitir NF-e</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={emitirBoleto} onCheckedChange={setEmitirBoleto} id="boleto" /><Label htmlFor="boleto" className="text-sm">Gerar Boleto</Label></div>
            </div>

            {/* FORMAS DE PAGAMENTO */}
            <div className="space-y-2">
              {formasPagamentoVenda.map((fp, idx) => {
                const configForma = fp.forma_id ? obterConfiguracao(fp.forma_id) : null;
                return (
                  <div key={idx} className="flex gap-1">
                    <Select value={fp.forma_id || ""} onValueChange={(formaId) => {
                      const forma = formasPDV.find(f => f.id === formaId);
                      const novas = [...formasPagamentoVenda];
                      novas[idx].forma_id = formaId;
                      novas[idx].forma_descricao = forma?.descricao || "";
                      novas[idx].parcelas = 1;
                      setFormasPagamentoVenda(novas);
                    }}>
                      <SelectTrigger className="h-8 flex-1"><SelectValue placeholder="Forma" /></SelectTrigger>
                      <SelectContent>{formasPDV.map(f => <SelectItem key={f.id} value={f.id}>{f.icone && `${f.icone} `}{f.descricao}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" step="0.01" value={fp.valor} onChange={(e) => { const novas = [...formasPagamentoVenda]; novas[idx].valor = parseFloat(e.target.value) || 0; setFormasPagamentoVenda(novas); }} placeholder="Valor" className="h-8 w-24" />
                    {configForma?.permite_parcelar && (
                      <Input type="number" min="1" max={configForma?.max_parcelas || 12} value={fp.parcelas || 1} onChange={(e) => { const novas = [...formasPagamentoVenda]; novas[idx].parcelas = parseInt(e.target.value) || 1; setFormasPagamentoVenda(novas); }} placeholder="Parc" className="h-8 w-16" />
                    )}
                    {formasPagamentoVenda.length > 1 && (
                      <Button size="sm" variant="ghost" data-permission="Financeiro.CaixaPDV.editar" onClick={() => setFormasPagamentoVenda(formasPagamentoVenda.filter((_, i) => i !== idx))} className="h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                );
              })}
              <Button size="sm" variant="outline" data-permission="Financeiro.CaixaPDV.editar" onClick={() => setFormasPagamentoVenda([...formasPagamentoVenda, { forma_id: null, forma_descricao: "Selecione", valor: 0, parcelas: 1 }])} className="w-full">
                <Plus className="w-4 h-4 mr-1" /> Adicionar Forma
              </Button>
            </div>

            {totalPago !== totalVenda && (
              <div className="bg-slate-100 rounded p-2">
                {totalPago > totalVenda ? (
                  <p className="text-green-600 font-bold text-lg">🟢 TROCO: R$ {troco.toFixed(2)}</p>
                ) : (
                  <p className="text-red-600 font-bold text-lg">🔴 FALTA: R$ {(totalVenda - totalPago).toFixed(2)}</p>
                )}
              </div>
            )}

            <Button data-permission="Financeiro.CaixaPDV.criar" onClick={() => finalizarVenda.mutate()} disabled={controlesDesabilitados || finalizarVenda.isPending || carrinho.length === 0 || totalPago < totalVenda} className="w-full bg-emerald-600 h-10">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar Venda
            </Button>
            <Button data-permission="Financeiro.CaixaPDV.editar" onClick={() => { setCarrinho([]); setClienteSelecionado(null); setFormasPagamentoVenda([{ forma_id: null, forma_descricao: "Selecione", valor: 0, parcelas: 1 }]); setDesconto(0); setAcrescimo(0); }} variant="outline" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" /> Limpar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}