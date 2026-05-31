/**
 * ActiveWorkspace v1.0
 * Workspace ativo com chats e membros
 * Passo 32: Espaço compartilhado em tempo real
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Eye } from 'lucide-react';

const ACTIVE_MEMBERS = [
  { id: 1, nome: 'João Silva', status: 'online', funcao: 'Gerente', empresa: 'Zuccaro SP' },
  { id: 2, nome: 'Maria Santos', status: 'online', funcao: 'Supervisor', empresa: 'Zuccaro SP' },
  { id: 3, nome: 'Carlos Oliveira', status: 'away', funcao: 'Operador', empresa: 'Zuccaro MG' },
  { id: 4, nome: 'Ana Costa', status: 'online', funcao: 'Analista', empresa: 'Zuccaro SP' },
];

const MESSAGES = [
  { autor: 'João Silva', horario: '11:50', mensagem: 'Finalizado: Pedido #5847 — 500 un', tipo: 'evento' },
  { autor: 'Maria Santos', horario: '11:45', mensagem: 'SKU-001 confirmado em estoque. Pronto para entrega.', tipo: 'chat' },
  { autor: 'Carlos Oliveira', horario: '11:40', mensagem: '@Maria: A transferência de MG foi autorizada?', tipo: 'chat' },
  { autor: 'Ana Costa', horario: '11:35', mensagem: '🎯 Meta de produção atingida em 102%!', tipo: 'evento' },
];

export default function ActiveWorkspace({ empresa }) {
  const [newMessage, setNewMessage] = useState('');
  const membrosEmpresa = ACTIVE_MEMBERS.filter((m) => m.empresa === empresa);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-blue-950 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white">Workspace Live</h2>

          {/* Messages */}
          <div className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-white/5 border border-blue-500/30 p-4">
            {MESSAGES.map((msg, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{msg.autor}</p>
                    <Badge
                      className={msg.tipo === 'evento' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}
                    >
                      {msg.tipo}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{msg.horario}</p>
                </div>
                <p className="text-sm text-slate-300">{msg.mensagem}</p>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 bg-white/5 rounded-lg p-3 border border-blue-500/30">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mensagem em tempo real... @mencione alguém"
              className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
            />
            <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <Send className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>

        {/* Members Sidebar */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" />
            Ativos Agora ({membrosEmpresa.length})
          </h3>

          <div className="space-y-2">
            {membrosEmpresa.map((member) => (
              <Card key={member.id} className="p-3 bg-white/5 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2 mb-1">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      member.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{member.nome}</p>
                    <p className="text-xs text-slate-400">{member.funcao}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}