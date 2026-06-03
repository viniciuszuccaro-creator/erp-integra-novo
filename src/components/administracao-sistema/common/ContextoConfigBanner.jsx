/**
 * ContextoConfigBanner v3.0
 * - Testa ambos contextos (Grupo + Empresa) num único fluxo
 * - Exibe resultado detalhado por contexto
 * - Botão "Inicializar Configs" com contagem real
 */
import React, { useState } from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { base44 } from "@/api/base44Client";
import { Building2, Layers, Settings, RefreshCw, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ContextoConfigBanner() {
  const { empresaAtual, grupoAtual, estaNoGrupo, empresasDoGrupo } = useContextoVisual();
  const { user } = useUser();
  const [iniciando, setIniciando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [testando, setTestando] = useState(false);
  const [testeResults, setTesteResults] = useState(null); // { grupo, empresa }

  const isAdmin = user?.role === 'admin';

  // Testa persistência em AMBOS contextos sequencialmente
  const handleTesteContexto = async () => {
    setTestando(true);
    setTesteResults(null);
    const resultados = { grupo: null, empresa: null };

    // Teste 1: Grupo
    if (grupoAtual?.id) {
      try {
        await base44.functions.invoke('upsertConfig', {
          chave: '__teste_contexto_grupo__',
          data: { chave: '__teste_contexto_grupo__', ativa: true, categoria: 'teste' },
          scope: { group_id: grupoAtual.id, empresa_id: null },
        });
        // Relê para confirmar
        const verify = await base44.functions.invoke('getEntityRecord', {
          entityName: 'ConfiguracaoSistema',
          filter: { chave: '__teste_contexto_grupo__', group_id: grupoAtual.id },
          limit: 1,
        });
        const found = Array.isArray(verify?.data) ? verify.data[0] : null;
        resultados.grupo = { ok: !!found && found.ativa === true, msg: found ? 'Salvo e lido ✓' : 'Salvo mas não encontrado na leitura' };
      } catch (err) {
        resultados.grupo = { ok: false, msg: err?.message?.slice(0, 60) || 'Erro' };
      }
    } else {
      resultados.grupo = { ok: null, msg: 'Sem grupo selecionado' };
    }

    // Teste 2: Empresa
    if (empresaAtual?.id) {
      try {
        await base44.functions.invoke('upsertConfig', {
          chave: '__teste_contexto_empresa__',
          data: { chave: '__teste_contexto_empresa__', ativa: true, categoria: 'teste' },
          scope: { group_id: grupoAtual?.id || null, empresa_id: empresaAtual.id },
        });
        const verify = await base44.functions.invoke('getEntityRecord', {
          entityName: 'ConfiguracaoSistema',
          filter: { chave: '__teste_contexto_empresa__', empresa_id: empresaAtual.id },
          limit: 1,
        });
        const found = Array.isArray(verify?.data) ? verify.data[0] : null;
        resultados.empresa = { ok: !!found && found.ativa === true, msg: found ? 'Salvo e lido ✓' : 'Salvo mas não relido' };
      } catch (err) {
        resultados.empresa = { ok: false, msg: err?.message?.slice(0, 60) || 'Erro' };
      }
    } else {
      resultados.empresa = { ok: null, msg: 'Sem empresa selecionada' };
    }

    setTesteResults(resultados);
    const allOk = Object.values(resultados).every(r => r.ok === true || r.ok === null);
    if (allOk) toast.success('Teste dual de contexto OK — Grupo e Empresa persistindo corretamente!');
    else toast.error('Falha em algum contexto — verifique os resultados abaixo.');
    setTestando(false);
  };

  const handleInitConfigs = async () => {
    setIniciando(true);
    setResultado(null);
    try {
      const res = await base44.functions.invoke('initDefaultConfigs', {});
      const data = res?.data;
      setResultado({ ok: true, created: data?.created || 0, skipped: data?.skipped || 0 });
      toast.success(data?.created > 0 ? `${data.created} config(s) criada(s)!` : 'Configs já existem.');
    } catch (err) {
      setResultado({ ok: false });
      toast.error('Erro ao inicializar: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIniciando(false);
    }
  };

  const ResultIcon = ({ ok }) => {
    if (ok === true) return <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />;
    if (ok === false) return <XCircle className="w-3 h-3 text-red-600 shrink-0" />;
    return <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />;
  };

  return (
    <div className="w-full space-y-2">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3">
        {/* Contexto atual */}
        <div className="flex items-center gap-3 flex-wrap">
          {grupoAtual ? (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-900">{grupoAtual.nome_do_grupo}</span>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                {empresasDoGrupo.length} empresa(s)
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Nenhum grupo selecionado</span>
            </div>
          )}
          {empresaAtual && !estaNoGrupo && (
            <>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {empresaAtual.nome_fantasia || empresaAtual.razao_social}
                </span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">{empresaAtual.status || 'Ativa'}</Badge>
              </div>
            </>
          )}
          {estaNoGrupo && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">Modo Grupo</Badge>
          )}
        </div>

        {/* Ações admin */}
        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            {resultado && (
              <span className={`text-xs flex items-center gap-1 ${resultado.ok ? 'text-green-700' : 'text-red-600'}`}>
                {resultado.ok
                  ? <><CheckCircle2 className="w-3 h-3" />{resultado.created} criada(s)</>
                  : <><AlertCircle className="w-3 h-3" />Erro</>
                }
              </span>
            )}
            <Button
              variant="outline" size="sm"
              onClick={handleTesteContexto}
              disabled={testando || iniciando}
              className="gap-1.5 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              title="Testa persistência de toggle em ambos contextos (Grupo E Empresa)"
            >
              {testando
                ? <RefreshCw className="w-3 h-3 animate-spin" />
                : <CheckCircle2 className="w-3 h-3" />
              }
              Testar Dual (Grupo+Empresa)
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={handleInitConfigs}
              disabled={iniciando || testando}
              className="gap-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {iniciando
                ? <RefreshCw className="w-3 h-3 animate-spin" />
                : <Settings className="w-3 h-3" />
              }
              Inicializar Configs
            </Button>
          </div>
        )}
      </div>

      {/* Resultado detalhado do teste dual */}
      {testeResults && (
        <div className="flex flex-wrap gap-2 px-1">
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
            testeResults.grupo?.ok === true ? 'bg-green-50 border-green-200 text-green-800'
            : testeResults.grupo?.ok === false ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <ResultIcon ok={testeResults.grupo?.ok} />
            <span className="font-medium">Grupo:</span>
            <span>{testeResults.grupo?.msg}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
            testeResults.empresa?.ok === true ? 'bg-green-50 border-green-200 text-green-800'
            : testeResults.empresa?.ok === false ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <ResultIcon ok={testeResults.empresa?.ok} />
            <span className="font-medium">Empresa:</span>
            <span>{testeResults.empresa?.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}