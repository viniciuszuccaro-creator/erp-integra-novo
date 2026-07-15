import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function TabelaFiscalTabValidacao({
  formData, setFormData, validandoIA, onValidarIA, podeUsarIA
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Status de Validação IA</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {formData.validado_ia ? (
          <Alert className="border-green-300 bg-green-50">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription>
              <strong>Validado pela IA</strong>
              <p className="text-xs mt-1">Confiança: {formData.confianca_ia}%</p>
              {formData.ultima_validacao_ia && (
                <p className="text-xs">Última validação: {new Date(formData.ultima_validacao_ia).toLocaleString('pt-BR')}</p>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-orange-300 bg-orange-50">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <AlertDescription>
              Esta regra fiscal ainda não foi validada pela IA. Clique em "Validar com IA" para obter sugestões.
            </AlertDescription>
          </Alert>
        )}
        <Button type="button" onClick={onValidarIA} disabled={validandoIA || !podeUsarIA} data-sensitive="true"
          className="w-full" variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          {validandoIA ? "Validando com IA..." : "Validar com IA Fiscal"}
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Prioridade</Label>
            <Input type="number" value={formData.prioridade}
              onChange={(e) => setFormData({ ...formData, prioridade: parseInt(e.target.value) || 100 })} />
            <p className="text-xs text-slate-500 mt-1">Quanto maior, mais prioritária</p>
          </div>
          <div>
            <Label className="text-xs">Origem da Mercadoria</Label>
            <Select value={formData.origem_mercadoria} onValueChange={(value) => setFormData({ ...formData, origem_mercadoria: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0 - Nacional">0 - Nacional</SelectItem>
                <SelectItem value="1 - Estrangeira Importação Direta">1 - Estrangeira Importação Direta</SelectItem>
                <SelectItem value="2 - Estrangeira Mercado Interno">2 - Estrangeira Mercado Interno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Legislação Base</Label>
          <Textarea value={formData.legislacao_base || ""}
            onChange={(e) => setFormData({ ...formData, legislacao_base: e.target.value })}
            placeholder="Referência à legislação..." rows={2} />
        </div>
      </CardContent>
    </Card>
  );
}