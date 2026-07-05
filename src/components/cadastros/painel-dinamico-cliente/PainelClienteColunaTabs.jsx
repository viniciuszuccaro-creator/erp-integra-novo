import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Package,
  Activity,
  ExternalLink,
  Route,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Top10ProdutosCliente from "@/components/comercial/Top10ProdutosCliente";
import HistoricoOrigemCliente from "@/components/comercial/HistoricoOrigemCliente";
import HistoricoProdutosCliente from "@/components/comercial/HistoricoProdutosCliente";

/**
 * Coluna 3 do PainelDinamicoCliente (Regra-Mãe P1).
 * Tabs de Endereços, Produtos, Canais + Últimos Pedidos.
 */
export default function PainelClienteColunaTabs({ cliente, pedidos }) {
  const [activeTab, setActiveTab] = useState("enderecos");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enderecos" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            Endereços
          </TabsTrigger>
          <TabsTrigger value="produtos" className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="canais" className="text-xs">
            <Activity className="w-3 h-3 mr-1" />
            Canais
          </TabsTrigger>
          <TabsTrigger value="historico_produtos" className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            Histórico Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enderecos" className="mt-4 space-y-2">
          {cliente.locais_entrega && cliente.locais_entrega.length > 0 ? (
            cliente.locais_entrega.map((endereco, idx) => (
              <Card key={idx} className="border-0 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{endereco.apelido || `Local ${idx + 1}`}</p>
                        {endereco.principal && (
                          <Badge className="bg-green-600 text-xs py-0">Principal</Badge>
                        )}
                        {endereco.tipo_endereco && (
                          <Badge variant="outline" className="text-xs">{endereco.tipo_endereco}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {endereco.logradouro}, {endereco.numero}
                        {endereco.complemento && ` - ${endereco.complemento}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                      </p>
                      {endereco.contato_nome && (
                        <p className="text-xs text-slate-500 mt-1">
                          Contato: {endereco.contato_nome}
                          {endereco.contato_telefone && ` - ${endereco.contato_telefone}`}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {endereco.mapa_url && (
                          <a
                            href={endereco.mapa_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Google Maps
                          </a>
                        )}
                        {endereco.latitude && endereco.longitude && (
                          <Link
                            to={createPageUrl('Expedicao') + '?tab=rotas'}
                            className="text-xs text-green-600 hover:underline flex items-center gap-1"
                          >
                            <Route className="w-3 h-3" />
                            Roteirizar
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum endereço cadastrado</p>
            </div>
          )}

          {cliente.endereco_principal?.cidade && !cliente.locais_entrega?.length && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-sm">Endereço Principal</p>
                    <p className="text-xs text-slate-600">
                      {cliente.endereco_principal.logradouro}, {cliente.endereco_principal.numero}
                    </p>
                    <p className="text-xs text-slate-500">
                      {cliente.endereco_principal.cidade}/{cliente.endereco_principal.estado}
                      {cliente.endereco_principal.cep && ` - ${cliente.endereco_principal.cep}`}
                    </p>
                    {cliente.endereco_principal.mapa_url && (
                      <a
                        href={cliente.endereco_principal.mapa_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Google Maps
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="produtos" className="mt-4">
          <Top10ProdutosCliente clienteId={cliente.id} />
        </TabsContent>

        <TabsContent value="canais" className="mt-4">
          <HistoricoOrigemCliente clienteId={cliente.id} compact={false} />
        </TabsContent>
      </Tabs>

      {/* Últimos Pedidos */}
      <Card className="border-0 shadow-sm mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            Últimos Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pedidos.length > 0 ? (
            <div className="space-y-2">
              {pedidos.slice(0, 5).map((pedido) => (
                <div key={pedido.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <div>
                    <p className="text-xs font-medium">{pedido.numero_pedido}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${
                      pedido.status === 'Entregue' ? 'bg-green-100 text-green-700' :
                      pedido.status === 'Cancelado' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {pedido.status}
                    </Badge>
                    <p className="text-xs font-semibold mt-1">
                      R$ {(pedido.valor_total || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">Nenhum pedido</p>
          )}
        </CardContent>
      </Card>

      {activeTab === 'historico_produtos' && (
        <div className="-mt-2">
          <HistoricoProdutosCliente clienteId={cliente.id} />
        </div>
      )}
    </div>
  );
}