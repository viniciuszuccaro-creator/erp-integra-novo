import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Clock, Zap } from 'lucide-react';

export default function ComplianceDashboard() {
  const [expanded, setExpanded] = useState(null);

  const frameworks = [
    {
      id: 'LGPD', nome: 'LGPD - Lei Geral de Proteção de Dados', status: 'Em Conformidade',
      score: 94, progresso: 94, vencimento: '15/12/2026', itens_total: 18, itens_ok: 17,
      alertas: [{ msg: 'Consentimento Cookie: revisa necessária em 45 dias', tipo: 'warning' }],
      checklist: [
        { item: 'Política de Privacidade Atualizada', ok: true },
        { item: 'Consentimento de Dados Coletados', ok: true },
        { item: 'DPIA - Avaliação de Impacto', ok: true },
        { item: 'DPO Designado', ok: true },
        { item: 'Registro de Atividades de Processamento', ok: true },
        { item: 'Procedimento de Incidente', ok: false },
      ]
    },
    {
      id: 'ISO27001', nome: 'ISO 27001 - Segurança da Informação', status: 'Em Conformidade',
      score: 88, progresso: 88, vencimento: '22/06/2027', itens_total: 24, itens_ok: 21,
      alertas: [{ msg: 'Auditoria Interna: agendada para 10/06', tipo: 'info' }],
      checklist: [
        { item: 'Política de Segurança', ok: true },
        { item: 'Controle de Acesso', ok: true },
        { item: 'Criptografia de Dados', ok: true },
        { item: 'Backup e Recuperação', ok: false },
        { item: 'Gestão de Incidentes', ok: true },
        { item: 'Conscientização de Segurança', ok: false },
      ]
    },
    {
      id: 'SOX', nome: 'SOX - Lei Sarbanes-Oxley', status: 'Requer Ação',
      score: 71, progresso: 71, vencimento: '30/09/2026', itens_total: 30, itens_ok: 21,
      alertas: [
        { msg: 'Controle Financeiro: 3 achados pendentes', tipo: 'error' },
        { msg: 'Documentação de Processos: entrega atrasada em 5 dias', tipo: 'warning' }
      ],
      checklist: [
        { item: 'Controles de TI - Geral', ok: true },
        { item: 'Segregação de Funções', ok: false },
        { item: 'Trilha de Auditoria', ok: true },
        { item: 'Documentação de Processos', ok: false },
        { item: 'Testes de Controle', ok: false },
        { item: 'Relatório de Avaliação', ok: true },
      ]
    },
  ];

  const statusColor = (status) => {
    if (status === 'Em Conformidade') return 'bg-emerald-900 text-emerald-200';
    return 'bg-red-900 text-red-200';
  };

  const alertColor = (tipo) => {
    if (tipo === 'error') return 'border-red-600 bg-red-900/20 text-red-200';
    if (tipo === 'warning') return 'border-yellow-600 bg-yellow-900/20 text-yellow-200';
    return 'border-blue-600 bg-blue-900/20 text-blue-200';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      {/* Score Geral */}
      <div className="grid grid-cols-3 gap-3">
        {frameworks.map((f) => (
          <Card key={f.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-white text-sm">{f.id}</span>
                <Badge className={statusColor(f.status)}>{f.status === 'Em Conformidade' ? '✓' : '⚠'}</Badge>
              </div>
              <div className="mb-2">
                <div className="flex justify-between mb-1 text-xs">
                  <span className="text-slate-400">Conformidade</span>
                  <span className="font-bold text-white">{f.score}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${f.score}%` }} />
                </div>
              </div>
              <p className="text-xs text-slate-500">{f.itens_ok}/{f.itens_total} itens</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalhes */}
      <div className="space-y-3">
        {frameworks.map((f) => (
          <Card key={f.id} className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2 cursor-pointer hover:bg-slate-700/50" onClick={() => setExpanded(expanded === f.id ? null : f.id)}>
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm text-white">{f.nome}</CardTitle>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{f.score}%</p>
                  <p className="text-xs text-slate-500">Vence: {f.vencimento}</p>
                </div>
              </div>
            </CardHeader>

            {expanded === f.id && (
              <CardContent className="space-y-3">
                {/* Alertas */}
                {f.alertas.length > 0 && (
                  <div className="space-y-2">
                    {f.alertas.map((alerta, idx) => (
                      <div key={idx} className={`p-2 rounded-lg border text-xs ${alertColor(alerta.tipo)}`}>
                        {alerta.tipo === 'error' ? <AlertTriangle className="w-3 h-3 inline mr-1" /> : <Clock className="w-3 h-3 inline mr-1" />}
                        {alerta.msg}
                      </div>
                    ))}
                  </div>
                )}

                {/* Checklist */}
                <div>
                  <p className="text-xs font-bold text-white mb-2">Checklist de Itens</p>
                  <div className="space-y-1">
                    {f.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-slate-700/50 rounded">
                        {item.ok ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span className={item.ok ? 'text-slate-300' : 'text-red-300'}>{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}