import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const rules = [
  { texto: 'Nunca apagar: melhorar, integrar e preservar funcionalidades existentes.', emoji: '🔒' },
  { texto: 'Multiempresa por padrão: group_id e empresa_id em todas as entidades, funções e consultas.', emoji: '🏢' },
  { texto: 'Controle de acesso granular em módulos, abas, ações e campos sensíveis (RBAC + SoD).', emoji: '🛡️' },
  { texto: 'Componentes pequenos (≤ 150 linhas), reutilizáveis, com hooks e configs dedicados.', emoji: '⚡' },
  { texto: 'Layout w-full/h-full, responsivo, mobile-first e preparado para multitarefa com WindowManager.', emoji: '📱' },
  { texto: 'IA conectada ao operacional: anomalias, preço, churn, rotas, diagnóstico e previsões.', emoji: '🤖' },
  { texto: 'Auditoria de todas as ações sensíveis no AuditLog central com módulo, entidade e escopo.', emoji: '📋' },
  { texto: 'LGPD: PII encriptado via piiEncryptor, consentimento registrado e direito de exclusão.', emoji: '🔐' },
  { texto: 'Performance: paginação, cache IDB offline, prefetch preditivo e deduplicação de inflight.', emoji: '🚀' },
  { texto: 'Ciclos contínuos: medir → identificar gap → executar → validar → repetir.', emoji: '🔄' },
  { texto: 'Inovação futurista: IA gerativa, dashboards preditivos, automações e novos canais.', emoji: '✨' },
  { texto: 'Governança de configurações: herança grupo → empresa → usuário com override granular.', emoji: '⚙️' },
  { texto: 'Integrações seguras: reuso de funções existentes, sem duplicidade, com conector OAuth.', emoji: '🔗' },
  { texto: 'Backup automático criptografado por empresa + deploy audit rastreando versões.', emoji: '💾' },
];

export default function PlanoMelhoriaGovernanca() {
  return (
    <Card className="w-full border-blue-100 bg-blue-50/60">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl text-slate-900">Governança da Regra-Mãe</CardTitle>
          <Badge className="w-fit bg-blue-600 text-white">Padrão obrigatório</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule, index) => (
            <div key={index} className="rounded-xl border border-blue-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</span>
                <span className="text-lg">{rule.emoji}</span>
              </div>
              <p>{rule.texto}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}