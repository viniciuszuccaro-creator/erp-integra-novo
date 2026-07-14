/**
 * B2BOrderManagement v1.0
 * Sistema de pedidos B2B para fornecedores gerarem pedidos para clientes
 * Regra-Mãe: multi-empresa, controle de acesso, IA de recomendações
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Download } from 'lucide-react';
import usePermissions from "@/components/lib/usePermissions";

const PEDIDOS_B2B = [
  {
    id: 'ORD-001',
    cliente: 'Cliente A',
    data: '2026-05-31',
    valor: 5432,
    status: 'confirmado',
    itens: 12,
    prazo: '5 dias',
  },
  {
    id: 'ORD-002',
    cliente: 'Cliente B',
    data: '2026-05-30',
    valor: 3210,
    status: 'em_processamento',
    itens: 8,
    prazo: '3 dias',
  },
  {
    id: 'ORD-003',
    cliente: 'Cliente C',
    data: '2026-05-29',
    valor: 7890,
    status: 'entregue',
    itens: 15,
    prazo: 'entregue',
  },
];

export default function B2BOrderManagement() {
  const [pedidos] = useState(PEDIDOS_B2B);
  const [filtro, setFiltro] = useState('todos');
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission?.("Comercial.Pedido.criar") ?? true;
  const canExport = hasPermission?.("Comercial.Pedido.exportar") ?? true;

  const getStatusColor = (status) => {
    const colors = {
      confirmado: 'bg-blue-100 text-blue-800',
      em_processamento: 'bg-amber-100 text-amber-800',
      entregue: 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  const statusLabels = {
    confirmado: '✅ Confirmado',
    em_processamento: '⏳ Processando',
    entregue: '📦 Entregue',
  };

  const pedidosFiltrados = filtro === 'todos' ? pedidos : pedidos.filter((p) => p.status === filtro);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          📦 Gerenciamento de Pedidos
        </h2>
        <Button disabled={!canCreate} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4 rounded-lg bg-white border border-slate-200">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar pedido ou cliente..."
              className="bg-transparent text-sm outline-none flex-1"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2" disabled>
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button variant="outline" className="flex items-center gap-2" disabled>
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </Card>

      {/* Tabs de Status */}
      <Tabs value={filtro} onValueChange={setFiltro} className="w-full">
        <TabsList className="w-full rounded-lg bg-white border border-slate-200">
          {[
            { value: 'todos', label: 'Todos', count: pedidos.length },
            { value: 'confirmado', label: 'Confirmados', count: pedidos.filter((p) => p.status === 'confirmado').length },
            { value: 'em_processamento', label: 'Processando', count: pedidos.filter((p) => p.status === 'em_processamento').length },
            { value: 'entregue', label: 'Entregues', count: pedidos.filter((p) => p.status === 'entregue').length },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-blue-100">
              {tab.label} ({tab.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filtro} className="mt-4">
          <div className="space-y-3">
            {pedidosFiltrados.map((pedido) => (
              <Card key={pedido.id} className="p-4 rounded-lg bg-white border border-slate-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{pedido.id}</p>
                    <p className="text-sm text-slate-600 mt-1">{pedido.cliente}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(pedido.status)}`}>
                    {statusLabels[pedido.status]}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-slate-600">Valor</p>
                    <p className="font-semibold text-slate-900">R$ {pedido.valor.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Itens</p>
                    <p className="font-semibold text-slate-900">{pedido.itens}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Data</p>
                    <p className="font-semibold text-slate-900">{new Date(pedido.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Prazo</p>
                    <p className="font-semibold text-slate-900">{pedido.prazo}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled>
                   Visualizar
                  </Button>
                   <Button size="sm" variant="outline" disabled>
                   Editar
                  </Button>
                   <Button size="sm" variant="outline" disabled>
                   Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">Nenhum pedido encontrado</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}