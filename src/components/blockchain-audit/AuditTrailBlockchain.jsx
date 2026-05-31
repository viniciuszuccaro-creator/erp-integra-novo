import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, User, Activity, Zap, FileText, Shield } from 'lucide-react';

export default function AuditTrailBlockchain() {
  const [filter, setFilter] = useState('todos');

  const auditoria = [
    {
      id: 'BLK001', timestamp: '31/05 16:45:32', usuario: 'Ana Costa', acao: 'Criação Pedido',
      entidade: 'Pedido L2024-05-042', detalhes: 'Valor: R$ 85.400 | Cliente: Metalúrgica XYZ',
      hash: 'a3f8d2...e9c1', bloco: 2847, empresa: 'Zuccaro SP', severidade: 'média', modificavel: false
    },
    {
      id: 'BLK002', timestamp: '31/05 16:32:15', usuario: 'Carlos M.', acao: 'Aprovação Desconto',
      entidade: 'Pedido L2024-05-041', detalhes: 'Desconto: 12% | Margem resultante: 13%',
      hash: 'b7e4c1...f3a9', bloco: 2846, empresa: 'Zuccaro SP', severidade: 'alta', modificavel: false
    },
    {
      id: 'BLK003', timestamp: '31/05 16:15:48', usuario: 'Você', acao: 'Aumento de Salário',
      entidade: 'Colaborador - João Silva', detalhes: 'Aumento: 8% | De: R$ 4.500 para R$ 4.860',
      hash: 'c2b9f7...d5e2', bloco: 2845, empresa: 'Zuccaro SP', severidade: 'alta', modificavel: false
    },
    {
      id: 'BLK004', timestamp: '31/05 15:47:23', usuario: 'Sistema', acao: 'Exclusão em Lote',
      entidade: 'MovimentacaoEstoque (10 registros)', detalhes: 'Exclusão autorizada por SoD check: Segregação OK',
      hash: 'd9f3b4...a8c6', bloco: 2844, empresa: 'Zuccaro RJ', severidade: 'crítica', modificavel: false
    },
    {
      id: 'BLK005', timestamp: '31/05 15:20:10', usuario: 'Admin', acao: 'Alteração de Permissão',
      entidade: 'Perfil "Gerente Comercial"', detalhes: 'Adicionado: "Aprovar Desconto > 20%"',
      hash: 'e4a8d1...f7b3', bloco: 2843, empresa: 'Zuccaro Grupo', severidade: 'crítica', modificavel: false
    },
  ];

  const severidadeColor = (sev) => {
    if (sev === 'crítica') return 'bg-red-900 text-red-200 border-red-700';
    if (sev === 'alta') return 'bg-orange-900 text-orange-200 border-orange-700';
    return 'bg-yellow-900 text-yellow-200 border-yellow-700';
  };

  const acaoIcon = (acao) => {
    if (acao.includes('Criação') || acao.includes('Aumento')) return <Zap className="w-4 h-4" />;
    if (acao.includes('Aprovação')) return <Shield className="w-4 h-4" />;
    if (acao.includes('Alteração') || acao.includes('Exclusão')) return <Lock className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const filtrados = auditoria.filter(a => {
    if (filter === 'criticas') return a.severidade === 'crítica';
    if (filter === 'altas') return a.severidade === 'alta';
    return true;
  });

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      {/* Filtros */}
      <div className="flex gap-2 sticky top-0 bg-slate-900 pt-1 pb-2 z-10">
        {['todos', 'criticas', 'altas'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {f === 'todos' ? `Todos (${auditoria.length})` : f === 'criticas' ? `Críticos (${auditoria.filter(a => a.severidade === 'crítica').length})` : `Altos (${auditoria.filter(a => a.severidade === 'alta').length})`}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtrados.map((aud, idx) => (
          <Card key={aud.id} className={`bg-slate-800 border-2 ${severidadeColor(aud.severidade)}`}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Bloco */}
                <div className="pt-1 shrink-0">
                  <div className="p-2 rounded-lg bg-slate-700/50 border border-slate-600">
                    {acaoIcon(aud.acao)}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-white text-sm">{aud.acao}</p>
                    <Badge className={`border ${severidadeColor(aud.severidade)} text-xs`}>
                      {aud.severidade.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-slate-500">Bloco #{aud.bloco}</span>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-1">
                    <User className="w-3 h-3 inline mr-1" /> {aud.usuario} ({aud.empresa})
                  </p>
                  <p className="text-sm text-slate-300 mb-1">{aud.entidade}</p>
                  <p className="text-xs text-slate-500 mb-2">{aud.detalhes}</p>

                  {/* Hash e Timestamp */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 rounded font-mono">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span className="text-slate-400">{aud.hash}</span>
                    </div>
                    <span className="text-slate-500">{aud.timestamp}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}