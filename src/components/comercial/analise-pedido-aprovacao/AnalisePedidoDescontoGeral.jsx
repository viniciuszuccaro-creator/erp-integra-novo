import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingDown } from "lucide-react";

export default function AnalisePedidoDescontoGeral({
  descontoGeralPercentual, setDescontoGeralPercentual,
  descontoGeralValor, setDescontoGeralValor,
  descontoGeralCalculado
}) {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Desconto Geral do Pedido
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Desconto % (percentual)</Label>
            <Input
              type="number" step="0.01"
              value={descontoGeralPercentual}
              onChange={(e) => { setDescontoGeralPercentual(parseFloat(e.target.value) || 0); setDescontoGeralValor(0); }}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Desconto R$ (valor)</Label>
            <Input
              type="number" step="0.01"
              value={descontoGeralValor}
              onChange={(e) => { setDescontoGeralValor(parseFloat(e.target.value) || 0); setDescontoGeralPercentual(0); }}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="mt-3 p-2 bg-purple-100 rounded">
          <p className="text-sm text-purple-800">
            <strong>Desconto Geral Aplicado:</strong> R$ {descontoGeralCalculado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}