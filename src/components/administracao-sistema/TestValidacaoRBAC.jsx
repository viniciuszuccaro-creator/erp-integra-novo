/**
 * TestValidacaoRBAC v1.0
 * Validar RBAC em cada módulo com ProtectedSection
 * Regra-Mãe: garantir segurança granular
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProtectedSection from '@/components/security/ProtectedSection';
import usePermissions from '@/components/lib/usePermissions';
import { CheckCircle2, AlertCircle, Lock, Unlock } from 'lucide-react';

export default function TestValidacaoRBAC() {
  const { hasPermission } = usePermissions();

  const modulosTestar = [
    { modulo: 'Dashboard', acoes: ['ver', 'visualizar'] },
    { modulo: 'CRM', acoes: ['ver', 'criar', 'editar', 'excluir'] },
    { modulo: 'Comercial', acoes: ['ver', 'criar', 'editar', 'excluir'] },
    { modulo: 'Estoque', acoes: ['ver', 'criar', 'editar', 'excluir'] },
    { modulo: 'Compras', acoes: ['ver', 'criar', 'editar', 'excluir'] },
    { modulo: 'Financeiro', acoes: ['ver', 'criar', 'editar', 'excluir'] },
    { modulo: 'Fiscal', acoes: ['ver', 'criar', 'editar', 'excluir'] },
    { modulo: 'RH', acoes: ['ver', 'criar', 'editar', 'excluir'] },
    { modulo: 'Sistema', acoes: ['ver', 'criar', 'editar', 'excluir'] },
  ];

  return (
    <div className="w-full h-full space-y-4 overflow-auto p-4">
      {/* Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 ml-2">
          Validando RBAC em cada módulo. Ações bloqueadas aparecem em vermelho.
        </AlertDescription>
      </Alert>

      {/* Matriz de Permissões */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Matriz de Permissões RBAC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-2 font-medium text-slate-900">Módulo</th>
                  <th className="text-center p-2 font-medium text-slate-900">Ver</th>
                  <th className="text-center p-2 font-medium text-slate-900">Criar</th>
                  <th className="text-center p-2 font-medium text-slate-900">Editar</th>
                  <th className="text-center p-2 font-medium text-slate-900">Excluir</th>
                </tr>
              </thead>
              <tbody>
                {modulosTestar.map((mod) => (
                  <tr key={mod.modulo} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2 font-medium text-slate-900">{mod.modulo}</td>
                    {['ver', 'criar', 'editar', 'excluir'].map((acao) => {
                      const permitido = hasPermission(mod.modulo, null, acao);
                      return (
                        <td key={acao} className="text-center p-2">
                          {permitido ? (
                            <Badge className="bg-green-100 text-green-800 gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              OK
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Bloqueado
                            </Badge>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Test ProtectedSection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Teste ProtectedSection (CRM)</CardTitle>
        </CardHeader>
        <CardContent>
          <ProtectedSection
            module="CRM"
            action="ver"
            fallback={<p className="p-4 text-sm text-red-600">❌ Acesso Negado ao CRM</p>}
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">✓ Você tem acesso ao módulo CRM</p>
            </div>
          </ProtectedSection>
        </CardContent>
      </Card>

      {/* Test ProtectedSection Financeiro */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Teste ProtectedSection (Financeiro)</CardTitle>
        </CardHeader>
        <CardContent>
          <ProtectedSection
            module="Financeiro"
            action="ver"
            fallback={<p className="p-4 text-sm text-red-600">❌ Acesso Negado ao Financeiro</p>}
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">✓ Você tem acesso ao módulo Financeiro</p>
            </div>
          </ProtectedSection>
        </CardContent>
      </Card>

      {/* Relatório de Blocagem */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ações Bloqueadas</CardTitle>
        </CardHeader>
        <CardContent>
          {modulosTestar.some(mod => ['ver', 'criar', 'editar', 'excluir'].some(a => !hasPermission(mod.modulo, null, a))) ? (
            <div className="space-y-2 text-sm">
              {modulosTestar.map(mod => {
                const bloqueadas = ['ver', 'criar', 'editar', 'excluir'].filter(a => !hasPermission(mod.modulo, null, a));
                if (bloqueadas.length === 0) return null;
                return (
                  <div key={mod.modulo} className="p-2 bg-white rounded border border-orange-200">
                    <p className="font-medium text-orange-900">
                      {mod.modulo}: {bloqueadas.join(', ')}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-green-600">✓ Todas as ações permitidas (Admin?)</p>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como Validar RBAC</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-slate-600">
          <ol className="list-decimal list-inside space-y-1">
            <li>Verificar se a matriz mostra todas permissões corretamente</li>
            <li>Clicar em módulos diferentes e confirmar ProtectedSection</li>
            <li>Testar com diferentes perfis de usuário (Admin, Vendedor, etc)</li>
            <li>Validar que ações bloqueadas não aparecem na UI (botões desabilitados)</li>
            <li>Confirmar que tentativa de acesso negado loga auditoria</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}