import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function TabelaFiscalSugestaoIA({ sugestaoIA, onAplicar, podeSalvar }) {
  if (!sugestaoIA) return null;
  return (
    <Alert className="border-purple-300 bg-purple-50">
      <Sparkles className="w-4 h-4 text-purple-600" />
      <AlertDescription className="text-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <strong>Sugestão da IA Fiscal:</strong>
            <p className="mt-1">{sugestaoIA.recomendacao}</p>
            {sugestaoIA.alertas?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {sugestaoIA.alertas.map((alerta, idx) => (
                  <li key={idx} className="text-xs">• {alerta}</li>
                ))}
              </ul>
            )}
            {sugestaoIA.legislacao && (
              <p className="text-xs mt-2 text-purple-700"><strong>Base Legal:</strong> {sugestaoIA.legislacao}</p>
            )}
          </div>
          <Button type="button" size="sm" onClick={onAplicar} disabled={!podeSalvar} data-sensitive="true"
            className="ml-4 bg-purple-600 hover:bg-purple-700">
            Aplicar Sugestões
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}