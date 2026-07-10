import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Globe, Lock, BarChart3, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";
import { toast } from "sonner";
import GatewayTaxasTab from "./gateway-pagamento/GatewayTaxasTab";
import GatewayConfigTab from "./gateway-pagamento/GatewayConfigTab";

export default function GatewayPagamentoForm({ gateway, windowMode = false, onSubmit }) {
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas', grupoAtual?.id, empresaAtual?.id],
    queryFn: () => filterInContext('Empresa', {}, 'nome_fantasia', 999),
    enabled: !!contexto,
  });

  const [formData, setFormData] = useState(gateway || {
    nome: "",
    provedor: "Pagar.me",
    empresa_id: "",
    chave_api_publica: "",
    chave_api_secreta: "",
    webhook_url: "",
    webhook_secret: "",
    ambiente: "Teste",
    configuracoes_extras: {},
    taxas_gateway: {
      taxa_boleto_fixa: 0,
      taxa_pix_percentual: 0,
      taxa_cartao_debito_percentual: 0,
      taxa_cartao_credito_percentual: 0,
      taxa_link_pagamento_percentual: 0
    },
    limites_transacao: {
      valor_minimo: 0,
      valor_maximo: 0,
      limite_diario: 0,
      limite_mensal: 0
    },
    tipos_pagamento_suportados: ["PIX", "Boleto", "Cartão Crédito"],
    ativo: true,
    prioridade: 1
  });

  const [tiposSelecionados, setTiposSelecionados] = useState(
    formData.tipos_pagamento_suportados || ["PIX", "Boleto"]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, tipos_pagamento_suportados: tiposSelecionados };
    const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
    const erroUnicidade = await checkGlobalUniqueness('GatewayPagamento', payload, { groupId, empresaId: empresaAtual?.id, currentId: gateway?.id, isEdit: !!gateway?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    try { await onSubmit?.(payload); }
    catch (e) { toast.error(e?.message || 'Erro ao salvar gateway de pagamento.'); }
  };

  const tiposPagamentoDisponiveis = [
    "PIX",
    "Boleto",
    "Cartão Crédito",
    "Cartão Débito",
    "Transferência",
    "Link de Pagamento"
  ];

  return (
    <div className={windowMode ? "w-full h-full flex flex-col" : "w-full h-full"}>
      <form onSubmit={handleSubmit} className={windowMode ? "flex-1 flex flex-col overflow-hidden" : "w-full h-full"}>
        <div className={windowMode ? "flex-1 overflow-auto p-6" : "w-full h-full"}>
          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="geral">
                <Settings className="w-4 h-4 mr-2" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="credenciais">
                <Lock className="w-4 h-4 mr-2" />
                Credenciais
              </TabsTrigger>
              <TabsTrigger value="taxas">
                <BarChart3 className="w-4 h-4 mr-2" />
                Taxas
              </TabsTrigger>
              <TabsTrigger value="config">
                <Globe className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-4">
              <div>
                <Label>Empresa *</Label>
                <Select
                  value={formData.empresa_id || ''}
                  onValueChange={(v) => setFormData({ ...formData, empresa_id: v })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Selecione a empresa..." /></SelectTrigger>
                  <SelectContent>
                    {empresas.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.nome_fantasia || emp.razao_social}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Gateway *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Pagar.me Principal"
                    required
                  />
                </div>
                <div>
                  <Label>Provedor *</Label>
                  <Select
                    value={formData.provedor}
                    onValueChange={(v) => setFormData({ ...formData, provedor: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pagar.me">Pagar.me</SelectItem>
                      <SelectItem value="Stripe">Stripe</SelectItem>
                      <SelectItem value="Asaas">Asaas</SelectItem>
                      <SelectItem value="Juno">Juno</SelectItem>
                      <SelectItem value="PagSeguro">PagSeguro</SelectItem>
                      <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                      <SelectItem value="Adyen">Adyen</SelectItem>
                      <SelectItem value="Cielo">Cielo</SelectItem>
                      <SelectItem value="Rede">Rede</SelectItem>
                      <SelectItem value="Stone">Stone</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ambiente *</Label>
                  <Select
                    value={formData.ambiente}
                    onValueChange={(v) => setFormData({ ...formData, ambiente: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teste">Teste</SelectItem>
                      <SelectItem value="Homologação">Homologação</SelectItem>
                      <SelectItem value="Produção">Produção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Input
                    type="number"
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Tipos de Pagamento Suportados</Label>
                <div className="grid grid-cols-2 gap-3">
                  {tiposPagamentoDisponiveis.map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox
                        checked={tiposSelecionados.includes(tipo)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTiposSelecionados([...tiposSelecionados, tipo]);
                          } else {
                            setTiposSelecionados(tiposSelecionados.filter(t => t !== tipo));
                          }
                        }}
                      />
                      <label className="text-sm">{tipo}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Gateway Ativo</Label>
                  <p className="text-xs text-slate-500">Habilitar para uso no sistema</p>
                </div>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="credenciais" className="space-y-4 mt-4">
              <div>
                <Label>Chave API Pública *</Label>
                <Input
                  value={formData.chave_api_publica}
                  onChange={(e) => setFormData({ ...formData, chave_api_publica: e.target.value })}
                  placeholder="pk_test_..."
                  type="text"
                />
              </div>
              <div>
                <Label>Chave API Secreta *</Label>
                <Input
                  value={formData.chave_api_secreta}
                  onChange={(e) => setFormData({ ...formData, chave_api_secreta: e.target.value })}
                  placeholder="sk_test_..."
                  type="password"
                />
              </div>
              <div>
                <Label>URL do Webhook</Label>
                <Input
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://api.seuapp.com/webhooks/pagamentos"
                />
              </div>
              <div>
                <Label>Secret do Webhook</Label>
                <Input
                  value={formData.webhook_secret}
                  onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                  placeholder="whsec_..."
                  type="password"
                />
              </div>
            </TabsContent>

            <TabsContent value="taxas" className="space-y-4 mt-4">
              <GatewayTaxasTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="config" className="space-y-4 mt-4">
              <GatewayConfigTab formData={formData} setFormData={setFormData} />
            </TabsContent>
          </Tabs>
        </div>

        <div className={windowMode ? "border-t bg-slate-50 p-4" : "mt-6"}>
          <div className="flex justify-end gap-3">
            <Button type="submit" data-permission="Cadastros.GatewayPagamento.salvar" className="bg-blue-600 hover:bg-blue-700">
              <CreditCard className="w-4 h-4 mr-2" />
              {gateway ? 'Atualizar Gateway' : 'Cadastrar Gateway'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}