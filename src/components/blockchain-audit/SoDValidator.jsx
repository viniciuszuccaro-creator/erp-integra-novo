import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, User, Shield } from 'lucide-react';

export default function SoDValidator() {
  const sodConflitos = [
    {
      id: 'SOD001', usuario: 'Carlos Mendes', cargo: 'Gerente Financeiro',
      conflito: 'Pode Aprovar Pagamento + Conciliar Banco', risco: 'Crítico',
      recomendacao: 'Remover permissão de "Conciliar Banco"', status: 'Pendente'
    },
    {
      id: 'SOD002', usuario: 'Ana Costa', cargo: 'Analista Comercial',
      conflito: 'Pode Criar Pedido + Aprovar Desconto > 15%', risco: 'Alto',
      recomendacao: 'Elevado acúmulo. Restringir desconto para < 10%', status: 'Pendente'
    },
    {
      id: 'SOD003', usuario: 'João Silva', cargo: 'Admin',
      conflito: 'Pode Deletar Auditoria + Alterar Permissões', risco: 'Crítico',
      recomendacao: 'Implementar 2FA + Auditoria separada para admin', status: 'Em Remediação'
    },
  ];

  const validacoesSod = [
    { area: 'Financeiro', itens_validados: 45, conflitos_encontrados: 1, status: 'OK' },
    { area: 'Comercial', itens_validados: 38, conflitos_encontrados: 1, status: 'OK' },
    { area: 'RH', itens_validados: 23, conflitos_encontrados: 0, status: 'OK' },
    { area: 'TI/Admin', itens_validados: 15, conflitos_encontrados: 1, status: 'CRÍTICO' },
  ];

  const riscoColor = (risco) => {
    if (risco === 'Crítico') return 'bg-red-900 text-red-200';
    if (risco === 'Alto') return 'bg-orange-900 text-orange-200';
    return 'bg-yellow-900 text-yellow-200';
  };

  const statusColor = (status) => {
    if (status === 'OK') return 'text-emerald-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      {/* Resumo por Área */}
      <div className="grid grid-cols-2 gap-3">
        {validacoesSod.map((v) => (
          <Card key={v.area} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <p className="font-bold text-white text-sm">{v.area}</p>
                <span className={`text-sm font-bold ${statusColor(v.status)}`}>
                  {v.status === 'OK' ? '✓' : '✕'}
                </span>
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p>Itens: {v.itens_validados}</p>
                <p className={v.conflitos_encontrados > 0 ? 'text-red-400 font-semibold' : 'text-emerald-400'}>
                  Conflitos: {v.conflitos_encontrados}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conflitos Detectados */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white px-2">Conflitos Detectados — {sodConflitos.length} itens</h3>
        
        {sodConflitos.map((sod) => (
          <Card key={sod.id} className={`bg-slate-800 border-2 ${sod.risco === 'Crítico' ? 'border-red-600' : 'border-orange-600'}`}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="pt-1 shrink-0">
                  <AlertTriangle className={`w-5 h-5 ${sod.risco === 'Crítico' ? 'text-red-400' : 'text-orange-400'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-white text-sm">{sod.usuario}</p>
                    <Badge className={riscoColor(sod.risco)}>{sod.risco}</Badge>
                    <Badge className="bg-slate-700 text-slate-300">{sod.cargo}</Badge>
                  </div>

                  <p className="text-sm text-slate-300 mb-2">
                    <Shield className="w-3 h-3 inline mr-1" />
                    {sod.conflito}
                  </p>

                  <div className="bg-slate-700/50 p-2 rounded text-xs text-slate-400 mb-2">
                    <p className="font-semibold text-blue-300 mb-1">Recomendação:</p>
                    <p>{sod.recomendacao}</p>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Status: {sod.status}</span>
                    <button className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs">
                      Revisar
                    </button>
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