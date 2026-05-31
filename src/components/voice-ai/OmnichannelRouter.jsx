import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, MessageCircle, Mail, Phone, BarChart3 } from 'lucide-react';

export default function OmnichannelRouter() {
  const canais = [
    { icon: MessageCircle, nome: 'WhatsApp', ativas: 24, resolvidas: 18, taxa: '75%', cor: 'text-green-400', bg: 'bg-green-900/20' },
    { icon: Mail, nome: 'Email', ativas: 12, resolvidas: 8, taxa: '67%', cor: 'text-blue-400', bg: 'bg-blue-900/20' },
    { icon: MessageSquare, nome: 'Chat Web', ativas: 8, resolvidas: 7, taxa: '88%', cor: 'text-purple-400', bg: 'bg-purple-900/20' },
    { icon: Phone, nome: 'Telefone', ativas: 5, resolvidas: 4, taxa: '80%', cor: 'text-cyan-400', bg: 'bg-cyan-900/20' },
  ];

  const conversasPendentes = [
    { id: 'W001', usuario: 'Cliente A', canal: 'WhatsApp', tempo: '5 min atrás', status: 'Aguardando IA', prioridade: 'Alta' },
    { id: 'E001', usuario: 'Cliente B', canal: 'Email', tempo: '12 min atrás', status: 'Processando', prioridade: 'Normal' },
    { id: 'C001', usuario: 'Cliente C', canal: 'Chat', tempo: '2 min atrás', status: 'Respondido', prioridade: 'Normal' },
    { id: 'W002', usuario: 'Cliente D', canal: 'WhatsApp', tempo: '8 min atrás', status: 'Aguardando Agente', prioridade: 'Alta' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Card de Canais */}
      <div className="grid grid-cols-2 gap-3">
        {canais.map((canal, idx) => {
          const Icon = canal.icon;
          return (
            <Card key={idx} className={`${canal.bg} border-slate-700`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${canal.cor}`} />
                  <p className="font-semibold text-white text-sm">{canal.nome}</p>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Ativas:</span>
                    <span className="font-bold">{canal.ativas}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Resolvidas:</span>
                    <span className="font-bold text-emerald-400">{canal.resolvidas}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-600">
                    <span>Taxa Resolução:</span>
                    <span className={`font-bold ${canal.cor}`}>{canal.taxa}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conversas Pendentes */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Conversas Ativas</h3>
        {conversasPendentes.map(c => (
          <Card key={c.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-white text-sm">{c.usuario}</p>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{c.canal}</span>
                  </div>
                  <p className="text-xs text-slate-500">{c.tempo}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${
                    c.status === 'Respondido' ? 'bg-emerald-900 text-emerald-200' : 'bg-blue-900 text-blue-200'
                  }`}>
                    {c.status}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    c.prioridade === 'Alta' ? 'bg-red-900/30 text-red-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {c.prioridade}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas Gerais */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Resumo Omnichannel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-700/50 p-2 rounded">
              <p className="text-slate-400 text-xs">Total Ativo</p>
              <p className="text-lg font-bold text-cyan-400">49</p>
            </div>
            <div className="bg-slate-700/50 p-2 rounded">
              <p className="text-slate-400 text-xs">Taxa Geral</p>
              <p className="text-lg font-bold text-emerald-400">77.6%</p>
            </div>
            <div className="bg-slate-700/50 p-2 rounded">
              <p className="text-slate-400 text-xs">Tempo Médio</p>
              <p className="text-lg font-bold text-purple-400">3.2m</p>
            </div>
            <div className="bg-slate-700/50 p-2 rounded">
              <p className="text-slate-400 text-xs">Satisfação</p>
              <p className="text-lg font-bold text-orange-400">8.3/10</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}