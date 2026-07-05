import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Sparkles } from "lucide-react";

/**
 * Componente de resultados da IA de Leitura de Projeto
 * Extraído de IALeituraProjeto.jsx
 */
export default function LeituraProjetoResultados({ resultado, limparResultados }) {
  if (!resultado || !resultado.elementos_identificados || resultado.elementos_identificados.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Elementos Identificados: {resultado.elementos_identificados.length} Peças
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Revisão dos elementos detectados pela inteligência artificial.
                <span className="ml-2 font-medium">Confiança Média: {resultado.confianca_geral.toFixed(0)}%</span>
              </p>
            </div>
            <Button variant="outline" onClick={limparResultados}>Limpar Resultados</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Elemento</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Bitola Principal</TableHead>
                  <TableHead>Barras</TableHead>
                  <TableHead>C (mm)</TableHead>
                  <TableHead>L (mm)</TableHead>
                  <TableHead>A (mm)</TableHead>
                  <TableHead>Estribo</TableHead>
                  <TableHead>Espaçamento (cm)</TableHead>
                  <TableHead>Confiança</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.elementos_identificados.map((peca, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{peca.elemento}</TableCell>
                    <TableCell>{peca.posicao || '-'}</TableCell>
                    <TableCell><Badge variant="outline">{peca.tipo_peca}</Badge></TableCell>
                    <TableCell>{peca.bitola_principal}</TableCell>
                    <TableCell>{peca.quantidade_barras}</TableCell>
                    <TableCell>{peca.comprimento_mm}</TableCell>
                    <TableCell>{peca.largura_mm || '-'}</TableCell>
                    <TableCell>{peca.altura_mm || '-'}</TableCell>
                    <TableCell>{peca.estribo_bitola || '-'}</TableCell>
                    <TableCell>{peca.estribo_espacamento || '-'}</TableCell>
                    <TableCell>
                      <Badge className={
                        peca.confianca >= 90 ? 'bg-green-100 text-green-700' :
                        peca.confianca >= 75 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }>
                        {peca.confianca}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {resultado.observacoes && (
            <div className="p-4 border-t bg-slate-50 text-sm text-slate-700">
              <strong>Observações da IA:</strong> {resultado.observacoes}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">💡 Como funciona a IA</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✓ Identifica vigas, colunas, blocos, estacas automaticamente</li>
                <li>✓ Reconhece bitolas, medidas e quantidades</li>
                <li>✓ Valida bitolas contra o estoque cadastrado (quando ativado)</li>
                <li>✓ Gera descrições técnicas automáticas</li>
                <li>✓ Permite conferência e edição manual (em futuras versões)</li>
                <li>✓ Integra diretamente com OPs e produção (quando ativado)</li>
              </ul>
              <p className="text-xs text-purple-700 mt-3">
                <strong>Provedores suportados (preparado):</strong> Azure OpenAI, OpenAI, Custom API, Local
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}