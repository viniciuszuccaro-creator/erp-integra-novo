import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, Search, Plus, Edit, TrendingUp, Star } from 'lucide-react';
import { useCountEntities } from '@/components/lib/useCountEntities';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import PaginationControls from '@/components/ui/PaginationControls';

/**
 * V22.0 - FornecedoresTab Otimizado para Grandes Volumes
 * Suporta milhares de fornecedores com paginação server-side e contagem eficiente
 */
export default function FornecedoresTabOptimized({ onEdit, onCreate }) {
  const { empresaAtual, getFiltroContexto } = useContextoVisual();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filtroBase = getFiltroContexto('empresa_dona_id', true);

  // Contagem total otimizada
  const { count: totalFornecedores, isLoading: loadingCount } = useCountEntities(
    'Fornecedor',
    filtroBase,
    { staleTime: 60000 }
  );

  // Busca paginada
  const { data: fornecedores = [], isLoading: loadingFornecedores } = useQuery({
    queryKey: ['fornecedores-paginados', currentPage, itemsPerPage, empresaAtual?.id],
    queryFn: async () => {
      try {
        const skip = (currentPage - 1) * itemsPerPage;
        const { data } = await base44.functions.invoke('entityListSorted', {
          entityName: 'Fornecedor',
          filter: filtroBase,
          sortField: 'updated_date',
          sortDirection: 'desc',
          limit: itemsPerPage,
          skip
        });
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
        return [];
      }
    },
    staleTime: 30000,
    retry: 2
  });

  // Filtros locais
  const fornecedoresFiltrados = useMemo(() => {
    let resultado = fornecedores;

    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(f => {
        const matchNome = (f.nome || '').toLowerCase().includes(termo) ||
          (f.razao_social || '').toLowerCase().includes(termo) ||
          (f.nome_fantasia || '').toLowerCase().includes(termo);
        
        const matchDocumento = (f.cnpj || '').includes(termo) ||
          (f.cpf || '').includes(termo);
        
        const matchContato = f.emails?.some(e => 
          (e.email || '').toLowerCase().includes(termo)
        ) || f.telefones?.some(t => 
          (t.numero || '').includes(termo)
        ) || (f.whatsapp || '').includes(termo) ||
          (f.contato_responsavel || '').toLowerCase().includes(termo);
        
        const matchOutros = (f.categoria || '').toLowerCase().includes(termo) ||
          (f.tipo_fornecedor || '').toLowerCase().includes(termo) ||
          (f.ramo_atividade || '').toLowerCase().includes(termo) ||
          (f.cnae_principal || '').includes(termo) ||
          (f.observacoes || '').toLowerCase().includes(termo);
        
        return matchNome || matchDocumento || matchContato || matchOutros;
      });
    }

    if (statusFilter !== 'todos') {
      resultado = resultado.filter(f => 
        (f.status || f.status_fornecedor) === statusFilter
      );
    }

    return resultado;
  }, [fornecedores, searchTerm, statusFilter]);

  const statusColors = {
    'Ativo': 'bg-green-100 text-green-700',
    'Inativo': 'bg-gray-100 text-gray-700',
    'Em Análise': 'bg-yellow-100 text-yellow-700',
    'Bloqueado': 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {/* Header com Estatísticas */}
      <Card className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-cyan-600" />
              <span>Fornecedores - Base Completa</span>
            </div>
            <Badge className="bg-cyan-600 text-white text-lg px-4 py-1">
              {loadingCount ? '...' : totalFornecedores.toLocaleString('pt-BR')} fornecedores
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 mb-1">Ativos</p>
              <p className="text-2xl font-bold text-green-900">
                {fornecedores.filter(f => (f.status || f.status_fornecedor) === 'Ativo').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700 mb-1">Em Análise</p>
              <p className="text-2xl font-bold text-yellow-900">
                {fornecedores.filter(f => (f.status || f.status_fornecedor) === 'Em Análise').length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-1">Nota Média</p>
              <p className="text-2xl font-bold text-blue-900">
                {(fornecedores.reduce((sum, f) => sum + (f.nota_media || 0), 0) / (fornecedores.length || 1)).toFixed(1)}
                <Star className="w-4 h-4 inline ml-1 text-yellow-500" />
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 mb-1">Nesta Página</p>
              <p className="text-2xl font-bold text-purple-900">{fornecedores.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, razão, CNPJ, CPF, telefone, email, categoria, tipo..."
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
          <option value="Em Análise">Em Análise</option>
          <option value="Inativo">Inativo</option>
          <option value="Bloqueado">Bloqueado</option>
        </select>
        {onCreate && (
          <Button onClick={onCreate} className="bg-cyan-600 hover:bg-cyan-700" data-sensitive>
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto">
        {loadingFornecedores ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : fornecedoresFiltrados.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhum fornecedor encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {fornecedoresFiltrados.map(fornecedor => (
              <Card key={fornecedor.id} className="border hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {fornecedor.nome || fornecedor.razao_social}
                        </h3>
                        <Badge className={statusColors[fornecedor.status || fornecedor.status_fornecedor]}>
                          {fornecedor.status || fornecedor.status_fornecedor}
                        </Badge>
                        {fornecedor.nota_media >= 4 && (
                          <Badge className="bg-yellow-100 text-yellow-700">
                            ⭐ {fornecedor.nota_media.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-slate-600">
                        {fornecedor.cnpj && <span>CNPJ: {fornecedor.cnpj}</span>}
                        {fornecedor.categoria && <span>📦 {fornecedor.categoria}</span>}
                        {fornecedor.cidade && <span>📍 {fornecedor.cidade}</span>}
                      </div>
                    </div>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(fornecedor)}
                        data-sensitive
                      >
                        <Edit className="w-4 h-4 text-cyan-600" />
                      </Button>
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
        totalItems={totalFornecedores}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        isLoading={loadingFornecedores || loadingCount}
      />
    </div>
  );
}