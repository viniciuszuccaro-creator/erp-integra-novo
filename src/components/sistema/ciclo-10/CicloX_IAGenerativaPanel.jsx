import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function CicloXIAGenerativaPanel() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [module, setModule] = useState('Comercial');
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const modules = ['Comercial', 'Financeiro', 'Estoque', 'Produção'];

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('iaGenerativeContextual', {
        module,
        prompt,
        context: { empresa_id: empresaAtual?.id, group_id: grupoAtual?.id }
      });
      setResponse(res.data?.response || res.data);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          IA Generativa Contextual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {modules.map(m => (
            <Button
              key={m}
              variant={module === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => setModule(m)}
              disabled={!hasPermission(m, null, 'ver')}
            >
              {m}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Faça uma pergunta contextual sobre este módulo..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <Button onClick={handleAsk} disabled={loading || !prompt.trim()} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {loading ? 'Pensando...' : 'Perguntar IA'}
          </Button>
        </div>

        {response && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm whitespace-pre-wrap">
            {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}