import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wallet, CheckCircle2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import useContextoVisual from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePermissions from "@/components/lib/usePermissions";
import CaixaPDVVendaTab from "./caixa-pdv/CaixaPDVVendaTab";
import CaixaPDVTitulosTab from "./caixa-pdv/CaixaPDVTitulosTab";
import CaixaPDVMovimentosTab from "./caixa-pdv/CaixaPDVMovimentosTab";

export default function CaixaPDVCompleto({ empresaAtual: empresaProp, windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState("venda");
  const [carrinho, setCarrinho] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [formasPagamentoVenda, setFormasPagamentoVenda] = useState([{ forma_id: null, forma_descricao: "Selecione", valor: 0, parcelas: 1 }]);
  const [desconto, setDesconto] = useState(0);
  const [tipoDesconto, setTipoDesconto] = useState("valor");
  const [acrescimo, setAcrescimo] = useState(0);
  const [tipoAcrescimo, setTipoAcrescimo] = useState("valor");
  const [emitirNFe, setEmitirNFe] = useState(false);
  const [emitirRecibo, setEmitirRecibo] = useState(true);
  const [emitirBoleto, setEmitirBoleto] = useState(false);
  const [tipoEntrega, setTipoEntrega] = useState("Retirada");
  const [enderecoEntrega, setEnderecoEntrega] = useState("");
  const [buscaProduto, setBuscaProduto] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState(0);

  const queryClient = useQueryClient();
  const { empresaAtual: empresaContexto, grupoAtual, filterInContext, createInContext, updateInContext } = useContextoVisual();
  const { confirm, ConfirmDialog } = useConfirm();
  const { canCreate, canEdit, hasPermission } = usePermissions();
  const empresaAtual = empresaProp || empresaContexto;
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeOperarCaixa = canCreate('Financeiro', 'Caixa') || canEdit('Financeiro', 'Caixa') || hasPermission('Financeiro', 'PDV', 'criar');
  const podeLiquidarTitulos = canEdit('Financeiro', 'Contas a Receber') || canEdit('Financeiro', 'Contas a Pagar') || hasPermission('Financeiro', null, 'baixar');
  const controlesDesabilitados = !contextoValido || !podeOperarCaixa;

  const { formasPagamento, obterFormasPorContexto, obterConfiguracao } = useFormasPagamento({ empresa_id: empresaAtual?.id });
  const formasPDV = obterFormasPorContexto('pdv');

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });
  const { data: produtos = [] } = useQuery({ queryKey: ['produtos', contextKey], queryFn: () => filterInContext('Produto', {}, 'descricao', 200), enabled: contextoValido });
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes', contextKey], queryFn: () => filterInContext('Cliente', {}, 'nome', 200), enabled: contextoValido });
  const { data: contasReceber = [] } = useQuery({ queryKey: ['contasReceber', contextKey], queryFn: () => filterInContext('ContaReceber', {}, 'data_vencimento', 200), enabled: contextoValido });
  const { data: contasPagar = [] } = useQuery({ queryKey: ['contasPagar', contextKey], queryFn: () => filterInContext('ContaPagar', {}, 'data_vencimento', 200), enabled: contextoValido });
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos', contextKey], queryFn: () => filterInContext('Pedido', {}, '-data_pedido', 200), enabled: contextoValido });
  const { data: movimentos = [] } = useQuery({ queryKey: ['movimentos-caixa', contextKey], queryFn: () => filterInContext('CaixaMovimento', {}, '-data_movimento', 200), enabled: caixaAberto && contextoValido, refetchInterval: 10000 });

  const hoje = new Date().toISOString().split('T')[0];
  const movimentosHoje = movimentos.filter(m => new Date(m.data_movimento).toISOString().split('T')[0] === hoje && !m.cancelado);
  const totalEntradasDinheiro = movimentosHoje.filter(m => m.tipo_movimento === 'Entrada' && m.forma_pagamento === 'Dinheiro').reduce((s, m) => s + (m.valor || 0), 0);
  const totalSaidasDinheiro = movimentosHoje.filter(m => m.tipo_movimento === 'Saída' && m.forma_pagamento === 'Dinheiro').reduce((s, m) => s + (m.valor || 0), 0);
  const saldoAtual = saldoInicial + totalEntradasDinheiro - totalSaidasDinheiro;
  const somatoriaFormasPagamento = movimentosHoje.reduce((acc, m) => {
    const forma = m.forma_pagamento || 'Outros';
    if (!acc[forma]) acc[forma] = { entradas: 0, saidas: 0, total: 0 };
    if (m.tipo_movimento === 'Entrada') { acc[forma].entradas += m.valor || 0; acc[forma].total += m.valor || 0; }
    else if (m.tipo_movimento === 'Saída') { acc[forma].saidas += m.valor || 0; acc[forma].total -= m.valor || 0; }
    return acc;
  }, {});

  const subtotal = carrinho.reduce((s, i) => s + (i.preco_venda * i.quantidade), 0);
  const valorDesconto = tipoDesconto === 'percentual' ? (subtotal * desconto / 100) : desconto;
  const valorAcrescimo = tipoAcrescimo === 'percentual' ? (subtotal * acrescimo / 100) : acrescimo;
  const totalVenda = subtotal - valorDesconto + valorAcrescimo;
  const totalPago = formasPagamentoVenda.reduce((s, f) => s + (f.valor || 0), 0);
  const troco = totalPago - totalVenda;

  const produtosFiltrados = produtos.filter(p => p.descricao?.toLowerCase().includes(buscaProduto.toLowerCase())).slice(0, 30);
  const clientesFiltrados = clientes.filter(c => c.nome?.toLowerCase().includes(buscaCliente.toLowerCase())).slice(0, 5);
  const contasReceberPendentes = contasReceber.filter(c => c.status === 'Pendente');
  const contasPagarPendentes = contasPagar.filter(c => c.status === 'Pendente');
  const pedidosReceber = pedidos.filter(p => p.status === 'Aprovado' || p.status === 'Pronto para Faturar');

  const abrirCaixa = useMutation({
    mutationFn: async (saldo) => {
      if (controlesDesabilitados) throw new Error("Sem contexto ou permissão.");
      await createInContext('CaixaMovimento', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), data_movimento: new Date().toISOString(), tipo_movimento: 'Abertura', origem: 'Abertura Caixa', forma_pagamento: 'Dinheiro', valor: saldo, descricao: 'Abertura de Caixa', usuario_operador_nome: user?.full_name, caixa_aberto: true });
    },
    onSuccess: () => { setCaixaAberto(true); queryClient.invalidateQueries({ queryKey: ['movimentos-caixa'] }); toast.success("Caixa aberto!"); }
  });

  const finalizarVenda = useMutation({
    mutationFn: async () => {
      if (controlesDesabilitados) throw new Error("Sem contexto ou permissão.");
      const pedido = await createInContext('Pedido', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), numero_pedido: `PDV-${Date.now()}`, forma_pagamento: formasPagamentoVenda.map(f => f.forma_descricao).join(', '), tipo: 'Pedido', tipo_frete: tipoEntrega === "Retirada" ? "Retirada" : "CIF", origem_pedido: 'PDV Presencial', data_pedido: hoje, cliente_nome: clienteSelecionado?.nome || 'Cliente Avulso', cliente_id: clienteSelecionado?.id, vendedor: user?.full_name, itens_revenda: carrinho.map(item => ({ produto_id: item.id, produto_descricao: item.descricao, quantidade: item.quantidade, valor_unitario: item.preco_venda, valor_total: item.preco_venda * item.quantidade })), valor_produtos: subtotal, desconto_geral_pedido_valor: valorDesconto, valor_total: totalVenda, status: 'Faturado' });
      if (tipoEntrega === "Entrega" && clienteSelecionado) {
        const ec = clienteSelecionado.endereco_principal || {};
        await createInContext('Entrega', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), pedido_id: pedido.id, numero_pedido: pedido.numero_pedido, cliente_id: clienteSelecionado.id, cliente_nome: clienteSelecionado.nome, endereco_entrega_completo: { logradouro: ec.logradouro || enderecoEntrega, numero: ec.numero || "", complemento: ec.complemento || "", bairro: ec.bairro || "", cidade: ec.cidade || "", estado: ec.estado || "", cep: ec.cep || "" }, data_previsao: hoje, status: "Aguardando Separação", tipo_frete: "CIF", valor_mercadoria: totalVenda });
      }
      let contaReceber = null;
      if (emitirBoleto || formasPagamentoVenda.some(f => f.forma_descricao !== 'Dinheiro')) {
        contaReceber = await createInContext('ContaReceber', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), descricao: `Venda PDV ${pedido.numero_pedido}`, cliente: clienteSelecionado?.nome || 'Cliente Avulso', cliente_id: clienteSelecionado?.id, pedido_id: pedido.id, valor: totalVenda, data_emissao: hoje, data_vencimento: hoje, status: emitirBoleto ? 'Pendente' : 'Recebido', forma_recebimento: formasPagamentoVenda.map(f => f.forma_descricao).join(', '), origem_tipo: 'pedido' });
      }
      for (const fp of formasPagamentoVenda) {
        if (fp.valor > 0 && fp.forma_id) await createInContext('CaixaMovimento', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), data_movimento: new Date().toISOString(), tipo_movimento: 'Entrada', origem: 'Venda PDV', forma_pagamento: fp.forma_descricao, valor: fp.valor, descricao: `Venda ${pedido.numero_pedido} - ${clienteSelecionado?.nome || 'Avulso'}`, pedido_id: pedido.id, conta_receber_id: contaReceber?.id, usuario_operador_nome: user?.full_name, caixa_aberto: true });
      }
      return { pedido };
    },
    onSuccess: ({ pedido }) => {
      setCarrinho([]); setFormasPagamentoVenda([{ forma_id: null, forma_descricao: "Selecione", valor: 0, parcelas: 1 }]); setClienteSelecionado(null); setDesconto(0); setAcrescimo(0); setEmitirNFe(false); setEmitirBoleto(false); setTipoEntrega("Retirada"); setEnderecoEntrega("");
      queryClient.invalidateQueries();
      toast.success(`Venda ${pedido.numero_pedido} finalizada!${troco > 0 ? ` TROCO: R$ ${troco.toFixed(2)}` : ''}`);
    }
  });

  const liquidarTitulo = useMutation({
    mutationFn: async ({ titulo, tipo, forma }) => {
      if (!contextoValido || !podeLiquidarTitulos) throw new Error("Sem contexto ou permissão.");
      if (tipo === 'receber') {
        await updateInContext('ContaReceber', titulo.id, { status: 'Recebido', data_recebimento: hoje, valor_recebido: titulo.valor, forma_recebimento: forma });
        await createInContext('CaixaMovimento', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), data_movimento: new Date().toISOString(), tipo_movimento: 'Entrada', origem: 'Liquidação Receber', forma_pagamento: forma, valor: titulo.valor, descricao: `Recebimento: ${titulo.cliente}`, conta_receber_id: titulo.id, usuario_operador_nome: user?.full_name, caixa_aberto: true });
      } else {
        await updateInContext('ContaPagar', titulo.id, { status: 'Pago', data_pagamento: hoje, valor_pago: titulo.valor, forma_pagamento: forma });
        await createInContext('CaixaMovimento', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), data_movimento: new Date().toISOString(), tipo_movimento: 'Saída', origem: 'Liquidação Pagar', forma_pagamento: forma, valor: titulo.valor, descricao: `Pagamento: ${titulo.fornecedor}`, conta_pagar_id: titulo.id, usuario_operador_nome: user?.full_name, caixa_aberto: true });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries(); toast.success("Liquidado!"); }
  });

  const fecharCaixa = useMutation({
    mutationFn: async () => {
      if (controlesDesabilitados) throw new Error("Sem contexto ou permissão.");
      await createInContext('CaixaMovimento', { ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}), ...(groupId ? { group_id: groupId } : {}), data_movimento: new Date().toISOString(), tipo_movimento: 'Fechamento', origem: 'Fechamento Caixa', forma_pagamento: 'Dinheiro', valor: saldoAtual, descricao: `Fechamento - Saldo: R$ ${saldoAtual.toFixed(2)}`, usuario_operador_nome: user?.full_name, caixa_aberto: false });
    },
    onSuccess: () => { setCaixaAberto(false); queryClient.invalidateQueries(); toast.success("Caixa fechado!"); }
  });

  if (!caixaAberto) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" /> Abrir Caixa PDV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <p className="text-sm"><strong>Operador:</strong> {user?.full_name}</p>
                <p className="text-sm"><strong>Empresa:</strong> {empresaAtual?.nome_fantasia || empresaAtual?.razao_social}</p>
              </CardContent>
            </Card>
            <div>
              <Label>Saldo Inicial em Dinheiro (R$)</Label>
              <Input type="number" step="0.01" value={saldoInicial} onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)} placeholder="0.00" className="text-lg" disabled={controlesDesabilitados} />
            </div>
            <Button data-permission="Financeiro.Caixa.abrir" onClick={() => abrirCaixa.mutate(saldoInicial)} className="w-full bg-emerald-600 h-10" disabled={controlesDesabilitados || abrirCaixa.isPending}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Abrir Caixa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 p-3 bg-white rounded border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <div><p className="text-sm font-bold">Caixa PDV</p><p className="text-xs text-slate-500">{user?.full_name}</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Saldo em Dinheiro</p>
            <p className="text-lg font-bold text-emerald-600">R$ {saldoAtual.toFixed(2)}</p>
          </div>
          <Button data-permission="Financeiro.Caixa.fechar" onClick={async () => { const ok = await confirm({ title: "Fechar Caixa", description: `Fechar caixa?\nSaldo: R$ ${saldoAtual.toFixed(2)}`, variant: "warning", confirmText: "Fechar" }); if (ok) fecharCaixa.mutate(); }} variant="outline" size="sm" disabled={controlesDesabilitados || fecharCaixa.isPending}>Fechar Caixa</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card><CardContent className="p-3"><p className="text-xs text-blue-700 font-semibold">Vendas Hoje</p><p className="text-xl font-bold">{movimentosHoje.filter(m => m.origem === 'Venda PDV').length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-green-700 font-semibold">Entradas 💵</p><p className="text-xl font-bold">R$ {totalEntradasDinheiro.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-red-700 font-semibold">Saídas 💵</p><p className="text-xl font-bold">R$ {totalSaidasDinheiro.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-slate-700 font-semibold">Total Movimentos</p><p className="text-xl font-bold">{movimentosHoje.length}</p></CardContent></Card>
      </div>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="venda">💰 Venda</TabsTrigger>
          <TabsTrigger value="pedidos">📦 Pedidos</TabsTrigger>
          <TabsTrigger value="receber">💚 Receber</TabsTrigger>
          <TabsTrigger value="pagar">💔 Pagar</TabsTrigger>
          <TabsTrigger value="movimentos">📊 Movimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="venda">
          <CaixaPDVVendaTab
            carrinho={carrinho} setCarrinho={setCarrinho}
            clienteSelecionado={clienteSelecionado} setClienteSelecionado={setClienteSelecionado}
            buscaProduto={buscaProduto} setBuscaProduto={setBuscaProduto}
            buscaCliente={buscaCliente} setBuscaCliente={setBuscaCliente}
            produtosFiltrados={produtosFiltrados} clientesFiltrados={clientesFiltrados}
            desconto={desconto} setDesconto={setDesconto} tipoDesconto={tipoDesconto} setTipoDesconto={setTipoDesconto}
            acrescimo={acrescimo} setAcrescimo={setAcrescimo} tipoAcrescimo={tipoAcrescimo} setTipoAcrescimo={setTipoAcrescimo}
            emitirNFe={emitirNFe} setEmitirNFe={setEmitirNFe} emitirRecibo={emitirRecibo} setEmitirRecibo={setEmitirRecibo} emitirBoleto={emitirBoleto} setEmitirBoleto={setEmitirBoleto}
            tipoEntrega={tipoEntrega} setTipoEntrega={setTipoEntrega}
            formasPagamentoVenda={formasPagamentoVenda} setFormasPagamentoVenda={setFormasPagamentoVenda} formasPDV={formasPDV} obterConfiguracao={obterConfiguracao}
            subtotal={subtotal} valorDesconto={valorDesconto} valorAcrescimo={valorAcrescimo} totalVenda={totalVenda} totalPago={totalPago} troco={troco}
            finalizarVenda={finalizarVenda} controlesDesabilitados={controlesDesabilitados}
          />
        </TabsContent>

        <TabsContent value="pedidos">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Valor</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader>
              <TableBody>
                {pedidosReceber.map(p => (
                  <tr key={p.id}>
                    <TableCell>{p.numero_pedido}</TableCell>
                    <TableCell>{p.cliente_nome}</TableCell>
                    <TableCell className="font-bold">R$ {(p.valor_total || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button size="sm" data-permission="Financeiro.Caixa.liquidar" disabled={!contextoValido || !podeLiquidarTitulos || liquidarTitulo.isPending} onClick={() => liquidarTitulo.mutate({ titulo: { id: p.id, cliente: p.cliente_nome, valor: p.valor_total }, tipo: 'receber', forma: 'Dinheiro' })}>Receber</Button>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="receber">
          <CaixaPDVTitulosTab tipo="receber" titulos={contasReceberPendentes} liquidarTitulo={liquidarTitulo} contextoValido={contextoValido} podeLiquidarTitulos={podeLiquidarTitulos} />
        </TabsContent>

        <TabsContent value="pagar">
          <CaixaPDVTitulosTab tipo="pagar" titulos={contasPagarPendentes} liquidarTitulo={liquidarTitulo} contextoValido={contextoValido} podeLiquidarTitulos={podeLiquidarTitulos} />
        </TabsContent>

        <TabsContent value="movimentos">
          <CaixaPDVMovimentosTab movimentosHoje={movimentosHoje} somatoriaFormasPagamento={somatoriaFormasPagamento} pedidos={pedidos} />
        </TabsContent>
      </Tabs>
      <ConfirmDialog />
    </div>
  );
}