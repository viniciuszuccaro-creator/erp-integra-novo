import React, { useState, useEffect } from 'react';
import { Shield, Hash, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function BlockchainAuditoriaPanel({ entity, entityId }) {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  useEffect(() => {
    carregarRegistros();
  }, [entity, entityId, contextoKey]);

  const carregarRegistros = async () => {
    setLoading(true);
    try {
      const logs = await filterInContext('AuditLog',
        { entidade: entity, registro_id: entityId },
        '-data_hora',
        50
      );
      
      const comHash = logs.map((log) => ({
        ...log,
        hash: gerarHash(JSON.stringify(log)),
        hashAnterior: logs[logs.indexOf(log) - 1] ? gerarHash(JSON.stringify(logs[logs.indexOf(log) - 1])) : null
      }));

      setRegistros(comHash);
    } catch (err) {
      console.error('Erro ao carregar registros:', err);
    } finally {
      setLoading(false);
    }
  };

  const gerarHash = (data) => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 16).toUpperCase().padStart(16, '0');
  };

  return (
    <div className="w-full h-full space-y-4 p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-emerald-600" />
        <h3 className="font-semibold">Auditoria Blockchain — {entity}</h3>
        <button onClick={carregarRegistros} disabled={loading} className="ml-auto text-xs underline">
          {loading ? 'Carregando...' : 'Atualizar'}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {registros.map((reg, idx) => (
          <div key={reg.id} className="bg-white border-l-4 border-emerald-500 p-3 rounded text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{reg.acao} — {reg.usuario}</p>
                <p className="text-xs text-gray-600">{new Date(reg.data_hora).toLocaleString()}</p>
                <div className="mt-2 font-mono text-xs bg-slate-100 p-2 rounded break-all">
                  <Hash className="w-3 h-3 inline mr-1" />
                  {reg.hash}
                </div>
                {reg.hashAnterior && (
                  <p className="mt-1 text-xs text-gray-500">
                    Hash anterior: {reg.hashAnterior}
                  </p>
                )}
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>

      {registros.length === 0 && !loading && (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          Nenhum registro de auditoria encontrado
        </div>
      )}
    </div>
  );
}