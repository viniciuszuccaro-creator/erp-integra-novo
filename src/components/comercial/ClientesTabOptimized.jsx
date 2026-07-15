import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, Plus, Edit, TrendingUp, AlertCircle, MoreVertical } from 'lucide-react';
import { useCountEntities } from '@/components/lib/useCountEntities';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import PaginationControls from '@/components/ui/PaginationControls';

/**
 * V22.0 - ClientesTab Otimizado para Grandes Volumes
 * Suporta até 25.000+ clientes com paginação server-side e contagem eficiente
 */
export default function ClientesTabOptimized({ onEdit, onCreate }) {
  const queryClient = useQueryClient();
  const { empresaAtual, getFiltroContexto } = useContextoVisual();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Filtro base multiempresa
  const filtroBase = getFiltroContexto('empresa_id', true);

  // Contagem total otimizada
  const { count: totalClientes, isLoading: loadingCount } = useCountEntities(
    'Cliente',
    filtroBase,
    { staleTime: 60000 }
  );

  // Busca paginada SERVER-SIDE
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes-paginados', currentPage, itemsPerPage, empresaAtual?.id],
    queryFn: async () => {
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const { data } = await base44.functions.invoke('entityListSorted', {
          entityName: 'Cliente',
          filter: filtroBase,
          sortField: 'updated_date',
          sortDirection: 'desc',
          limit: itemsPerPage,
          skip
        });
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        return [];
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Filtros locais (aplicados após busca server-side)
  const clientesFiltrados = useMemo(() => {
    let resultado = clientes;

    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(c => {
        const matchNome = (c.nome || '').toLowerCase().includes(termo) ||
          (c.razao_social || '').toLowerCase().includes(termo) ||
          (c.nome_fantasia || '').toLowerCase().includes(termo);
        
        const matchDocumento = (c.cnpj || '').includes(termo) ||
          (c.cpf || '').includes(termo) ||
          (c.rg || '').includes(termo);
        
        const matchContato = c.contatos?.some(ct => 
          (ct.nome || '').toLowerCase().includes(termo) ||
          (ct.valor || '').includes(termo)
        );
        
        const matchOutros = (c.vendedor_responsavel || '').toLowerCase().includes(termo) ||
          (c.indicador_nome || '').toLowerCase().includes(termo) ||
          (c.ramo_atividade || '').toLowerCase().includes(termo) ||
          (c.segmento_cliente_id || '').toLowerCase().includes(termo) ||
          (c.regiao_atendimento_nome || '').toLowerCase().includes(termo) ||
          (c.observacoes || '').toLowerCase().includes(termo) ||
          (c.endereco_principal?.cidade || '').toLowerCase().includes(termo) ||
          (c.endereco_principal?.bairro || '').toLowerCase().includes(termo);
        
        return matchNome || matchDocumento || matchContato || matchOutros;
      });
    }

    if (statusFilter !== 'todos') {
      resultado = resultado.filter(c => c.status === statusFilter);
    }

    return resultado;
  }, [clientes, searchTerm, statusFilter]);

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-gray-100 text-gray-700',
    'Prospect': 'bg-blue-100 text-blue-700',
    'Bloqueado': 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {/* Header com Estatísticas */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Clientes - Sistema Escalável</span>
            </div>
            <Badge className="bg-blue-600 text-white text-lg px-4 py-1">
              {loadingCount ? '...' : totalClientes.toLocaleString('pt-BR')} clientes
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-1">Ativos</p>
              <p className="text-2xl font-bold text-green-900">
                {clientes.filter(c => c.status === 'Ativo').length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Prospects</p>
              <p className="text-2xl font-bold text-blue-900">
                {clientes.filter(c => c.status === 'Prospect').length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 mb-1">Total Paginado</p>
              <p className="text-2xl font-bold text-purple-900">{clientes.length}</p>
            </div>
            <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-xs text-cyan-700 mb-1">Taxa Conversão</p>
              <p className="text-2xl font-bold text-cyan-900">
                {((clientes.filter(c => c.status === 'Ativo').length / (totalClientes || 1)) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, razão, CPF, CNPJ, telefone, vendedor, região, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="todos">Todos Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Prospect">Prospect</option>
          <option value="Inativo">Inativo</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>
        {onCreate && (
          <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700" data-sensitive>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* Lista de Clientes */}
      <div className="flex-1 overflow-auto">
        {loadingClientes ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {clientesFiltrados.map(cliente => (
              <Card key={cliente.id} className="border hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {cliente.nome || cliente.razao_social}
                        </h3>
                        <Badge className={statusColors[cliente.status]}>
                          {cliente.status}
                        </Badge>
                      </div>
                      <div className="flex gap-3 text-xs text-slate-600">
                        {cliente.cnpj && <span>CNPJ: {cliente.cnpj}</span>}
                        {cliente.cpf && <span>CPF: {cliente.cpf}</span>}
                        {cliente.cidade && <span>📍 {cliente.cidade}</span>}
                      </div>
                    </div>
                    {onEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(cliente)}
                          data-sensitive
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(cliente)}>Ver</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      <PaginationControls
        currentPage={currentPage}
        totalItems={totalClientes}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        isLoading={loadingClientes || loadingCount}
      />
    </div>
  );
}