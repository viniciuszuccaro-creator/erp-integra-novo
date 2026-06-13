import React, { useState, Suspense, lazy } from 'react';
import { Play, CheckCircle2, Zap, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

// Carregamento dinâmico (lazy) dos componentes referenciados pelo campo `componente`
const componentMap = {
  IAGenerativaAvancadaPanel: lazy(() => import('@/components/ia/IAGenerativaAvancadaPanel')),
  ChatbotOmnicanal: lazy(() => import('@/components/chatbot/ChatbotOmnicanal')),
  BlockchainAuditoriaPanel: lazy(() => import('@/components/blockchain/BlockchainAuditoriaPanel')),
  APIHeadlessGuide: lazy(() => import('@/components/integracao/APIHeadlessGuide')),
  LanguageSwitcher: lazy(() => import('@/components/layout/LanguageSwitcher')),
  DashboardIAGerador: lazy(() => import('@/components/dashboard/DashboardIAGerador')),
};

// Lista local do painel de execução (ids numéricos para compatibilidade com lógica de estado)
const ciclo21Items = [
  { id: 1, nome: 'IA Generativa Avançada', descricao: 'Geração contextual de conteúdo com LLM integrado', status: 'ativo', componente: 'IAGenerativaAvancadaPanel', impacto: 'Alto' },
  { id: 2, nome: 'Chatbot Omnicanal', descricao: 'Comunicação multi-canal (WhatsApp, Email, SMS)', status: 'ativo', componente: 'ChatbotOmnicanal', impacto: 'Alto' },
  { id: 3, nome: 'Blockchain Auditoria', descricao: 'Trilha imutável de alterações com hash', status: 'ativo', componente: 'BlockchainAuditoriaPanel', impacto: 'Crítico' },
  { id: 4, nome: 'API Headless Multi-Tenant', descricao: 'REST + GraphQL + Webhooks por empresa', status: 'ativo', componente: 'APIHeadlessGuide', impacto: 'Alto' },
  { id: 5, nome: 'Internacionalização (i18n)', descricao: 'Suporte a múltiplos idiomas (PT, EN, ES)', status: 'ativo', componente: 'LanguageSwitcher', impacto: 'Médio' },
  { id: 6, nome: 'Dashboard IA Gerador', descricao: 'Relatórios automáticos com LLM', status: 'ativo', componente: 'DashboardIAGerador', impacto: 'Médio' },
];

export default function CicloExecucaoPanel() {
  const [executando, setExecutando] = useState(null);
  const [completos, setCompletos] = useState([]);
  const [mostrando, setMostrando] = useState(null);
  const [inicializado, setInicializado] = useState(false);
  const { user } = useUser();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();

  const iniciarCiclo21 = async () => {
    try {
      const res = await base44.functions.invoke('ciclo21Executor', {
        action: 'start',
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
      });
      if (res?.data?.success) {
        setInicializado(true);
      }
    } catch (err) {
      console.error('Erro ao iniciar Ciclo 21:', err);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'em-progresso': return 'bg-amber-100 text-amber-800';
      case 'completado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const impactoColor = (impacto) => {
    switch (impacto) {
      case 'Crítico': return 'bg-red-100 text-red-800';
      case 'Alto': return 'bg-orange-100 text-orange-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const executar = async (item) => {
    setExecutando(item.id);
    try {
      // Executa componente via backend
      const res = await base44.functions.invoke('ciclo21Executor', {
        action: 'execute_component',
        component_id: item.id,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
      });

      if (res?.data?.success) {
        setCompletos([...completos, item.id]);
        setMostrando(item.id); // Mostra componente após conclusão

        // Se todos estão completos, finaliza ciclo
        const novoCompletos = [...completos, item.id];
        if (novoCompletos.length === ciclo21Items.length) {
          await base44.functions.invoke('ciclo21Executor', {
            action: 'complete_cycle',
            empresa_id: empresaAtual?.id || null,
            group_id: grupoAtual?.id || null,
          });
        }
      }
    } catch (err) {
      console.error(`Erro ao executar ${item.nome}:`, err);
    }
    setExecutando(null);
  };

  const totalCompleto = completos.length;
  const percentualCiclo = Math.round((totalCompleto / ciclo21Items.length) * 100);

  return (
    <div className="w-full space-y-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-600" />
          <h3 className="text-xl font-bold">Ciclo 21 — Execução de Melhorias</h3>
        </div>
        <div className="flex items-center gap-2">
          {!inicializado && (
            <Button onClick={iniciarCiclo21} className="bg-green-600 hover:bg-green-700 text-white">
              <Zap className="w-4 h-4 mr-2" /> Iniciar Ciclo 21
            </Button>
          )}
          <Badge variant="outline" className="text-base px-3 py-1">
            {percentualCiclo}% Concluído
          </Badge>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600">{totalCompleto}/{ciclo21Items.length} componentes</span>
          <span className="text-sm text-slate-500">Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-600 transition-all"
            style={{ width: `${percentualCiclo}%` }}
          />
        </div>
      </div>

      {!inicializado && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            💡 Clique em "Iniciar Ciclo 21" acima para começar a execução dos 6 componentes estratégicos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {inicializado && ciclo21Items.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {completos.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {item.nome}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">{item.descricao}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColor(item.status)} variant="outline">
                  {item.status === 'ativo' ? '✓ Ativo' : item.status}
                </Badge>
                <Badge className={impactoColor(item.impacto)} variant="outline">
                  {item.impacto}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => executar(item)} 
                  disabled={executando === item.id || completos.includes(item.id)}
                  size="sm"
                  className="flex-1"
                  variant={completos.includes(item.id) ? "outline" : "default"}
                >
                  {completos.includes(item.id) ? (
                    <>✓ Concluído</>
                  ) : executando === item.id ? (
                    <><Loader className="w-3 h-3 mr-1 animate-spin" /> Exec...</>
                  ) : (
                    <><Play className="w-3 h-3 mr-1" /> Executar</>
                  )}
                </Button>
                {completos.includes(item.id) && (
                  <Button 
                    onClick={() => setMostrando(mostrando === item.id ? null : item.id)}
                    size="sm"
                    variant="outline"
                  >
                    {mostrando === item.id ? 'Ocultar' : 'Ver'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {inicializado && completos.length === 0 && (
        <div className="text-center py-4 text-slate-600 text-sm">
          Clique em "Executar" em qualquer componente para ativar a funcionalidade.
        </div>
      )}

      {percentualCiclo === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Ciclo 21 Completo! 🎉</p>
            <p className="text-sm text-green-800 mt-1">Todas as melhorias foram integradas e ativadas. Próximo: Ciclo 22 (Q3 2026).</p>
          </div>
        </div>
      )}

      {mostrando && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-slate-900">
              {ciclo21Items.find(i => i.id === mostrando)?.nome}
            </p>
            <button onClick={() => setMostrando(null)} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>
          <Suspense fallback={<div className="flex items-center gap-2 text-slate-500"><Loader className="w-4 h-4 animate-spin" /> Carregando...</div>}>
            {(() => {
              const item = ciclo21Items.find(i => i.id === mostrando);
              if (!item) return null;
              const Component = componentMap[item.componente];
              return Component ? <Component /> : <p className="text-slate-500">Componente não encontrado</p>;
            })()}
          </Suspense>
        </div>
      )}
    </div>
  );
}