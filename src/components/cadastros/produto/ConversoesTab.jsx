import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calculator } from 'lucide-react';

/**
 * Aba Conversões do formulário de produto
 */
export default function ConversoesTab({ formData, setFormData, toggleUnidadeSecundaria, calculoConversao }) {
  return (
    <Card className="border-indigo-300 bg-white/60 backdrop-blur-md shadow-lg">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-bold text-indigo-900">V22.0: Unidades e Conversões</h3>

        <Alert className="border-indigo-400 bg-indigo-100">
          <AlertDescription className="text-sm text-indigo-900">
            🎯 <strong>REGRA MESTRE:</strong> As unidades selecionadas aqui estarão disponíveis em Vendas, Compras e Movimentações
          </AlertDescription>
        </Alert>

        <div>
          <Label>Unidade Principal (Relatórios) *</Label>
          <Select
            value={formData.unidade_principal}
            onValueChange={(v) => setFormData(prev => ({ ...prev, unidade_principal: v, unidade_medida: v }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="UN">Unidade (UN)</SelectItem>
              <SelectItem value="PÇ">Peça (PÇ)</SelectItem>
              <SelectItem value="KG">Quilograma (KG)</SelectItem>
              <SelectItem value="MT">Metro (MT)</SelectItem>
              <SelectItem value="TON">Tonelada (TON)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Unidades Habilitadas (Multi-Select) *</Label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white">
            {['UN', 'PÇ', 'KG', 'MT', 'TON', 'CX', 'BARRA'].map(unidade => (
              <Badge
                key={unidade}
                className={`cursor-pointer transition-all ${
                  (formData.unidades_secundarias || []).includes(unidade)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
                onClick={() => toggleUnidadeSecundaria(unidade)}
              >
                {(formData.unidades_secundarias || []).includes(unidade) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {unidade}
              </Badge>
            ))}
          </div>
        </div>

        {calculoConversao && (
          <Card className="border-green-200 bg-white/60 backdrop-blur-md shadow-lg">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm text-green-900 mb-3">✅ Fatores de Conversão</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <p>1 PÇ = {calculoConversao.kg_por_peca.toFixed(2)} KG</p>
                <p>1 MT = {calculoConversao.kg_por_metro.toFixed(3)} KG</p>
                <p>1 TON = {calculoConversao.peca_por_ton.toFixed(1)} PÇ</p>
                <p>1 PÇ = {calculoConversao.metros_por_peca} MT</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}