import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function PedidosAprovacaoStats({
  pendentes, aprovados, negados, selectedPedidos,
  onGerenciarAprovacoes, onNotifyWhatsApp, onNotifyEmail
}) {
  if (pendentes.length === 0 && aprovados.length === 0 && negados.length === 0) return null;

  return (
    <>
      {pendentes.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-orange-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />{pendentes.length} pedido(s) aguardando aprovação
              </p>
              <p className="text-xs text-orange-700 mt-1">Pedidos com descontos ou outras pendências financeiras aguardam sua análise.</p>
            </div>
            <Button onClick={onGerenciarAprovacoes} className="bg-orange-600 hover:bg-orange-600/90">
              <ShieldCheck className="w-4 h-4 mr-2" />Gerenciar Aprovações
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {pendentes.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="text-sm text-slate-700">Há <span className="font-semibold">{pendentes.length}</span> pedido(s) aguardando aprovação.</div>
            <div className="flex items-center gap-2">
              <Button onClick={onGerenciarAprovacoes} className="bg-orange-600 hover:bg-orange-600/90">Central de Aprovações</Button>
              <Button variant="outline" onClick={onNotifyWhatsApp}>Notificar WhatsApp</Button>
              <Button variant="outline" onClick={onNotifyEmail}>Notificar Email</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-orange-700">Pendentes Aprovação</p><p className="text-2xl font-bold text-orange-900">{pendentes.length}</p></div>
            <Clock className="w-8 h-8 text-orange-400" />
          </CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-green-700">Descontos Aprovados</p><p className="text-2xl font-bold text-green-900">{aprovados.length}</p></div>
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-red-700">Descontos Negados</p><p className="text-2xl font-bold text-red-900">{negados.length}</p></div>
            <XCircle className="w-8 h-8 text-red-400" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}