import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import useRLSQuery from "@/components/lib/useRLSQuery";

export default function ComercialTab({ formData, setFormData }) {
  const { data: tabelasPreco = [], isLoading: loadingTabelas } = useRLSQuery('TabelaPreco', {}, 'nome', 50);
  const { data: condicoesComerciais = [], isLoading: loadingCondicoes } = useRLSQuery('CondicaoComercial', {}, 'nome_condicao', 100);

  if (!formData) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tabela de Preço *</Label>
          <Select
            value={formData.condicao_comercial?.tabela_preco_nome || ""}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                condicao_comercial: { ...prev.condicao_comercial, tabela_preco_nome: value },
              }))
            }
          >
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {loadingTabelas && <SelectItem value="_loading" disabled>Carregando...</SelectItem>}
              {!loadingTabelas && tabelasPreco.length === 0 && <SelectItem value="_empty" disabled>Nenhuma tabela cadastrada</SelectItem>}
              {tabelasPreco.map((t) => (
                <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Desconto Adicional (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.condicao_comercial?.percentual_desconto || 0}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                condicao_comercial: {
                  ...prev.condicao_comercial,
                  percentual_desconto: parseFloat(e.target.value) || 0,
                },
              }))
            }
          />
        </div>

        <div>
          <Label>Vigência do Desconto Até</Label>
          <Input
            type="date"
            value={formData.condicao_comercial?.vigencia_desconto_ate || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                condicao_comercial: { ...prev.condicao_comercial, vigencia_desconto_ate: e.target.value },
              }))
            }
          />
          <p className="text-xs text-slate-500 mt-1">⚠️ Alerta será enviado 30 dias antes do vencimento</p>
        </div>

        <div>
          <Label>Condição de Pagamento *</Label>
          <Select
            value={formData.condicao_comercial?.condicao_pagamento || "À Vista"}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                condicao_comercial: { ...prev.condicao_comercial, condicao_pagamento: value },
              }))
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {loadingCondicoes && <SelectItem value="_loading" disabled>Carregando...</SelectItem>}
              {!loadingCondicoes && condicoesComerciais.length === 0 && <SelectItem value="_empty" disabled>Nenhuma condição cadastrada</SelectItem>}
              {condicoesComerciais.map((c) => (
                <SelectItem key={c.id} value={c.nome_condicao || c.descricao}>{c.nome_condicao || c.descricao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Dia Vencimento Preferencial (1-31)</Label>
          <Input
            type="number"
            min="1"
            max="31"
            value={formData.condicao_comercial?.dia_vencimento_preferencial || 10}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                condicao_comercial: {
                  ...prev.condicao_comercial,
                  dia_vencimento_preferencial: parseInt(e.target.value) || 10,
                },
              }))
            }
          />
        </div>

        <div>
          <Label>Limite de Crédito (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.condicao_comercial?.limite_credito || 0}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                condicao_comercial: {
                  ...prev.condicao_comercial,
                  limite_credito: parseFloat(e.target.value) || 0,
                },
              }))
            }
            disabled={formData.condicao_comercial?.condicao_pagamento === "À Vista"}
          />
          {formData.condicao_comercial?.condicao_pagamento === "À Vista" && (
            <p className="text-xs text-amber-600 mt-1">⚠️ Limite de crédito é R$ 0,00 para pagamento À Vista</p>
          )}
        </div>

        <div>
          <Label>Vendedor Responsável *</Label>
          <Input
            value={formData.vendedor_responsavel}
            onChange={(e) => setFormData((prev) => ({ ...prev, vendedor_responsavel: e.target.value }))}
            required
          />
        </div>
      </div>

      {(formData.condicao_comercial?.limite_credito || 0) > 0 && (
        <Card className="p-4 bg-blue-50">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Aprovação de Limite de Crédito</h4>
              <p className="text-sm text-blue-700 mt-1">
                Limite de crédito superior a R$ 0,00 requer aprovação do Gerente Financeiro. O sistema registrará automaticamente quem e quando aprovou.
              </p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}