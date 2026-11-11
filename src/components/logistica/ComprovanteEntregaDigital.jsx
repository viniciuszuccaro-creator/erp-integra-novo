import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { sanitizeFlow } from "@/components/lib/contexto/contextoCrud";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, CheckCircle2, AlertCircle, User, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";

/**
 * 📸 COMPROVANTE DIGITAL DE ENTREGA (consolidado com o fluxo proprietário)
 * Este formulário não baixa mais estoque no navegador: a baixa oficial por produto
 * pertence a applyOrderStockMovements. A foto é guardada em armazenamento privado.
 */
export default function ComprovanteEntregaDigital({ pedido, entrega, onSuccess, windowMode = false }) {
  const { filterInContext, createInContext, updateInContext } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [documentoRecebedor, setDocumentoRecebedor] = useState("");
  const [cargoRecebedor, setCargoRecebedor] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotoComprovante, setFotoComprovante] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [uploadando, setUploadando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [geolocalizacao, setGeolocalizacao] = useState(null);
  const queryClient = useQueryClient();

  const podeConfirmarEntrega = hasPermission("Comercial", "Pedido", "editar");

  const capturarGeolocalizacao = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocalizacao({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        toast.success("📍 Localização capturada!");
      },
      () => toast.error("❌ Erro ao capturar localização")
    );
  };

  const handleFotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadando(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setFotoComprovante(file_uri);
      setPreviewFoto(URL.createObjectURL(file));
      toast.success("✅ Foto enviada!");
    } catch (error) {
      toast.error("Erro ao enviar foto: " + error.message);
    } finally {
      setUploadando(false);
    }
  };

  // Efeitos operacionais delegados ao fluxo existente: contexto, RBAC e auditoria próprios.
  const confirmarEntrega = async () => {
    if (!podeConfirmarEntrega) { toast.error("Sem permissão para confirmar entrega."); return; }
    if (!pedido?.id || !pedido?.empresa_id) { toast.error("Pedido sem contexto de grupo/empresa."); return; }
    setConfirmando(true);
    try {
      const comprovanteData = sanitizeFlow({
        foto_comprovante: fotoComprovante,
        nome_recebedor: nomeRecebedor,
        documento_recebedor: documentoRecebedor,
        cargo_recebedor: cargoRecebedor,
        data_hora_recebimento: new Date().toISOString(),
        latitude_entrega: geolocalizacao?.latitude,
        longitude_entrega: geolocalizacao?.longitude,
        observacoes_recebimento: observacoes,
      });

      if (entrega?.id) {
        await updateInContext("Entrega", entrega.id, { status: "Entregue", data_entrega: new Date().toISOString(), comprovante_entrega: comprovanteData });
      } else {
        await createInContext("Entrega", {
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          cliente_nome: pedido.cliente_nome,
          empresa_id: pedido.empresa_id,
          group_id: pedido.group_id,
          endereco_entrega_completo: pedido.endereco_entrega_principal,
          status: "Entregue",
          data_entrega: new Date().toISOString(),
          comprovante_entrega: comprovanteData,
        });
      }

      // Baixa oficial por produto é idempotente por pedido: não repete o que a aprovação já baixou.
      const jaBaixado = await filterInContext("MovimentacaoEstoque", { origem_documento_id: pedido.id, origem_movimento: "pedido" }, "-created_date", 1);
      if (!(jaBaixado || []).length && (pedido.itens_revenda || []).length) {
        await base44.functions.invoke("applyOrderStockMovements", { pedido });
      }

      await updateInContext("Pedido", pedido.id, { status: "Entregue" });

      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("✅ Entrega confirmada.");
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || "Não foi possível confirmar a entrega.");
    } finally {
      setConfirmando(false);
    }
  };

  const podeConfirmar = Boolean(nomeRecebedor.trim() && fotoComprovante);

  return (
    <Card className={windowMode ? "border-0 shadow-none" : "border-0 shadow-xl"}>
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          📸 Comprovante Digital de Entrega
        </CardTitle>
        <p className="text-sm opacity-90">Pedido #{pedido?.numero_pedido}</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Card className="bg-blue-50 border-blue-300">
          <CardContent className="p-4">
            <Label className="text-sm font-semibold mb-2 block">📷 Foto do Comprovante *</Label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById('foto-input')?.click()}
                disabled={uploadando}
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploadando ? 'Enviando...' : fotoComprovante ? '✅ Foto Enviada' : 'Tirar/Enviar Foto'}
              </Button>
            </div>
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoUpload}
              className="hidden"
            />
            {previewFoto && <img src={previewFoto} alt="Prévia do comprovante" className="mt-3 w-full max-h-48 object-contain rounded border bg-card" />}
            <p className="mt-2 text-xs text-muted-foreground">A foto é guardada em armazenamento privado. Para o comprovante completo, use o formulário da Expedição.</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome de Quem Recebeu *
            </Label>
            <Input value={nomeRecebedor} onChange={(e) => setNomeRecebedor(e.target.value)} placeholder="Nome completo" />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CPF/RG do Recebedor
            </Label>
            <Input value={documentoRecebedor} onChange={(e) => setDocumentoRecebedor(e.target.value)} placeholder="000.000.000-00" />
          </div>
        </div>

        <div>
          <Label>Cargo/Função do Recebedor</Label>
          <Input value={cargoRecebedor} onChange={(e) => setCargoRecebedor(e.target.value)} placeholder="Ex: Gerente, Almoxarife, Proprietário..." />
        </div>

        <div>
          <Label>Observações da Entrega</Label>
          <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Ex: Entregue em perfeito estado, sem avarias..." rows={3} />
        </div>

        <Card className={geolocalizacao ? "bg-green-50 border-green-300" : "bg-slate-50"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-5 h-5 ${geolocalizacao ? 'text-green-600' : 'text-slate-400'}`} />
                <div>
                  <p className="text-sm font-semibold">{geolocalizacao ? '✅ Localização Capturada' : '📍 Capturar Localização'}</p>
                  {geolocalizacao && (
                    <p className="text-xs text-slate-600">Lat: {geolocalizacao.latitude.toFixed(6)}, Lng: {geolocalizacao.longitude.toFixed(6)}</p>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={capturarGeolocalizacao} className={geolocalizacao ? "border-green-300" : ""}>
                {geolocalizacao ? 'Recapturar' : 'Capturar GPS'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {!podeConfirmar && (
          <Card className="bg-orange-50 border-orange-300">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-orange-800">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Campos obrigatórios:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {!nomeRecebedor.trim() && <li>Nome do recebedor</li>}
                    {!fotoComprovante && <li>Foto do comprovante</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={confirmarEntrega}
          disabled={!podeConfirmar || confirmando || uploadando || !podeConfirmarEntrega}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          size="lg"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {confirmando ? '⏳ Confirmando...' : '✅ Confirmar Entrega'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          ⚠️ A baixa de estoque segue a movimentação oficial do pedido e não é repetida quando já registrada.
        </p>
      </CardContent>
    </Card>
  );
}