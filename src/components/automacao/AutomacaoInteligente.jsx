/**
 * AutomacaoInteligente v1.0
 * RPA + Workflow Automation baseado em regras e padrões
 * Regra-Mãe: w-full, multitarefa, IA-driven
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Zap, Play, PauseCircle, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AUTOMACOES_DISPONIVEIS = [
  {
    id: 'reposicao-estoque',
    nome: 'Reposição Automática de Estoque',
    descricao: 'Cria OC quando estoque atinge mínimo',
    trigger: 'estoque < mínimo',
    status: 'ativo',
    ultima_exec: '2min atrás',
    proxima_exec: '5min',
  },
  {
    id: 'cobranca-automatica',
    nome: 'Cobrança Automática',
    descricao: 'Envia boleto automaticamente quando vence',
    trigger: '24h antes de vencer',
    status: 'ativo',
    ultima_exec: '1h atrás',
    proxima_exec: '23h',
  },
  {
    id: 'reconciliacao-bancaria',
    nome: 'Reconciliação Bancária',
    descricao: 'Reconcilia transações automaticamente',
    trigger: 'diário às 23:00',
    status: 'ativo',
    ultima_exec: 'ontem',
    proxima_exec: '22h',
  },
  {
    id: 'nfe-automatica',
    nome: 'Emissão NF-e Automática',
    descricao: 'Emite NF-e quando pedido é confirmado',
    trigger: 'pedido.status = confirmado',
    status: 'ativo',
    ultima_exec: '30min atrás',
    proxima_exec: 'sob demanda',
  },
];

export default function AutomacaoInteligente() {
  const [automacoes, setAutomacoes] = useState(AUTOMACOES_DISPONIVEIS);
  const [selectedAutomacao, setSelectedAutomacao] = useState(null);

  const toggleAutomacao = async (id) => {
    setAutomacoes(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: a.status === 'ativo' ? 'pausado' : 'ativo' } : a
      )
    );
    // Chamar função backend para atualizar automação
    await base44.functions.invoke('updateAutomacaoStatus', { automacao_id: id });
  };

  const executarAgora = async (automacao) => {
    const result = await base44.functions.invoke('executarAutomacao', {
      automacao_id: automacao.id,
    });
    console.log('Automação executada:', result);
    // Atualizar UI com resultado
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-gradient-to-br from-slate-50 to-orange-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-600" />
          Automações Inteligentes (RPA)
        </h2>
        <div className="text-sm text-slate-600">
          {automacoes.filter(a => a.status === 'ativo').length}/{automacoes.length} ativas
        </div>
      </div>

      {/* Lista de Automações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {automacoes.map((automacao) => (
          <Card
            key={automacao.id}
            className={`p-4 border-l-4 cursor-pointer transition-all ${
              automacao.status === 'ativo'
                ? 'border-orange-500 bg-orange-50'
                : 'border-slate-300 bg-slate-50'
            }`}
            onClick={() => setSelectedAutomacao(automacao)}
          >
            {/* Header da Automação */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{automacao.nome}</h3>
                <p className="text-xs text-slate-600 mt-1">{automacao.descricao}</p>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded ${
                automacao.status === 'ativo'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {automacao.status === 'ativo' ? '✓ Ativa' : '⏸ Pausada'}
              </div>
            </div>

            {/* Trigger */}
            <div className="mb-3 p-2 bg-white rounded border border-slate-200">
              <p className="text-xs font-mono text-slate-700">Trigger: {automacao.trigger}</p>
            </div>

            {/* Status de Execução */}
            <div className="text-xs text-slate-600 mb-3 space-y-1">
              <p>⏱️ Última execução: {automacao.ultima_exec}</p>
              <p>⏰ Próxima execução: {automacao.proxima_exec}</p>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAutomacao(automacao.id);
                }}
                className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-all ${
                  automacao.status === 'ativo'
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-slate-600 text-white hover:bg-slate-700'
                }`}
              >
                {automacao.status === 'ativo' ? (
                  <>
                    <PauseCircle className="w-4 h-4 inline mr-1" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 inline mr-1" />
                    Ativar
                  </>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  executarAgora(automacao);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700"
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Executar
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Painel de Detalhes */}
      {selectedAutomacao && (
        <Card className="w-full p-4 bg-white border-l-4 border-purple-500">
          <h3 className="font-bold text-lg mb-3">Detalhes: {selectedAutomacao.nome}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Status</p>
              <p className="font-bold text-slate-900">{selectedAutomacao.status}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Trigger</p>
              <p className="font-mono text-xs text-slate-900">{selectedAutomacao.trigger}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Última Exec</p>
              <p className="font-bold text-slate-900">{selectedAutomacao.ultima_exec}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Próxima Exec</p>
              <p className="font-bold text-slate-900">{selectedAutomacao.proxima_exec}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}