import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, FileText, ArrowRight, CheckCircle } from "lucide-react";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function ConverterOportunidade({ oportunidade, open, onClose, onConverter, windowMode = false }) {
  const [tipoConversao, setTipoConversao] = useState("orcamento");

  const handleConverter = () => {
    onConverter(oportunidade, tipoConversao);
  };

  const formContent = (
    <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">Pronto para Converter!</h4>
                <p className="text-sm text-green-700">
                  A oportunidade será convertida em um documento de venda
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Oportunidade</Label>
            <div className="p-3 bg-slate-50 rounded">
              <p className="font-semibold">{oportunidade?.titulo}</p>
              <p className="text-sm text-slate-600">{oportunidade?.cliente_nome}</p>
              <p className="text-sm text-green-600 font-semibold mt-1">
                Valor: R$ {(oportunidade?.valor_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div>
            <Label>Converter em *</Label>
            <Select value={tipoConversao} onValueChange={setTipoConversao}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orcamento">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold">Orçamento</p>
                      <p className="text-xs text-slate-600">Gerar proposta formal para o cliente</p>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="pedido">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-semibold">Pedido Direto</p>
                      <p className="text-xs text-slate-600">Converter diretamente em pedido</p>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              O que acontecerá:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Um novo {tipoConversao === "orcamento" ? "orçamento" : "pedido"} será criado</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Os dados da oportunidade serão transferidos</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>A oportunidade será marcada como "Ganho"</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Você poderá editar os detalhes na tela de {tipoConversao === "orcamento" ? "orçamento" : "pedido"}</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConverter}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Converter Agora
            </Button>
          </div>
        </div>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        {formContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Converter Oportunidade em Venda</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}