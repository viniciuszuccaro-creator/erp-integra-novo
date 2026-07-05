import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, PenTool, Eye } from "lucide-react";
import { format } from "date-fns";
import useAprovacaoOrcamento from "@/components/portal/aprovacao-assinatura/useAprovacaoOrcamento";
import AssinaturaAprovacaoModal, { RevisaoModal } from "@/components/portal/aprovacao-assinatura/AssinaturaAprovacaoModal";

/**
 * V21.5 - Aprovação de Orçamentos com Assinatura Eletrônica
 * Refatorado: lógica em useAprovacaoOrcamento, modais em AssinaturaAprovacaoModal
 * P3: data-permission nos botões | prompt() substituído por modal inline
 * P4: Layout w-full h-full
 */
export default function AprovacaoComAssinatura({ clienteId }) {
  const h = useAprovacaoOrcamento({ clienteId });

  return (
    <div className="space-y-4 w-full h-full">
      <Card className="border-2 border-blue-300 bg-blue-50 shadow-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Orçamentos Aguardando Aprovação
            {h.orcamentos.length > 0 && (
              <Badge className="ml-2 bg-orange-600 text-white animate-pulse">
                {h.orcamentos.length} pendente(s)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {h.orcamentos.length > 0 ? (
            <div className="space-y-4">
              {h.orcamentos.map(orc => (
                <Card key={orc.id} className="bg-white border-2 border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-xl">{orc.numero_orcamento}</p>
                        <p className="text-sm text-slate-600">
                          Criado em {format(new Date(orc.created_date), 'dd/MM/yyyy')}
                        </p>
                        {orc.data_validade && (
                          <p className="text-sm text-orange-600">
                            Válido até {format(new Date(orc.data_validade), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">
                          R$ {orc.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-500">{orc.itens?.length || 0} item(ns)</p>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-slate-50 rounded-lg border">
                      <p className="font-semibold mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Itens do Orçamento
                      </p>
                      <div className="space-y-2">
                        {(orc.itens || []).slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-700">• {item.descricao}</span>
                            <span className="font-medium">
                              {item.quantidade} {item.unidade} - R$ {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                        {(orc.itens?.length || 0) > 5 && (
                          <p className="text-xs text-slate-500 mt-2">+ {orc.itens.length - 5} item(ns) adicionais</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Condição de Pagamento</p>
                        <p className="font-semibold">{orc.condicoes_pagamento || 'À Vista'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Prazo de Entrega</p>
                        <p className="font-semibold">{orc.prazo_entrega || '7 dias úteis'}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        data-permission="Portal.Orcamentos.aprovar"
                        onClick={() => { h.setOrcamentoSelecionado(orc); h.setAssinaturaModal(true); }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
                      >
                        <PenTool className="w-5 h-5 mr-2" />
                        Aprovar com Assinatura
                      </Button>

                      <Button
                        data-permission="Portal.Orcamentos.revisar"
                        variant="outline"
                        onClick={() => { h.setOrcamentoSelecionado(orc); h.setRevisaoModal(true); }}
                        className="border-2 border-amber-300 hover:bg-amber-50"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Solicitar Revisão
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <FileText className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nenhum orçamento pendente</p>
              <p className="text-sm mt-2">Seus orçamentos aprovados viram pedidos automaticamente</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AssinaturaAprovacaoModal
        assinaturaModal={h.assinaturaModal}
        setAssinaturaModal={h.setAssinaturaModal}
        orcamentoSelecionado={h.orcamentoSelecionado}
        nomeAssinante={h.nomeAssinante}
        setNomeAssinante={h.setNomeAssinante}
        canvasRef={h.canvasRef}
        startDrawing={h.startDrawing}
        draw={h.draw}
        stopDrawing={h.stopDrawing}
        limparAssinatura={h.limparAssinatura}
        onAprovar={h.handleAprovar}
        isAprovando={h.aprovarMutation.isPending}
      />

      <RevisaoModal
        revisaoModal={h.revisaoModal}
        setRevisaoModal={h.setRevisaoModal}
        motivoRevisao={h.motivoRevisao}
        setMotivoRevisao={h.setMotivoRevisao}
        onConfirmar={h.handleRejeitar}
        isRejeitando={h.rejeitarMutation.isPending}
      />
    </div>
  );
}