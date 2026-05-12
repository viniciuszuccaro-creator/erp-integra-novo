import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const rules = [
  'Nunca apagar: melhorar, integrar e preservar funcionalidades existentes.',
  'Multiempresa por padrão: group_id e empresa_id em todas as entidades e funções.',
  'Controle de acesso granular em módulos, abas, ações e campos sensíveis.',
  'Componentes pequenos (≤ 150 linhas), reutilizáveis e fáceis de manter.',
  'Layout w-full/h-full, responsivo, mobile-first e preparado para multitarefa.',
  'IA conectada ao operacional: anomalias, preço, churn, rotas e diagnóstico.',
  'Auditoria de todas as ações sensíveis no AuditLog central.',
  'LGPD: PII encriptado, consentimento registrado e direito de exclusão.',
  'Performance: paginação, cache seletivo, prefetch e contagens otimizadas.',
  'Ciclos contínuos: medir → identificar gap → executar → validar → repetir.',
  'Inovação: IA futurista, dashboards preditivos e automações inteligentes.',
  'Governança de configurações: herança grupo → empresa → usuário.'
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
            <div key={rule} className="rounded-xl border border-blue-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <p>{rule}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}