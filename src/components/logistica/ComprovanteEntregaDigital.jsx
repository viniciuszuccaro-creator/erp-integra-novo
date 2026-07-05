import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, CheckCircle2, AlertCircle, User, FileText, MapPin } from "lucide-react";
import { toast } from "sonner";

/**
 * 📸 COMPROVANTE DIGITAL DE ENTREGA V21.5
 * Upload de foto, assinatura digital e geolocalização
 */
export default function ComprovanteEntregaDigital({ pedido, entrega, onSuccess, windowMode = false }) {
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [documentoRecebedor, setDocumentoRecebedor] = useState("");
  const [cargoRecebedor, setCargoRecebedor] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotoComprovante, setFotoComprovante] = useState(null);
  const [uploadando, setUploadando] = useState(false);
  const [geolocalizacao, setGeolocalizacao] = useState(null);

  const queryClient = useQueryClient();

  const capturarGeolocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocalizacao({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success("📍 Localização capturada!");
        },
        () => {
          toast.error("❌ Erro ao capturar localização");
        }
      );
    }
  };

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadando(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFotoComprovante(file_url);
      toast.success("✅ Foto enviada!");
    } catch (error) {
      toast.error("Erro ao enviar foto: " + error.message);
    } finally {
      setUploadando(false);
    }
  };

  const confirmarEntregaMutation = useMutation({
    mutationFn: async () => {
      // Baixar estoque automaticamente
      if (pedido.itens_revenda?.length > 0) {
        for (const item of pedido.itens_revenda) {
          if (item.produto_id) {
            const produtos = await base44.entities.Produto.filter({ 
              id: item.produto_id,
              empresa_id: pedido.empresa_id 
            });
            
            const produto = produtos[0];
            if (produto && (produto.estoque_atual || 0) >= (item.quantidade || 0)) {
              const novoEstoque = (produto.estoque_atual || 0) - (item.quantidade || 0);
              
              await base44.entities.MovimentacaoEstoque.create({
                empresa_id: pedido.empresa_id,
                group_id: pedido.group_id,
                tipo_movimento: "saida",
                origem_movimento: "pedido",
                origem_documento_id: pedido.id,
                produto_id: item.produto_id,
                produto_descricao: item.descricao || item.produto_descricao,
                quantidade: item.quantidade,
                unidade_medida: item.unidade,
                estoque_anterior: produto.estoque_atual || 0,
                estoque_atual: novoEstoque,
                data_movimentacao: new Date().toISOString(),
                documento: pedido.numero_pedido,
                motivo: `Entrega confirmada - ${nomeRecebedor}`,
                responsavel: nomeRecebedor,
                aprovado: true
              });
              
              await base44.entities.Produto.update(item.produto_id, {
                estoque_atual: novoEstoque
              });
            }
          }
        }
      }

      // Atualizar ou criar entrega
      const comprovanteData = {
        foto_comprovante: fotoComprovante,
        nome_recebedor: nomeRecebedor,
        documento_recebedor: documentoRecebedor,
        cargo_recebedor: cargoRecebedor,
        data_hora_recebimento: new Date().toISOString(),
        latitude_entrega: geolocalizacao?.latitude,
        longitude_entrega: geolocalizacao?.longitude,
        observacoes_recebimento: observacoes
      };

      if (entrega) {
        await base44.entities.Entrega.update(entrega.id, {
          status: 'Entregue',
          data_entrega: new Date().toISOString(),
          comprovante_entrega: comprovanteData
        });
      } else {
        await base44.entities.Entrega.create({
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          cliente_nome: pedido.cliente_nome,
          empresa_id: pedido.empresa_id,
          group_id: pedido.group_id,
          endereco_entrega_completo: pedido.endereco_entrega_principal,
          status: 'Entregue',
          data_entrega: new Date().toISOString(),
          comprovante_entrega: comprovanteData
        });
      }

      // Atualizar pedido
      await base44.entities.Pedido.update(pedido.id, {
        status: 'Entregue'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success("✅ Entrega confirmada e estoque baixado!");
      if (onSuccess) onSuccess();
    }
  });

  const podeConfirmar = nomeRecebedor.trim() && fotoComprovante;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          📸 Comprovante Digital de Entrega
        </CardTitle>
        <p className="text-sm opacity-90">Pedido #{pedido.numero_pedido}</p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Upload de Foto */}
        <Card className="bg-blue-50 border-blue-300">
          <CardContent className="p-4">
            <Label className="text-sm font-semibold mb-2 block">📷 Foto do Comprovante *</Label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => document.getElementById('foto-input').click()}
                disabled={uploadando}
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploadando ? 'Enviando...' : fotoComprovante ? '✅ Foto Enviada' : 'Tirar/Enviar Foto'}
              </Button>
              {fotoComprovante && (
                <Button
                  variant="outline"
                  onClick={() => window.open(fotoComprovante, '_blank')}
                >
                  Ver Foto
                </Button>
              )}
            </div>
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Dados do Recebedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome de Quem Recebeu *
            </Label>
            <Input
              value={nomeRecebedor}
              onChange={(e) => setNomeRecebedor(e.target.value)}
              placeholder="Nome completo"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CPF/RG do Recebedor
            </Label>
            <Input
              value={documentoRecebedor}
              onChange={(e) => setDocumentoRecebedor(e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>
        </div>

        <div>
          <Label>Cargo/Função do Recebedor</Label>
          <Input
            value={cargoRecebedor}
            onChange={(e) => setCargoRecebedor(e.target.value)}
            placeholder="Ex: Gerente, Almoxarife, Proprietário..."
          />
        </div>

        <div>
          <Label>Observações da Entrega</Label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Entregue em perfeito estado, sem avarias..."
            rows={3}
          />
        </div>

        {/* Geolocalização */}
        <Card className={geolocalizacao ? "bg-green-50 border-green-300" : "bg-slate-50"}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-5 h-5 ${geolocalizacao ? 'text-green-600' : 'text-slate-400'}`} />
                <div>
                  <p className="text-sm font-semibold">
                    {geolocalizacao ? '✅ Localização Capturada' : '📍 Capturar Localização'}
                  </p>
                  {geolocalizacao && (
                    <p className="text-xs text-slate-600">
                      Lat: {geolocalizacao.latitude.toFixed(6)}, Lng: {geolocalizacao.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={capturarGeolocalizacao}
                className={geolocalizacao ? "border-green-300" : ""}
              >
                {geolocalizacao ? 'Recapturar' : 'Capturar GPS'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Validação */}
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

        {/* Botão de Confirmação */}
        <Button
          onClick={() => confirmarEntregaMutation.mutate()}
          disabled={!podeConfirmar || confirmarEntregaMutation.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          size="lg"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {confirmarEntregaMutation.isPending ? '⏳ Confirmando...' : '✅ Confirmar Entrega e Baixar Estoque'}
        </Button>

        <p className="text-xs text-center text-slate-500">
          ⚠️ Ao confirmar, o estoque será baixado automaticamente e não poderá ser desfeito
        </p>
      </CardContent>
    </Card>
  );
}