import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Badge as BadgeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ClienteFinanceiroTab({ formData, setFormData, tabelasPreco, formasPagamento, calcularSituacaoCredito }) {
  return (
    <div className="space-y-6">
      <Card className={`border-2 ${
        calcularSituacaoCredito() === 'OK' ? 'border-green-300 bg-green-50' :
        calcularSituacaoCredito() === 'Alerta' ? 'border-orange-300 bg-orange-50' :
        'border-red-300 bg-red-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-6 h-6 ${
              calcularSituacaoCredito() === 'OK' ? 'text-green-600' :
              calcularSituacaoCredito() === 'Alerta' ? 'text-orange-600' :
              'text-red-600'
            }`} />
            <div>
              <p className="font-semibold">Situação de Crédito: {calcularSituacaoCredito()}</p>
              <p className="text-sm text-slate-600">
                Utilizado: R$ {(formData.condicao_comercial?.limite_credito_utilizado || 0).toLocaleString('pt-BR')}
                {' '}de R$ {(formData.condicao_comercial?.limite_credito || 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="limite_credito">Limite de Crédito (R$)</Label>
          <Input
            id="limite_credito"
            type="number"
            step="0.01"
            value={formData.condicao_comercial?.limite_credito || 0}
            onChange={(e) => setFormData({
              ...formData,
              condicao_comercial: {
                ...formData.condicao_comercial,
                limite_credito: parseFloat(e.target.value) || 0
              }
            })}
          />
        </div>

        <div>
          <Label htmlFor="limite_utilizado">Limite Utilizado (R$)</Label>
          <Input
            id="limite_utilizado"
            type="number"
            step="0.01"
            value={formData.condicao_comercial?.limite_credito_utilizado || 0}
            onChange={(e) => setFormData({
              ...formData,
              condicao_comercial: {
                ...formData.condicao_comercial,
                limite_credito_utilizado: parseFloat(e.target.value) || 0
              }
            })}
            disabled
          />
          <p className="text-xs text-slate-500 mt-1">Calculado automaticamente</p>
        </div>

        <div>
          <Label htmlFor="tabela_preco_id">Tabela de Preço</Label>
          <Select
            value={formData.condicao_comercial?.tabela_preco_id || ""}
            onValueChange={(value) => {
              const tabela = tabelasPreco.find(t => t.id === value);
              setFormData({
                ...formData,
                condicao_comercial: {
                  ...formData.condicao_comercial,
                  tabela_preco_id: value,
                  tabela_preco_nome: tabela?.nome || ""
                }
              });
            }}
          >
            <SelectTrigger id="tabela_preco_id">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              {tabelasPreco.filter(t => t.ativo).map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nome} ({t.tipo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="forma_pagamento_padrao_id">Forma de Pagamento Padrão</Label>
          <Select
            value={formData.condicao_comercial?.forma_pagamento_padrao_id || ""}
            onValueChange={(value) => {
              const forma = formasPagamento.find(f => f.id === value);
              setFormData({
                ...formData,
                condicao_comercial: {
                  ...formData.condicao_comercial,
                  forma_pagamento_padrao_id: value,
                  forma_pagamento_padrao_nome: forma?.descricao || ""
                }
              });
            }}
          >
            <SelectTrigger id="forma_pagamento_padrao_id">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              {formasPagamento.filter(f => f.ativa).map(f => (
                <SelectItem key={f.id} value={f.id}>
                  {f.descricao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="condicao_pagamento">Condição de Pagamento</Label>
          <Select
            value={formData.condicao_comercial?.condicao_pagamento || "À Vista"}
            onValueChange={(value) => setFormData({
              ...formData,
              condicao_comercial: {
                ...formData.condicao_comercial,
                condicao_pagamento: value
              }
            })}
          >
            <SelectTrigger id="condicao_pagamento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value="À Vista">À Vista</SelectItem>
              <SelectItem value="7 dias">7 dias</SelectItem>
              <SelectItem value="15 dias">15 dias</SelectItem>
              <SelectItem value="30 dias">30 dias</SelectItem>
              <SelectItem value="45 dias">45 dias</SelectItem>
              <SelectItem value="60 dias">60 dias</SelectItem>
              <SelectItem value="Parcelado">Parcelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="percentual_desconto">Desconto Padrão (%)</Label>
          <Input
            id="percentual_desconto"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.condicao_comercial?.percentual_desconto || 0}
            onChange={(e) => setFormData({
              ...formData,
              condicao_comercial: {
                ...formData.condicao_comercial,
                percentual_desconto: parseFloat(e.target.value) || 0
              }
            })}
          />
        </div>
      </div>
    </div>
  );
}