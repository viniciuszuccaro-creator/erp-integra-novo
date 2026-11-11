import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, CheckCircle, Clock, Phone, Camera } from "lucide-react";
import ComprovanteDigital from '@/components/expedicao/ComprovanteDigital';

export default function EntregaAtivaView({
  entregaAtual, localizacao, isOffline, smsNumero, setSmsNumero,
  fotoComprovante, tirarFoto, registrarOcorrencia, registrarReversa,
  concluirComprovante, enfileirarComprovante,
  reversaMotivo, setReversaMotivo, reversaQtd, setReversaQtd, reversaValor, setReversaValor,
  onVoltar,
}) {
  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-br from-green-50 to-slate-100 p-4">
      <Card className="mb-4 bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Entrega em Andamento</h2>
            <Badge className="bg-white text-green-700"><Clock className="w-3 h-3 mr-1" />{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Badge>
          </div>
          <p className="text-xl font-bold">{entregaAtual.cliente_nome}</p>
          <p className="text-sm opacity-90">Pedido: {entregaAtual.numero_pedido}</p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" />Endereço de Entrega</CardTitle></CardHeader>
        <CardContent>
          <p className="font-medium">{entregaAtual.endereco_entrega_completo?.logradouro}, {entregaAtual.endereco_entrega_completo?.numero}</p>
          <p className="text-sm text-slate-600">{entregaAtual.endereco_entrega_completo?.bairro} - {entregaAtual.endereco_entrega_completo?.cidade}/{entregaAtual.endereco_entrega_completo?.estado}</p>
          <p className="text-sm text-slate-500 mt-1">CEP: {entregaAtual.endereco_entrega_completo?.cep}</p>
          {entregaAtual.endereco_entrega_completo?.mapa_url && (
            <Button variant="outline" className="w-full mt-3" onClick={() => window.open(entregaAtual.endereco_entrega_completo.mapa_url, "_blank")}>
              <Navigation className="w-4 h-4 mr-2" />Abrir no Google Maps
            </Button>
          )}
          {entregaAtual.contato_entrega?.telefone && (
            <Button variant="outline" className="w-full mt-2" onClick={() => window.open(`tel:${entregaAtual.contato_entrega.telefone}`, "_self")}>
              <Phone className="w-4 h-4 mr-2" />Ligar para {entregaAtual.contato_entrega.nome || "contato"}
            </Button>
          )}
        </CardContent>
      </Card>

      <ComprovanteDigital key={entregaAtual.id} entrega={entregaAtual} windowMode onSuccess={concluirComprovante} onOffline={enfileirarComprovante} />

      {isOffline && (
        <Alert className="mb-4 border-amber-300 bg-amber-50">
          <AlertDescription className="text-sm text-amber-800">
            Sem conexão: envie sua posição via SMS.
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input placeholder="Número do gateway SMS" value={smsNumero} onChange={(e) => setSmsNumero(e.target.value)} />
              <Button variant="outline" onClick={() => {
                const lat = localizacao?.latitude?.toFixed(6) || "LAT";
                const lng = localizacao?.longitude?.toFixed(6) || "LNG";
                const body = `GPS ${lat},${lng} ENTREGA:${entregaAtual?.id || "ENTREGA"} PLACA:${entregaAtual?.placa || "PLACA"}`;
                window.location.href = `sms:${encodeURIComponent(smsNumero)}?body=${encodeURIComponent(body)}`;
              }}>Abrir SMS com localização</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <details className="bg-white rounded-lg border">
          <summary className="p-4 cursor-pointer font-medium text-sm">⚠️ Entrega Frustrada?</summary>
          <div className="p-4 pt-0 space-y-2">
            <RBACButton module="Expedição" section="Entrega" action="editar" variant="outline" className="w-full" onClick={tirarFoto}><Camera className="w-4 h-4 mr-2" />{fotoComprovante ? 'Foto da ocorrência anexada' : 'Fotografar ocorrência'}</RBACButton>
            <RBACButton module="Expedição" section="Entrega" action="editar" variant="outline" className="w-full justify-start" onClick={() => registrarOcorrencia("Cliente Ausente")}>Cliente Ausente</RBACButton>
            <RBACButton module="Expedição" section="Entrega" action="editar" variant="outline" className="w-full justify-start" onClick={() => registrarOcorrencia("Endereço Incorreto")}>Endereço Incorreto</RBACButton>
            <RBACButton module="Expedição" section="Entrega" action="editar" variant="outline" className="w-full justify-start" onClick={() => registrarOcorrencia("Recusa de Recebimento")}>Recusa de Recebimento</RBACButton>
          </div>
        </details>

        <details className="bg-white rounded-lg border">
          <summary className="p-4 cursor-pointer font-medium text-sm">🔁 Logística Reversa</summary>
          <div className="p-4 pt-0 space-y-3">
            <label className="text-xs text-slate-600">Motivo</label>
            <select className="w-full border rounded p-2" value={reversaMotivo} onChange={(e) => setReversaMotivo(e.target.value)}>
              <option>Recusa Total</option><option>Recusa Parcial</option><option>Avaria</option><option>Troca</option><option>Outro</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Quantidade Devolvida</label>
                <input type="number" className="w-full border rounded p-2" value={reversaQtd} onChange={(e) => setReversaQtd(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="text-xs text-slate-600">Valor Devolvido (R$)</label>
                <input type="number" step="0.01" className="w-full border rounded p-2" value={reversaValor} onChange={(e) => setReversaValor(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
            <RBACButton module="Expedição" section="Entrega" action="editar" variant="outline" className="w-full border-red-300 text-red-700" onClick={registrarReversa}>Registrar Reversa</RBACButton>
          </div>
        </details>

        <Button variant="outline" className="w-full" onClick={onVoltar}>Voltar para Lista</Button>
      </div>
    </div>
  );
}