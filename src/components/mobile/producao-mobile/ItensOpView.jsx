import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Send } from "lucide-react";

export default function ItensOpView({ opSelecionada, onSelectItem, onVoltar, onFinalizar, podeExpedir, isEnviando }) {
  return (
    <div className="w-full h-full overflow-auto min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
          <Button variant="ghost" size="sm" onClick={onVoltar} className="text-white hover:bg-blue-700 mb-3">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">{opSelecionada.numero_op}</h2>
          <p className="text-blue-100">{opSelecionada.cliente_nome}</p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-blue-700 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: `${opSelecionada.percentual_conclusao || 0}%` }}></div>
            </div>
            <span className="font-bold">{opSelecionada.percentual_conclusao || 0}%</span>
          </div>
        </div>

        <Card className="bg-white/90">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Pedido</p>
                <p className="font-semibold">{opSelecionada.numero_pedido}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <Badge>{opSelecionada.status}</Badge>
              </div>
              <div>
                <p className="text-slate-500">Peso Teórico</p>
                <p className="font-semibold">{opSelecionada.peso_teorico_total_kg?.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-slate-500">Peso Real</p>
                <p className="font-semibold text-green-600">{opSelecionada.peso_real_total_kg?.toFixed(1) || 0} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg px-2">Selecione o item:</h3>
          {(opSelecionada.itens_producao || []).map((item, idx) => (
            <Card
              key={idx}
              className={`${
                item.apontado
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-white/95 hover:bg-white cursor-pointer'
              } transition-all`}
              onClick={() => !item.apontado && onSelectItem(item)}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{item.elemento}</p>
                    <p className="text-sm text-slate-600">{item.tipo_peca}</p>
                  </div>
                  {item.apontado ? (
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Concluído
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pendente</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  {item.descricao_automatica || `${item.quantidade_pecas} peça(s)`}
                </p>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span>Bitola: {item.bitola_principal}</span>
                  <span>Peso: {item.peso_teorico_total?.toFixed(1)} kg</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {opSelecionada.percentual_conclusao === 100 && podeExpedir && (
          <Button data-permission="Mobile.ItensOpView.enviar"
            className="w-full h-16 bg-green-600 hover:bg-green-700 text-lg"
            onClick={onFinalizar}
            disabled={isEnviando}
          >
            <Send className="w-6 h-6 mr-3" />
            {isEnviando ? 'Enviando...' : 'Finalizar e Enviar p/ Expedição'}
          </Button>
        )}
      </div>
    </div>
  );
}