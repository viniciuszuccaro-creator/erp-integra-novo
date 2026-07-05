import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Save } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";

/**
 * V21.1.2: Avaliação Fornecedor - Window Mode
 * P3: RBAC aplicado
 */
export default function AvaliacaoFornecedorForm({ ordemCompra, onSubmit, windowMode = false }) {
  const { hasPermission } = usePermissions();
  const canAvaliar = hasPermission?.("Compras.Fornecedor.avaliar") ?? true;
  const [formData, setFormData] = useState({
    qualidade: 5,
    prazo: 5,
    preco: 5,
    atendimento: 5,
    comentario: ""
  });

  const notaMedia = ((formData.qualidade + formData.prazo + formData.preco + formData.atendimento) / 4).toFixed(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="font-semibold text-lg">{ordemCompra?.fornecedor_nome}</p>
            <p className="text-sm text-slate-600">OC: {ordemCompra?.numero_oc}</p>
            <p className="text-sm text-slate-600">Valor: R$ {ordemCompra?.valor_total?.toFixed(2)}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="font-semibold">Qualidade do Produto</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, qualidade: star})}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-7 h-7 ${star <= formData.qualidade ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="font-semibold">Cumprimento de Prazo</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, prazo: star})}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-7 h-7 ${star <= formData.prazo ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="font-semibold">Preço Competitivo</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, preco: star})}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-7 h-7 ${star <= formData.preco ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="font-semibold">Atendimento</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, atendimento: star})}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-7 h-7 ${star <= formData.atendimento ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Comentários e Observações</Label>
            <Textarea
              value={formData.comentario}
              onChange={(e) => setFormData({...formData, comentario: e.target.value})}
              rows={4}
              placeholder="Comentários sobre a compra, qualidade, atendimento..."
              className="mt-2"
            />
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-50 to-amber-50 rounded-lg text-center border-2 border-amber-200">
            <p className="text-sm text-slate-600 mb-2">Nota Média Final</p>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
              <p className="text-5xl font-bold text-amber-600">{notaMedia}</p>
              <span className="text-2xl text-slate-400">/5.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" className="bg-amber-600 hover:bg-amber-700" data-permission="Compras.Fornecedor.avaliar">
          <Save className="w-4 h-4 mr-2" />
          Salvar Avaliação
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}