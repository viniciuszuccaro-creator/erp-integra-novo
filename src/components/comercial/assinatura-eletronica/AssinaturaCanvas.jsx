import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

/**
 * Canvas para desenho da assinatura eletrônica com botão de limpar.
 */
export default function AssinaturaCanvas({
  canvasRef,
  assinaturaVazia,
  onIniciarDesenho,
  onDesenhar,
  onPararDesenho,
  onLimpar,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Label>Desenhe sua assinatura *</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onLimpar}
          disabled={assinaturaVazia}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>
      <Card className="p-1 border-2 border-slate-300">
        <canvas
          ref={canvasRef}
          width={700}
          height={200}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={onIniciarDesenho}
          onMouseMove={onDesenhar}
          onMouseUp={onPararDesenho}
          onMouseLeave={onPararDesenho}
          onTouchStart={onIniciarDesenho}
          onTouchMove={onDesenhar}
          onTouchEnd={onPararDesenho}
        />
      </Card>
      <p className="text-xs text-slate-500 mt-1">
        Use o mouse ou toque na tela para assinar
      </p>
    </div>
  );
}