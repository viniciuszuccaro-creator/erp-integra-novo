/**
 * Checklist de Execução - Administração do Sistema v2.0
 * Simplificado: apenas tarefas críticas + status visual
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import useToggleConfig from '@/components/lib/useToggleConfig';

const CRITICAL_TASKS = [
  {
    id: 'nfe_config',
    title: 'NF-e Configurada',
    description: 'Certificado digital + API Fiscal',
    configKey: 'nfe_config_ok',
    action: 'Configurar',
  },
  {
    id: 'boleto_config',
    title: 'Boletos Ativados',
    description: 'Gateway + API Geração',
    configKey: 'boleto_config_ok',
    action: 'Ativar',
  },
  {
    id: 'usuarios_criados',
    title: 'Usuários Cadastrados',
    description: 'Mínimo 1 gestor + 1 operacional',
    configKey: 'usuarios_criados_ok',
    action: 'Gerenciar',
  },
  {
    id: 'empresas_linked',
    title: 'Empresas Vinculadas',
    description: 'CPA Ferro, 3Z Ltda, etc.',
    configKey: 'empresas_linked_ok',
    action: 'Vincular',
  },
  {
    id: 'rbac_setup',
    title: 'RBAC Configurado',
    description: 'Perfis + permissões por módulo',
    configKey: 'rbac_setup_ok',
    action: 'Configurar',
  },
];

export default function AdminChecklistExec() {
  const { toggleConfig } = useToggleConfig();
  const [expandedTask, setExpandedTask] = useState(null);

  const completedCount = CRITICAL_TASKS.filter(
    (task) => toggleConfig[task.configKey]?.ativa
  ).length;
  const progress = Math.round((completedCount / CRITICAL_TASKS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding - Execução</CardTitle>
          <CardDescription>
            {completedCount} de {CRITICAL_TASKS.length} tarefas críticas concluídas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-slate-500 mt-2">{progress}% completo</p>
        </CardContent>
      </Card>

      {/* Tarefas */}
      <div className="space-y-2">
        {CRITICAL_TASKS.map((task) => {
          const isCompleted = toggleConfig[task.configKey]?.ativa;
          const isExpanded = expandedTask === task.id;

          return (
            <Card
              key={task.id}
              className={`cursor-pointer transition-all ${
                isCompleted ? 'border-green-200 bg-green-50' : 'hover:border-slate-300'
              }`}
              onClick={() => setExpandedTask(isExpanded ? null : task.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-sm text-slate-500">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isCompleted ? 'default' : 'secondary'}>
                      {isCompleted ? 'Concluído' : 'Pendente'}
                    </Badge>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 border-t">
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-slate-600">
                      Status: {isCompleted ? '✅ Concluído' : '⏳ Aguardando Ação'}
                    </p>
                    <button className="text-sm text-blue-600 hover:underline font-medium">
                      {task.action}
                    </button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}