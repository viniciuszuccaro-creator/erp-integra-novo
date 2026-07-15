import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PenTool, CheckCircle, Trash2, Shield } from "lucide-react";
import { useAssinaturaEletronica } from "./assinatura-eletronica/useAssinaturaEletronica";
import AssinaturaDadosCard from "./assinatura-eletronica/AssinaturaDadosCard";
import AssinaturaSucessoView from "./assinatura-eletronica/AssinaturaSucessoView";

/**
 * Formulário de assinatura eletrônica com canvas
 * V21.1.2 - WINDOW MODE READY
 * Refatorado: lógica em useAssinaturaEletronica, UI em sub-componentes (Regra-Mãe)
 */
export default function AssinaturaEletronicaForm({ documento, tipo = "contrato", onAssinado, windowMode = false }) {
  const {
    canvasRef, assinando, assinado, assinaturaVazia, dadosAssinatura, setDadosAssinatura,
    iniciarDesenho, desenhar, pararDesenho, limparAssinatura, assinarDocumento, baixarComprovante
  } = useAssinaturaEletronica({ documento, tipo, onAssinado });

  if (!documento) return null;

  const campos = [
    { key: 'nome_completo', label: 'Nome Completo *', required: true },
    { key: 'cpf', label: 'CPF *', placeholder: '000.000.000-00', required: true },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'cargo', label: 'Cargo', placeholder: 'Ex: Diretor' }
  ];

  const content = (
    <div className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      {!assinado ? (
        <>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-2">Documento a ser assinado:</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                  <div><span className="text-blue-600">Tipo:</span> <strong className="capitalize">{tipo}</strong></div>
                  <div><span className="text-blue-600">Número:</span> <strong>{documento.numero_contrato || documento.numero_pedido || documento.numero}</strong></div>
                  {documento.cliente_nome && <div className="col-span-2"><span className="text-blue-600">Cliente:</span> <strong>{documento.cliente_nome}</strong></div>}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {campos.map(({ key, label, placeholder, type, required }) => (
              <div key={key}>
                <Label>{label}</Label>
                <Input
                  type={type || 'text'}
                  value={dadosAssinatura[key]}
                  onChange={(e) => setDadosAssinatura(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required={required}
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Desenhe sua assinatura *</Label>
              <Button type="button" variant="ghost" size="sm" onClick={limparAssinatura} disabled={assinaturaVazia}>
                <Trash2 className="w-4 h-4 mr-2" />Limpar
              </Button>
            </div>
            <Card className="p-1 border-2 border-slate-300">
              <canvas
                ref={canvasRef}
                width={700}
                height={200}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={iniciarDesenho}
                onMouseMove={desenhar}
                onMouseUp={pararDesenho}
                onMouseLeave={pararDesenho}
                onTouchStart={iniciarDesenho}
                onTouchMove={desenhar}
                onTouchEnd={pararDesenho}
              />
            </Card>
            <p className="text-xs text-slate-500 mt-1">Use o mouse ou toque na tela para assinar</p>
          </div>

          <AssinaturaDadosCard dadosAssinatura={dadosAssinatura} documentoId={documento.id} />

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

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button type="button" onClick={assinarDocumento} disabled={assinando} className="bg-blue-600 hover:bg-blue-700">
              {assinando ? (
                <><Shield className="w-4 h-4 mr-2 animate-pulse" />Registrando...</>
              ) : (
                <><PenTool className="w-4 h-4 mr-2" />Assinar Documento</>
              )}
            </Button>
          </div>
        </>
      ) : (
        <AssinaturaSucessoView dadosAssinatura={dadosAssinatura} onBaixarComprovante={baixarComprovante} />
      )}
    </div>
  );

  if (windowMode) return <div className="w-full h-full bg-white">{content}</div>;
  return content;
}