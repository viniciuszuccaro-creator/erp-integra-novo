import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ClienteFiscalTab({ formData, setFormData, ultimaNF }) {
  return (
    <div className="space-y-6">
      {ultimaNF && ultimaNF.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Última Nota Fiscal Emitida</p>
                <p className="text-xs text-blue-700">
                  NF-e {ultimaNF[0].numero}/{ultimaNF[0].serie} - {new Date(ultimaNF[0].data_emissao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Badge variant="outline" className="text-blue-700">
                R$ {(ultimaNF[0].valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="regime_tributario">Regime Tributário</Label>
          <Select
            value={formData.configuracao_fiscal?.regime_tributario || "Simples Nacional"}
            onValueChange={(value) => setFormData({
              ...formData,
              configuracao_fiscal: {
                ...formData.configuracao_fiscal,
                regime_tributario: value
              }
            })}
          >
            <SelectTrigger id="regime_tributario">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
              <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
              <SelectItem value="Lucro Real">Lucro Real</SelectItem>
              <SelectItem value="MEI">MEI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cfop_padrao_venda">CFOP Padrão Vendas</Label>
          <Input
            id="cfop_padrao_venda"
            value={formData.configuracao_fiscal?.cfop_padrao_venda || "5102"}
            onChange={(e) => setFormData({
              ...formData,
              configuracao_fiscal: {
                ...formData.configuracao_fiscal,
                cfop_padrao_venda: e.target.value
              }
            })}
          />
        </div>

        <div>
          <Label htmlFor="tipo_contribuinte">Tipo de Contribuinte</Label>
          <Select
            value={formData.configuracao_fiscal?.tipo_contribuinte || "1 - Contribuinte"}
            onValueChange={(value) => setFormData({
              ...formData,
              configuracao_fiscal: {
                ...formData.configuracao_fiscal,
                tipo_contribuinte: value
              }
            })}
          >
            <SelectTrigger id="tipo_contribuinte">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[99999]">
              <SelectItem value="1 - Contribuinte">1 - Contribuinte ICMS</SelectItem>
              <SelectItem value="2 - Isento">2 - Isento</SelectItem>
              <SelectItem value="9 - Não Contribuinte">9 - Não Contribuinte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 pt-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isento_icms"
              checked={formData.configuracao_fiscal?.isento_icms || false}
              onChange={(e) => setFormData({
                ...formData,
                configuracao_fiscal: {
                  ...formData.configuracao_fiscal,
                  isento_icms: e.target.checked
                }
              })}
              className="rounded"
            />
            <Label htmlFor="isento_icms" className="font-normal cursor-pointer">
              Isento ICMS
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isento_ipi"
              checked={formData.configuracao_fiscal?.isento_ipi || false}
              onChange={(e) => setFormData({
                ...formData,
                configuracao_fiscal: {
                  ...formData.configuracao_fiscal,
                  isento_ipi: e.target.checked
                }
              })}
              className="rounded"
            />
            <Label htmlFor="isento_ipi" className="font-normal cursor-pointer">
              Isento IPI
            </Label>
          </div>
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes_fiscais">Observações Fiscais</Label>
          <Textarea
            id="observacoes_fiscais"
            value={formData.configuracao_fiscal?.observacoes_fiscais || ""}
            onChange={(e) => setFormData({
              ...formData,
              configuracao_fiscal: {
                ...formData.configuracao_fiscal,
                observacoes_fiscais: e.target.value
              }
            })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}