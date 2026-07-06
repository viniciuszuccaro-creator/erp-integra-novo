import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Truck, MapPin, CheckCircle2, Package, Search, Eye,
  Bell, BarChart3, Route, Zap, Navigation, FileText
} from "lucide-react";
import { toast } from "sonner";
import DashboardLogisticaInteligente from "../logistica/DashboardLogisticaInteligente";
import NotificadorAutomaticoEntrega from "../logistica/NotificadorAutomaticoEntrega";
import MapaRoteirizacaoIA from "../logistica/MapaRoteirizacaoIA";
import ComprovanteEntregaDigital from "../logistica/ComprovanteEntregaDigital";
import RegistroOcorrenciaLogistica from "../logistica/RegistroOcorrenciaLogistica";
import IntegracaoRomaneio from "../logistica/IntegracaoRomaneio";
import PainelMetricasRealtime from "../logistica/PainelMetricasRealtime";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { usePermissoesLogistica } from "../logistica/ControleAcessoLogistica";
import PedidosEntregaKPIs from "./pedidos-entrega/PedidosEntregaKPIs";
import PedidosEntregaFiltros from "./pedidos-entrega/PedidosEntregaFiltros";
import PedidosEntregaDetalhesDialog from "./pedidos-entrega/PedidosEntregaDetalhesDialog";

/**
 * 🚚 PEDIDOS PARA ENTREGA V21.5
 * Refatorado: KPIs, Filtros e Dialog de Detalhes extraídos para componentes
 */
export default function PedidosEntregaTab({ windowMode = false }) {
  const [busca, setBusca] = useState("");
  const [regiaoFiltro, setRegiaoFiltro] = useState("todas");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [entregaSelecionada, setEntregaSelecionada] = useState(null);
  const [notificadorOpen, setNotificadorOpen] = useState(false);
  const [comprovanteOpen, setComprovanteOpen] = useState(false);
  const [ocorrenciaOpen, setOcorrenciaOpen] = useState(false);
  const [romaneioOpen, setRomaneioOpen] = useState(false);

  const queryClient = useQueryClient();
  const { openWindow } = useWindow();
  const permissoes = usePermissoesLogistica();
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', contextoKey],
    queryFn: () => filterInContext('Pedido', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas', contextoKey],
    queryFn: () => filterInContext('Entrega', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const pedidosParaEntrega = useMemo(() => {
    return pedidos.filter(p =>
      (p.tipo_frete === 'CIF' || p.tipo_frete === 'FOB') &&
      ['Aprovado', 'Pronto para Faturar', 'Faturado', 'Em Expedição', 'Em Trânsito'].includes(p.status)
    );
  }, [pedidos]);

  const pedidosPorRegiao = useMemo(() => {
    const grupos = {};
    pedidosParaEntrega.forEach(pedido => {
      const regiao = pedido.endereco_entrega_principal?.cidade || 'Sem Região';
      if (!grupos[regiao]) grupos[regiao] = [];
      grupos[regiao].push(pedido);
    });
    return grupos;
  }, [pedidosParaEntrega]);

  const pedidosFiltrados = useMemo(() => {
    let resultado = pedidosParaEntrega;
    if (busca) {
      resultado = resultado.filter(p =>
        p.numero_pedido?.toLowerCase().includes(busca.toLowerCase()) ||
        p.cliente_nome?.toLowerCase().includes(busca.toLowerCase())
      );
    }
    if (statusFiltro !== "todos") {
      resultado = resultado.filter(p => p.status === statusFiltro);
    }
    if (regiaoFiltro !== "todas") {
      resultado = resultado.filter(p => (p.endereco_entrega_principal?.cidade || 'Sem Região') === regiaoFiltro);
    }
    return resultado;
  }, [pedidosParaEntrega, busca, statusFiltro, regiaoFiltro]);

  const handleVerDetalhes = (pedido) => {
    const entrega = entregas.find(e => e.pedido_id === pedido.id);
    setEntregaSelecionada({ pedido, entrega });
    setDetalhesOpen(true);
  };

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-7 h-7 text-blue-600" />
              Logística de Entrega
            </h2>
            <p className="text-slate-600 text-sm">Pedidos aprovados aguardando entrega</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button data-permission="Expedicao.Entrega.visualizar" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => openWindow(PainelMetricasRealtime, { windowMode: true }, { title: '⚡ Métricas em Tempo Real', width: 1100, height: 650 })}>
              <Zap className="w-4 h-4 mr-2" /> Tempo Real
            </Button>
            <Button data-permission="Expedicao.Entrega.visualizar" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => openWindow(DashboardLogisticaInteligente, { windowMode: true }, { title: '📊 Dashboard Logística IA', width: 1200, height: 700 })}>
              <BarChart3 className="w-4 h-4 mr-2" /> Analytics IA
            </Button>
            <Button data-permission="Expedicao.Roteirizacao.criar" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => openWindow(MapaRoteirizacaoIA, { windowMode: true }, { title: '🗺️ Roteirização Inteligente', width: 1000, height: 700 })}>
              <Route className="w-4 h-4 mr-2" /> 🤖 Otimizar Rotas
            </Button>
            {permissoes.podeCriarRomaneio && (
              <Button data-permission="Expedicao.Romaneio.criar" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={() => setRomaneioOpen(true)}>
                <FileText className="w-4 h-4 mr-2" /> Criar Romaneio
              </Button>
            )}
          </div>
        </div>

        <PedidosEntregaKPIs pedidosParaEntrega={pedidosParaEntrega} pedidosPorRegiao={pedidosPorRegiao} />
        <PedidosEntregaFiltros busca={busca} setBusca={setBusca} regiaoFiltro={regiaoFiltro} setRegiaoFiltro={setRegiaoFiltro}
          statusFiltro={statusFiltro} setStatusFiltro={setStatusFiltro} pedidosPorRegiao={pedidosPorRegiao} />

        {/* Tabela principal */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Região</TableHead>
                  <TableHead>Valor</TableHead><TableHead>Previsão</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosFiltrados.map(pedido => {
                  const regiao = pedido.endereco_entrega_principal?.cidade || 'Sem Região';
                  const entrega = entregas.find(e => e.pedido_id === pedido.id);
                  return (
                    <TableRow key={pedido.id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                      <TableCell>{pedido.cliente_nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />{regiao}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-sm">
                        {pedido.data_prevista_entrega ? new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          pedido.status === 'Entregue' ? 'bg-green-600' :
                          pedido.status === 'Em Trânsito' ? 'bg-purple-600' :
                          pedido.status === 'Em Expedição' ? 'bg-orange-600' :
                          pedido.status === 'Faturado' ? 'bg-blue-600' :
                          pedido.status === 'Pronto para Faturar' ? 'bg-indigo-600' : 'bg-slate-600'
                        }>
                          {pedido.status === 'Entregue' ? '✅ Entregue' : pedido.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" data-permission="Comercial.Pedido.visualizar" onClick={() => handleVerDetalhes(pedido)}>
                            <Eye className="w-4 h-4 mr-1" /> Ver
                          </Button>
                          <Button size="sm" variant="outline" data-permission="Comercial.Pedido.notificar"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => { setEntregaSelecionada({ pedido, entrega }); setNotificadorOpen(true); }}>
                            <Bell className="w-4 h-4 mr-1" /> Notificar
                          </Button>
                          {pedido.status === 'Em Trânsito' && permissoes.podeConfirmarEntrega && (
                            <Button data-permission="Comercial.PedidosEntrega.confirmar" size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => { setEntregaSelecionada({ pedido, entrega }); setComprovanteOpen(true); }}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Confirmar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {pedidosFiltrados.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum pedido para entrega encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={notificadorOpen} onOpenChange={setNotificadorOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            {entregaSelecionada && <NotificadorAutomaticoEntrega pedido={entregaSelecionada.pedido} entrega={entregaSelecionada.entrega} onClose={() => setNotificadorOpen(false)} />}
          </DialogContent>
        </Dialog>

        <Dialog open={comprovanteOpen} onOpenChange={setComprovanteOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            {entregaSelecionada && (
              <ComprovanteEntregaDigital pedido={entregaSelecionada.pedido} entrega={entregaSelecionada.entrega}
                onSuccess={() => { setComprovanteOpen(false); setDetalhesOpen(false); }} />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={ocorrenciaOpen} onOpenChange={setOcorrenciaOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            {entregaSelecionada && <RegistroOcorrenciaLogistica pedido={entregaSelecionada.pedido} entrega={entregaSelecionada.entrega} onClose={() => setOcorrenciaOpen(false)} />}
          </DialogContent>
        </Dialog>

        <Dialog open={romaneioOpen} onOpenChange={setRomaneioOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <IntegracaoRomaneio pedidosSelecionados={pedidosFiltrados} onClose={() => setRomaneioOpen(false)} />
          </DialogContent>
        </Dialog>

        <PedidosEntregaDetalhesDialog
          open={detalhesOpen}
          onOpenChange={setDetalhesOpen}
          entregaSelecionada={entregaSelecionada}
          permissoes={permissoes}
          entregas={entregas}
        />
      </div>
    </div>
  );
}