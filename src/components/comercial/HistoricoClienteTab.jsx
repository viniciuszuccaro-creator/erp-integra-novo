import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ShoppingCart, TrendingUp, Package, Clock, DollarSign, FileText, Truck,
  CheckCircle2, Plus, BarChart3,
} from 'lucide-react';
import { useHistoricoCliente } from './historico-cliente/useHistoricoCliente';
import HistoricoListaCard from './historico-cliente/HistoricoListaCard';

export default function HistoricoClienteTab({ formData, setFormData, onAdicionarItemAoPedido }) {
  const {
    contasReceber, entregas, notasFiscais, produtosFrequentes, analisando,
    totalPedidos, valorTotalHistorico, ticketMedio, taxaEntrega, contasPagas, contasAtrasadas,
  } = useHistoricoCliente(formData);

  if (!formData.cliente_id) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Selecione um cliente para ver o histórico</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto">
      <Alert className="border-purple-200 bg-purple-50">
        <BarChart3 className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          📊 <strong>Histórico Expandido V21.1.2:</strong> Top 20 produtos, auditoria de NF-e, entregas e pagamentos
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-slate-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{totalPedidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-slate-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-green-600">R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs text-slate-600">Taxa Entrega</p>
                <p className="text-2xl font-bold text-orange-600">{taxaEntrega.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs text-slate-600">Pagamentos</p>
                <p className="text-lg font-bold text-green-600">{contasPagas} OK</p>
                {contasAtrasadas > 0 && <p className="text-sm font-semibold text-red-600">{contasAtrasadas} Atrasadas</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Top 20 Produtos Mais Comprados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {analisando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-slate-600 mt-2">Analisando histórico...</p>
            </div>
          ) : produtosFrequentes.length > 0 ? (
            <div className="space-y-2">
              {produtosFrequentes.map((produto, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600 text-white">#{idx + 1}</Badge>
                      <p className="font-semibold text-sm">{produto.descricao}</p>
                      {produto.tipo && <Badge variant="outline" className="text-xs">{produto.tipo}</Badge>}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-slate-600">
                      <span>Qtd Total: <strong>{produto.quantidade_total.toFixed(2)}</strong></span>
                      <span>Frequência: <strong>{produto.frequencia}x</strong></span>
                      <span>Média: <strong>R$ {produto.preco_medio.toFixed(2)}</strong></span>
                      <span>Última: <strong>{new Date(produto.ultima_compra).toLocaleDateString('pt-BR')}</strong></span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onAdicionarItemAoPedido && onAdicionarItemAoPedido(produto)}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum histórico de compras encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <HistoricoListaCard
        icon={FileText}
        title="Notas Fiscais Emitidas"
        items={notasFiscais}
        bgColor="bg-green-50"
        badgeColors={{ Autorizada: 'bg-green-600', Cancelada: 'bg-red-600' }}
        getPrimaryText={nf => `NF-e ${nf.numero} - Série ${nf.serie}`}
        getSecondaryText={nf => `${new Date(nf.data_emissao).toLocaleDateString('pt-BR')} • R$ ${(nf.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        getBadgeValue={nf => nf.status}
        emptyMessage="Nenhuma NF-e encontrada"
      />

      <HistoricoListaCard
        icon={Truck}
        title="Histórico de Entregas"
        items={entregas}
        bgColor="bg-orange-50"
        badgeColors={{ Entregue: 'bg-green-600', 'Em Trânsito': 'bg-blue-600', 'Entrega Frustrada': 'bg-red-600' }}
        getPrimaryText={e => e.endereco_entrega_completo?.cidade || 'Endereço não especificado'}
        getSecondaryText={e => `Previsão: ${e.data_previsao ? new Date(e.data_previsao).toLocaleDateString('pt-BR') : '-'} • ${e.peso_total_kg ? e.peso_total_kg + ' kg' : ''} • ${e.km_rodado ? e.km_rodado + ' km' : ''}`}
        getBadgeValue={e => e.status}
        emptyMessage="Nenhuma entrega registrada"
      />

      <HistoricoListaCard
        icon={DollarSign}
        title="Histórico Financeiro"
        items={contasReceber}
        bgColor="bg-blue-50"
        badgeColors={{ Recebido: 'bg-green-600', Atrasado: 'bg-red-600' }}
        getPrimaryText={c => c.descricao}
        getSecondaryText={c => `Vencimento: ${new Date(c.data_vencimento).toLocaleDateString('pt-BR')} • R$ ${(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${c.forma_recebimento ? ' • ' + c.forma_recebimento : ''}`}
        getBadgeValue={c => c.status}
        emptyMessage="Nenhuma movimentação financeira"
      />

      <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <CheckCircle2 className="w-5 h-5" />
            Resumo do Relacionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Total Faturado (12 meses)</p>
              <p className="text-xl font-bold text-green-600">R$ {valorTotalHistorico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-slate-600">Produtos Diferentes</p>
              <p className="text-xl font-bold text-purple-600">{produtosFrequentes.length}</p>
            </div>
            <div>
              <p className="text-slate-600">NF-e Emitidas</p>
              <p className="text-xl font-bold text-blue-600">{notasFiscais.length}</p>
            </div>
            <div>
              <p className="text-slate-600">Entregas Realizadas</p>
              <p className="text-xl font-bold text-orange-600">{entregas.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}