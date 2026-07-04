import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreditCard, QrCode, Link2, CheckCircle2, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GeradorLinkPagamento from "./GeradorLinkPagamento";
import WizardGatewayPagamento from "./WizardGatewayPagamento";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";

/**
 * ETAPA 4 - Modal Gerar Cobrança
 * Gera Boleto, PIX ou Link de Pagamento
 */
export default function GerarCobrancaModal({ isOpen, onClose, contaReceber }) {
  const queryClient = useQueryClient();
  const [tipoCobranca, setTipoCobranca] = useState('pix');
  const [gerando, setGerando] = useState(false);
  const [cobrancaGerada, setCobrancaGerada] = useState(null);
  const {
    empresaAtual,
    grupoAtual,
    filterInContext,
    createInContext,
    updateInContext
  } = useContextoVisual();
  const { canCreate, canEdit, hasPermission } = usePermissions();

  const groupId = contaReceber?.group_id || grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const empresaId = contaReceber?.empresa_id || empresaAtual?.id || null;
  const contextKey = empresaId || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";
  const podeGerarCobranca =
    canCreate("Financeiro", "Cobrança") ||
    canCreate("Financeiro", "Cobranca") ||
    canEdit("Financeiro", "Contas a Receber") ||
    hasPermission("Financeiro", null, "gerenciar");

  const { data: configsCobranca = [] } = useQuery({
    queryKey: ['configs-cobranca', contextKey],
    queryFn: () => filterInContext('ConfiguracaoCobrancaEmpresa', {}, '-created_date', 50),
    enabled: contextoValido,
  });

  const config = configsCobranca.find(c => c.empresa_id === contaReceber?.empresa_id);

  const gerarBoletoMutation = useMutation({
    mutationFn: async () => {
      if (!contextoValido) {
        throw new Error("Selecione um grupo ou empresa antes de gerar cobranca.");
      }
      if (!podeGerarCobranca) {
        throw new Error("Seu perfil nao permite gerar cobrancas.");
      }

      setGerando(true);

      const payload = {
        customer: contaReceber.cliente,
        value: contaReceber.valor,
        dueDate: contaReceber.data_vencimento,
        description: contaReceber.descricao,
        billingType: "BOLETO",
        fine: { value: config?.multa_pos_vencimento_percent || 2 },
        interest: { value: config?.juros_ao_dia_percent || 0.033 }
      };

      const retornoMock = {
        id: `bol_${Date.now()}`,
        status: "PENDING",
        invoiceUrl: `https://boleto.simulado.com/${contaReceber.id}`,
        bankSlipUrl: `https://boleto.simulado.com/pdf/${contaReceber.id}`,
        identificationField: "34191.09008 12345.678901 12345.678901 1 99990000012345",
        nossoNumero: String(Date.now()).substring(0, 10)
      };

      await createInContext('LogCobranca', {
        group_id: groupId,
        empresa_id: empresaId,
        conta_receber_id: contaReceber.id,
        tipo_operacao: "gerar_boleto",
        provedor: config?.provedor_cobranca || "Asaas",
        data_hora: new Date().toISOString(),
        payload_enviado: payload,
        retorno_recebido: retornoMock,
        status_operacao: "simulado",
        mensagem: "Boleto gerado em modo simulação"
      });

      await updateInContext('ContaReceber', contaReceber.id, {
        group_id: groupId,
        empresa_id: empresaId,
        forma_cobranca: "Boleto",
        id_cobranca_externa: retornoMock.id,
        boleto_id_integracao: retornoMock.id,
        linha_digitavel: retornoMock.identificationField,
        url_boleto_pdf: retornoMock.bankSlipUrl,
        status_cobranca: "gerada_simulada",
        provedor_pagamento: config?.provedor_cobranca || "Asaas"
      });

      setGerando(false);
      return retornoMock;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      setCobrancaGerada({ tipo: 'boleto', dados: data });
      toast.success("✅ Boleto gerado!");
    },
    onError: (error) => {
      setGerando(false);
      toast.error(error.message || "Erro ao gerar boleto");
    }
  });

  const gerarPixMutation = useMutation({
    mutationFn: async () => {
      if (!contextoValido) {
        throw new Error("Selecione um grupo ou empresa antes de gerar cobranca.");
      }
      if (!podeGerarCobranca) {
        throw new Error("Seu perfil nao permite gerar cobrancas.");
      }

      setGerando(true);

      const pixCopiaCola = `00020126580014br.gov.bcb.pix0136${contaReceber.id}52040000530398654${contaReceber.valor.toFixed(2)}5802BR6009SAO PAULO`;
      const qrCodeBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const retornoMock = {
        id: `pix_${Date.now()}`,
        status: "PENDING",
        encodedImage: qrCodeBase64,
        payload: pixCopiaCola,
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      await createInContext('LogCobranca', {
        group_id: groupId,
        empresa_id: empresaId,
        conta_receber_id: contaReceber.id,
        tipo_operacao: "gerar_pix",
        provedor: config?.provedor_cobranca || "Asaas",
        data_hora: new Date().toISOString(),
        retorno_recebido: retornoMock,
        status_operacao: "simulado",
        mensagem: "PIX gerado em modo simulação"
      });

      await updateInContext('ContaReceber', contaReceber.id, {
        group_id: groupId,
        empresa_id: empresaId,
        forma_cobranca: "PIX",
        id_cobranca_externa: retornoMock.id,
        pix_id_integracao: retornoMock.id,
        pix_qrcode: qrCodeBase64,
        pix_copia_cola: pixCopiaCola,
        status_cobranca: "gerada_simulada",
        provedor_pagamento: config?.provedor_cobranca || "Asaas"
      });

      setGerando(false);
      return retornoMock;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      setCobrancaGerada({ tipo: 'pix', dados: data });
      toast.success("✅ PIX gerado!");
    },
    onError: (error) => {
      setGerando(false);
      toast.error(error.message || "Erro ao gerar PIX");
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Gerar Cobrança
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* INFO CONTA */}
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-slate-600">Cliente</Label>
                  <p className="font-semibold">{contaReceber?.cliente}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Vencimento</Label>
                  <p className="font-semibold">
                    {new Date(contaReceber?.data_vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Valor</Label>
                  <p className="text-xl font-bold text-green-600">
                    R$ {(contaReceber?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <WizardGatewayPagamento tipo={tipoCobranca === 'boleto' ? 'Boleto' : 'PIX'} />

          {!cobrancaGerada ? (
            <>
              <Tabs value={tipoCobranca} onValueChange={setTipoCobranca}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="pix" disabled={!config?.habilitar_pix || !contextoValido || !podeGerarCobranca}>
                    <QrCode className="w-4 h-4 mr-2" />
                    PIX
                  </TabsTrigger>
                  <TabsTrigger value="boleto" disabled={!config?.habilitar_boleto || !contextoValido || !podeGerarCobranca}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Boleto
                  </TabsTrigger>
                  <TabsTrigger value="link" disabled={!contextoValido || !podeGerarCobranca}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Link
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pix" className="space-y-4">
                  <Alert className="border-green-300 bg-green-50">
                    <AlertDescription>
                      <strong>PIX Instantâneo</strong> - Pagamento em tempo real com QR Code
                    </AlertDescription>
                  </Alert>
                  <Button
                    data-permission="Financeiro.Cobranca.criar"
                    onClick={() => gerarPixMutation.mutate()}
                    disabled={gerando || !contextoValido || !podeGerarCobranca}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {gerando ? "Gerando..." : "Gerar PIX"}
                  </Button>
                </TabsContent>

                <TabsContent value="boleto" className="space-y-4">
                  <Alert className="border-orange-300 bg-orange-50">
                    <AlertDescription>
                      <strong>Boleto Bancário</strong> - Prazo conforme vencimento
                    </AlertDescription>
                  </Alert>
                  <Button
                    data-permission="Financeiro.Cobranca.criar"
                    onClick={() => gerarBoletoMutation.mutate()}
                    disabled={gerando || !contextoValido || !podeGerarCobranca}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {gerando ? "Gerando..." : "Gerar Boleto"}
                  </Button>
                </TabsContent>

                <TabsContent value="link" className="space-y-4">
                  <GeradorLinkPagamento titulo={contaReceber} onClose={onClose} />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-400 bg-green-50">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <AlertDescription>
                  <strong>{cobrancaGerada.tipo === 'pix' ? 'PIX' : 'Boleto'} gerado com sucesso!</strong>
                </AlertDescription>
              </Alert>

              {cobrancaGerada.tipo === 'pix' && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="bg-white border rounded p-3">
                      <Label className="text-xs text-slate-600 mb-2 block">PIX Copia e Cola</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-slate-50 p-2 rounded overflow-x-auto">
                          {cobrancaGerada.dados.payload}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(cobrancaGerada.dados.payload);
                            toast.success("PIX copiado!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      Válido até: {new Date(cobrancaGerada.dados.expirationDate).toLocaleString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {cobrancaGerada.tipo === 'boleto' && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-slate-600 mb-2 block">Linha Digitável</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-slate-50 p-2 rounded">
                          {cobrancaGerada.dados.identificationField}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(cobrancaGerada.dados.identificationField);
                            toast.success("Linha digitável copiada!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.open(cobrancaGerada.dados.bankSlipUrl, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      Ver Boleto PDF
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Button onClick={onClose} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}