import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, CheckCircle, Clock, Phone, Camera } from "lucide-react";

export default function EntregaAtivaView({
  entregaAtual, localizacao, isOffline, smsNumero, setSmsNumero,
  fotoComprovante, setFotoComprovante, nomeRecebedor, setNomeRecebedor,
  documentoRecebedor, setDocumentoRecebedor, setAssinaturaBase64,
  tirarFoto, confirmarEntrega, registrarOcorrencia, registrarReversa,
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

      <Card className="mb-4">
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" />Comprovante de Entrega</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Foto do Comprovante *</Label>
            {fotoComprovante ? (
              <div className="relative">
                <img src={fotoComprovante} className="w-full rounded-lg border" alt="Comprovante" />
                <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={() => setFotoComprovante(null)}>Tirar outra</Button>
              </div>
            ) : (
              <Button onClick={tirarFoto} variant="outline" className="w-full h-32 border-dashed">
                <div className="text-center"><Camera className="w-8 h-8 mx-auto mb-2" /><p>Tirar Foto</p></div>
              </Button>
            )}
          </div>
          <div>
            <Label>Nome de Quem Recebeu *</Label>
            <Input value={nomeRecebedor} onChange={(e) => setNomeRecebedor(e.target.value)} placeholder="Nome completo..." className="mt-1" />
          </div>
          <div>
            <Label>CPF/RG (Opcional)</Label>
            <Input value={documentoRecebedor} onChange={(e) => setDocumentoRecebedor(e.target.value)} placeholder="000.000.000-00" className="mt-1" />
          </div>
          <div>
            <Label className="mb-2 block">Assinatura Digital</Label>
            <div className="border-2 border-dashed rounded-lg p-4 bg-white">
              <canvas id="assinatura-canvas" width="300" height="150" className="w-full border rounded" style={{ touchAction: "none" }} />
              <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                const canvas = document.getElementById("assinatura-canvas");
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setAssinaturaBase64(null);
              }}>Limpar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <RBACButton module="Expedição" section="Entrega" action="criar" onClick={confirmarEntrega} disabled={!fotoComprovante || !nomeRecebedor} className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg">
          <CheckCircle className="w-5 h-5 mr-2" />Confirmar Entrega
        </RBACButton>

        <details className="bg-white rounded-lg border">
          <summary className="p-4 cursor-pointer font-medium text-sm">⚠️ Entrega Frustrada?</summary>
          <div className="p-4 pt-0 space-y-2">
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