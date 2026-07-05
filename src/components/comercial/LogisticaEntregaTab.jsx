import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import SeletorEnderecoEntregaPedido from "./SeletorEnderecoEntregaPedido";
import BuscaCEP from "./BuscaCEP";
import CriarEtapaEntregaModal from "./CriarEtapaEntregaModal";
import EtapasEntregaCard from "./logistica-entrega/EtapasEntregaCard";
import FreteCard from "./logistica-entrega/FreteCard";

export default function LogisticaEntregaTab({ formData, setFormData, clientes = [], onNext }) {
  const [modalEtapaOpen, setModalEtapaOpen] = useState(false);

  const clienteSelecionado = clientes?.find((c) => c.id === formData?.cliente_id) || null;
  const freteGratis = (formData?.peso_total_kg || 0) >= 30;

  const handleCriarEtapa = (novaEtapa) => {
    const etapasAtuais = formData.etapas_entrega || [];
    const etapaCompleta = {
      ...novaEtapa,
      id: `etapa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sequencia: etapasAtuais.length + 1,
      data_criacao: new Date().toISOString(),
    };
    setFormData((prev) => ({ ...prev, etapas_entrega: [...etapasAtuais, etapaCompleta] }));
    toast.success(`✅ Etapa "${novaEtapa.nome_etapa}" criada com ${novaEtapa.quantidade_total_itens} itens`);
  };

  const removerEtapa = (etapaId) => {
    setFormData((prev) => {
      const updatedEtapas = (prev.etapas_entrega || []).filter((e) => e.id !== etapaId);
      const reSequencedEtapas = updatedEtapas.map((etapa, index) => ({ ...etapa, sequencia: index + 1 }));
      return { ...prev, etapas_entrega: reSequencedEtapas };
    });
    toast.success("Etapa removida");
  };

  const etapas = formData.etapas_entrega || [];
  const totalItensAlocados = etapas.reduce((sum, e) => sum + (e.quantidade_total_itens || 0), 0);
  const totalItens =
    (formData.itens_revenda?.length || 0) +
    (formData.itens_armado_padrao?.length || 0) +
    (formData.itens_corte_dobra?.length || 0);

  const calcularFreteAutomatico = async () => {
    if (!formData?.endereco_entrega_principal?.cep) {
      toast.error("Configure o endereço de entrega primeiro");
      return;
    }
    const peso = formData.peso_total_kg || 0;
    if (peso === 0) {
      toast.error("Adicione itens ao pedido primeiro");
      return;
    }
    if (peso >= 30) {
      setFormData((prev) => ({ ...prev, valor_frete: 0, tipo_frete: "CIF" }));
      toast.success("✅ Frete GRÁTIS! Peso acima de 30kg");
      return;
    }
    const valorFrete = peso * 2.5;
    setFormData((prev) => ({ ...prev, valor_frete: parseFloat(valorFrete.toFixed(2)) }));
    toast.success(`✅ Frete calculado: R$ ${valorFrete.toFixed(2)}`);
  };

  return (
    <div className="space-y-6">
      {freteGratis && (
        <Alert className="border-green-300 bg-green-50">
          <Truck className="w-5 h-5 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900">🎉 Frete Grátis!</p>
            <p className="text-sm text-green-700">
              Peso total: {formData?.peso_total_kg?.toFixed(2) || "0.00"} kg (acima de 30 kg)
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clienteSelecionado ? (
            <SeletorEnderecoEntregaPedido
              cliente={clienteSelecionado}
              enderecoSelecionado={formData?.endereco_entrega_principal || {}}
              onSelect={(endereco) =>
                setFormData((prev) => ({ ...prev, endereco_entrega_principal: endereco }))
              }
            />
          ) : (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertDescription className="text-sm text-orange-700">
                Selecione um cliente na aba "Identificação" primeiro
              </AlertDescription>
            </Alert>
          )}

          <BuscaCEP
            onEnderecoEncontrado={(endereco) =>
              setFormData((prev) => ({ ...prev, endereco_entrega_principal: endereco }))
            }
          />

          {/* Google Maps */}
          <div className="border-t pt-4">
            <Label>🗺️ Link do Google Maps (Opcional)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={formData?.endereco_entrega_principal?.mapa_url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endereco_entrega_principal: {
                      ...(prev?.endereco_entrega_principal || {}),
                      mapa_url: e.target.value,
                    },
                  }))
                }
                placeholder="Cole o link do Google Maps aqui..."
                className="flex-1"
              />
              {formData?.endereco_entrega_principal?.mapa_url && (
                <Button
                  variant="outline"
                  size="icon"
                  data-permission="Comercial.Pedido.visualizar"
                  onClick={() => window.open(formData.endereco_entrega_principal.mapa_url, "_blank")}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <EtapasEntregaCard
        etapas={etapas}
        totalItens={totalItens}
        totalItensAlocados={totalItensAlocados}
        onCriarEtapa={() => setModalEtapaOpen(true)}
        onRemoverEtapa={removerEtapa}
      />

      <FreteCard
        formData={formData}
        setFormData={setFormData}
        freteGratis={freteGratis}
        onCalcularFrete={calcularFreteAutomatico}
      />

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instruções de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData?.endereco_entrega_principal?.instrucoes_entrega || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                endereco_entrega_principal: {
                  ...(prev?.endereco_entrega_principal || {}),
                  instrucoes_entrega: e.target.value,
                },
              }))
            }
            className="w-full p-3 border rounded-lg"
            rows="4"
            placeholder="Ex: Portaria 2, avisar com 30min de antecedência..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 border-t">
        <Button
          data-permission="Comercial.Pedido.visualizar"
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Financeiro
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <CriarEtapaEntregaModal
        open={modalEtapaOpen}
        onClose={() => setModalEtapaOpen(false)}
        pedidoData={formData}
        onCriarEtapa={handleCriarEtapa}
      />
    </div>
  );
}