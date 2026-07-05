import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function AutomationOrchestrator() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      // Simulated automation data
      const mockAutomations = [
        {
          id: '1',
          nome: 'Reposição de Estoque',
          descricao: 'Cria OC automaticamente quando estoque atinge mínimo',
          status: 'ativo',
          proximaExecucao: '2026-06-01 14:30',
          ultimaExecucao: '2026-05-31 10:15',
          sucessos: 42,
          falhas: 1
        },
        {
          id: '2',
          nome: 'Análise de Churn',
          descricao: 'Identifica clientes em risco e sugere ações',
          status: 'ativo',
          proximaExecucao: '2026-06-02 09:00',
          ultimaExecucao: '2026-05-31 09:00',
          sucessos: 15,
          falhas: 0
        },
        {
          id: '3',
          nome: 'Reconciliação Bancária',
          descricao: 'Concilia automaticamente extratos com movimentações',
          status: 'pausado',
          proximaExecucao: '--',
          ultimaExecucao: '2026-05-30 18:45',
          sucessos: 28,
          falhas: 2
        }
      ];
      setAutomations(mockAutomations);
    } catch (error) {
      console.error('Erro ao buscar automações:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = async (id) => {
    try {
      const automation = automations.find(a => a.id === id);
      const newStatus = automation.status === 'ativo' ? 'pausado' : 'ativo';
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (error) {
      console.error('Erro ao alternar automação:', error);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Carregando automações...</div>;
  }

  return (
    <div className="w-full space-y-4">
      {automations.map((auto) => (
        <Card key={auto.id} className="bg-slate-800/30 border-slate-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  {auto.nome}
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">{auto.descricao}</p>
              </div>
              <Badge className={auto.status === 'ativo' ? 'bg-green-600' : 'bg-slate-600'}>
                {auto.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-xs text-slate-400">Sucessos</p>
                <p className="text-lg font-bold text-green-400">{auto.sucessos}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-xs text-slate-400">Falhas</p>
                <p className="text-lg font-bold text-red-400">{auto.falhas}</p>
              </div>
              <div className="bg-slate-700/50 rounded p-2">
                <p className="text-xs text-slate-400">Taxa Sucesso</p>
                <p className="text-lg font-bold text-blue-400">
                  {auto.sucessos + auto.falhas > 0
                    ? Math.round((auto.sucessos / (auto.sucessos + auto.falhas)) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Execução */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-400">
                <span className="text-xs">Última:</span>
                <p className="text-slate-200">{auto.ultimaExecucao}</p>
              </div>
              <div className="text-slate-400">
                <span className="text-xs">Próxima:</span>
                <p className="text-slate-200">{auto.proximaExecucao}</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAutomation(auto.id)}
                className="flex-1"
              >
                {auto.status === 'ativo' ? (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1" />
                    Ativar
                  </>
                )}
              </Button>
              <Button data-permission="Sistema.Automacao.visualizar" variant="outline" size="sm" className="flex-1">
                <RefreshCw className="w-3 h-3 mr-1" />
                Executar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}