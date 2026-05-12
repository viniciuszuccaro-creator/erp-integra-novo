import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Package, Loader2 } from 'lucide-react';

export default function CicloXMarketplacePanel() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const marketplaces = ['mercado_livre', 'amazon', 'shopee'];

  const handleSync = async (marketplace) => {
    setSyncing(marketplace);
    try {
      const res = await base44.functions.invoke('marketplaceSync', {
        marketplace,
        action: 'sync_pedidos',
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id
      });
      setResult(res.data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" />
          Sincronização de Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {marketplaces.map(mp => (
            <Button
              key={mp}
              variant="outline"
              size="sm"
              onClick={() => handleSync(mp)}
              disabled={syncing === mp}
              className="flex flex-col items-center gap-2 h-auto py-3"
            >
              {syncing === mp && <Loader2 className="w-4 h-4 animate-spin" />}
              <span className="capitalize text-xs">{mp.replace('_', ' ')}</span>
            </Button>
          ))}
        </div>

        {result && (
          <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
            <p className="font-semibold">{result.marketplace} - {result.action}</p>
            {result.error ? (
              <Badge variant="destructive">Erro: {result.error}</Badge>
            ) : (
              <>
                <Badge variant="secondary">Pedidos: {result.pedidos_sincronizados}</Badge>
                <Badge variant="secondary">Produtos: {result.produtos_atualizados}</Badge>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}