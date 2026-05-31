/**
 * AutomacoesAvancadas v1.0
 * Automações cross-module inteligentes
 * Regra-Mãe: w-full, h-full, multi-empresa, inovação, IA
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, GitBranch, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const AUTOMACOES = [
  {
    id: 'pedido_to_estoque',
    nome: 'Pedido → Estoque',
    descricao: 'Quando pedido é criado, reserva automaticamente estoque',
    modulos: ['Comercial', 'Estoque'],
    condicao: 'Pedido.status = "Aprovado"',
    acao: 'Reservar estoque + criar movimentação',
  },
  {
    id: 'estoque_low_to_compra',
    nome: 'Estoque Baixo → Compra',
    descricao: 'Quando estoque fica abaixo do mínimo, cria automaticamente solicitação de compra',
    modulos: ['Estoque', 'Compras'],
    condicao: 'Produto.estoque_atual < estoque_minimo',
    acao: 'Criar SolicitacaoCompra + notificar gerente',
  },
  {
    id: 'nfe_to_financeiro',
    nome: 'NF-e → Financeiro',
    descricao: 'Quando NF-e é autorizada, cria automaticamente Conta a Receber',
    modulos: ['Fiscal', 'Financeiro'],
    condicao: 'NotaFiscal.status = "Autorizada"',
    acao: 'Criar ContaReceber + notificar cobrança',
  },
  {
    id: 'entrega_to_financeiro',
    nome: 'Entrega → Financeiro',
    descricao: 'Quando entrega é concluída, inicia cobrança automaticamente',
    modulos: ['Expedição', 'Financeiro'],
    condicao: 'Entrega.status = "Entregue"',
    acao: 'Emitir boleto + enviar via WhatsApp',
  },
  {
    id: 'pagto_to_caixa',
    nome: 'Pagamento → Caixa',
    descricao: 'Quando pagamento é confirmado, atualiza saldo de caixa',
    modulos: ['Financeiro', 'Caixa'],
    condicao: 'ContaReceber.status = "Pago"',
    acao: 'Atualizar caixa + reconciliar bancário',
  },
];

export default function AutomacoesAvancadas() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [automacoes, setAutomacoes] = useState(AUTOMACOES);
  const [ativas, setAtivas] = useState({});
  const [executando, setExecutando] = useState(null);

  // Carregar status das automações
  useEffect(() => {
    loadAutomacoes();
  }, [empresaAtual?.id]);

  const loadAutomacoes = async () => {
    try {
      const automacoesDb = await base44.entities.AuditLog.filter({
        ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
        tipo_auditoria: 'automacao',
      });

      const statusMap = {};
      automacoesDb.forEach((log) => {
        if (log.dados_novos?.automacao_id) {
          statusMap[log.dados_novos.automacao_id] = log.dados_novos.ativa;
        }
      });

      setAtivas(statusMap);
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    }
  };

  const toggleAutomacao = async (automacaoId) => {
    try {
      const novoStatus = !ativas[automacaoId];

      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me())?.full_name || 'Usuário',
        acao: novoStatus ? 'Ativação' : 'Desativação',
        modulo: 'Automações',
        tipo_auditoria: 'automacao',
        entidade: 'Automacao',
        descricao: `Automação ${automacaoId} ${novoStatus ? 'ativada' : 'desativada'}`,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
        dados_novos: { automacao_id: automacaoId, ativa: novoStatus },
        data_hora: new Date().toISOString(),
      });

      setAtivas((prev) => ({ ...prev, [automacaoId]: novoStatus }));
    } catch (error) {
      console.error('Erro ao toggle automação:', error);
    }
  };

  const testAutomacao = async (automacaoId) => {
    setExecutando(automacaoId);
    try {
      await base44.functions.invoke('iaGenerativeContextual', {
        task: 'test_automation',
        automation_id: automacaoId,
        empresa_id: empresaAtual?.id,
      });

      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me())?.full_name || 'Usuário',
        acao: 'Teste',
        modulo: 'Automações',
        tipo_auditoria: 'automacao',
        entidade: 'AutomacaoTest',
        descricao: `Teste de automação ${automacaoId} executado com sucesso`,
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
        dados_novos: { automacao_id: automacaoId, status: 'success' },
        data_hora: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao testar automação:', error);
    } finally {
      setExecutando(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <GitBranch className="w-8 h-8 text-emerald-600" />
          Automações Cross-Module
        </h2>
        <p className="text-slate-600">Conecta processos entre módulos automaticamente</p>
      </div>

      {/* Automações */}
      <div className="space-y-4">
        {automacoes.map((auto) => (
          <Card key={auto.id} className="w-full p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  {auto.nome}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{auto.descricao}</p>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    ativas[auto.id] ? 'bg-green-600' : 'bg-slate-300'
                  }`}
                ></div>
                <span className="text-sm font-semibold text-slate-700">
                  {ativas[auto.id] ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>

            {/* Modulos conectados */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2">Módulos Conectados:</p>
              <div className="flex flex-wrap gap-2">
                {auto.modulos.map((mod, idx) => (
                  <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-900 rounded text-xs font-medium">
                    {mod}
                  </span>
                ))}
              </div>
            </div>

            {/* Condição e ação */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">Condição:</p>
                <p className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-700">{auto.condicao}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 font-semibold mb-1">Ação:</p>
                <p className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-700">{auto.acao}</p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button
                onClick={() => toggleAutomacao(auto.id)}
                className={`flex-1 text-xs ${
                  ativas[auto.id]
                    ? 'bg-red-100 hover:bg-red-200 text-red-900'
                    : 'bg-green-100 hover:bg-green-200 text-green-900'
                }`}
              >
                {ativas[auto.id] ? 'Desativar' : 'Ativar'}
              </Button>
              <Button
                onClick={() => testAutomacao(auto.id)}
                disabled={executando === auto.id}
                className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {executando === auto.id ? (
                  <>
                    <Zap className="w-3 h-3 mr-1 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Testar
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}