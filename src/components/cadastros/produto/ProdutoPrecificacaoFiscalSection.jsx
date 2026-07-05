import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Package, FileText } from "lucide-react";
import ProtectedField from "@/components/security/ProtectedField";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";

export default function ProdutoPrecificacaoFiscalSection({
  formData, setFormData, sugestoesIA, handleDadosNCM,
}) {
  return (
    <>
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-green-900 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> 💰 Precificação</h3>
          <div className="grid grid-cols-3 gap-4">
            <ProtectedField module="Estoque" submodule="Produto" tab="Precificacao" field="custo_aquisicao" action="visualizar" asText>
              <div>
                <Label>Custo Aquisição</Label>
                <Input type="number" step="0.01" value={formData.custo_aquisicao} onChange={(e) => setFormData(prev => ({...prev, custo_aquisicao: parseFloat(e.target.value) || 0}))} placeholder="0.00" />
              </div>
            </ProtectedField>
            <div>
              <Label>Preço Venda</Label>
              <Input type="number" step="0.01" value={formData.preco_venda} onChange={(e) => setFormData(prev => ({...prev, preco_venda: parseFloat(e.target.value) || 0}))} placeholder="0.00" />
            </div>
            <ProtectedField module="Estoque" submodule="Produto" tab="Precificacao" field="margem_percentual" action="visualizar" asText>
              <div>
                <Label>Margem (%)</Label>
                <Input type="number" value={formData.custo_aquisicao > 0 ? (((formData.preco_venda - formData.custo_aquisicao) / formData.custo_aquisicao) * 100).toFixed(2) : 0} disabled className="bg-slate-100" />
              </div>
            </ProtectedField>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-orange-900 flex items-center gap-2"><Package className="w-5 h-5" /> Peso e Dimensões (Logística & E-commerce)</h3>
          <Alert className="border-orange-300 bg-orange-100"><AlertDescription className="text-xs text-orange-900">📦 <strong>Usado em:</strong> Cálculo de frete, cubagem de caminhão, catálogo de marketplace (ML, Shopee), Portal do Cliente</AlertDescription></Alert>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Peso Líquido (kg)</Label>
              <Input type="number" step="0.001" value={formData.peso_liquido_kg} onChange={(e) => setFormData(prev => ({...prev, peso_liquido_kg: parseFloat(e.target.value) || 0}))} placeholder="0.000" />
              <p className="text-xs text-slate-500 mt-1">Peso do produto sem embalagem</p>
            </div>
            <div>
              <Label>Peso Bruto (kg)</Label>
              <Input type="number" step="0.001" value={formData.peso_bruto_kg} onChange={(e) => setFormData(prev => ({...prev, peso_bruto_kg: parseFloat(e.target.value) || 0}))} placeholder="0.000" />
              <p className="text-xs text-slate-500 mt-1">Peso com embalagem</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div><Label>Altura (cm)</Label><Input type="number" step="0.1" value={formData.altura_cm} onChange={(e) => setFormData(prev => ({...prev, altura_cm: parseFloat(e.target.value) || 0}))} placeholder="0.0" /></div>
            <div><Label>Largura (cm)</Label><Input type="number" step="0.1" value={formData.largura_cm} onChange={(e) => setFormData(prev => ({...prev, largura_cm: parseFloat(e.target.value) || 0}))} placeholder="0.0" /></div>
            <div><Label>Comprimento (cm)</Label><Input type="number" step="0.1" value={formData.comprimento_cm} onChange={(e) => setFormData(prev => ({...prev, comprimento_cm: parseFloat(e.target.value) || 0}))} placeholder="0.0" /></div>
            <div><Label>Volume (m³)</Label><Input type="number" value={formData.volume_m3?.toFixed(6) || 0} disabled className="bg-slate-100" /><p className="text-xs text-slate-500 mt-1">Calculado automaticamente</p></div>
          </div>
          {formData.volume_m3 > 0 && (
            <Alert className="border-green-300 bg-green-50"><AlertDescription className="text-xs text-green-900">✅ <strong>Cubagem:</strong> {formData.volume_m3.toFixed(6)} m³ por unidade{formData.peso_bruto_kg > 0 && ` • Peso taxado: ${Math.max(formData.peso_bruto_kg, formData.volume_m3 * 300).toFixed(2)} kg`}</AlertDescription></Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-base flex items-center gap-2"><FileText className="w-5 h-5 text-purple-600" /> Configuração Fiscal</CardTitle></CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <Label htmlFor="ncm">NCM (Código Fiscal)</Label>
              <Input id="ncm" value={formData.ncm || ""} onChange={(e) => setFormData(prev => ({...prev, ncm: e.target.value}))} placeholder="00000000" maxLength={8} />
              {sugestoesIA.ncm_info && <p className="text-xs text-blue-600 mt-1">ℹ️ {sugestoesIA.ncm_info}</p>}
            </div>
            <div><BotaoBuscaAutomatica tipo="ncm" valor={formData.ncm} onDadosEncontrados={handleDadosNCM} disabled={!formData.ncm || formData.ncm.length !== 8}>Buscar NCM</BotaoBuscaAutomatica></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="cest">CEST</Label><Input id="cest" value={formData.cest || ""} onChange={(e) => setFormData(prev => ({...prev, cest: e.target.value}))} placeholder="00.000.00" maxLength={10} /></div>
            <div><Label htmlFor="unidade_medida">Unidade de Medida Fiscal</Label><Input id="unidade_medida" value={formData.unidade_medida || ""} onChange={(e) => setFormData(prev => ({...prev, unidade_medida: e.target.value}))} placeholder="UN, KG, M" /></div>
          </div>
          <div>
            <Label>Status do Produto</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({...prev, status: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem><SelectItem value="Descontinuado">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </>
  );
}