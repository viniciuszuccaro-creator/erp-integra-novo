import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

/**
 * Card de progresso durante processamento IA
 * Extraído de UploadProjetoModal.jsx
 */
export default function UploadProjetoProgresso({ progresso }) {
  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
          <div className="flex-1">
            <p className="font-semibold text-purple-900 mb-1">Processando projeto com IA...</p>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progresso}%` }} />
            </div>
            <p className="text-xs text-purple-700 mt-1">{progresso}% concluído</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}