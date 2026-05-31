import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Users, Clock, MapPin, MessageCircle, Plus } from 'lucide-react';

export default function MeetingsChannels() {
  const [tab, setTab] = useState('reunioes');

  const reunioes = [
    {
      id: 'R001', titulo: 'Semanal Operacional', tipo: 'Video', hora: '09:00 - 10:00', data: '02/06 (seg)',
      participantes: ['Ana Costa', 'Carlos M.', 'João Silva', '+2'], empresa: 'Zuccaro SP',
      status: 'Agendada', url: 'meet.zoom.us/123'
    },
    {
      id: 'R002', titulo: 'Revisão Resultados Maio', tipo: 'Híbrida', hora: '14:00 - 15:30', data: 'Hoje',
      participantes: ['Você', 'Dir. Financeiro', '+5'], empresa: 'Zuccaro Grupo',
      status: 'Em andamento', url: 'meet.zoom.us/456'
    },
    {
      id: 'R003', titulo: 'Alinhamento RH-Operações', tipo: 'Video', hora: '16:00 - 17:00', data: '02/06',
      participantes: ['Você', 'Gerente RH', '+3'], empresa: 'Zuccaro SP',
      status: 'Agendada', url: null
    },
  ];

  const canais = [
    { id: 'C001', nome: 'geral', descricao: 'Comunicações gerais', membros: 87, mensagens_nao_lidas: 0 },
    { id: 'C002', nome: 'comercial-vendas', descricao: 'Comercial & Vendas', membros: 24, mensagens_nao_lidas: 5 },
    { id: 'C003', nome: 'producao-ops', descricao: 'Produção & Operações', membros: 15, mensagens_nao_lidas: 2 },
    { id: 'C004', nome: 'rh-talentos', descricao: 'RH & Desenvolvimento', membros: 12, mensagens_nao_lidas: 0 },
    { id: 'C005', nome: 'financeiro', descricao: 'Financeiro & Contábil (restrito)', membros: 8, mensagens_nao_lidas: 1 },
    { id: 'C006', nome: 'inovacao-tech', descricao: 'Inovação & Tecnologia', membros: 18, mensagens_nao_lidas: 3 },
  ];

  const statusColor = (status) => {
    if (status === 'Em andamento') return 'bg-emerald-900 text-emerald-200';
    return 'bg-blue-900 text-blue-200';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      {/* Abas */}
      <div className="flex gap-2 sticky top-0 bg-slate-900 pt-1 pb-2 z-10">
        {['reunioes', 'canais'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold ${tab === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {t === 'reunioes' ? `Reuniões (${reunioes.length})` : `Canais (${canais.length})`}
          </button>
        ))}
      </div>

      {/* Reuniões */}
      {tab === 'reunioes' && (
        <div className="space-y-3">
          {reunioes.map((r) => (
            <Card key={r.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Video className="w-4 h-4 text-blue-400" />
                      <p className="font-semibold text-white">{r.titulo}</p>
                      <Badge className={statusColor(r.status)}>{r.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400">{r.empresa}</p>
                  </div>
                  {r.status === 'Em andamento' && (
                    <button className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">
                      Entrar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{r.hora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span>{r.data}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-400">
                    {r.participantes.join(', ')}
                  </p>
                </div>

                <button className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 font-semibold">
                  {r.status === 'Em andamento' ? 'Já em andamento' : 'Ver Detalhes'}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Canais */}
      {tab === 'canais' && (
        <div className="space-y-2">
          {canais.map((c) => (
            <Card key={c.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">#{c.nome}</p>
                      {c.mensagens_nao_lidas > 0 && (
                        <Badge className="bg-red-900 text-red-200 text-xs">{c.mensagens_nao_lidas}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{c.descricao}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {c.membros}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Criar novo canal */}
          <Card className="bg-slate-800/50 border-2 border-dashed border-slate-700 hover:border-blue-600 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-400">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-semibold">Criar novo canal</span>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}