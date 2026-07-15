import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Factory, AlertTriangle, Package } from "lucide-react";
import SeletorProdutosProducao from "../SeletorProdutosProducao";

export default function OPTabMateriaPrima({
  formData, produtosProducao, produtosInsuficientes,
  seletorProdutoAberto, setSeletorProdutoAberto,
  adicionarProduto, atualizarQuantidadeItem, removerItem,
}) {
  return (
    <div className="space-y-4">
      <Alert className="border-orange-300 bg-orange-50">
        <Factory className="w-5 h-5 text-orange-600" />
        <AlertDescription>
          <p className="font-semibold text-orange-900 mb-1">🏭 Seleção de Matéria-Prima</p>
          <p className="text-sm text-orange-700">Apenas produtos configurados como "Matéria-Prima Produção" aparecem aqui</p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 mb-1">Produtos Disponíveis</p>
            <p className="text-2xl font-bold text-blue-900">{produtosProducao.length}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <p className="text-xs text-purple-700 mb-1">Itens na OP</p>
            <p className="text-2xl font-bold text-purple-900">{formData.itens?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className={produtosInsuficientes.length > 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}>
          <CardContent className="p-4">
            <p className={`text-xs mb-1 ${produtosInsuficientes.length > 0 ? 'text-red-700' : 'text-green-700'}`}>Status Estoque</p>
            <p className={`text-2xl font-bold ${produtosInsuficientes.length > 0 ? 'text-red-900' : 'text-green-900'}`}>
              {produtosInsuficientes.length > 0 ? '⚠️ Crítico' : '✅ OK'}
            </p>
          </CardContent>
        </Card>
      </div>

      {produtosInsuficientes.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <p className="font-semibold text-red-900 mb-2">⚠️ {produtosInsuficientes.length} produto(s) com estoque insuficiente:</p>
            <div className="space-y-2">
              {produtosInsuficientes.map((item, idx) => (
                <div key={idx} className="text-sm text-red-800 p-2 bg-white rounded border border-red-200">
                  <p className="font-semibold">{item.produto}</p>
                  <div className="flex gap-4 text-xs mt-1">
                    <span>Necessário: {item.necessario}</span>
                    <span>Disponível: {item.disponivel}</span>
                    <span className="text-red-600 font-bold">Faltam: {item.faltante.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Button type="button" onClick={() => setSeletorProdutoAberto(true)} variant="outline"
        className="w-full border-dashed border-2 border-blue-300 hover:bg-blue-50">
        <Package className="w-4 h-4 mr-2" /> Adicionar Matéria-Prima
      </Button>

      {formData.itens && formData.itens.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-base">Matéria-Prima Selecionada ({formData.itens.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {formData.itens.map((item, idx) => {
                const estoqueInsuficiente = item.quantidade > item.estoque_disponivel;
                return (
                  <div key={idx} className={`p-4 ${estoqueInsuficiente ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{item.descricao}</p>
                        <p className="text-xs text-slate-600">SKU: {item.codigo}</p>
                      </div>
                      <div className="w-32">
                        <Label className="text-xs">Quantidade</Label>
                        <Input type="number" step="0.01" value={item.quantidade}
                          onChange={(e) => atualizarQuantidadeItem(idx, e.target.value)} className="text-sm" />
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-xs text-slate-600">Disponível</p>
                        <p className={`font-bold ${estoqueInsuficiente ? 'text-red-600' : 'text-green-600'}`}>{item.estoque_disponivel} {item.unidade}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removerItem(idx)} className="text-red-600 hover:bg-red-50">✕</Button>
                    </div>
                    {estoqueInsuficiente && (
                      <Alert className="border-red-300 bg-red-100 mt-2">
                        <AlertDescription className="text-xs text-red-800">
                          ⚠️ Estoque insuficiente! Faltam: {(item.quantidade - item.estoque_disponivel).toFixed(2)} {item.unidade}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {seletorProdutoAberto && (
        <Card className="border-blue-300 bg-blue-50">
          <CardHeader className="border-b bg-blue-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Selecionar Produtos de Produção</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => setSeletorProdutoAberto(false)}>Fechar</Button>
            </div>
          </CardHeader>
          <CardContent className="p-4"><SeletorProdutosProducao onSelecionarProduto={adicionarProduto} /></CardContent>
        </Card>
      )}
    </div>
  );
}