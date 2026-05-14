// Inicializador automático de perfis RBAC por empresa/grupo
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function RBACInitializer({ group_id, empresa_id, onComplete = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Auto-inicializa se tiver scope
    if ((group_id || empresa_id) && !status) {
      initialize();
    }
  }, [group_id, empresa_id]);

  const initialize = async () => {
    try {
      setLoading(true);
      setStatus('loading');
      setMessage('Inicializando perfis RBAC...');

      const { data } = await base44.functions.invoke('initializeRBACProfiles', {
        group_id,
        empresa_id,
      });

      if (data?.ok) {
        setStatus('success');
        setMessage(`✓ ${data.created} perfis criados com sucesso`);
        setTimeout(() => onComplete(), 1500);
      } else {
        setStatus('error');
        setMessage(data?.error || 'Erro ao inicializar');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  return (
    <Card className="w-full border-blue-200 bg-blue-50">
      <CardContent className="p-4 flex items-center gap-3">
        {status === 'loading' && (
          <>
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <span className="text-sm text-blue-900">{message}</span>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-900">{message}</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-900">{message}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={initialize}
                disabled={loading}
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}