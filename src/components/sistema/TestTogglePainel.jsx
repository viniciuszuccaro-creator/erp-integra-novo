/**
 * TestTogglePainel v1.0
 * Teste de toggles em contextos Grupo + Empresa + refresh
 * Regra-Mãe: validar persistência e propagação
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useSyncToggleConfig from '@/components/lib/useSyncToggleConfig';
import { base44 } from '@/api/base44Client';
import ProtectedSection from '@/components/security/ProtectedSection';
import { CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export default function TestTogglePainel() {
  const { contexto, grupoAtual, empresaAtual } = useContextoVisual();
  const { getToggle, setToggle, loading } = useSyncToggleConfig();
  
  const [testValues, setTestValues] = useState({
    teste_basico: false,
    teste_propagacao: false,
    teste_persistencia: false,
  });
  
  const [resultados, setResultados] = useState({});
  const [sessaoId] = useState(() => `session_${Date.now()}`);

  // Carregar valores iniciais
  useEffect(() => {
    const loadToggleValues = async () => {
      try {
        const valores = {
          teste_basico: await getToggle('teste_basico'),
          teste_propagacao: await getToggle('teste_propagacao'),
          teste_persistencia: await getToggle('teste_persistencia'),
        };
        setTestValues(valores);
      } catch (err) {
        console.error('Erro ao carregar toggles:', err);
      }
    };
    loadToggleValues();
  }, [getToggle]);

  // Testar toggle + registrar na auditoria
  const handleToggleChange = async (key, value) => {
    try {
      setTestValues(prev => ({ ...prev, [key]: value }));
      await setToggle(key, value);
      
      // Registrar teste na auditoria
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me()).full_name,
        acao: 'Teste',
        modulo: 'Sistema',
        tipo_auditoria: 'teste',
        entidade: 'ToggleConfig',
        descricao: `Teste toggle: ${key} = ${value}`,
        dados_novos: { 
          contexto,
          grupo_id: grupoAtual?.id,
          empresa_id: empresaAtual?.id,
          toggle_key: key,
          valor: value,
          sessao_id: sessaoId,
        },
        data_hora: new Date().toISOString(),
      });

      setResultados(prev => ({
        ...prev,
        [key]: { status: 'sucesso', timestamp: new Date().toLocaleTimeString() }
      }));
    } catch (err) {
      console.error(`Erro ao testar ${key}:`, err);
      setResultados(prev => ({
        ...prev,
        [key]: { status: 'erro', mensagem: err.message }
      }));
    }
  };

  // Testar persistência após refresh (simular)
  const handleTestRefresh = async () => {
    try {
      // Salvar estado atual em sessionStorage
      sessionStorage.setItem('test_estado_pre_refresh', JSON.stringify(testValues));
      
      // Forçar reload
      window.location.reload();
    } catch (err) {
      console.error('Erro ao testar refresh:', err);
    }
  };

  // Verificar se houve refresh anterior
  useEffect(() => {
    const estadoPreRefresh = sessionStorage.getItem('test_estado_pre_refresh');
    if (estadoPreRefresh) {
      const estadoAntigo = JSON.parse(estadoPreRefresh);
      const diferenças = [];
      
      Object.keys(estadoAntigo).forEach(key => {
        if (estadoAntigo[key] !== testValues[key]) {
          diferenças.push(key);
        }
      });

      if (diferenças.length === 0) {
        setResultados(prev => ({
          ...prev,
          persistencia: { status: 'sucesso', mensagem: 'Todos toggles persistiram após refresh!' }
        }));
      } else {
        setResultados(prev => ({
          ...prev,
          persistencia: { status: 'aviso', mensagem: `Diferenças: ${diferenças.join(', ')}` }
        }));
      }
      
      sessionStorage.removeItem('test_estado_pre_refresh');
    }
  }, [testValues]);

  const contextLabel = contexto === 'grupo' ? `Grupo: ${grupoAtual?.nome_do_grupo}` : `Empresa: ${empresaAtual?.nome_fantasia}`;

  return (
    <div className="w-full h-full space-y-4 overflow-auto p-4">
      {/* Contexto Atual */}
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 ml-2">
          Testando em contexto: <strong>{contextLabel}</strong>
        </AlertDescription>
      </Alert>

      {/* Toggles de Teste */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Toggles de Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Teste Básico */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-slate-900">Teste Básico</p>
              <p className="text-xs text-slate-500">Toggle simples on/off</p>
            </div>
            <Switch
              checked={testValues.teste_basico}
              onCheckedChange={(v) => handleToggleChange('teste_basico', v)}
              disabled={loading}
            />
            {resultados.teste_basico && (
              <Badge className={resultados.teste_basico.status === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {resultados.teste_basico.status}
              </Badge>
            )}
          </div>

          {/* Teste Propagação */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-slate-900">Teste Propagação</p>
              <p className="text-xs text-slate-500">Deve sincronizar entre contextos</p>
            </div>
            <Switch
              checked={testValues.teste_propagacao}
              onCheckedChange={(v) => handleToggleChange('teste_propagacao', v)}
              disabled={loading}
            />
            {resultados.teste_propagacao && (
              <Badge className={resultados.teste_propagacao.status === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {resultados.teste_propagacao.status}
              </Badge>
            )}
          </div>

          {/* Teste Persistência */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
            <div>
              <p className="font-medium text-slate-900">Teste Persistência</p>
              <p className="text-xs text-slate-500">Deve manter valor após refresh</p>
            </div>
            <Switch
              checked={testValues.teste_persistencia}
              onCheckedChange={(v) => handleToggleChange('teste_persistencia', v)}
              disabled={loading}
            />
            {resultados.teste_persistencia && (
              <Badge className={resultados.teste_persistencia.status === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {resultados.teste_persistencia.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teste de Refresh */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Teste de Persistência Pós-Refresh</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-3">
            Clique no botão abaixo para fazer refresh da página. Os toggles devem manter seus valores atuais.
          </p>
          <Button
            onClick={handleTestRefresh}
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Fazer Refresh & Validar
          </Button>
          {resultados.persistencia && (
            <div className="mt-3 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm font-medium text-orange-900">
                {resultados.persistencia.status === 'sucesso' ? '✓' : '⚠'} {resultados.persistencia.mensagem}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Geral */}
      <Card className="bg-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status Geral dos Testes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Contexto: <strong>{contextLabel}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Sessão: <code className="text-xs bg-slate-100 px-2 py-1 rounded">{sessaoId}</code></span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            <span>Status: {loading ? 'Carregando...' : 'Pronto para testar'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como Testar</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-slate-600">
          <ol className="list-decimal list-inside space-y-1">
            <li>Alternar cada toggle (Teste Básico, Propagação, Persistência)</li>
            <li>Verificar se muda verde (sucesso) na auditoria</li>
            <li>Trocar de contexto (Grupo ↔ Empresa) e confirmar sincronização</li>
            <li>Clicar "Fazer Refresh" e validar se valores persistem</li>
            <li>Abrir Console (F12) para ver logs de useSyncToggleConfig</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}