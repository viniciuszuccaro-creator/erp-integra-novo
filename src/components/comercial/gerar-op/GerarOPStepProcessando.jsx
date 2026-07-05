import React from "react";
import { Loader2, CheckCircle, Clock } from "lucide-react";

/**
 * Step 3 do GerarOPModal: Tela de processamento
 */
export default function GerarOPStepProcessando() {
  return (
    <div className="py-12 text-center">
      <Loader2 className="w-16 h-16 text-amber-600 animate-spin mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Gerando Ordem de Produção...</h3>
      <p className="text-slate-600 mb-4">Aguarde enquanto criamos a OP e reservamos estoque</p>

      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Validando dados e configurações</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
          <span>Calculando materiais e peso total</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Clock className="w-5 h-5" />
          <span>Criando registro da OP</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Clock className="w-5 h-5" />
          <span>Verificando estoque e reservando materiais</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Clock className="w-5 h-5" />
          <span>Vinculando OP ao pedido</span>
        </div>
      </div>
    </div>
  );
}