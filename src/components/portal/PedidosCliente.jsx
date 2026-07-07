import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Search, Eye, MapPin, FileText, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

/**
 * V21.5 - Meus Pedidos COMPLETO
 * ✅ Busca em tempo real
 * ✅ Integração com rastreamento
 * ✅ Modal detalhes responsivo
 * ✅ w-full h-full
 */
export default function PedidosCliente() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { filterInContext } = useContextoVisual();
  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['meus-pedidos', user?.id],
    queryFn: async () => {
      const me = await base44.auth.me();
      const clientes = await filterInContext('Cliente', { portal_usuario_id: me.id });
      const cliente = clientes[0];
      
      if (!cliente) return [];
      
      return await filterInContext('Pedido', { 
        cliente_id: cliente.id,
        pode_ver_no_portal: true,
        empresa_id: cliente.empresa_id || undefined,
        group_id: cliente.group_id || undefined
      }, '-data_pedido', 50);
    },
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['minhas-entregas', user?.id],
    queryFn: async () => {
      const me = await base44.auth.me();
      const clientes = await filterInContext('Cliente', { portal_usuario_id: me.id });
      const cliente = clientes[0];
      
      if (!cliente) return [];
      
      return await filterInContext('Entrega', { cliente_id: cliente.id, empresa_id: cliente.empresa_id || undefined, group_id: cliente.group_id || undefined }, '-data_previsao', 50);
    },
  });

  const statusColor = {
    'Rascunho': 'bg-gray-100 text-gray-800',
    'Aguardando Aprovação': 'bg-yellow-100 text-yellow-800',
    'Aprovado': 'bg-blue-100 text-blue-800',
    'Em Produção': 'bg-purple-100 text-purple-800',
    'Pronto para Faturar': 'bg-indigo-100 text-indigo-800',
    'Faturado': 'bg-green-100 text-green-800',
    'Em Expedição': 'bg-orange-100 text-orange-800',
    'Em Trânsito': 'bg-cyan-100 text-cyan-800',
    'Entregue': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800',
  };

  const getStatusProgress = (status) => {
    const statusMap = {
      'Rascunho': 10,
      'Aguardando Aprovação': 20,
      'Aprovado': 30,
      'Em Produção': 50,
      'Pronto para Faturar': 70,
      'Faturado': 80,
      'Em Expedição': 85,
      'Em Trânsito': 90,
      'Entregue': 100,
    };
    return statusMap[status] || 0;
  };

  const filteredPedidos = pedidos.filter(p =>
    p.numero_pedido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (pedido) => {
    setSelectedPedido(pedido);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return <div className="p-6">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Buscar por número do pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 w-full">
        {filteredPedidos.map((pedido) => {
          const entrega = entregas.find(e => e.pedido_id === pedido.id);
          const progress = getStatusProgress(pedido.status);

          return (
            <Card key={pedido.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{pedido.numero_pedido}</h3>
                      <p className="text-sm text-slate-600">
                        Data: {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-slate-600">
                        Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_total)}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColor[pedido.status] || 'bg-gray-100'}>
                    {pedido.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progresso do Pedido</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {entrega && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Status da Entrega: {entrega.status}</p>
                      <p className="text-xs text-blue-700">
                        Previsão: {new Date(entrega.data_previsao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(pedido)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Detalhes
                  </Button>
                  {entrega && entrega.qr_code && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/rastreamento/${entrega.qr_code}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Rastrear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredPedidos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido {selectedPedido?.numero_pedido}</DialogTitle>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Data do Pedido</p>
                  <p className="font-medium">{new Date(selectedPedido.data_pedido).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge className={statusColor[selectedPedido.status]}>{selectedPedido.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Valor Total</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedPedido.valor_total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Forma de Pagamento</p>
                  <p className="font-medium">{selectedPedido.forma_pagamento || 'Não definida'}</p>
                </div>
              </div>

              {selectedPedido.itens_revenda && selectedPedido.itens_revenda.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Itens do Pedido</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Produto</th>
                          <th className="text-right p-3 text-sm font-medium">Qtd</th>
                          <th className="text-right p-3 text-sm font-medium">Valor Unit.</th>
                          <th className="text-right p-3 text-sm font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPedido.itens_revenda.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-3">{item.produto_descricao || item.descricao}</td>
                            <td className="text-right p-3">{item.quantidade} {item.unidade}</td>
                            <td className="text-right p-3">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_unitario || item.valor_unitario)}
                            </td>
                            <td className="text-right p-3 font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedPedido.observacoes_publicas && (
                <div>
                  <h4 className="font-semibold mb-2">Observações</h4>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {selectedPedido.observacoes_publicas}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}