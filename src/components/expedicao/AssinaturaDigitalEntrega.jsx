import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pen, Eraser, CheckCircle, MapPin, Camera, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * Componente de Assinatura Digital para Confirmação de Entrega
 */
export default function AssinaturaDigitalEntrega({ onAssinaturaConcluida, isLoading }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [assinado, setAssinado] = useState(false);

  const [dados, setDados] = useState({
    nome_recebedor: "",
    documento_recebedor: "",
    cargo_recebedor: "",
    observacoes_recebimento: "",
    foto_comprovante: null
  });

  const [localizacao, setLocalizacao] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  // Capturar geolocalização
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacao({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocalização não disponível:", error);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const iniciarDesenho = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const desenhar = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setAssinado(true);
  };

  const pararDesenho = () => {
    setIsDrawing(false);
  };

  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAssinado(false);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDados({ ...dados, foto_comprovante: file });
      const reader = new FileReader();
      reader.onloadend = () => setPreviewFoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmar = async () => {
    if (!dados.nome_recebedor) {
      toast.error("Informe o nome de quem recebeu");
      return;
    }

    if (!assinado) {
      toast.error("É necessário assinar");
      return;
    }

    // Upload da foto (se houver)
    let fotoUrl = null;
    if (dados.foto_comprovante) {
      const uploadResult = await base44.integrations.Core.UploadFile({
        file: dados.foto_comprovante
      });
      fotoUrl = uploadResult.file_url;
    }

    // Converter assinatura para base64
    const canvas = canvasRef.current;
    const assinaturaBase64 = canvas.toDataURL();

    onAssinaturaConcluida({
      nome_recebedor: dados.nome_recebedor,
      documento_recebedor: dados.documento_recebedor,
      cargo_recebedor: dados.cargo_recebedor,
      observacoes_recebimento: dados.observacoes_recebimento,
      assinatura_base64: assinaturaBase64,
      foto_url: fotoUrl,
      latitude: localizacao?.latitude,
      longitude: localizacao?.longitude,
      data_hora_assinatura: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      {/* Geolocalização */}
      {localizacao && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-900">Localização capturada</p>
                <p className="text-xs text-green-700">
                  Lat: {localizacao.latitude.toFixed(6)} | Long: {localizacao.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Foto */}
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Foto do Comprovante (opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {previewFoto ? (
            <div className="relative">
              <img src={previewFoto} alt="Preview" className="w-full h-64 object-cover rounded border-2" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPreviewFoto(null);
                  setDados({ ...dados, foto_comprovante: null });
                }}
              >
                Remover
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="foto"
                accept="image/*"
                capture="environment"
                onChange={handleFotoChange}
                className="hidden"
              />
              <label htmlFor="foto" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600">Clique para tirar foto ou fazer upload</p>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dados do Recebedor */}
      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="text-sm">Dados do Recebedor *</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Nome Completo *</Label>
            <Input
              value={dados.nome_recebedor}
              onChange={(e) => setDados({ ...dados, nome_recebedor: e.target.value })}
              required
              className="mt-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CPF/RG (opcional)</Label>
              <Input
                value={dados.documento_recebedor}
                onChange={(e) => setDados({ ...dados, documento_recebedor: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Cargo (opcional)</Label>
              <Input
                value={dados.cargo_recebedor}
                onChange={(e) => setDados({ ...dados, cargo_recebedor: e.target.value })}
                placeholder="Gerente, Porteiro..."
                className="mt-2"
              />
            </div>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea
              value={dados.observacoes_recebimento}
              onChange={(e) => setDados({ ...dados, observacoes_recebimento: e.target.value })}
              rows={2}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assinatura */}
      <Card>
        <CardHeader className="bg-orange-50 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Pen className="w-5 h-5 text-orange-600" />
            Assinatura Digital *
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="border-2 border-slate-300 rounded bg-white cursor-crosshair w-full"
              onMouseDown={iniciarDesenho}
              onMouseMove={desenhar}
              onMouseUp={pararDesenho}
              onMouseLeave={pararDesenho}
              onTouchStart={(e) => iniciarDesenho(e.touches[0])}
              onTouchMove={(e) => desenhar(e.touches[0])}
              onTouchEnd={pararDesenho}
            />
            {assinado && (
              <Badge className="absolute top-2 right-2 bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Assinado
              </Badge>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={limparAssinatura}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botão Confirmar */}
      <RBACButton module="Expedicao" action="confirmar"
        onClick={handleConfirmar}
        disabled={!dados.nome_recebedor || !assinado || isLoading}
        className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
      >
        {isLoading ? 'Confirmando...' : 'Confirmar Entrega'}
      </RBACButton>
    </div>
  );
}