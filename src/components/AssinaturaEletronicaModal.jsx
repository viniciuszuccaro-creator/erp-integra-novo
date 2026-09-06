import React, { useState, useEffect } from "react";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenTool, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import useAssinaturaCanvas from "@/components/comercial/assinatura-eletronica/useAssinaturaCanvas";
import useAssinaturaData from "@/components/comercial/assinatura-eletronica/useAssinaturaData";
import AssinaturaFormFields from "@/components/comercial/assinatura-eletronica/AssinaturaFormFields";
import AssinaturaCanvas from "@/components/comercial/assinatura-eletronica/AssinaturaCanvas";
import AssinaturaMetaCard from "@/components/comercial/assinatura-eletronica/AssinaturaMetaCard";
import AssinaturaSuccessView from "@/components/comercial/assinatura-eletronica/AssinaturaSuccessView";

export default function AssinaturaEletronicaModal({
  isOpen,
  onClose,
  documento,
  tipo = "contrato",
  onAssinado
}) {
  const { toast } = useToast();
  const { updateInContext } = useContextoVisual();
  const { canEdit } = usePermissions();
  const [assinando, setAssinando] = useState(false);
  const [assinado, setAssinado] = useState(false);

  const { currentUser, dadosAssinatura, setDadosAssinatura } = useAssinaturaData(isOpen);
  const {
    canvasRef, assinaturaVazia, inicializarCanvas,
    iniciarDesenho, desenhar, pararDesenho,
    limparAssinatura, obterAssinaturaBase64,
  } = useAssinaturaCanvas();

  useEffect(() => {
    if (isOpen) inicializarCanvas();
  }, [isOpen, inicializarCanvas]);

  const validar = () => {
    if (assinaturaVazia) {
      toast({ title: "⚠️ Assinatura obrigatória", description: "Desenhe sua assinatura no espaço indicado", variant: "destructive" });
      return false;
    }
    if (!dadosAssinatura.nome_completo) { toast({ title: "⚠️ Nome completo obrigatório", variant: "destructive" }); return false; }
    if (!dadosAssinatura.cpf) { toast({ title: "⚠️ CPF obrigatório", variant: "destructive" }); return false; }
    return true;
  };

  const assinarDocumento = async () => {
    if (!validar()) return;
    // Regra-Mãe 5: RBAC fail-closed antes da persistência
    const moduloDoc = tipo === "contrato" ? 'Contratos' : 'Comercial';
    if (!canEdit(moduloDoc)) {
      toast({ title: "❌ Sem permissão", description: "Você não tem permissão para registrar assinaturas neste módulo.", variant: "destructive" });
      return;
    }
    try {
      setAssinando(true);
      const assinaturaImagem = obterAssinaturaBase64();
      const assinatura = {
        ...dadosAssinatura,
        assinatura_imagem: assinaturaImagem,
        data_hora: new Date().toISOString(),
        documento_tipo: tipo,
        documento_id: documento.id,
        documento_numero: documento.numero_contrato || documento.numero_pedido || documento.numero,
        geolocation: "São Paulo, BR",
        user_id: currentUser?.id || "",
        user_email: currentUser?.email || "",
      };

      await new Promise(resolve => setTimeout(resolve, 1500));

      let campoAssinatura = {};
      if (tipo === "contrato") {
        campoAssinatura = {
          assinado: true,
          data_assinatura: new Date().toISOString().split('T')[0],
          assinatura_digital: assinatura,
          status: documento.status === "Aguardando Assinatura" ? "Vigente" : documento.status,
        };
      } else if (tipo === "pedido") {
        campoAssinatura = {
          assinado_cliente: true,
          data_assinatura_cliente: new Date().toISOString(),
          assinatura_cliente: assinatura,
        };
      }

      // Regra-Mãe 5: persistência protegida (carimbo de contexto + auditoria antes/depois)
      if (tipo === "contrato") {
        await updateInContext('Contrato', documento.id, campoAssinatura);
      } else if (tipo === "pedido") {
        await updateInContext('Pedido', documento.id, campoAssinatura);
      }

      setAssinado(true);
      toast({ title: "✅ Documento assinado!", description: "Assinatura registrada com sucesso" });
      if (onAssinado) onAssinado(assinatura);
    } catch (error) {
      console.error("Erro ao assinar:", error);
      toast({ title: "❌ Erro ao assinar", description: error.message, variant: "destructive" });
    } finally {
      setAssinando(false);
    }
  };

  const baixarComprovante = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `assinatura_${tipo}_${documento.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: "📥 Download iniciado", description: "Comprovante de assinatura baixado" });
  };

  const fechar = () => {
    limparAssinatura();
    setAssinado(false);
    onClose();
  };

  if (!documento) return null;

  return (
    <Dialog open={isOpen} onOpenChange={fechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Assinatura Eletrônica
            {assinado && <Badge className="bg-green-600">Assinado</Badge>}
          </DialogTitle>
        </DialogHeader>

        {!assinado ? (
          <div className="space-y-6">
            {/* Info do Documento */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-2">Documento a ser assinado:</p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                    <div>
                      <span className="text-blue-600">Tipo:</span>{" "}
                      <strong className="capitalize">{tipo}</strong>
                    </div>
                    <div>
                      <span className="text-blue-600">Número:</span>{" "}
                      <strong>{documento.numero_contrato || documento.numero_pedido || documento.numero}</strong>
                    </div>
                    {documento.parte_contratante && (
                      <div className="col-span-2">
                        <span className="text-blue-600">Parte:</span>{" "}
                        <strong>{documento.parte_contratante}</strong>
                      </div>
                    )}
                    {documento.cliente_nome && (
                      <div className="col-span-2">
                        <span className="text-blue-600">Cliente:</span>{" "}
                        <strong>{documento.cliente_nome}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Dados do Assinante */}
            <AssinaturaFormFields dadosAssinatura={dadosAssinatura} setDadosAssinatura={setDadosAssinatura} />

            {/* Canvas de Assinatura */}
            <AssinaturaCanvas
              canvasRef={canvasRef}
              assinaturaVazia={assinaturaVazia}
              onIniciarDesenho={iniciarDesenho}
              onDesenhar={desenhar}
              onPararDesenho={pararDesenho}
              onLimpar={limparAssinatura}
            />

            {/* Dados do Dispositivo */}
            <AssinaturaMetaCard dadosAssinatura={dadosAssinatura} documentoId={documento.id} />

            {/* Termos */}
            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-2">Declaração:</p>
                  <p>Ao assinar este documento eletronicamente, declaro que:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-amber-800">
                    <li>Li e concordo com todos os termos do documento</li>
                    <li>Tenho plena capacidade jurídica para assinar</li>
                    <li>A assinatura tem validade legal conforme MP 2.200-2/2001</li>
                    <li>Os dados registrados são verdadeiros e precisos</li>
                  </ul>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={fechar}
                data-action="Comercial.AssinaturaEletronica.cancelar"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={assinarDocumento}
                disabled={assinando}
                className="bg-blue-600 hover:bg-blue-700"
                data-action="Comercial.AssinaturaEletronica.assinar"
                data-sensitive="true"
              >
                {assinando ? (
                  <>
                    <Shield className="w-4 h-4 mr-2 animate-pulse" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Assinar Documento
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <AssinaturaSuccessView
            dadosAssinatura={dadosAssinatura}
            onBaixar={baixarComprovante}
            onConcluir={fechar}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}