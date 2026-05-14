import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Banner orientativo exibido quando nenhuma empresa está selecionada.
 * Conforme c11-08: nunca deixar tela em branco, sempre guiar o usuário.
 */
export default function SemEmpresaBanner({ modulo = 'este módulo', children = null }) {
  const { empresaAtual, contexto } = useContextoVisual();

  // Se há empresa OU estamos no contexto de grupo, não exibe
  if (empresaAtual?.id || contexto === 'grupo') return children;

  return (
    <Alert className="border-amber-300 bg-amber-50 mb-4">
      <Building2 className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="font-semibold text-amber-800">Nenhuma empresa selecionada</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Para visualizar dados de {modulo}, selecione uma empresa ou acesse no contexto de grupo.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
          onClick={() => {
            // Tenta abrir EmpresaSwitcher via click no elemento do header
            const switcher = document.querySelector('[data-empresa-switcher]');
            if (switcher) switcher.click();
          }}
        >
          <Building2 className="w-4 h-4 mr-1" /> Selecionar Empresa
        </Button>
      </AlertDescription>
    </Alert>
  );
}