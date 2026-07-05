import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck } from "lucide-react";

/**
 * Tab de integração com transportadoras
 * Extraído de ConfiguracaoExpedicao.jsx
 */
export default function TabTransportadora({ config, setConfig }) {
  return (
    <Card className="w-full">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4" />Integração com Transportadoras</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label>Provedor</Label>
          <Select value={config.provider} onValueChange={(v) => setConfig({ ...config, provider: v })}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Nenhum">Nenhum</SelectItem>
              <SelectItem value="Melhor Envio">Melhor Envio</SelectItem>
              <SelectItem value="Kangu">Kangu</SelectItem>
              <SelectItem value="Correios">Correios (API)</SelectItem>
              <SelectItem value="Jadlog">Jadlog</SelectItem>
              <SelectItem value="Custom">Custom API</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.provider !== "Nenhum" && (
          <>
            <div>
              <Label>URL da API</Label>
              <Input value={config.api_url} onChange={(e) => setConfig({ ...config, api_url: e.target.value })}
                placeholder="https://api.melhorenvio.com/..." className="mt-2" />
            </div>
            <div>
              <Label>API Token/Key</Label>
              <Input type="password" value={config.api_token} onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
                placeholder="Seu token de API" className="mt-2" />
            </div>
            <div className="flex items-center gap-3 pt-3">
              <input type="checkbox" id="calc-frete" checked={config.calcular_frete_auto}
                onChange={(e) => setConfig({ ...config, calcular_frete_auto: e.target.checked })} />
              <label htmlFor="calc-frete" className="text-sm">Calcular frete automaticamente ao criar entrega</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="rastreamento" checked={config.enviar_rastreamento_auto}
                onChange={(e) => setConfig({ ...config, enviar_rastreamento_auto: e.target.checked })} />
              <label htmlFor="rastreamento" className="text-sm">Enviar código de rastreamento para o cliente</label>
            </div>
          </>
        )}

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ <strong>Atenção:</strong> As integrações estão preparadas mas ainda não implementadas.
          Configure agora e elas serão ativadas em atualizações futuras.
        </div>
      </CardContent>
    </Card>
  );
}