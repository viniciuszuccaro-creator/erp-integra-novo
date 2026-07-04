/**
 * AutomationBuilder v1.0
 * Visual builder para criar automações e workflows
 * Regra-Mãe: drag-drop, IA suggestions, multi-empresa
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap, GitBranch, Check } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { toast } from "sonner";

const TRIGGERS = [
  { id: 'pedido_criado', nome: 'Pedido Criado', icon: '📦' },
  { id: 'pagamento_recebido', nome: 'Pagamento Recebido', icon: '💰' },
  { id: 'estoque_baixo', nome: 'Estoque Baixo', icon: '⚠️' },
  { id: 'cliente_novo', nome: 'Cliente Novo', icon: '👤' },
  { id: 'agendamento', nome: 'Agendamento', icon: '📅' },
];

const ACOES = [
  { id: 'enviar_email', nome: 'Enviar E-mail', icon: '📧' },
  { id: 'enviar_whatsapp', nome: 'Enviar WhatsApp', icon: '💬' },
  { id: 'criar_tarefa', nome: 'Criar Tarefa', icon: '✅' },
  { id: 'atualizar_campo', nome: 'Atualizar Campo', icon: '🔄' },
  { id: 'disparar_funcao', nome: 'Disparar Função', icon: '⚡' },
];

export default function AutomationBuilder() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [automacoes, setAutomacoes] = useState([]);
  const [novaAuto, setNovaAuto] = useState({
    nome: '',
    trigger: null,
    acoes: [],
    ativa: false,
  });

  const handleAddAutomacao = () => {
    if (!novaAuto.nome || !novaAuto.trigger || novaAuto.acoes.length === 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    setAutomacoes([...automacoes, { id: Date.now(), ...novaAuto }]);
    setNovaAuto({ nome: '', trigger: null, acoes: [], ativa: false });
  };

  const handleToggleAcao = (acaoId) => {
    if (novaAuto.acoes.includes(acaoId)) {
      setNovaAuto({ ...novaAuto, acoes: novaAuto.acoes.filter((a) => a !== acaoId) });
    } else {
      setNovaAuto({ ...novaAuto, acoes: [...novaAuto.acoes, acaoId] });
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-purple-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Zap className="w-8 h-8 text-purple-600" />
        Construtor de Automações
      </h2>

      {/* Builder */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Criar Nova Automação</h3>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Nome da Automação</label>
            <input
              type="text"
              placeholder="Ex: Notificar cliente quando pedido é criado"
              value={novaAuto.nome}
              onChange={(e) => setNovaAuto({ ...novaAuto, nome: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Quando? (Trigger)</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {TRIGGERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setNovaAuto({ ...novaAuto, trigger: t.id })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    novaAuto.trigger === t.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <p className="text-2xl mb-1">{t.icon}</p>
                  <p className="text-xs font-semibold text-slate-900 text-center">{t.nome}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Então? (Ações)</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {ACOES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleToggleAcao(a.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    novaAuto.acoes.includes(a.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <p className="text-2xl mb-1">{a.icon}</p>
                  <p className="text-xs font-semibold text-slate-900 text-center">{a.nome}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {novaAuto.trigger && (
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <p className="text-sm font-semibold text-slate-900 mb-2">📝 Preview:</p>
              <p className="text-sm text-slate-700">
                <strong>SE:</strong> {TRIGGERS.find((t) => t.id === novaAuto.trigger)?.nome} <br />
                <strong>ENTÃO:</strong>{' '}
                {novaAuto.acoes
                  .map((acaoId) => ACOES.find((a) => a.id === acaoId)?.nome)
                  .filter(Boolean)
                  .join(' + ') || 'Nenhuma ação selecionada'}
              </p>
            </div>
          )}

          <Button onClick={handleAddAutomacao} className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Automação
          </Button>
        </div>
      </Card>

      {/* Automações Criadas */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Automações Ativas ({automacoes.length})</h3>

        {automacoes.length === 0 ? (
          <p className="text-center text-slate-500 py-4">Nenhuma automação criada ainda</p>
        ) : (
          <div className="space-y-3">
            {automacoes.map((auto) => (
              <div key={auto.id} className="p-4 border border-purple-200 bg-purple-50 rounded-lg flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{auto.nome}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                    <span className="px-2 py-1 bg-white rounded">
                      {TRIGGERS.find((t) => t.id === auto.trigger)?.nome}
                    </span>
                    <GitBranch className="w-3 h-3" />
                    {auto.acoes.map((acaoId) => (
                      <span key={acaoId} className="px-2 py-1 bg-white rounded">
                        {ACOES.find((a) => a.id === acaoId)?.nome}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="text-xs bg-purple-600 hover:bg-purple-700 text-white">Ativar</Button>
                  <Button className="text-xs bg-slate-300 hover:bg-slate-400">Deletar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}