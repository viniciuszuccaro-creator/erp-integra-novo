import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Map, Truck, Navigation, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import TesteGoogleMaps from "@/components/integracoes/TesteGoogleMaps";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function RoteirizacaoInteligente({ windowMode = false }) {
  const queryClient = useQueryClient();
  const [dataRota, setDataRota] = useState(new Date().toISOString().split('T')[0]);
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: entregas = [] } = useQuery({
    queryKey: ["entregas", contextoKey],
    queryFn: () => filterInContext('Entrega', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ["motoristas", contextoKey],
    queryFn: () => filterInContext('Motorista', {}, 'nome', 999),
    enabled: !!contexto,
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ["veiculos", contextoKey],
    queryFn: () => filterInContext('Veiculo', {}, 'placa', 999),
    enabled: !!contexto,
  });

  const { data: rotas = [] } = useQuery({
    queryKey: ["roteirizacao-inteligente", contextoKey],
    queryFn: () => filterInContext('RoteirizacaoInteligente', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const gerarRotaIAMutation = useMutation({
    mutationFn: async ({ entregasIds, motoristaId, veiculoId }) => {
      toast.info("🤖 IA otimizando rota...");

      const entregasSelecionadas = entregas.filter(e => entregasIds.includes(e.id));
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Otimize a rota de entrega considerando:

Entregas: ${JSON.stringify(entregasSelecionadas.map(e => ({
  cliente: e.cliente_nome,
  endereco: e.endereco_entrega_completo,
  janela: e.janela_entrega_inicio + ' - ' + e.janela_entrega_fim,
  peso: e.peso_total_kg,
  prioridade: e.prioridade
})))}

Retorne a melhor sequência de entregas, distância total, tempo estimado e custo.`,
        response_json_schema: {
          type: "object",
          properties: {
            sequencia_otimizada: { type: "array", items: { type: "string" } },
            distancia_total_km: { type: "number" },
            tempo_total_minutos: { type: "number" },
            custo_estimado: { type: "number" },
            economia_vs_manual: { type: "object" }
          }
        }
      });

      const motorista = motoristas.find(m => m.id === motoristaId);
      const veiculo = veiculos.find(v => v.id === veiculoId);

      return base44.entities.RoteirizacaoInteligente.create({
        data_rota: dataRota,
        motorista_id: motoristaId,
        motorista_nome: motorista?.nome || "",
        veiculo_id: veiculoId,
        veiculo_placa: veiculo?.placa || "",
        entregas_vinculadas: entregasSelecionadas.map((e, idx) => ({
          entrega_id: e.id,
          pedido_id: e.pedido_id,
          cliente_nome: e.cliente_nome,
          endereco_completo: `${e.endereco_entrega_completo?.logradouro}, ${e.endereco_entrega_completo?.numero}`,
          latitude: e.endereco_entrega_completo?.latitude,
          longitude: e.endereco_entrega_completo?.longitude,
          ordem_sequencia: idx + 1,
          peso_kg: e.peso_total_kg,
          prioridade: e.prioridade
        })),
        otimizacao_ia: {
          distancia_total_km: result.distancia_total_km,
          tempo_total_estimado_minutos: result.tempo_total_minutos,
          custo_estimado_frete: result.custo_estimado,
          algoritmo_usado: "IA Base44 LLM",
          fatores_considerados: ["Distância", "Janela de Entrega", "Trânsito", "Prioridade", "Peso"],
          economia_vs_rota_manual: result.economia_vs_manual
        },
        status: "Planejada"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roteirizacao-inteligente"]);
      toast.success("✅ Rota otimizada gerada com IA!");
    },
  });

  const entregasPendentes = entregas.filter(e => 
    e.status === "Aguardando Separação" || e.status === "Pronto para Expedir"
  );

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Roteirização Inteligente</h2>
          <p className="text-sm text-slate-600 mt-1">Otimização de rotas com IA</p>
        </div>

        <Button
          onClick={() => {
            if (entregasPendentes.length > 0 && motoristas.length > 0 && veiculos.length > 0) {
              gerarRotaIAMutation.mutate({
                entregasIds: entregasPendentes.slice(0, 5).map(e => e.id),
                motoristaId: motoristas[0].id,
                veiculoId: veiculos[0].id
              });
            } else {
              toast.error("Cadastre entregas, motoristas e veículos primeiro");
            }
          }}
          disabled={gerarRotaIAMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Gerar Rota com IA
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Rotas Ativas</p>
                <p className="text-2xl font-bold">{rotas.filter(r => r.status === "Em Execução").length}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Entregas Pendentes</p>
                <p className="text-2xl font-bold">{entregasPendentes.length}</p>
              </div>
              <Navigation className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Economia IA (KM)</p>
                <p className="text-2xl font-bold text-green-600">
                  {rotas.reduce((acc, r) => acc + (r.otimizacao_ia?.economia_vs_rota_manual?.km_economizados || 0), 0).toFixed(0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <details className="bg-white rounded-lg border">
       <summary className="p-4 cursor-pointer font-medium text-sm">🗺️ Simular Geocodificação e Rota (Google Maps - Teste)</summary>
       <div className="p-4">
         <TesteGoogleMaps windowMode />
       </div>
      </details>

      <Card>
       <CardHeader>
         <CardTitle>Rotas Geradas</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">Data</th>
                  <th className="text-left p-3 text-sm font-semibold">Motorista</th>
                  <th className="text-left p-3 text-sm font-semibold">Veículo</th>
                  <th className="text-right p-3 text-sm font-semibold">Entregas</th>
                  <th className="text-right p-3 text-sm font-semibold">Distância (KM)</th>
                  <th className="text-right p-3 text-sm font-semibold">Tempo (h)</th>
                  <th className="text-right p-3 text-sm font-semibold">Custo Est.</th>
                  <th className="text-left p-3 text-sm font-semibold">Status</th>
                  <th className="text-center p-3 text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rotas.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-6 text-slate-500">
                      Nenhuma rota gerada ainda
                    </td>
                  </tr>
                ) : (
                  rotas.map((rota) => (
                    <tr key={rota.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-sm">
                        {new Date(rota.data_rota).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-sm">{rota.motorista_nome}</td>
                      <td className="p-3 text-sm">{rota.veiculo_placa}</td>
                      <td className="p-3 text-sm text-right">{rota.entregas_vinculadas?.length || 0}</td>
                      <td className="p-3 text-sm text-right">
                        {rota.otimizacao_ia?.distancia_total_km?.toFixed(1) || '-'}
                      </td>
                      <td className="p-3 text-sm text-right">
                        {rota.otimizacao_ia?.tempo_total_estimado_minutos 
                          ? (rota.otimizacao_ia.tempo_total_estimado_minutos / 60).toFixed(1) 
                          : '-'}
                      </td>
                      <td className="p-3 text-sm text-right">
                        R$ {(rota.otimizacao_ia?.custo_estimado_frete || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <Badge 
                          className={
                            rota.status === "Concluída" ? "bg-green-100 text-green-800" :
                            rota.status === "Em Execução" ? "bg-blue-100 text-blue-800" :
                            "bg-slate-100 text-slate-800"
                          }
                        >
                          {rota.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button size="sm" variant="outline">
                          <Map className="w-3 h-3 mr-1" />
                          Mapa
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}