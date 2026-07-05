import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, CheckCircle2 } from "lucide-react";

export default function ProdutoBitolaConversoesSection({
  formData, setFormData, calculoConversao, toggleUnidadeSecundaria,
}) {
  return (
    <>
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-dashed">
        <div>
          <Label className="text-base font-semibold">É uma Bitola de Aço?</Label>
          <p className="text-xs text-slate-500">Habilita campos específicos e conversão PÇ ↔ KG ↔ MT</p>
        </div>
        <Switch checked={formData.eh_bitola} onCheckedChange={(v) => {
          setFormData(prev => ({...prev, eh_bitola: v}));
          if (v) setFormData(prev => ({...prev, unidade_principal: 'KG', unidades_secundarias: ['PÇ', 'KG', 'MT'], tipo_item: 'Matéria-Prima Produção'}));
        }} />
      </div>

      {formData.eh_bitola && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-blue-900">📏 Especificações da Bitola</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Diâmetro (mm) *</Label>
                <Input type="number" step="0.1" value={formData.bitola_diametro_mm} onChange={(e) => setFormData(prev => ({...prev, bitola_diametro_mm: parseFloat(e.target.value) || 0}))} placeholder="8.0" />
              </div>
              <div>
                <Label>Peso Teórico (kg/m) *</Label>
                <Input type="number" step="0.001" value={formData.peso_teorico_kg_m} onChange={(e) => setFormData(prev => ({...prev, peso_teorico_kg_m: parseFloat(e.target.value) || 0}))} placeholder="0.395" />
                <p className="text-xs text-slate-500 mt-1">Tabela oficial ABNT</p>
              </div>
              <div>
                <Label>Tipo de Aço</Label>
                <Select value={formData.tipo_aco} onValueChange={(v) => setFormData(prev => ({...prev, tipo_aco: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA-25">CA-25</SelectItem>
                    <SelectItem value="CA-50">CA-50</SelectItem>
                    <SelectItem value="CA-60">CA-60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>Comprimento Padrão da Barra (metros)</Label>
                <Input type="number" step="0.1" value={formData.comprimento_barra_padrao_m} onChange={(e) => setFormData(prev => ({...prev, comprimento_barra_padrao_m: parseFloat(e.target.value) || 12}))} placeholder="12" />
                <p className="text-xs text-slate-500 mt-1">🔧 Usado para calcular kg_por_peca automaticamente</p>
              </div>
            </div>

            {calculoConversao && (
              <Alert className="border-green-300 bg-green-50">
                <Calculator className="w-4 h-4 text-green-700" />
                <AlertDescription>
                  <p className="font-semibold text-sm text-green-900 mb-2">✅ Conversões Calculadas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                    <p>• 1 PÇ (barra) = <strong>{calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
                    <p>• 1 MT = <strong>{calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
                    <p>• 1 TON = <strong>{calculoConversao.peca_por_ton.toFixed(1)} PÇ</strong></p>
                    <p>• 1 PÇ = <strong>{calculoConversao.metros_por_peca} MT</strong></p>
                  </div>
                  <p className="text-xs text-green-700 mt-2">💡 Essas conversões serão usadas em Vendas, Compras e Estoque automaticamente</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-indigo-300 bg-indigo-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Calculator className="w-5 h-5" /> V22.0: Unidades e Conversões</h3>
          <Alert className="border-indigo-400 bg-indigo-100"><AlertDescription className="text-sm text-indigo-900">🎯 <strong>REGRA MESTRE:</strong> As unidades selecionadas aqui estarão disponíveis em Vendas, Compras e Movimentações</AlertDescription></Alert>

          <div>
            <Label>Unidade Principal (Relatórios e Dashboard)</Label>
            <Select value={formData.unidade_principal} onValueChange={(v) => setFormData(prev => ({...prev, unidade_principal: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">Unidade (UN)</SelectItem><SelectItem value="PÇ">Peça (PÇ)</SelectItem>
                <SelectItem value="KG">Quilograma (KG)</SelectItem><SelectItem value="MT">Metro (MT)</SelectItem>
                <SelectItem value="TON">Tonelada (TON)</SelectItem><SelectItem value="CX">Caixa (CX)</SelectItem>
                <SelectItem value="LT">Litro (LT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Unidades Habilitadas (Multi-Select) *</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
              {['UN', 'PÇ', 'KG', 'MT', 'TON', 'CX', 'BARRA'].map(unidade => (
                <Badge key={unidade} className={`cursor-pointer transition-all ${(formData.unidades_secundarias || []).includes(unidade) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`} onClick={() => toggleUnidadeSecundaria(unidade)}>
                  {(formData.unidades_secundarias || []).includes(unidade) && <CheckCircle2 className="w-3 h-3 mr-1" />}{unidade}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">✅ Selecionadas: {(formData.unidades_secundarias || []).join(', ')}</p>
          </div>

          {formData.unidades_secundarias?.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm text-blue-900">
                <p className="font-semibold mb-2">📦 Como será usado nos módulos:</p>
                <div className="space-y-1 text-xs">
                  <p>• <strong>Vendas:</strong> Dropdown terá opções: {formData.unidades_secundarias.join(', ')}</p>
                  <p>• <strong>Compras:</strong> Dropdown terá opções: {formData.unidades_secundarias.join(', ')}</p>
                  <p>• <strong>Estoque:</strong> Saldo sempre em KG (conversão automática)</p>
                  <p>• <strong>NF-e:</strong> Unidade do pedido + equivalente KG</p>
                  {formData.tipo_item === 'Matéria-Prima Produção' && <p className="text-orange-700 font-semibold">• <strong>Produção:</strong> ✅ Disponível em OPs</p>}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </>
  );
}