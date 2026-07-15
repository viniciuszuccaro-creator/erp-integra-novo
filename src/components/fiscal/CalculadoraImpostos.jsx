import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { calcularImpostosItem } from '../lib/calculoImpostos';
import { formatarMoeda, formatarPercentual } from '../lib/validacoes';

/**
 * Calculadora de Impostos Interativa
 * Calcula ICMS, PIS, COFINS, IPI e DIFAL
 */
export default function CalculadoraImpostos({ 
  onCalculado,
  valorInicial = 1000,
  regimeInicial = 'Lucro Presumido'
}) {
  const [dados, setDados] = useState({
    valor_unitario: valorInicial,
    quantidade: 1,
    ncm: '73089090',
    cfop: '5102',
    regime_tributario: regimeInicial,
    uf_emitente: 'SP',
    uf_destinatario: 'SP',
    tipo_contribuinte: '1 - Contribuinte',
    incluir_ipi: false
  });

  const [resultado, setResultado] = useState(null);

  const handleCalcular = async () => {
    const calc = await calcularImpostosItem(dados);
    setResultado(calc);
    
    if (onCalculado) {
      onCalculado(calc);
    }
  };

  const operacaoInterna = dados.uf_emitente === dados.uf_destinatario;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Calculadora de Impostos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valor Unitário (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={dados.valor_unitario}
                onChange={(e) => setDados({...dados, valor_unitario: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={dados.quantidade}
                onChange={(e) => setDados({...dados, quantidade: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>NCM</Label>
              <Input
                value={dados.ncm}
                onChange={(e) => setDados({...dados, ncm: e.target.value})}
                placeholder="00000000"
                maxLength={8}
              />
            </div>
            <div>
              <Label>CFOP</Label>
              <Input
                value={dados.cfop}
                onChange={(e) => setDados({...dados, cfop: e.target.value})}
                placeholder="5102"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <Label>Regime Tributário do Emitente</Label>
            <Select value={dados.regime_tributario} onValueChange={(v) => setDados({...dados, regime_tributario: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                <SelectItem value="MEI">MEI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>UF Emitente</Label>
              <Select value={dados.uf_emitente} onValueChange={(v) => setDados({...dados, uf_emitente: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 
                    'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'].map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>UF Destinatário</Label>
              <Select value={dados.uf_destinatario} onValueChange={(v) => setDados({...dados, uf_destinatario: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 
                    'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO'].map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo Contribuinte</Label>
              <Select value={dados.tipo_contribuinte} onValueChange={(v) => setDados({...dados, tipo_contribuinte: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 - Contribuinte">Contribuinte</SelectItem>
                  <SelectItem value="2 - Isento">Isento</SelectItem>
                  <SelectItem value="9 - Não Contribuinte">Não Contribuinte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="incluir_ipi"
              checked={dados.incluir_ipi}
              onChange={(e) => setDados({...dados, incluir_ipi: e.target.checked})}
              className="w-4 h-4"
            />
            <Label htmlFor="incluir_ipi" className="cursor-pointer">
              Incluir IPI no cálculo
            </Label>
          </div>

          <Button onClick={handleCalcular} className="w-full bg-blue-600 hover:bg-blue-700">
            <Calculator className="w-4 h-4 mr-2" />
            Calcular Impostos
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card className="border-2 border-green-300 shadow-lg">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="w-5 h-5" />
              Resultado do Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {!operacaoInterna && dados.tipo_contribuinte !== '1 - Contribuinte' && (
              <Alert className="border-orange-300 bg-orange-50">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <AlertDescription>
                  <p className="text-sm text-orange-900 font-semibold">
                    ⚠️ DIFAL Aplicável
                  </p>
                  <p className="text-xs text-orange-800">
                    Operação interestadual para não contribuinte - DIFAL será calculado
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatarMoeda(resultado.valor_total)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-xs text-red-700 mb-1">Total Impostos</p>
                <p className="text-2xl font-bold text-red-900">
                  {formatarMoeda(resultado.total_impostos)}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {formatarPercentual(resultado.carga_tributaria_percentual)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              {resultado.icms.valor > 0 && (
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <div>
                    <p className="font-semibold text-sm">ICMS</p>
                    <p className="text-xs text-slate-600">
                      Base: {formatarMoeda(resultado.icms.base_calculo)} • {formatarPercentual(resultado.icms.aliquota)}
                    </p>
                  </div>
                  <Badge className="bg-blue-600 text-white">
                    {formatarMoeda(resultado.icms.valor)}
                  </Badge>
                </div>
              )}

              {resultado.ipi.valor > 0 && (
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <div>
                    <p className="font-semibold text-sm">IPI</p>
                    <p className="text-xs text-slate-600">
                      Base: {formatarMoeda(resultado.ipi.base_calculo)} • {formatarPercentual(resultado.ipi.aliquota)}
                    </p>
                  </div>
                  <Badge className="bg-purple-600 text-white">
                    {formatarMoeda(resultado.ipi.valor)}
                  </Badge>
                </div>
              )}

              {resultado.pis.valor > 0 && (
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <div>
                    <p className="font-semibold text-sm">PIS</p>
                    <p className="text-xs text-slate-600">
                      {formatarPercentual(resultado.pis.aliquota)}
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {formatarMoeda(resultado.pis.valor)}
                  </Badge>
                </div>
              )}

              {resultado.cofins.valor > 0 && (
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <div>
                    <p className="font-semibold text-sm">COFINS</p>
                    <p className="text-xs text-slate-600">
                      {formatarPercentual(resultado.cofins.aliquota)}
                    </p>
                  </div>
                  <Badge className="bg-green-700 text-white">
                    {formatarMoeda(resultado.cofins.valor)}
                  </Badge>
                </div>
              )}

              {resultado.difal.valor > 0 && (
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200">
                  <div>
                    <p className="font-semibold text-sm">DIFAL</p>
                    <p className="text-xs text-orange-700">
                      ICMS Destino: {formatarPercentual(resultado.difal.icms_destino_aliquota)} • 
                      ICMS Origem: {formatarPercentual(resultado.difal.icms_origem_aliquota)}
                    </p>
                  </div>
                  <Badge className="bg-orange-600 text-white">
                    {formatarMoeda(resultado.difal.valor)}
                  </Badge>
                </div>
              )}

              {resultado.difal.fcp_valor > 0 && (
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-200">
                  <div>
                    <p className="font-semibold text-sm">FCP (Fundo Pobreza)</p>
                    <p className="text-xs text-orange-700">
                      {formatarPercentual(resultado.difal.fcp_aliquota)}
                    </p>
                  </div>
                  <Badge className="bg-orange-700 text-white">
                    {formatarMoeda(resultado.difal.fcp_valor)}
                  </Badge>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Valor com Impostos</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Carga Tributária: {formatarPercentual(resultado.carga_tributaria_percentual)}
                  </p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {formatarMoeda(resultado.valor_com_impostos)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}