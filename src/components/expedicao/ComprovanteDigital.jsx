import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, CheckCircle, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function ComprovanteDigital({ entrega, isOpen, onClose, windowMode = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nome_recebedor: "",
    documento_recebedor: "",
    cargo_recebedor: "",
    observacoes_recebimento: "",
    foto_comprovante: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Entrega.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      toast({ title: "✅ Comprovante registrado com sucesso!" });
      onClose();
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "⚠️ Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }

      setFormData({ ...formData, foto_comprovante: file });
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome_recebedor) {
      toast({
        title: "⚠️ Campo obrigatório",
        description: "Informe o nome de quem recebeu",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      let fotoUrl = null;

      // Upload da foto se houver
      if (formData.foto_comprovante) {
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: formData.foto_comprovante
        });
        fotoUrl = uploadResult.file_url;
      }

      // Obter geolocalização (se disponível)
      let latitude = null;
      let longitude = null;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.log("Geolocalização não disponível");
        }
      }

      // Atualizar entrega com comprovante
      await updateMutation.mutateAsync({
        id: entrega.id,
        data: {
          status: "Entregue",
          data_entrega: new Date().toISOString(),
          comprovante_entrega: {
            foto_comprovante: fotoUrl,
            nome_recebedor: formData.nome_recebedor,
            documento_recebedor: formData.documento_recebedor,
            cargo_recebedor: formData.cargo_recebedor,
            data_hora_recebimento: new Date().toISOString(),
            latitude_entrega: latitude,
            longitude_entrega: longitude,
            observacoes_recebimento: formData.observacoes_recebimento
          },
          historico_status: [
            ...(entrega.historico_status || []),
            {
              status: "Entregue",
              data_hora: new Date().toISOString(),
              usuario: "Sistema",
              observacao: `Entrega confirmada. Recebido por: ${formData.nome_recebedor}`,
              localizacao: latitude && longitude ? { latitude, longitude } : null
            }
          ]
        }
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao registrar comprovante",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info da Entrega */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Cliente:</strong> {entrega?.cliente_nome}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Endereço:</strong> {entrega?.endereco_entrega_completo?.logradouro}, {entrega?.endereco_entrega_completo?.numero}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Pedido:</strong> {entrega?.numero_pedido || 'Sem pedido'}
            </p>
          </div>

          {/* Foto do Comprovante */}
          <div className="space-y-3">
            <Label htmlFor="foto-comprovante" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Foto do Comprovante (opcional)
            </Label>
            
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg border-2 border-slate-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreviewUrl(null);
                    setFormData({ ...formData, foto_comprovante: null });
                  }}
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="foto-comprovante"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="foto-comprovante" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-1">
                    Clique para tirar foto ou fazer upload
                  </p>
                  <p className="text-xs text-slate-500">
                    Máximo 5MB - JPG, PNG
                  </p>
                </label>
              </div>
            )}
          </div>

          {/* Dados do Recebedor */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Dados do Recebedor</h3>
            
            <div>
              <Label htmlFor="nome-recebedor">Nome de quem recebeu *</Label>
              <Input
                id="nome-recebedor"
                value={formData.nome_recebedor}
                onChange={(e) => setFormData({ ...formData, nome_recebedor: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="documento-recebedor">CPF/RG (opcional)</Label>
                <Input
                  id="documento-recebedor"
                  value={formData.documento_recebedor}
                  onChange={(e) => setFormData({ ...formData, documento_recebedor: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="cargo-recebedor">Cargo (opcional)</Label>
                <Input
                  id="cargo-recebedor"
                  value={formData.cargo_recebedor}
                  onChange={(e) => setFormData({ ...formData, cargo_recebedor: e.target.value })}
                  placeholder="Ex: Gerente, Porteiro"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações do Recebimento</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes_recebimento}
                onChange={(e) => setFormData({ ...formData, observacoes_recebimento: e.target.value })}
                rows={3}
                placeholder="Informações adicionais sobre o recebimento..."
              />
            </div>
          </div>

          {/* Info sobre Geolocalização */}
          <div className="p-3 bg-green-50 rounded border border-green-200 text-sm text-green-800 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              A localização GPS será registrada automaticamente no momento da confirmação (se disponível).
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button data-permission="Expedicao.ComprovanteDigital.salvar" 
              type="submit" 
              disabled={uploading || !formData.nome_recebedor}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Entrega
                </>
              )}
            </Button>
          </div>
        </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirmar Entrega - Comprovante Digital
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Confirmar Entrega - Comprovante Digital
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}