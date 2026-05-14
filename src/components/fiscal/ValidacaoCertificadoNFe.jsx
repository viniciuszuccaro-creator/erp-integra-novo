import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Settings, X } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * c11-10: Valida configuração de certificado A1 e API fiscal antes de habilitar emissão NF-e.
 * Exibe banner bloqueante se config incompleta, com link para configurar.
 */
export default function ValidacaoCertificadoNFe({ onConfigurado }) {
  const { empresaAtual } = useContextoVisual();
  const [dismissed, setDismissed] = useState(false);

  const { data: configFiscal } = useQuery({
    queryKey: ['config-fiscal-nfe', empresaAtual?.id],
    queryFn: async () => {
      if (!empresaAtual?.id) return null;
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfigFiscalEmpresa',
        filter: { empresa_id: empresaAtual.id },
        limit: 1,
      });
      return Array.isArray(res?.data) ? (res.data[0] || null) : null;
    },
    enabled: !!empresaAtual?.id,
  });

  const { data: configSistema } = useQuery({
    queryKey: ['config-sistema-nfe', empresaAtual?.id],
    queryFn: async () => {
      if (!empresaAtual?.id) return null;
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter: { chave: `integracoes_${empresaAtual.id}` },
        limit: 1,
      });
      return Array.isArray(res?.data) ? (res.data[0] || null) : null;
    },
    enabled: !!empresaAtual?.id,
  });

  if (dismissed) return null;

  // Verificações de configuração
  const temCNPJ = !!configFiscal?.cnpj_emitente;
  const temSerie = !!configFiscal?.serie_nfe;
  const temAPIKey = !!configSistema?.integracao_nfe?.api_key;
  const configurado = temCNPJ && temSerie && temAPIKey;

  if (configurado) {
    if (onConfigurado) onConfigurado(true);
    return (
      <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span>Certificado e API NF-e configurados para {empresaAtual?.nome_fantasia || 'esta empresa'}.</span>
      </div>
    );
  }

  const pendentes = [
    !temCNPJ && 'CNPJ Emitente (Config Fiscal)',
    !temSerie && 'Série da NF-e',
    !temAPIKey && 'API Key do provedor NF-e (eNotas/Bling)',
  ].filter(Boolean);

  return (
    <Alert className="border-red-300 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-red-800 mb-1">⚠️ Configuração de NF-e incompleta</p>
            <p className="text-xs text-red-700 mb-2">Para emitir NF-e, configure:</p>
            <ul className="space-y-1">
              {pendentes.map((p, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-red-800">
                  <X className="w-3 h-3 text-red-500 flex-shrink-0" /> {p}
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              className="mt-3 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = '/AdministracaoSistema?tab=integracoes'}
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" /> Configurar agora
            </Button>
          </div>
          <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-600 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      </AlertDescription>
    </Alert>
  );
}