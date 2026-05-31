import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight } from 'lucide-react';

export default function AllocationAuditLog() {
  const [logs] = useState([
    {
      id: 1,
      timestamp: '2026-05-31 14:32:15',
      acao: 'Realocação',
      colaborador: 'João Silva',
      de: 'Projeto A (SP)',
      para: 'Projeto B (SP)',
      usuario: 'Sistema IA',
      motivo: 'Otimização automática de custos',
      tipo: 'automático',
    },
    {
      id: 2,
      timestamp: '2026-05-31 12:15:47',
      acao: 'Alocação Inicial',
      colaborador: 'Maria Santos',
      de: 'Disponível',
      para: 'Projeto C (MG)',
      usuario: 'Gerente RH',
      motivo: 'Solicitação operacional',
      tipo: 'manual',
    },
    {
      id: 3,
      timestamp: '2026-05-30 18:45:22',
      acao: 'Requisição Criada',
      colaborador: 'Vaga - Dev Senior',
      de: 'Previsão IA',
      para: 'Requisição #456',
      usuario: 'Sistema IA',
      motivo: 'Previsão de demanda junho',
      tipo: 'automático',
    },
    {
      id: 4,
      timestamp: '2026-05-30 15:20:10',
      acao: 'Liberação',
      colaborador: 'Pedro Costa',
      de: 'Projeto B',
      para: 'Disponível',
      usuario: 'Gerente Projeto',
      motivo: 'Conclusão de fase',
      tipo: 'manual',
    },
    {
      id: 5,
      timestamp: '2026-05-29 09:12:38',
      acao: 'Otimização',
      colaborador: 'Carlos Mendes',
      de: 'Projeto A (MG)',
      para: 'Projeto A (SP)',
      usuario: 'Sistema IA',
      motivo: 'Redução de custo operacional',
      tipo: 'automático',
    },
  ]);

  const tipoConfig = {
    automático: 'bg-blue-500/20 text-blue-400',
    manual: 'bg-amber-500/20 text-amber-400',
  };

  const acaoConfig = {
    'Realocação': 'text-cyan-400',
    'Alocação Inicial': 'text-emerald-400',
    'Requisição Criada': 'text-violet-400',
    'Liberação': 'text-orange-400',
    'Otimização': 'text-blue-400',
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-white/5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Auditoria de Alocações
          </h3>
          <p className="text-xs text-slate-400">{logs.length} eventos registrados</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
        {logs.map((log, idx) => (
          <div key={log.id} className="relative">
            {/* Timeline line */}
            {idx < logs.length - 1 && (
              <div className="absolute left-3 top-8 w-0.5 h-12 bg-gradient-to-b from-white/20 to-transparent" />
            )}

            {/* Log item */}
            <Card className="bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-all relative z-10">
              <div className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className={`text-sm font-semibold ${acaoConfig[log.acao]} leading-tight`}>
                        {log.acao}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        <strong className="text-white">{log.colaborador}</strong>
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge className={`text-xs border-0 ${tipoConfig[log.tipo]}`}>
                        {log.tipo}
                      </Badge>
                    </div>
                  </div>

                  {/* From → To */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="truncate">{log.de}</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-white/30" />
                    <span className="truncate">{log.para}</span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-xs text-slate-500">Por</p>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5">{log.usuario}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Motivo</p>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5 truncate">{log.motivo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Data/Hora</p>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 bg-white/5 border-t border-white/10 text-center text-xs text-slate-400">
        Mostrando últimos {logs.length} eventos • Todos os eventos são auditados e rastreáveis
      </div>
    </div>
  );
}