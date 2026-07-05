import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";

/**
 * Tab de integração WhatsApp
 * Extraído de ConfiguracaoExpedicao.jsx
 */
export default function TabWhatsApp({ config, setConfig }) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="w-4 h-4" />Integração WhatsApp</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label>Provedor WhatsApp</Label>
          <Select value={config.provider} onValueChange={(v) => setConfig({ ...config, provider: v })}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Nenhum">Nenhum</SelectItem>
              <SelectItem value="Twilio">Twilio</SelectItem>
              <SelectItem value="Zenvia">Zenvia</SelectItem>
              <SelectItem value="Evolution API">Evolution API</SelectItem>
              <SelectItem value="Custom">Custom API</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.provider !== "Nenhum" && (
          <>
            <div>
              <Label>URL da API</Label>
              <Input value={config.api_url} onChange={(e) => setConfig({ ...config, api_url: e.target.value })} className="mt-2" />
            </div>
            <div>
              <Label>API Token</Label>
              <Input type="password" value={config.api_token} onChange={(e) => setConfig({ ...config, api_token: e.target.value })} className="mt-2" />
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="font-semibold text-sm">Modelos de Mensagens</h4>
              <div>
                <Label>Saída para Entrega</Label>
                <Textarea value={config.modelo_saida} onChange={(e) => setConfig({ ...config, modelo_saida: e.target.value })} rows={2} className="mt-2" />
                <p className="text-xs text-slate-500 mt-1">Variáveis: {'{'}{'{'}numero_pedido{'}'}{'}'}, {'{'}{'{'}data_prevista{'}'}{'}'}</p>
              </div>
              <div>
                <Label>Entrega Concluída</Label>
                <Textarea value={config.modelo_entregue} onChange={(e) => setConfig({ ...config, modelo_entregue: e.target.value })} rows={2} className="mt-2" />
              </div>
              <div>
                <Label>Entrega Frustrada</Label>
                <Textarea value={config.modelo_frustrada} onChange={(e) => setConfig({ ...config, modelo_frustrada: e.target.value })} rows={2} className="mt-2" />
                <p className="text-xs text-slate-500 mt-1">Variável: {'{'}{'{'}motivo{'}'}{'}'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="whats-auto" checked={config.enviar_auto}
                onChange={(e) => setConfig({ ...config, enviar_auto: e.target.checked })} />
              <label htmlFor="whats-auto" className="text-sm">Enviar mensagens automaticamente</label>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}