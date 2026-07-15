import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Zap } from "lucide-react";

/**
 * Sub-componente: Aba Parcelamento da Forma de Pagamento
 * Configuração de parcelas genérica e individual para cartão de crédito.
 */
export default function FormaPagamentoTabParcelamento({ formData, setFormData, handleMaxParcelasChange, atualizarParcelaIndividual, gerarConfiguracaoParcelas }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div><Label className="font-semibold">Permite Parcelamento</Label><p className="text-xs text-slate-500">Habilitar pagamento em múltiplas parcelas</p></div>
        <Switch checked={formData.permite_parcelamento} onCheckedChange={(v) => setFormData({ ...formData, permite_parcelamento: v, configuracao_parcelas_cartao: (v && formData.tipo === 'Cartão Crédito') ? gerarConfiguracaoParcelas(formData.maximo_parcelas) : formData.configuracao_parcelas_cartao })} />
      </div>
      {formData.permite_parcelamento && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Máximo de Parcelas</Label><Input type="number" min="2" max="36" value={formData.maximo_parcelas} onChange={(e) => handleMaxParcelasChange(parseInt(e.target.value) || 1)} /></div>
            {formData.tipo !== 'Cartão Crédito' && (
              <>
                <div><Label>Intervalo (dias)</Label><Input type="number" min="7" max="90" value={formData.intervalo_parcelas_dias} onChange={(e) => setFormData({ ...formData, intervalo_parcelas_dias: parseInt(e.target.value) || 30 })} /></div>
                <div><Label>Taxa por Parcela (%)</Label><Input type="number" step="0.01" min="0" max="10" value={formData.taxa_por_parcela} onChange={(e) => setFormData({ ...formData, taxa_por_parcela: parseFloat(e.target.value) || 0 })} /></div>
              </>
            )}
          </div>
          {formData.tipo === 'Cartão Crédito' && (
            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader className="bg-blue-100 border-b border-blue-200"><CardTitle className="text-base flex items-center gap-2 text-blue-900"><CreditCard className="w-5 h-5" />💳 Configuração Individual por Parcela - Cartão de Crédito</CardTitle><p className="text-xs text-blue-700 mt-1">Configure dias de vencimento e taxa específica para cada parcela</p></CardHeader>
              <CardContent className="p-4">
                {!formData.configuracao_parcelas_cartao?.length && (<div className="text-center py-4"><Button onClick={() => setFormData({ ...formData, configuracao_parcelas_cartao: gerarConfiguracaoParcelas(formData.maximo_parcelas) })} className="bg-blue-600 hover:bg-blue-700"><Zap className="w-4 h-4 mr-2" />Gerar Configuração Padrão</Button></div>)}
                {formData.configuracao_parcelas_cartao?.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {formData.configuracao_parcelas_cartao.sort((a, b) => a.numero_parcela - b.numero_parcela).map((parcela) => (
                      <div key={parcela.numero_parcela} className="p-4 bg-white rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-3"><Badge className="bg-blue-600 text-white px-3 py-1">{parcela.numero_parcela}x</Badge><p className="font-semibold text-slate-900">Parcela {parcela.numero_parcela}</p></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label className="text-xs">Dias até vencimento</Label><Input type="number" min="0" max="365" value={parcela.dias_vencimento} onChange={(e) => atualizarParcelaIndividual(parcela.numero_parcela, 'dias_vencimento', e.target.value)} placeholder="Ex: 30" /><p className="text-xs text-slate-500 mt-1">Vence em: {parcela.dias_vencimento} dias</p></div>
                          <div><Label className="text-xs">Taxa desta parcela (%)</Label><Input type="number" step="0.01" min="0" max="20" value={parcela.taxa_percentual} onChange={(e) => atualizarParcelaIndividual(parcela.numero_parcela, 'taxa_percentual', e.target.value)} placeholder="Ex: 1.99" /><p className="text-xs text-slate-500 mt-1">Taxa: {parcela.taxa_percentual}%</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {formData.configuracao_parcelas_cartao?.length > 0 && (
                  <Alert className="mt-4 border-blue-300 bg-blue-50"><AlertDescription className="text-xs text-blue-900"><strong>📋 Exemplo de uso:</strong> Compra de R$ 1.200,00<div className="mt-2 grid grid-cols-2 gap-2">{formData.configuracao_parcelas_cartao.slice(0, 6).map(p => { const valorParcela = (1200 / p.numero_parcela) * (1 + (p.taxa_percentual / 100)); const valorTotal = valorParcela * p.numero_parcela; return <div key={p.numero_parcela} className="text-xs">{p.numero_parcela}x de R$ {valorParcela.toFixed(2)} = R$ {valorTotal.toFixed(2)}</div>; })}</div></AlertDescription></Alert>
                )}
              </CardContent>
            </Card>
          )}
          {formData.tipo !== 'Cartão Crédito' && (
            <Alert className="border-purple-300 bg-purple-50"><AlertDescription className="text-xs text-purple-900"><strong>Exemplo:</strong> Valor de R$ 1.200,00 em {formData.maximo_parcelas}x = {formData.maximo_parcelas > 0 ? ` ${formData.maximo_parcelas}x de R$ ${(1200 / formData.maximo_parcelas).toFixed(2)}` : ' -'}{formData.taxa_por_parcela > 0 && ` + ${formData.taxa_por_parcela}% taxa/parcela`}</AlertDescription></Alert>
          )}
        </div>
      )}
    </div>
  );
}