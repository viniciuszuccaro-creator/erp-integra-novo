import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MovimentacaoForm from "./MovimentacaoForm";
import { useWindow } from "@/components/lib/useWindow";
import useRLS from "@/components/lib/useRLS";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";
import { useUser } from "@/components/lib/UserContext";

export default function MovimentacoesTab({ movimentacoes, produtos }) {
  const { user: authUser } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { openWindow } = useWindow();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { create: createRLS, update: updateRLS } = useRLS();
  const { canCreate } = usePermissions();
  const contextoValido = Boolean(empresaAtual?.id || grupoAtual?.id);
  const canCreateMovimentacao = canCreate('Estoque', 'Movimentações') || canCreate('Estoque', 'Movimentacoes');
  const { data: movsBackend = [] } = useRLSQuery('MovimentacaoEstoque', {}, '-data_movimentacao', 500);
  const movList = Array.isArray(movimentacoes) && movimentacoes.length ? movimentacoes : movsBackend;
  const [novaMovimentacao, setNovaMovimentacao] = useState({
    tipo_movimentacao: "",
    produto_id: "",
    produto_nome: "",
    quantidade: "",
    unidade_medida: "",
    data_movimentacao: new Date().toISOString().split('T')[0],
    documento_referencia: "",
    observacoes: "",
    responsavel: ""
  });

  const queryClient = useQueryClient();

  const resetForm = () => {
    setNovaMovimentacao({
      tipo_movimentacao: "",
      produto_id: "",
      produto_nome: "",
      quantidade: "",
      unidade_medida: "",
      data_movimentacao: new Date().toISOString().split('T')[0],
      documento_referencia: "",
      observacoes: "",
      responsavel: ""
    });
  };

  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setNovaMovimentacao({
        ...novaMovimentacao,
        produto_id: produtoId,
        produto_nome: produto.descricao,
        unidade_medida: produto.unidade_medida
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!canCreateMovimentacao) {
        throw new Error("Sem permissao para criar movimentacao de estoque.");
      }
      const movimentacaoData = {
        tipo_movimentacao: data.tipo_movimentacao,
        produto_id: data.produto_id,
        produto_descricao: data.produto_nome,
        quantidade: parseFloat(data.quantidade),
        data_movimentacao: data.data_movimentacao,
        documento_referencia: data.documento_referencia,
        observacoes: data.observacoes,
        responsavel: data.responsavel
      };

      const novaMovimentacao = await createRLS('MovimentacaoEstoque', movimentacaoData);
      
      const produto = produtos.find(p => p.id === data.produto_id);
      if (produto) {
        const qtd = parseFloat(data.quantidade);
        let novoEstoque = produto.estoque_atual || 0;
        
        if (data.tipo_movimentacao === 'Entrada' || data.tipo_movimentacao === 'Devolução') {
          novoEstoque += qtd;
        } else if (data.tipo_movimentacao === 'Saída') {
          novoEstoque -= qtd;
        } else if (data.tipo_movimentacao === 'Ajuste') {
          novoEstoque = qtd;
        } else if (data.tipo_movimentacao === 'Inventário') {
          novoEstoque = qtd;
        }
        
        await updateRLS('Produto', produto.id, {
          estoque_atual: novoEstoque
        });
      }
      
      return novaMovimentacao;
    },
    onSuccess: async (novaMov) => {
      await queryClient.invalidateQueries({ queryKey: ['MovimentacaoEstoque'] });
      await queryClient.invalidateQueries({ queryKey: ['Produto'] });
      
      setIsDialogOpen(false);
      resetForm();
      try {
        if (novaMov?.id) {
          await base44.entities.AuditLog.create({
            acao: 'Criação', modulo: 'Estoque', entidade: 'MovimentacaoEstoque', registro_id: novaMov.id,
            usuario: authUser?.full_name || authUser?.email, usuario_id: authUser?.id,
            descricao: 'Movimentação registrada', dados_novos: novaMov,
            data_hora: new Date().toISOString(), sucesso: true
          });
        }
      } catch (_) {}
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await base44.auth.me();
    
    createMutation.mutate({
      ...novaMovimentacao,
      responsavel: novaMovimentacao.responsavel || user?.full_name || 'Sistema'
    });
  };

  const filteredMovimentacoes = movList.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    return m.produto_nome?.toLowerCase().includes(searchLower) ||
      m.produto_descricao?.toLowerCase().includes(searchLower) ||
      m.codigo_produto?.toLowerCase().includes(searchLower) ||
      m.tipo_movimentacao?.toLowerCase().includes(searchLower) ||
      m.tipo_movimento?.toLowerCase().includes(searchLower) ||
      m.origem_movimento?.toLowerCase().includes(searchLower) ||
      m.documento?.toLowerCase().includes(searchLower) ||
      m.motivo?.toLowerCase().includes(searchLower) ||
      m.responsavel?.toLowerCase().includes(searchLower) ||
      m.centro_custo_nome?.toLowerCase().includes(searchLower) ||
      m.localizacao_origem?.toLowerCase().includes(searchLower) ||
      m.localizacao_destino?.toLowerCase().includes(searchLower) ||
      m.lote?.toLowerCase().includes(searchLower) ||
      m.observacoes?.toLowerCase().includes(searchLower);
  });

  const tipoIcons = {
    'Entrada': <ArrowDown className="w-4 h-4 text-green-600" />,
    'Saída': <ArrowUp className="w-4 h-4 text-red-600" />,
    'Ajuste': <RefreshCw className="w-4 h-4 text-blue-600" />,
    'Inventário': <RefreshCw className="w-4 h-4 text-purple-600" />,
    'Devolução': <ArrowDown className="w-4 h-4 text-orange-600" />
  };

  const tipoColors = {
    'Entrada': 'bg-green-100 text-green-700',
    'Saída': 'bg-red-100 text-red-700',
    'Ajuste': 'bg-blue-100 text-blue-700',
    'Inventário': 'bg-purple-100 text-purple-700',
    'Devolução': 'bg-orange-100 text-orange-700'
  };

  return (
    <div className="w-full h-full overflow-y-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-md mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por produto, código, tipo, movimento, documento, lote, responsável, centro custo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {canCreateMovimentacao && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            data-permission="Estoque.Movimentacoes.criar"
            data-sensitive="true"
            disabled={!contextoValido}
            onClick={() => openWindow(MovimentacaoForm, {
            windowMode: true,
            canSubmit: canCreateMovimentacao && contextoValido,
            onSubmit: async (data) => {
              try {
                const user = await base44.auth.me();
                await createMutation.mutateAsync({
                  ...data,
                  responsavel: data.responsavel || user?.full_name || 'Sistema'
                });
                toast.success("✅ Movimentação registrada!");
              } catch (error) {
                toast.error("Erro ao registrar movimentação");
              }
            }
          }, {
            title: '📦 Nova Movimentação',
            width: 900,
            height: 600
          })}
        >
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        )}
        
      </div>

      <Card className="border-0 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovimentacoes.map((mov) => (
                <TableRow key={mov.id} className="hover:bg-slate-50">
                  <TableCell>
                    {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tipoIcons[mov.tipo_movimentacao]}
                      <Badge className={tipoColors[mov.tipo_movimentacao]}>
                        {mov.tipo_movimentacao}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{mov.produto_nome || mov.produto_descricao}</TableCell>
                  <TableCell>
                    {mov.tipo_movimentacao === 'Entrada' || mov.tipo_movimentacao === 'Devolução' ? '+' : 
                     mov.tipo_movimentacao === 'Saída' ? '-' : ''}
                    {mov.quantidade} {mov.unidade_medida}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{mov.documento_referencia || '-'}</TableCell>
                  <TableCell>{mov.responsavel || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMovimentacoes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Nenhuma movimentação encontrada.</p>
          </div>
        )}
      </Card>
    </div>
  );
}