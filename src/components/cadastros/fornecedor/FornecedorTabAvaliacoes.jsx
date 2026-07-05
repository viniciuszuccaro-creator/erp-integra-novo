import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

/** Sub-componente: Aba Avaliações do Fornecedor */
export default function FornecedorTabAvaliacoes({ formData, fornecedor }) {
  if (!fornecedor?.id) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Salve o fornecedor primeiro para gerenciar avaliações</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Histórico de Avaliações</h3>
        <Badge variant="outline" className="text-lg"><Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />{(formData.nota_media || 0).toFixed(1)}</Badge>
      </div>
      {formData.avaliacoes && formData.avaliacoes.length > 0 ? (
        <div className="space-y-3">
          {formData.avaliacoes.map((avaliacao, idx) => (
            <Card key={idx} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`w-4 h-4 ${star <= avaliacao.nota ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />)}</div>
                  <span className="text-xs text-slate-600">{new Date(avaliacao.data).toLocaleDateString('pt-BR')}</span>
                </div>
                {avaliacao.criterios && (
                  <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                    <div><span className="text-slate-600">Qualidade:</span><span className="ml-1 font-medium">{avaliacao.criterios.qualidade}/5</span></div>
                    <div><span className="text-slate-600">Prazo:</span><span className="ml-1 font-medium">{avaliacao.criterios.prazo}/5</span></div>
                    <div><span className="text-slate-600">Preço:</span><span className="ml-1 font-medium">{avaliacao.criterios.preco}/5</span></div>
                    <div><span className="text-slate-600">Atendimento:</span><span className="ml-1 font-medium">{avaliacao.criterios.atendimento}/5</span></div>
                  </div>
                )}
                {avaliacao.comentario && <p className="text-slate-600 text-sm italic border-l-2 border-slate-300 pl-3 mt-2">"{avaliacao.comentario}"</p>}
                {avaliacao.avaliador && <p className="text-slate-500 text-xs mt-2">Avaliado por: {avaliacao.avaliador}</p>}
                {avaliacao.ordem_compra_id && <p className="text-slate-500 text-xs">OC vinculada</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Star className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhuma avaliação registrada</p>
          <p className="text-sm text-slate-400 mt-2">Avaliações são criadas automaticamente ao receber Ordens de Compra</p>
        </div>
      )}
    </div>
  );
}