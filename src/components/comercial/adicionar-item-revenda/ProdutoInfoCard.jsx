import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Package, DollarSign } from "lucide-react";

export default function ProdutoInfoCard({ produto, quantidade, margemMinimaSistema }) {
  const estoqueDisp = produto.estoque_disponivel || produto.estoque_atual || 0;
  return (
    <div className="border-0 shadow-sm bg-blue-50 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <p className="font-bold text-blue-900">{produto.descricao}</p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-blue-700">Código</p>
              <p className="font-semibold text-blue-900">{produto.codigo}</p>
            </div>
            <div>
              <p className="text-blue-700">Unidade</p>
              <p className="font-semibold text-blue-900">{produto.unidade_medida}</p>
            </div>
            <div>
              <p className="text-blue-700">Estoque</p>
              <p className={`font-semibold ${estoqueDisp >= quantidade ? "text-green-700" : "text-red-700"}`}>
                {estoqueDisp} {produto.unidade_medida}
              </p>
            </div>
            <div>
              <p className="text-blue-700">Margem Mín.</p>
              <p className="font-semibold text-blue-900">
                {produto.margem_minima_percentual || margemMinimaSistema}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}