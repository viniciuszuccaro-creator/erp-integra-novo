import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Package, Phone, Truck } from "lucide-react";

export default function EntregaListaView({ minhasEntregas, localizacao, isOffline, smsNumero, setSmsNumero, iniciarEntrega, user }) {
  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <Card className="mb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-xl font-bold">Minhas Entregas</h1><p className="text-sm opacity-90">{user?.full_name}</p></div>
            <div className="text-right"><p className="text-2xl font-bold">{minhasEntregas.length}</p><p className="text-xs opacity-90">pendentes</p></div>
          </div>
        </CardContent>
      </Card>

      {localizacao && (
        <Alert className="mb-4 border-green-300 bg-green-50">
          <MapPin className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-sm text-green-700">📍 GPS ativo • Precisão: {localizacao.precisao?.toFixed(0)}m</AlertDescription>
        </Alert>
      )}

      {isOffline && (
        <Alert className="mb-4 border-amber-300 bg-amber-50">
          <AlertDescription className="text-sm text-amber-800">
            Sem conexão: você pode enviar sua localização por SMS para o centro de operações.
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input placeholder="Número do gateway SMS (ex.: 28900)" value={smsNumero} onChange={(e) => setSmsNumero(e.target.value)} />
              <Button variant="outline" onClick={() => {
                const lat = localizacao?.latitude?.toFixed(6) || "LAT";
                const lng = localizacao?.longitude?.toFixed(6) || "LNG";
                const entrega = minhasEntregas?.[0]?.id || "ENTREGA";
                const placa = minhasEntregas?.[0]?.placa || "PLACA";
                const body = `GPS ${lat},${lng} ENTREGA:${entrega} PLACA:${placa}`;
                window.location.href = `sms:${encodeURIComponent(smsNumero)}?body=${encodeURIComponent(body)}`;
              }}>Abrir SMS com localização</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {minhasEntregas.map((entrega, idx) => (
          <Card key={entrega.id} className="border-2 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-lg">{entrega.cliente_nome}</p>
                  <p className="text-sm text-slate-600">Pedido: {entrega.numero_pedido}</p>
                </div>
                <Badge className="bg-blue-600">#{idx + 1}</Badge>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero}</p>
                    <p className="text-slate-600">{entrega.endereco_entrega_completo?.bairro} - {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}</p>
                    <p className="text-slate-500">CEP: {entrega.endereco_entrega_completo?.cep}</p>
                  </div>
                </div>
                {entrega.contato_entrega?.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <a href={`tel:${entrega.contato_entrega.telefone}`} className="text-blue-600">{entrega.contato_entrega.telefone}</a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>{entrega.volumes || 1} volume(s) • {entrega.peso_total_kg?.toFixed(2) || "0.00"} kg</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => iniciarEntrega(entrega)} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Navigation className="w-4 h-4 mr-2" />Iniciar Entrega
                </Button>
                {entrega.endereco_entrega_completo?.mapa_url && (
                  <Button variant="outline" onClick={() => window.open(entrega.endereco_entrega_completo.mapa_url, "_blank")}>
                    <MapPin className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {minhasEntregas.length === 0 && (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-slate-500">Nenhuma entrega pendente</p>
          </div>
        )}
      </div>
    </div>
  );
}