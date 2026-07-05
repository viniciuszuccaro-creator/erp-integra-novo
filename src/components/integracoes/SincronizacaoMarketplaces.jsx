import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingCart, RefreshCw, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Sincronização com Marketplaces
 * Mercado Livre, Shopee, Amazon
 */
export default function SincronizacaoMarketplaces({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const [config, setConfig] = useState({
    mercado_livre: { ativo: false, token: '' },
    shopee: { ativo: false, token: '' },
    amazon: { ativo: false, token: '' }
  });

  const { data: pedidosExternos = [] } = useQuery({
    queryKey: ['pedidos-externos-config', contextoKey],
    queryFn: () => filterInContext('PedidoExterno', {}, '-created_date'),
  });

  const sincronizarMutation = useMutation({
    mutationFn: async (marketplace) => {
      // Simulação de sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Em produção, chamaria API real do marketplace
      return {
        marketplace,
        novos_pedidos: 0,
        atualizados: 0
      };
    },
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-externos-config'] });
      toast({
        title: `✅ ${resultado.marketplace} sincronizado!`,
        description: `${resultado.novos_pedidos} pedidos novos`
      });
    }
  });

  const marketplaces = [
    {
      id: 'mercado_livre',
      nome: 'Mercado Livre',
      icone: ShoppingCart,
      cor: 'yellow',
      descricao: 'Maior marketplace da América Latina'
    },
    {
      id: 'shopee',
      nome: 'Shopee',
      icone: Package,
      cor: 'orange',
      descricao: 'Marketplace asiático em crescimento'
    },
    {
      id: 'amazon',
      nome: 'Amazon',
      icone: ShoppingCart,
      cor: 'blue',
      descricao: 'Marketplace global'
    }
  ];

  const pedidosPorOrigem = (origem) => {
    return pedidosExternos.filter(p => p.origem === origem).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Integração com Marketplaces</CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Sincronize pedidos automaticamente de Mercado Livre, Shopee e Amazon
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {marketplaces.map((mp) => {
            const Icon = mp.icone;
            const ativo = config[mp.id]?.ativo || false;

            return (
              <div key={mp.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className={`w-12 h-12 bg-${mp.cor}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${mp.cor}-600`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{mp.nome}</h4>
                    <Badge variant="outline">
                      {pedidosPorOrigem(mp.nome)} pedido(s)
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{mp.descricao}</p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ativo}
                        onCheckedChange={(v) => setConfig({
                          ...config,
                          [mp.id]: { ...config[mp.id], ativo: v }
                        })}
                      />
                      <Label className="text-sm">
                        {ativo ? 'Ativo' : 'Inativo'}
                      </Label>
                    </div>

                    {ativo && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sincronizarMutation.mutate(mp.nome)}
                        disabled={sincronizarMutation.isPending}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${sincronizarMutation.isPending ? 'animate-spin' : ''}`} />
                        Sincronizar Agora
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Últimos Pedidos Sincronizados */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Últimos Pedidos Externos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Origem</TableHead>
                <TableHead>ID Externo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidosExternos.slice(0, 10).map((pe) => (
                <TableRow key={pe.id}>
                  <TableCell>
                    <Badge variant="outline">{pe.origem}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {pe.numero_pedido_externo}
                  </TableCell>
                  <TableCell>{pe.cliente_nome}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    R$ {(pe.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      pe.status_importacao === 'Importado' ? 'bg-green-100 text-green-700' :
                      pe.status_importacao === 'A Validar' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {pe.status_importacao}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pedidosExternos.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Nenhum pedido externo sincronizado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}