import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function OCSelecionadasBar({ selectedCount, onExportCSV, onClear }) {
  if (!selectedCount) return null;
  return (
    <Alert className="m-2 border-blue-300 bg-blue-50 py-2 px-3">
      <AlertDescription className="flex items-center justify-between text-xs">
        <div className="text-blue-900 font-semibold">{selectedCount} OC selecionada(s)</div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={onExportCSV}>
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>Limpar</Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}