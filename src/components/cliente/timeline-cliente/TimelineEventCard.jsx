import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag, Factory, Truck, DollarSign, FileText, MessageSquare,
  User, Settings, AlertCircle, CheckCircle, Clock, Download, Send,
  Building2, MapPin, TrendingUp, Package
} from "lucide-react";

const moduloConfig = {
  "Cadastro": { icon: User, color: "text-slate-600", bg: "bg-slate-100" },
  "Comercial": { icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
  "Pedido": { icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" },
  "Producao": { icon: Factory, color: "text-orange-600", bg: "bg-orange-100" },
  "Expedicao": { icon: Truck, color: "text-green-600", bg: "bg-green-100" },
  "Financeiro": { icon: DollarSign, color: "text-purple-600", bg: "bg-purple-100" },
  "Fiscal": { icon: FileText, color: "text-yellow-600", bg: "bg-yellow-100" },
  "CRM": { icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-100" },
  "Comunicacao": { icon: MessageSquare, color: "text-cyan-600", bg: "bg-cyan-100" },
  "Manual": { icon: User, color: "text-slate-600", bg: "bg-slate-100" },
  "Sistema": { icon: Settings, color: "text-indigo-600", bg: "bg-indigo-100" }
};

const tipoEventoConfig = {
  "Criacao": { icon: Package, color: "text-blue-600" },
  "Alteracao": { icon: Settings, color: "text-orange-600" },
  "Aprovacao": { icon: CheckCircle, color: "text-green-600" },
  "Cancelamento": { icon: AlertCircle, color: "text-red-600" },
  "Finalizacao": { icon: CheckCircle, color: "text-emerald-600" },
  "Envio": { icon: Send, color: "text-blue-600" },
  "Recebimento": { icon: TrendingUp, color: "text-green-600" },
  "Pagamento": { icon: DollarSign, color: "text-purple-600" },
  "Atraso": { icon: Clock, color: "text-orange-600" },
  "Entrega": { icon: Truck, color: "text-green-600" },
  "Devolucao": { icon: AlertCircle, color: "text-red-600" },
  "Comunicacao": { icon: MessageSquare, color: "text-cyan-600" },
  "Observacao": { icon: FileText, color: "text-slate-600" },
  "Alerta": { icon: AlertCircle, color: "text-amber-600" }
};

/**
 * Card de um evento na timeline do cliente
 * Extraído de TimelineCliente.jsx
 */
export default function TimelineEventCard({ evento, isLast }) {
  const moduloInfo = moduloConfig[evento.modulo_origem] || moduloConfig["Sistema"];
  const tipoInfo = tipoEventoConfig[evento.tipo_evento] || tipoEventoConfig["Observacao"];
  const ModuloIcon = moduloInfo.icon;
  const TipoIcon = tipoInfo.icon;

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[21px] top-12 w-0.5 h-full bg-slate-200 z-0"></div>
      )}
      <div className="relative z-10 flex gap-4">
        <div className={`flex-shrink-0 w-11 h-11 rounded-full ${moduloInfo.bg} flex items-center justify-center shadow-sm`}>
          <ModuloIcon className={`w-6 h-6 ${moduloInfo.color}`} />
        </div>
        <Card className="flex-1 border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <TipoIcon className={`w-4 h-4 mt-0.5 ${tipoInfo.color}`} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{evento.titulo_evento}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{evento.modulo_origem}</Badge>
                      {evento.referencia_numero && (
                        <Badge variant="outline" className="text-xs">{evento.referencia_tipo}: {evento.referencia_numero}</Badge>
                      )}
                      {evento.empresa_id && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Building2 className="w-3 h-3" />{evento._empresa_label || 'Empresa'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {evento.descricao_detalhada && (
                  <p className="text-sm text-slate-600 mt-2">{evento.descricao_detalhada}</p>
                )}

                {evento.status_relacionado && (
                  <div className="mt-2"><Badge className="text-xs">Status: {evento.status_relacionado}</Badge></div>
                )}

                {(evento.whatsapp_envio || evento.email_envio) && (
                  <div className="flex gap-2 mt-3">
                    {evento.whatsapp_envio && (
                      <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        <MessageSquare className="w-3 h-3" />WhatsApp: {evento.whatsapp_status}
                      </div>
                    )}
                    {evento.email_envio && (
                      <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        <Send className="w-3 h-3" />E-mail: {evento.email_status}
                      </div>
                    )}
                  </div>
                )}

                {evento.latitude && evento.longitude && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3 h-3" />Lat: {evento.latitude.toFixed(6)}, Long: {evento.longitude.toFixed(6)}
                  </div>
                )}

                {evento.anexo_url && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={() => window.open(evento.anexo_url, '_blank')}
                      data-permission="Comercial.ClienteHistorico.visualizar">
                      <Download className="w-3 h-3 mr-2" />Baixar {evento.anexo_tipo || 'Anexo'}
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-slate-500">
                  <span>{new Date(evento.data_evento).toLocaleString('pt-BR')}</span>
                  {evento.usuario_responsavel && (<><span>•</span><span>Por: {evento.usuario_responsavel}</span></>)}
                  {evento.valor_relacionado && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-green-600">
                        R$ {evento.valor_relacionado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {evento.acao_necessaria && !evento.resolvido && (
                <div className="flex-shrink-0">
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />Ação Necessária
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}