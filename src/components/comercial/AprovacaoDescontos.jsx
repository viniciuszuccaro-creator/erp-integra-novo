import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingDown,
  User,
  Calendar,
  DollarSign,
  Percent,
  FileText
} from "lucide-react";
import { useUser } from "@/components/lib/UserContext";
import { toast } from "sonner";

/**
 * ETAPA 4 - Aprovação de Descontos V21.6 - DEPRECATED
 * ⚠️ ESTE COMPONENTE FOI SUBSTITUÍDO
 * 
 * NOVO COMPONENTE RECOMENDADO:
 * - CentralAprovacoesManager.jsx (V21.6)
 * 
 * RECURSOS DO NOVO:
 * - Aprovação + Fechamento automático
 * - Interface unificada (3 abas)
 * - Controle de acesso robusto
 * - Multi-empresa 100%
 * - w-full h-full responsivo
 * 
 * REGRA-MÃE: Mantido para compatibilidade
 */
export default function AprovacaoDescontos({ windowMode = false, empresaId = null }) {
  console.warn('⚠️ AprovacaoDescontos está DEPRECATED. Use CentralAprovacoesManager.jsx');
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [filtros, setFiltros] = useState({
    empresa_id: "",
    vendedor: "",
    cliente: ""
  });
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [decisao, setDecisao] = useState({
    acao: "", // 'aprovar', 'aprovar_parcial', 'rejeitar'
    desconto_ajustado_percentual: 0,
    comentarios: ""
  });

  // V21.6: Multi-empresa
  const { data: pedidosPendentes = [], isLoading } = useQuery({
    queryKey: ['pedidos-aprovacao', filtros, empresaId],
    queryFn: async () => {
      const pedidos = empresaId
        ? await base44.entities.Pedido.filter({ empresa_id: empresaId })
        : await base44.entities.Pedido.list();
      
      return pedidos.filter(p => 
        p.status_aprovacao === "pendente" &&
        (!filtros.empresa_id || p.empresa_id === filtros.empresa_id) &&
        (!filtros.vendedor || p.vendedor_id === filtros.vendedor) &&
        (!filtros.cliente || p.cliente_id === filtros.cliente)
      );
    }
  });

  // Mutation para aprovar/rejeitar
  const aprovarRejeitar = useMutation({
    mutationFn: async ({ pedidoId, acao, desconto_ajustado, comentarios }) => {
      const pedido = pedidosPendentes.find(p => p.id === pedidoId);
      
      let novoStatus = "";
      let descontoAprovado = pedido.desconto_solicitado_percentual;
      
      if (acao === "aprovar") {
        novoStatus = "aprovado";
        descontoAprovado = pedido.desconto_solicitado_percentual;
      } else if (acao === "aprovar_parcial") {
        novoStatus = "aprovado";
        descontoAprovado = desconto_ajustado;
      } else if (acao === "rejeitar") {
        novoStatus = "negado";
        descontoAprovado = 0;
      }

      // Atualizar pedido
      await base44.entities.Pedido.update(pedidoId, {
        status_aprovacao: novoStatus,
        desconto_aprovado_percentual: descontoAprovado,
        usuario_aprovador_id: user.id,
        data_aprovacao: new Date().toISOString(),
        comentarios_aprovacao: comentarios
      });

      // Registrar auditoria
      await base44.entities.AuditLog.create({
        group_id: pedido.group_id,
        empresa_id: pedido.empresa_id,
        usuario_id: user.id,
        usuario_nome: user.full_name,
        acao: `Aprovação de desconto - ${acao}`,
        modulo: "Comercial",
        entidade: "Pedido",
        entidade_id: pedidoId,
        detalhes: {
          desconto_solicitado: pedido.desconto_solicitado_percentual,
          desconto_aprovado: descontoAprovado,
          comentarios
        }
      });

      return { pedidoId, acao };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pedidos-aprovacao']);
      setPedidoSelecionado(null);
      setDecisao({ acao: "", desconto_ajustado_percentual: 0, comentarios: "" });
      toast.success("Decisão registrada com sucesso!");
    }
  });

  const handleAprovar = () => {
    if (!decisao.comentarios) {
      toast.error("Por favor, adicione um comentário explicando a aprovação");
      return;
    }
    aprovarRejeitar.mutate({
      pedidoId: pedidoSelecionado.id,
      acao: "aprovar",
      comentarios: decisao.comentarios
    });
  };

  const handleAprovarParcial = () => {
    if (!decisao.desconto_ajustado_percentual || decisao.desconto_ajustado_percentual <= 0) {
      toast.error("Informe o percentual de desconto ajustado");
      return;
    }
    if (!decisao.comentarios) {
      toast.error("Por favor, adicione um comentário explicando o ajuste");
      return;
    }
    aprovarRejeitar.mutate({
      pedidoId: pedidoSelecionado.id,
      acao: "aprovar_parcial",
      desconto_ajustado: decisao.desconto_ajustado_percentual,
      comentarios: decisao.comentarios
    });
  };

  const handleRejeitar = () => {
    if (!decisao.comentarios) {
      toast.error("Por favor, adicione um comentário explicando a rejeição");
      return;
    }
    aprovarRejeitar.mutate({
      pedidoId: pedidoSelecionado.id,
      acao: "rejeitar",
      comentarios: decisao.comentarios
    });
  };

  const content = (
    <div className="space-y-6">
      {/* V21.6: Alerta Deprecated */}
      <Card className="border-2 border-yellow-400 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900">
                ⚠️ Componente Legacy (V21.4)
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                Migre para <strong>CentralAprovacoesManager.jsx</strong> (V21.6) para acesso a fechamento automático integrado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            Aprovação de Descontos (Legacy)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Pedidos aguardando sua aprovação • ETAPA 4 • Use CentralAprovacoesManager para V21.6
          </p>
        </div>
        <Badge className="bg-orange-100 text-orange-800">
          {pedidosPendentes.length} pendentes
        </Badge>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Vendedor</Label>
              <Input 
                placeholder="Filtrar por vendedor"
                value={filtros.vendedor}
                onChange={(e) => setFiltros({...filtros, vendedor: e.target.value})}
              />
            </div>
            <div>
              <Label>Cliente</Label>
              <Input 
                placeholder="Filtrar por cliente"
                value={filtros.cliente}
                onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos Pendentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pedidosPendentes.map(pedido => (
          <Card 
            key={pedido.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              pedidoSelecionado?.id === pedido.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setPedidoSelecionado(pedido)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pedido #{pedido.numero || pedido.id.slice(0,8)}</CardTitle>
                <Badge className="bg-orange-100 text-orange-800">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  {pedido.desconto_solicitado_percentual}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Cliente:</span>
                <span className="font-medium">{pedido.cliente_nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Vendedor:</span>
                <span className="font-medium">{pedido.vendedor_nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Valor Total:</span>
                <span className="font-medium">
                  R$ {pedido.valor_total?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Solicitado em:</span>
                <span className="font-medium">
                  {new Date(pedido.created_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {pedido.justificativa_desconto && (
                <div className="mt-3 p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-600 mb-1">Justificativa:</p>
                  <p className="text-xs text-slate-800">{pedido.justificativa_desconto}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {pedidosPendentes.length === 0 && !isLoading && (
        <Card className="p-8">
          <div className="text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium">Nenhum pedido pendente</p>
            <p className="text-sm">Todos os descontos foram aprovados ou rejeitados</p>
          </div>
        </Card>
      )}

      {/* Painel de Decisão */}
      {pedidoSelecionado && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Decisão de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded">
                <p className="text-xs text-slate-600">Margem Mínima</p>
                <p className="text-lg font-bold text-slate-900">
                  {pedidoSelecionado.margem_minima_produto || 0}%
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <p className="text-xs text-slate-600">Desconto Solicitado</p>
                <p className="text-lg font-bold text-orange-700">
                  {pedidoSelecionado.desconto_solicitado_percentual}%
                </p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded">
                <p className="text-xs text-slate-600">Margem Aplicada</p>
                <p className="text-lg font-bold text-blue-700">
                  {pedidoSelecionado.margem_aplicada_vendedor || 0}%
                </p>
              </div>
            </div>

            <div>
              <Label>Desconto Ajustado (%) - Opcional para aprovação parcial</Label>
              <Input 
                type="number"
                placeholder="Ex: 5"
                value={decisao.desconto_ajustado_percentual}
                onChange={(e) => setDecisao({...decisao, desconto_ajustado_percentual: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div>
              <Label>Comentários *</Label>
              <Textarea 
                placeholder="Explique sua decisão..."
                value={decisao.comentarios}
                onChange={(e) => setDecisao({...decisao, comentarios: e.target.value})}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                data-permission="Comercial.Pedido.aprovar"
                onClick={handleAprovar}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aprovar Integral
              </Button>
              <Button
                data-permission="Comercial.Pedido.aprovar"
                onClick={handleAprovarParcial}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Percent className="w-4 h-4 mr-2" />
                Aprovar Parcial
              </Button>
              <Button
                data-permission="Comercial.Pedido.rejeitar"
                onClick={handleRejeitar}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // V21.6: w-full h-full responsivo
  const Wrapper = ({ children }) => windowMode ? (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  ) : (
    <>{children}</>
  );

  return <Wrapper>{content}</Wrapper>;
}