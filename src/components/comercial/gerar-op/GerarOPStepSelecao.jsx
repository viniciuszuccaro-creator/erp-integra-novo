import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle } from "lucide-react";

/**
 * Step 1 do GerarOPModal: Seleção de itens de produção
 */
export default function GerarOPStepSelecao({ pedido, itensSelecionados, toggleItem, toggleAll, avancarParaConfig, onClose }) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Sobre a Geração Automática de OP</p>
            <p>
              Uma única Ordem de Produção será gerada para todos os itens de produção deste pedido.
              Revise os itens abaixo e as configurações na próxima etapa.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Itens de Produção do Pedido {pedido.numero_pedido}</h3>
        <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
          {itensSelecionados.every(i => i.selecionado) ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </Button>
      </div>

      {itensSelecionados.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold mb-2">Este pedido não possui itens de produção</p>
          <p className="text-sm text-slate-500">Apenas pedidos com itens de produção sob medida podem gerar OPs.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {itensSelecionados.map((item, index) => (
            <Card
              key={index}
              className={`p-4 cursor-pointer transition-colors ${item.selecionado ? 'border-amber-500 border-2 bg-amber-50' : 'hover:bg-slate-50'}`}
              onClick={() => toggleItem(index)}
            >
              <div className="flex items-start gap-4">
                <Checkbox checked={item.selecionado} onCheckedChange={() => toggleItem(index)} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600">{item.tipo_peca}</Badge>
                    <Badge variant="outline">{item.identificador}</Badge>
                    <Badge className="bg-purple-100 text-purple-700">{item.quantidade}x</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-slate-500">Dimensões</Label>
                      <p className="font-medium">{item.altura} × {item.largura} × {item.comprimento} cm</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Peso Total</Label>
                      <p className="font-medium">{item.peso_total_kg.toFixed(0)} kg</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Prazo Entrega</Label>
                      <p className="font-medium">{item.prazo_entrega_dias || 7} dias</p>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">Ref. Item</Label>
                      <p className="font-medium text-amber-600">{item.numero_op}</p>
                    </div>
                  </div>
                  {item.observacoes_tecnicas && (
                    <p className="text-xs text-slate-600 mt-2 italic">{item.observacoes_tecnicas}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          type="button"
          data-permission="Producao.OrdemProducao.criar"
          onClick={avancarParaConfig}
          disabled={itensSelecionados.filter(i => i.selecionado).length === 0}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Continuar
          <span className="ml-2 bg-white text-amber-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {itensSelecionados.filter(i => i.selecionado).length}
          </span>
        </Button>
      </div>
    </div>
  );
}