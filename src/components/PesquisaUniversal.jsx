import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Target, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { SEARCH_ENTITIES, filterFunctions, resultMappers } from './PesquisaUniversal/searchFilters';

/**
 * Pesquisa Universal (Ctrl+K)
 * Busca em todas as entidades do sistema
 * V21.7: Integrada com sistema multiempresa + Debounce para evitar rate limit
 * V22.1: Filtros e mapeamentos extraídos para searchFilters.jsx
 */
export default function PesquisaUniversal({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const navigate = useNavigate();
  const { filterInContext, estaNoGrupo, empresaAtual } = useContextoVisual();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length >= 2) {
        buscar();
      } else {
        setResultados([]);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [query]);

  const buscar = async () => {
    setBuscando(true);

    try {
      const q = query.toLowerCase();

      // Buscar em paralelo com filterInContext (server-side, multi-tenant)
      const allData = await Promise.all(
        SEARCH_ENTITIES.map((entity) =>
          filterInContext(entity, {}, '-created_date', 100).catch(() => [])
        )
      );

      // Aplicar filtro textual para cada entidade usando as funções extraídas
      const filteredResults = SEARCH_ENTITIES.map((entity, idx) => {
        const fn = filterFunctions[entity];
        const mapper = resultMappers[entity];
        if (!fn || !mapper) return [];
        return fn(allData[idx] || [], q).map(mapper);
      });

      setResultados(filteredResults.flat());
    } catch (error) {
      console.error('Erro ao buscar:', error);
    } finally {
      setBuscando(false);
    }
  };

  const handleSelect = (resultado) => {
    navigate(resultado.url);
    onOpenChange(false);
    setQuery('');
  };

  const cores = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    slate: 'bg-slate-100 text-slate-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar em TODOS os módulos: nome, CPF, CNPJ, email, telefone, descrição..."
              className="pl-10 text-lg border-0 focus-visible:ring-0"
              autoFocus
            />
            {buscando && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5 animate-spin" />
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {resultados.length > 0 ? (
            <div className="space-y-1">
              {resultados.map((resultado, idx) => {
                const Icon = resultado.icone;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(resultado)}
                    className="w-full text-left p-3 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-3"
                  >
                    <div className={`p-2 rounded-lg ${cores[resultado.cor]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{resultado.titulo}</p>
                        <Badge variant="outline" className="text-xs">
                          {resultado.tipo}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{resultado.subtitulo}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 && !buscando ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum resultado encontrado para "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Digite para buscar em TODO o sistema (14+ módulos)</p>
              <p className="text-xs mt-2">Clientes • Pedidos • Produtos • Entregas • Fornecedores • OPs • Colaboradores • Pagar • Receber • Oportunidades • NF-e • OCs • Interações • Transportadoras • Comissões • Campanhas • Eventos • Contratos • Sol. Compra • Movimentações • Representantes • Centros Custo</p>
            </div>
          )}
        </div>

        <div className="border-t p-3 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>↑↓ Navegar</span>
              <span>↵ Selecionar</span>
              <span>Esc Fechar</span>
            </div>
            <div className="flex items-center gap-2">
              {estaNoGrupo ? (
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  Todas Empresas
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {empresaAtual?.nome_fantasia || 'Empresa Atual'}
                </Badge>
              )}
              <span>{resultados.length} resultado(s)</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}