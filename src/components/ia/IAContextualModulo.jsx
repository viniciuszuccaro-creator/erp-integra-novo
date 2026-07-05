import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * c11-12: IA generativa contextual — sugestões proativas por módulo.
 * Usa iaGenerativeContextual para sugerir próximas ações com base no contexto.
 */
export default function IAContextualModulo({ modulo, contextoExtra = {}, compact = false }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [aberto, setAberto] = useState(false);
  const [sugestoes, setSugestoes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const buscarSugestoes = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await base44.functions.invoke('iaGenerativeContextual', {
        modulo,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        contexto: contextoExtra,
      });
      setSugestoes(res?.data?.sugestoes || res?.data || null);
    } catch (e) {
      setErro('IA indisponível no momento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !aberto;
    setAberto(next);
    if (next && !sugestoes && !loading) {
      buscarSugestoes();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={handleToggle}
          disabled={loading}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          {loading ? 'IA pensando...' : 'Sugestões IA'}
          {aberto ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>
        {aberto && sugestoes && (
          <Badge className="bg-purple-100 text-purple-800 text-xs max-w-xs truncate">
            {typeof sugestoes === 'string' ? sugestoes : sugestoes?.[0] || ''}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="border-purple-200 bg-purple-50/60 w-full">
      <CardContent className="p-0">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-100/50 transition-colors rounded-lg"
          onClick={handleToggle}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white flex-shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-900">Sugestões IA — {modulo}</p>
            <p className="text-xs text-purple-600">Ações inteligentes baseadas no contexto atual</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <RefreshCw className="w-4 h-4 text-purple-500 animate-spin" />}
            {aberto ? <ChevronUp className="w-4 h-4 text-purple-500" /> : <ChevronDown className="w-4 h-4 text-purple-500" />}
          </div>
        </button>

        {aberto && (
          <div className="px-4 pb-4 pt-1 border-t border-purple-100 mt-0">
            {loading && (
              <div className="text-sm text-purple-600 text-center py-3 animate-pulse">
                🤖 Analisando contexto de {modulo}...
              </div>
            )}
            {erro && (
              <div className="text-sm text-red-600 py-2 flex items-center justify-between gap-2">
                <span>{erro}</span>
                <Button data-permission="Sistema.IA.visualizar" size="sm" variant="ghost" onClick={buscarSugestoes}>Tentar novamente</Button>
              </div>
            )}
            {!loading && sugestoes && (
              <div className="mt-2 space-y-2">
                {(typeof sugestoes === 'string' ? [sugestoes] : Array.isArray(sugestoes) ? sugestoes : [JSON.stringify(sugestoes)])
                  .slice(0, 5)
                  .map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-700 leading-relaxed">{typeof s === 'string' ? s : s?.titulo || s?.acao || JSON.stringify(s)}</span>
                    </div>
                  ))
                }
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-purple-200 text-purple-700"
                  onClick={buscarSugestoes}
                  disabled={loading}
                >
                  <RefreshCw className="w-3 h-3 mr-1.5" /> Atualizar sugestões
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}