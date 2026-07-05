import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Check,
  Package,
  DollarSign,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.6 - CRIAR PEDIDO DIRETO DO CHAT
 * 
 * Permite ao atendente criar pedidos durante o chat:
 * ✅ Busca de produtos em tempo real
 * ✅ Carrinho simplificado
 * ✅ Cálculo automático de totais
 * ✅ Vinculação com a conversa
 * ✅ Aplicação de tabela de preço do cliente
 */
export default function CriarPedidoChat({ conversa, clienteId, onPedidoCriado }) {
  const [carrinho, setCarrinho] = useState([]);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const queryClient = useQueryClient();
  const { empresaAtual, filterInContext, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  // Buscar cliente
  const { data: cliente } = useQuery({
    queryKey: ['cliente-chat', clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      const clientes = await base44.entities.Cliente.filter({ id: clienteId });
      return clientes[0];
    },
    enabled: !!clienteId
  });

  // Buscar produtos
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos-busca', buscaProduto, contextoKey],
    queryFn: async () => {
      if (!buscaProduto || buscaProduto.length < 2) return [];
      const todos = await filterInContext('Produto', {}, 'descricao', 999);
      return todos.filter(p => 
        p.descricao?.toLowerCase().includes(buscaProduto.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(buscaProduto.toLowerCase())
      ).slice(0, 10);
    },
    enabled: buscaProduto.length >= 2 && !!contexto
  });

  // Criar pedido
  const criarPedidoMutation = useMutation({
    mutationFn: async () => {
      if (carrinho.length === 0) throw new Error('Carrinho vazio');

      const valorTotal = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
      const pesoTotal = carrinho.reduce((sum, item) => sum + ((item.peso || 0) * item.quantidade), 0);

      // Gerar número do pedido
      const pedidos = await base44.entities.Pedido.list('-created_date', 1);
      const ultimoNumero = pedidos[0]?.numero_pedido?.replace('PED-', '') || '0';
      const novoNumero = `PED-${String(parseInt(ultimoNumero) + 1).padStart(6, '0')}`;

      // Criar pedido
      const pedido = await base44.entities.Pedido.create({
        numero_pedido: novoNumero,
        tipo: 'Pedido',
        origem_pedido: 'Chatbot',
        empresa_id: empresaAtual?.id,
        cliente_id: clienteId,
        cliente_nome: cliente?.nome || conversa?.cliente_nome,
        cliente_cpf_cnpj: cliente?.cpf || cliente?.cnpj,
        vendedor: 'Chatbot',
        data_pedido: new Date().toISOString().split('T')[0],
        itens_revenda: carrinho.map(item => ({
          produto_id: item.id,
          produto_descricao: item.descricao,
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidade: item.unidade || 'UN',
          preco_unitario: item.preco,
          valor_unitario: item.preco,
          valor_total: item.preco * item.quantidade
        })),
        valor_produtos: valorTotal,
        valor_total: valorTotal,
        peso_total_kg: pesoTotal,
        status: 'Rascunho',
        observacoes_internas: `Pedido criado via Chat - Conversa ${conversa?.sessao_id}`,
        prioridade: 'Normal'
      });

      // Vincular pedido à conversa
      if (conversa?.id) {
        await base44.entities.ConversaOmnicanal.update(conversa.id, {
          pedido_gerado_id: pedido.id,
          acoes_automaticas_executadas: [
            ...(conversa.acoes_automaticas_executadas || []),
            {
              acao: 'criar_pedido',
              data: new Date().toISOString(),
              resultado: `Pedido ${novoNumero} criado`
            }
          ]
        });
      }

      return pedido;
    },
    onSuccess: (pedido) => {
      toast.success('Pedido criado com sucesso!', {
        description: `Número: ${pedido.numero_pedido}`
      });
      setCarrinho([]);
      onPedidoCriado?.(pedido);
      queryClient.invalidateQueries({ queryKey: ['conversas-omnicanal'] });
    },
    onError: (error) => {
      toast.error('Erro ao criar pedido', { description: error.message });
    }
  });

  const adicionarAoCarrinho = (produto) => {
    const existente = carrinho.find(item => item.id === produto.id);
    if (existente) {
      setCarrinho(carrinho.map(item => 
        item.id === produto.id 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      setCarrinho([...carrinho, {
        id: produto.id,
        descricao: produto.descricao,
        codigo: produto.codigo,
        preco: produto.preco_venda || 0,
        peso: produto.peso_liquido_kg || 0,
        unidade: produto.unidade_medida,
        quantidade: 1
      }]);
    }
    setBuscaProduto('');
    setMostrarBusca(false);
    toast.success('Produto adicionado!');
  };

  const atualizarQuantidade = (produtoId, delta) => {
    setCarrinho(carrinho.map(item => {
      if (item.id === produtoId) {
        const novaQtd = Math.max(1, item.quantidade + delta);
        return { ...item, quantidade: novaQtd };
      }
      return item;
    }));
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho(carrinho.filter(item => item.id !== produtoId));
  };

  const valorTotal = carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          Criar Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dados do Cliente */}
        {cliente && (
          <div className="p-3 bg-slate-50 rounded-lg text-sm">
            <p className="font-semibold">{cliente.nome}</p>
            <p className="text-slate-600">{cliente.cpf || cliente.cnpj}</p>
            {cliente.condicao_comercial?.tabela_preco_nome && (
              <Badge variant="outline" className="mt-1 text-xs">
                {cliente.condicao_comercial.tabela_preco_nome}
              </Badge>
            )}
          </div>
        )}

        {/* Busca de Produtos */}
        <div className="relative">
          <Input
            placeholder="Buscar produto por nome ou código..."
            value={buscaProduto}
            onChange={(e) => {
              setBuscaProduto(e.target.value);
              setMostrarBusca(true);
            }}
            onFocus={() => setMostrarBusca(true)}
          />
          
          {mostrarBusca && produtos.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {produtos.map(produto => (
                <button
                  key={produto.id}
                  onClick={() => adicionarAoCarrinho(produto)}
                  className="w-full p-3 text-left hover:bg-blue-50 border-b last:border-0 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{produto.descricao}</p>
                      <p className="text-xs text-slate-500">{produto.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {(produto.preco_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Estoque: {produto.estoque_atual || 0}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Carrinho */}
        {carrinho.length > 0 ? (
          <div className="space-y-2">
            {carrinho.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.descricao}</p>
                  <p className="text-xs text-slate-500">
                    R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {item.unidade}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    data-permission="Comercial.Pedido.editar"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => atualizarQuantidade(item.id, -1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-bold">{item.quantidade}</span>
                  <Button
                    data-permission="Comercial.Pedido.editar"
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => atualizarQuantidade(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <p className="text-sm font-bold text-green-600 w-20 text-right">
                  R$ {(item.preco * item.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>

                <Button
                  data-permission="Comercial.Pedido.editar"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removerDoCarrinho(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Total */}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <span className="font-semibold text-blue-900">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Botão Criar */}
            <Button
              data-permission="Comercial.Pedido.criar"
              onClick={() => criarPedidoMutation.mutate()}
              disabled={criarPedidoMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {criarPedidoMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Criar Pedido ({carrinho.length} itens)
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Busque produtos para adicionar ao pedido</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}