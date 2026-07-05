import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Settings } from "lucide-react";

/**
 * Tab de notificações por e-mail + configurações gerais
 * Extraído de ConfiguracaoExpedicao.jsx
 */
export default function TabEmailEGeral({ configEmail, setConfigEmail }) {
  return (
    <>
      <Card className="w-full">
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" />Notificações por E-mail</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
            <input type="checkbox" id="email-auto" checked={configEmail.enviar_auto}
              onChange={(e) => setConfigEmail({ ...configEmail, enviar_auto: e.target.checked })} />
            <label htmlFor="email-auto" className="text-sm">Enviar e-mails automaticamente nas mudanças de status</label>
          </div>
          <div>
            <Label>Assunto - Saída para Entrega</Label>
            <Input value={configEmail.assunto_saida} onChange={(e) => setConfigEmail({ ...configEmail, assunto_saida: e.target.value })} className="mt-2" />
          </div>
          <div>
            <Label>Corpo do E-mail - Saída</Label>
            <Textarea value={configEmail.corpo_saida} onChange={(e) => setConfigEmail({ ...configEmail, corpo_saida: e.target.value })}
              rows={4} className="mt-2" placeholder="Olá {{cliente_nome}}, seu pedido {{numero_pedido}} saiu para entrega..." />
          </div>
          <div>
            <Label>Assunto - Entrega Concluída</Label>
            <Input value={configEmail.assunto_entregue} onChange={(e) => setConfigEmail({ ...configEmail, assunto_entregue: e.target.value })} className="mt-2" />
          </div>
          <div>
            <Label>Corpo do E-mail - Entregue</Label>
            <Textarea value={configEmail.corpo_entregue} onChange={(e) => setConfigEmail({ ...configEmail, corpo_entregue: e.target.value })} rows={4} className="mt-2" />
          </div>
          <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded">💡 O servidor SMTP é configurado em Integrações → E-mail</p>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4" />Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Regras de Expedição</h4>
            {[
              { id: "separacao-obrigatoria", label: "Exigir separação/conferência antes de gerar romaneio", bg: "bg-blue-50" },
              { id: "foto-obrigatoria", label: "Foto de comprovante obrigatória para finalizar entrega", bg: "bg-green-50" },
              { id: "assinatura-obrigatoria", label: "Assinatura digital obrigatória para finalizar entrega", bg: "bg-purple-50" },
              { id: "salvar-cliente", label: "Perguntar se quer salvar endereço/contato no cliente", bg: "bg-orange-50" }
            ].map(rule => (
              <div key={rule.id} className={`flex items-center gap-3 p-3 ${rule.bg} rounded`}>
                <input type="checkbox" id={rule.id} />
                <label htmlFor={rule.id} className="text-sm">{rule.label}</label>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <h4 className="font-semibold text-sm mb-3">Integração Google Maps (preparado)</h4>
            <div>
              <Label>Google Maps API Key</Label>
              <Input type="password" placeholder="Chave de API do Google Maps" className="mt-2" disabled />
              <p className="text-xs text-slate-500 mt-2">🔧 Será usado para roteirização e cálculo de rotas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}