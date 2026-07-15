import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Truck, User, Package, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * 📋 INTEGRAÇÃO COM ROMANEIO V21.5
 * Cria romaneios automaticamente com entregas selecionadas
 */
export default function IntegracaoRomaneio({ pedidosSelecionados = [], onClose, windowMode = false }) {
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const [motorista, setMotorista] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [placa, setPlaca] = useState("");
  const [pedidosSelecionadosIds, setPedidosSelecionadosIds] = useState(
    pedidosSelecionados.map(p => p.id)
  );

  const queryClient = useQueryClient();

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', contextoKey],
    queryFn: () => filterInContext('Pedido', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ['motoristas', contextoKey],
    queryFn: () => filterInContext('Motorista', {}, 'nome', 999),
    enabled: !!contexto,
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos', contextoKey],
    queryFn: () => filterInContext('Veiculo', {}, 'placa', 999),
    enabled: !!contexto,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const pedidosElegiveis = pedidos.filter(p => 
    ['Faturado', 'Em Expedição', 'Pronto para Faturar'].includes(p.status) &&
    p.tipo_frete !== 'Retirada'
  );

  const criarRomaneioMutation = useMutation({
    mutationFn: async () => {
      const pedidosParaRomaneio = pedidos.filter(p => pedidosSelecionadosIds.includes(p.id));
      
      const pesoTotal = pedidosParaRomaneio.reduce((sum, p) => sum + (p.peso_total_kg || 0), 0);
      const valorTotal = pedidosParaRomaneio.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      
      // Criar romaneio
      const romaneio = await base44.entities.Romaneio.create({
        data_saida: new Date().toISOString(),
        motorista: motorista,
        veiculo: veiculo,
        placa: placa,
        quantidade_entregas: pedidosParaRomaneio.length,
        peso_total_kg: pesoTotal,
        valor_total_mercadorias: valorTotal,
        status: 'Em Rota',
        responsavel_criacao: user?.full_name || "Sistema",
        empresa_id: pedidosParaRomaneio[0]?.empresa_id,
        group_id: pedidosParaRomaneio[0]?.group_id || grupoAtual?.id
      });

      // Criar entregas e vincular ao romaneio
      for (const pedido of pedidosParaRomaneio) {
        await base44.entities.Entrega.create({
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          cliente_nome: pedido.cliente_nome,
          empresa_id: pedido.empresa_id,
          group_id: pedido.group_id || grupoAtual?.id,
          endereco_entrega_completo: pedido.endereco_entrega_principal,
          romaneio_id: romaneio.id,
          motorista: motorista,
          veiculo: veiculo,
          placa: placa,
          data_saida: new Date().toISOString(),
          status: 'Saiu para Entrega',
          peso_total_kg: pedido.peso_total_kg,
          valor_mercadoria: pedido.valor_total
        });

        // Atualizar status do pedido
        await base44.entities.Pedido.update(pedido.id, {
          status: 'Em Trânsito'
        });
      }

      return romaneio;
    },
    onSuccess: (romaneio) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['romaneios'] });
      toast.success(`✅ Romaneio criado com ${pedidosSelecionadosIds.length} entrega(s)!`);
      if (onClose) onClose();
    }
  });

  const togglePedido = (pedidoId) => {
    setPedidosSelecionadosIds(prev => 
      prev.includes(pedidoId)
        ? prev.filter(id => id !== pedidoId)
        : [...prev, pedidoId]
    );
  };

  const pesoTotalSelecionado = pedidos
    .filter(p => pedidosSelecionadosIds.includes(p.id))
    .reduce((sum, p) => sum + (p.peso_total_kg || 0), 0);

  const containerClass = windowMode ? "w-full h-full flex flex-col" : "";

  return (
    <Card className={`border-0 shadow-xl ${containerClass}`}>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          📋 Criar Romaneio de Entrega
        </CardTitle>
        <p className="text-sm opacity-90">
          Agrupe entregas e envie para rota
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Dados do Motorista/Veículo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Motorista *
            </Label>
            <Input
              value={motorista}
              onChange={(e) => setMotorista(e.target.value)}
              placeholder="Nome do motorista"
              list="motoristas-list"
            />
            <datalist id="motoristas-list">
              {motoristas.map(m => (
                <option key={m.id} value={m.nome} />
              ))}
            </datalist>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Veículo *
            </Label>
            <Input
              value={veiculo}
              onChange={(e) => setVeiculo(e.target.value)}
              placeholder="Modelo do veículo"
              list="veiculos-list"
            />
            <datalist id="veiculos-list">
              {veiculos.map(v => (
                <option key={v.id} value={v.modelo} />
              ))}
            </datalist>
          </div>

          <div>
            <Label>Placa *</Label>
            <Input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="ABC-1234"
              maxLength={8}
            />
          </div>
        </div>

        {/* Resumo */}
        <Card className="bg-blue-50 border-blue-300">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-blue-700">Entregas</p>
                <p className="text-2xl font-bold text-blue-900">{pedidosSelecionadosIds.length}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Peso Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {pesoTotalSelecionado.toFixed(0)} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Valor</p>
                <p className="text-2xl font-bold text-blue-900">
                  R$ {pedidos
                    .filter(p => pedidosSelecionadosIds.includes(p.id))
                    .reduce((sum, p) => sum + (p.valor_total || 0), 0)
                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base">
              📦 Selecionar Entregas ({pedidosElegiveis.length} disponível(is))
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pedidosElegiveis.map(pedido => (
                <div
                  key={pedido.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                  onClick={() => togglePedido(pedido.id)}
                >
                  <Checkbox
                    checked={pedidosSelecionadosIds.includes(pedido.id)}
                    onCheckedChange={() => togglePedido(pedido.id)}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      #{pedido.numero_pedido} - {pedido.cliente_nome}
                    </p>
                    <p className="text-xs text-slate-600">
                      {pedido.endereco_entrega_principal?.cidade} • {(pedido.peso_total_kg || 0)} kg • R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Badge className={
                    pedido.status === 'Faturado' ? 'bg-blue-600' :
                    pedido.status === 'Em Expedição' ? 'bg-orange-600' :
                    'bg-indigo-600'
                  }>
                    {pedido.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={() => criarRomaneioMutation.mutate()}
            disabled={
              !motorista.trim() || 
              !veiculo.trim() || 
              !placa.trim() || 
              pedidosSelecionadosIds.length === 0 ||
              criarRomaneioMutation.isPending
            }
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {criarRomaneioMutation.isPending ? 'Criando...' : `🚚 Criar Romaneio (${pedidosSelecionadosIds.length})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}