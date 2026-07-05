import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, DollarSign, Zap, Rocket, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ValidadorEstoquePedido from "../ValidadorEstoquePedido";

export default function AnalisePedidoResumoFinanceiro({
  pedido, totais, comentarios, setComentarios,
  fecharAutomatico, setFecharAutomatico,
  onAprovar, onNegar, temEstoqueInsuficiente,
}) {
  return (
    <>
      {/* ANÁLISE DE MARGEM */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-orange-700">Margem Mínima</Label>
              <p className="text-2xl font-bold text-orange-900">{pedido.margem_minima_produto || 0}%</p>
            </div>
            <div>
              <Label className="text-xs text-orange-700">Margem Média Atual</Label>
              <p className={`text-2xl font-bold ${totais.margemMedia < 5 ? 'text-red-600' : totais.margemMedia < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                {totais.margemMedia.toFixed(2)}%
              </p>
            </div>
            <div>
              <Label className="text-xs text-orange-700">Valor Final</Label>
              <p className="text-2xl font-bold text-green-600">R$ {totais.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          {totais.margemMedia < 5 && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Atenção: Margem abaixo de 5% - Risco Alto</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ValidadorEstoquePedido pedido={pedido} empresaId={pedido.empresa_id} />

      {/* RESUMO FINANCEIRO */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Resumo Financeiro
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-700">Subtotal (itens):</span>
              <span className="font-semibold">R$ {totais.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Desc. nos Itens:</span>
              <span className="font-semibold text-red-600">- R$ {totais.descontoItensTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Desc. Geral:</span>
              <span className="font-semibold text-red-600">- R$ {totais.descontoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-700">Frete:</span>
              <span className="font-semibold">+ R$ {(pedido.valor_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="col-span-2 border-t border-blue-300 pt-2 mt-2">
              <div className="flex justify-between text-lg">
                <span className="font-bold text-blue-900">VALOR FINAL:</span>
                <span className="font-bold text-blue-900">R$ {totais.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* COMENTÁRIOS */}
      <div>
        <Label>Comentários da Aprovação/Negação</Label>
        <Textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} placeholder="Informe o motivo da decisão..." rows={4} />
      </div>

      {/* PREVISÃO DE IMPACTO IA */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" /> Previsão de Impacto (IA)
          </h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-600">Impacto no Lucro</p>
              <p className={`font-bold ${totais.margemMedia < 5 ? 'text-red-600' : 'text-green-600'}`}>
                {totais.margemMedia < 5 ? '🔴 Alto Risco' : totais.margemMedia < 10 ? '🟡 Médio' : '🟢 Baixo'}
              </p>
            </div>
            <div><p className="text-slate-600">Probabilidade Pagamento</p><p className="font-bold text-green-700">87%</p></div>
            <div><p className="text-slate-600">Score do Cliente</p><p className="font-bold text-blue-700">A+</p></div>
          </div>
        </CardContent>
      </Card>

      {/* TOGGLE FECHAMENTO AUTOMÁTICO */}
      <Card className="border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-slate-900">🚀 Fechamento Automático</p>
                <p className="text-xs text-slate-600">Após aprovação: Baixa Estoque + Gera Financeiro + Cria Logística</p>
              </div>
            </div>
            <Switch checked={fecharAutomatico} onCheckedChange={setFecharAutomatico} id="auto-close-approval" />
          </div>
          {fecharAutomatico && (
            <div className="mt-3 p-2 bg-blue-100 rounded-lg border border-blue-300">
              <p className="text-xs text-blue-800">✅ Após aprovar, o sistema executará automaticamente todo o fluxo de fechamento (~10s)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AÇÕES */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" data-permission="Comercial.Pedido.rejeitar" onClick={() => onNegar(comentarios)}
          className="border-red-300 text-red-600 hover:bg-red-50">
          <XCircle className="w-4 h-4 mr-2" /> Negar Desconto
        </Button>
        <Button data-permission="Comercial.Pedido.aprovar" onClick={onAprovar} disabled={temEstoqueInsuficiente}
          className={fecharAutomatico ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg" : "bg-green-600 hover:bg-green-700 shadow-lg"}>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {fecharAutomatico ? '✅ Aprovar e 🚀 Fechar' : '✅ Aprovar Pedido'}
        </Button>
      </div>
      {temEstoqueInsuficiente && (
        <p className="text-xs text-red-600 text-right">⚠️ Aprovação desabilitada - Estoque insuficiente em alguns itens</p>
      )}
    </>
  );
}