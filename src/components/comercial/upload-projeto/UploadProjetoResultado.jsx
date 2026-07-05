import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";

/**
 * Exibe o resultado da análise IA: resumo, lista de peças e alerta de conferência
 * Extraído de UploadProjetoModal.jsx
 */
export default function UploadProjetoResultado({ resultado }) {
  if (!resultado) return null;

  return (
    <>
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">Análise Concluída com Sucesso!</h4>
              {resultado.resumo_projeto && (
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Projeto:</strong> {resultado.resumo_projeto.nome_projeto || 'Sem nome'}</p>
                  <p><strong>Total de peças:</strong> {resultado.resumo_projeto.total_pecas}</p>
                  {resultado.resumo_projeto.tipos_encontrados && (
                    <p><strong>Tipos:</strong> {resultado.resumo_projeto.tipos_encontrados.join(', ')}</p>
                  )}
                  {resultado.resumo_projeto.observacoes_gerais && (
                    <p className="mt-2">{resultado.resumo_projeto.observacoes_gerais}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Peças Identificadas ({resultado.pecas.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {resultado.pecas.map((peca, index) => (
              <Card key={index} className="bg-slate-50">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-600">{peca.identificador}</Badge>
                        <span className="font-semibold">{peca.tipo_peca}</span>
                        {peca.quantidade > 1 && <Badge variant="outline">{peca.quantidade}x</Badge>}
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {peca.comprimento > 0 && <p>Comprimento: {peca.comprimento} cm</p>}
                        {peca.largura > 0 && <p>Largura: {peca.largura} cm</p>}
                        {peca.altura > 0 && <p>Altura: {peca.altura} cm</p>}
                        {peca.ferro_principal_bitola && <p>Ferro: {peca.ferro_principal_quantidade}Ø{peca.ferro_principal_bitola}</p>}
                        {peca.estribo_bitola && peca.estribo_distancia && <p>Estribo: Ø{peca.estribo_bitola} c/{peca.estribo_distancia}cm</p>}
                        {peca.observacoes && <p className="italic text-slate-500">{peca.observacoes}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">⚠️ Atenção - Conferência Necessária</p>
              <p>A IA identificou as peças automaticamente, mas é importante que você <strong>revise e confirme</strong> as informações antes de prosseguir. Após importar, você poderá ajustar qualquer dado diretamente no formulário.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}