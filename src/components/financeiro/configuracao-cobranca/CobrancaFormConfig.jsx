import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CreditCard } from "lucide-react";

/**
 * Formulário de configuração de cobrança da empresa selecionada
 * Extraído de ConfiguracaoCobranca.jsx
 */
export default function CobrancaFormConfig({ config, setConfig, empresaSelecionada, salvarMutation, onSubmit }) {
  if (!empresaSelecionada) {
    return (
      <Card className="border-0 shadow-md w-full">
        <CardContent className="p-12 text-center text-slate-500">
          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Selecione uma empresa para configurar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full">
      {/* Provedor */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-purple-50 border-b"><CardTitle className="text-base">Provedor de Cobrança</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Checkbox checked={config.ativo} onCheckedChange={(v) => setConfig({ ...config, ativo: v })} />
            <Label className="text-base font-semibold">Ativar cobrança para esta empresa</Label>
          </div>
          <div>
            <Label>Provedor *</Label>
            <Select value={config.provedor_cobranca} onValueChange={(v) => setConfig({ ...config, provedor_cobranca: v })}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Nenhum">Nenhum</SelectItem>
                <SelectItem value="Asaas">Asaas</SelectItem>
                <SelectItem value="Juno">Juno</SelectItem>
                <SelectItem value="Pagar.me">Pagar.me</SelectItem>
                <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                <SelectItem value="Banco do Brasil">Banco do Brasil</SelectItem>
                <SelectItem value="Sicoob">Sicoob</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.provedor_cobranca !== "Nenhum" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>URL da API</Label>
                  <Input value={config.api_url} onChange={(e) => setConfig({ ...config, api_url: e.target.value })}
                    placeholder="https://api.asaas.com/v3" className="mt-2" />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input type="password" value={config.api_key} onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                    placeholder="Sua chave de API" className="mt-2" />
                </div>
              </div>
              <div>
                <Label>ID da Conta no Provedor</Label>
                <Input value={config.conta_id} onChange={(e) => setConfig({ ...config, conta_id: e.target.value })}
                  placeholder="acc_xxx..." className="mt-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Formas de Cobrança */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-green-50 border-b"><CardTitle className="text-base">Formas de Cobrança</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-3">
          {[
            { key: 'habilitar_boleto', label: 'Boleto Bancário' },
            { key: 'habilitar_pix', label: 'PIX' },
            { key: 'habilitar_cartao', label: 'Cartão de Crédito' }
          ].map(item => (
            <div key={item.key} className="flex items-center gap-3">
              <Checkbox checked={config[item.key]} onCheckedChange={(v) => setConfig({ ...config, [item.key]: v })} />
              <Label className="text-base">{item.label}</Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Parâmetros Financeiros */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-orange-50 border-b"><CardTitle className="text-base">Parâmetros Financeiros</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Dias até Vencimento</Label>
              <Input type="number" value={config.dias_vencimento_padrao}
                onChange={(e) => setConfig({ ...config, dias_vencimento_padrao: parseInt(e.target.value) })} className="mt-2" />
            </div>
            <div>
              <Label>Multa após Vencimento (%)</Label>
              <Input type="number" step="0.01" value={config.multa_pos_vencimento_percent}
                onChange={(e) => setConfig({ ...config, multa_pos_vencimento_percent: parseFloat(e.target.value) })} className="mt-2" />
            </div>
            <div>
              <Label>Juros ao Dia (%)</Label>
              <Input type="number" step="0.001" value={config.juros_ao_dia_percent}
                onChange={(e) => setConfig({ ...config, juros_ao_dia_percent: parseFloat(e.target.value) })} className="mt-2" />
            </div>
            <div>
              <Label>Desconto Antecipação (%)</Label>
              <Input type="number" step="0.01" value={config.desconto_antecipacao_percent}
                onChange={(e) => setConfig({ ...config, desconto_antecipacao_percent: parseFloat(e.target.value) })} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PIX */}
      {config.habilitar_pix && (
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-green-50 border-b"><CardTitle className="text-base">Configuração PIX</CardTitle></CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Chave</Label>
                <Select value={config.pix_tipo} onValueChange={(v) => setConfig({ ...config, pix_tipo: v })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                    <SelectItem value="Email">E-mail</SelectItem>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                    <SelectItem value="Aleatoria">Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chave PIX</Label>
                <Input value={config.pix_chave} onChange={(e) => setConfig({ ...config, pix_chave: e.target.value })}
                  placeholder="00.000.000/0001-00" className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagens */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-base">Mensagens Padrão</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Mensagem Boleto</Label>
            <Textarea value={config.mensagem_padrao_boleto} onChange={(e) => setConfig({ ...config, mensagem_padrao_boleto: e.target.value })} rows={2} className="mt-2" />
          </div>
          <div>
            <Label>Mensagem PIX</Label>
            <Textarea value={config.mensagem_padrao_pix} onChange={(e) => setConfig({ ...config, mensagem_padrao_pix: e.target.value })} rows={2} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Envio Automático */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-blue-50 border-b"><CardTitle className="text-base">Envio Automático</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox checked={config.enviar_email_automatico} onCheckedChange={(v) => setConfig({ ...config, enviar_email_automatico: v })} />
            <Label>Enviar e-mail automaticamente ao gerar cobrança</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox checked={config.enviar_whatsapp_automatico} onCheckedChange={(v) => setConfig({ ...config, enviar_whatsapp_automatico: v })} />
            <Label>Enviar WhatsApp automaticamente ao gerar cobrança</Label>
          </div>
        </CardContent>
      </Card>

      {/* Modo Simulação */}
      <Card className="border-2 border-yellow-300 bg-yellow-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Checkbox checked={config.modo_simulacao} onCheckedChange={(v) => setConfig({ ...config, modo_simulacao: v })} />
                <Label className="font-semibold text-yellow-900">Modo Simulação</Label>
              </div>
              <p className="text-sm text-yellow-800">
                Quando ativo, as cobranças serão geradas apenas localmente (mock), sem chamar a API do provedor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={salvarMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700">
          {salvarMutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </div>
    </form>
  );
}