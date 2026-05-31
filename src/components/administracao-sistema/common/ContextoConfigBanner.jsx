/**
 * ContextoConfigBanner v2.0
 * Banner compacto mostrando contexto atual (grupo/empresa) e botão de inicializar configs.
 */
import React, { useState } from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { base44 } from "@/api/base44Client";
import { Building2, Layers, Settings, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ContextoConfigBanner() {
  const { empresaAtual, grupoAtual, estaNoGrupo, empresasDoGrupo } = useContextoVisual();
  const { user } = useUser();
  const [iniciando, setIniciando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const isAdmin = user?.role === 'admin';

  const handleInitConfigs = async () => {
    setIniciando(true);
    setResultado(null);
    try {
      const res = await base44.functions.invoke('initDefaultConfigs', {});
      const data = res?.data;
      setResultado({ ok: true, created: data?.created, skipped: data?.skipped, errors: data?.errors });
      if (data?.created > 0) {
        toast.success(`${data.created} configuração(ões) criada(s) com sucesso!`);
      } else {
        toast.info("Todas as configurações já existem.");
      }
    } catch (err) {
      setResultado({ ok: false });
      toast.error("Erro ao inicializar: " + (err?.message || "Tente novamente."));
    } finally {
      setIniciando(false);
    }
  };

  return (
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
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
                {empresaAtual.status || "Ativa"}
              </Badge>
            </div>
          </>
        )}

        {estaNoGrupo && (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px]">
            Modo Grupo
          </Badge>
        )}
      </div>

      {/* Ações admin */}
      {isAdmin && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {resultado && (
            <span className={`text-xs flex items-center gap-1 ${resultado.ok ? "text-green-700" : "text-red-600"}`}>
              {resultado.ok
                ? <><CheckCircle2 className="w-3 h-3" />{resultado.created} criada(s)</>
                : <><AlertCircle className="w-3 h-3" />Erro</>
              }
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitConfigs}
            disabled={iniciando}
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
  );
}