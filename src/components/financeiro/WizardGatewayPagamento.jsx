import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Settings, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * c11-11: Wizard orientativo quando gateway de pagamento não está configurado.
 * Exibe em vez de erro genérico ao tentar gerar boleto/PIX.
 */
export default function WizardGatewayPagamento({ onConfigurado, tipo = 'Boleto' }) {
  const { empresaAtual } = useContextoVisual();
  const [dismissed, setDismissed] = useState(false);

  const { data: gateways = [] } = useQuery({
    queryKey: ['gateways-pagamento', empresaAtual?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'GatewayPagamento',
        filter: { empresa_id: empresaAtual?.id, ativo: true },
        limit: 5,
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: !!empresaAtual?.id,
  });

  const { data: configCobranca } = useQuery({
    queryKey: ['config-cobranca', empresaAtual?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter: { chave: `integracoes_${empresaAtual?.id}` },
        limit: 1,
      });
      return Array.isArray(res?.data) ? (res.data[0] || null) : null;
    },
    enabled: !!empresaAtual?.id,
  });

  if (dismissed) return null;

  const temGateway = gateways.length > 0;
  const temApiKey = !!configCobranca?.integracao_boletos?.api_key;
  const configurado = temGateway || temApiKey;

  if (configurado) {
    if (onConfigurado) onConfigurado(true);
    return (
      <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span>Gateway de pagamento configurado e pronto para {tipo}.</span>
      </div>
    );
  }

  return (
    <Alert className="border-amber-300 bg-amber-50">
      <CreditCard className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="font-semibold text-amber-800 mb-1">Gateway de pagamento não configurado</p>
            <p className="text-xs text-amber-700 mb-3">
              Para gerar {tipo}, é necessário configurar um gateway de pagamento (Asaas, Juno ou outro).
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { nome: 'Asaas', desc: 'Boleto, PIX, Cartão', popular: true },
                { nome: 'Juno', desc: 'Boleto, PIX, Link' },
                { nome: 'PagSeguro', desc: 'Cartão, Link' },
                { nome: 'Stripe', desc: 'Cartão Internacional' },
              ].map((gw) => (
                <div key={gw.nome} className={`rounded-lg border px-3 py-2 text-xs ${gw.popular ? 'border-amber-400 bg-white' : 'border-amber-200 bg-amber-50/50'}`}>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{gw.nome}</span>
                    {gw.popular && <Badge className="text-[9px] bg-amber-500 text-white">Popular</Badge>}
                  </div>
                  <p className="text-amber-600">{gw.desc}</p>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => window.location.href = '/AdministracaoSistema?tab=integracoes'}
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" /> Configurar Gateway
            </Button>
          </div>
          <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      </AlertDescription>
    </Alert>
  );
}