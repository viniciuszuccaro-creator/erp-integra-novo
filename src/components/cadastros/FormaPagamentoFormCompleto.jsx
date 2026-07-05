import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, CreditCard, DollarSign, Calendar, Settings } from 'lucide-react';
import FormWrapper from "@/components/common/FormWrapper";
import useFormaPagamentoForm from "./forma-pagamento/useFormaPagamentoForm";
import FormaPagamentoTabGeral from "./forma-pagamento/FormaPagamentoTabGeral";
import FormaPagamentoTabFinanceiro from "./forma-pagamento/FormaPagamentoTabFinanceiro";
import FormaPagamentoTabParcelamento from "./forma-pagamento/FormaPagamentoTabParcelamento";
import FormaPagamentoTabConfig from "./forma-pagamento/FormaPagamentoTabConfig";

/**
 * V21.1.2 - REFACTORED (Regra-Mãe)
 * 727 → ~80 linhas
 * Lógica em useFormaPagamentoForm, abas em /forma-pagamento/
 */
export default function FormaPagamentoFormCompleto({ formaPagamento, item, data, onSubmit, onSave, onClose, windowMode = false }) {
  const {
    formaPagamentoNorm, formData, setFormData, abaAtiva, setAbaAtiva,
    contextoValido, podeSalvar, bancos, gateways, contextoAtual,
    gerarConfiguracaoParcelas, handleMaxParcelasChange, atualizarParcelaIndividual, handleSubmit
  } = useFormaPagamentoForm({ formaPagamento, item, data, onSubmit, onSave, onClose });

  const content = (
    <FormWrapper onSubmit={handleSubmit} externalData={formData} className={`${windowMode ? 'h-full overflow-auto p-6' : 'p-6'}`}>
      <Alert className="mb-6 border-blue-300 bg-blue-50"><AlertDescription className="text-sm text-blue-900"><strong>🏦 Forma de Pagamento:</strong> Configure métodos aceitos em PDV, Pedidos, E-commerce e Portal</AlertDescription></Alert>
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-4 w-full bg-slate-100">
          <TabsTrigger value="geral"><CreditCard className="w-4 h-4 mr-1" />Geral</TabsTrigger>
          <TabsTrigger value="financeiro"><DollarSign className="w-4 h-4 mr-1" />Financeiro</TabsTrigger>
          <TabsTrigger value="parcelamento"><Calendar className="w-4 h-4 mr-1" />Parcelamento</TabsTrigger>
          <TabsTrigger value="config"><Settings className="w-4 h-4 mr-1" />Config</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="space-y-4 mt-4"><FormaPagamentoTabGeral formData={formData} setFormData={setFormData} podeSalvar={podeSalvar} /></TabsContent>
        <TabsContent value="financeiro" className="space-y-4 mt-4"><FormaPagamentoTabFinanceiro formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="parcelamento" className="space-y-4 mt-4"><FormaPagamentoTabParcelamento formData={formData} setFormData={setFormData} handleMaxParcelasChange={handleMaxParcelasChange} atualizarParcelaIndividual={atualizarParcelaIndividual} gerarConfiguracaoParcelas={gerarConfiguracaoParcelas} /></TabsContent>
        <TabsContent value="config" className="space-y-4 mt-4"><FormaPagamentoTabConfig formData={formData} setFormData={setFormData} bancos={bancos} gateways={gateways} contextoAtual={contextoAtual} /></TabsContent>
      </Tabs>

      {/* Preview */}
      <Card className="mt-6 border-2" style={{ borderColor: formData.cor }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: formData.cor + '20' }}>{formData.icone}</div>
              <div>
                <p className="font-bold text-lg">{formData.descricao || 'Nome da Forma'}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="text-xs">{formData.tipo}</Badge>
                  {formData.aceita_desconto && formData.percentual_desconto_padrao > 0 && <Badge className="bg-green-100 text-green-700 text-xs">-{formData.percentual_desconto_padrao}%</Badge>}
                  {formData.aplicar_acrescimo && formData.percentual_acrescimo_padrao > 0 && <Badge className="bg-orange-100 text-orange-700 text-xs">+{formData.percentual_acrescimo_padrao}%</Badge>}
                  {formData.permite_parcelamento && <Badge className="bg-purple-100 text-purple-700 text-xs">Até {formData.maximo_parcelas}x</Badge>}
                </div>
              </div>
            </div>
            <Badge className={formData.ativa ? 'bg-green-600' : 'bg-red-600'}>{formData.ativa ? 'Ativa' : 'Inativa'}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8" disabled={!contextoValido || !podeSalvar} data-permission="Cadastros.FormaPagamento.salvar" data-sensitive="true">
          <CheckCircle2 className="w-4 h-4 mr-2" />{formaPagamentoNorm ? 'Atualizar Forma' : 'Criar Forma'}
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) return <div className="w-full h-full bg-white">{content}</div>;
  return content;
}