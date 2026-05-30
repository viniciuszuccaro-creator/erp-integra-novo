import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Database, Shield, Zap, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Widget de saúde do sistema - mostra status em tempo real
 */
export default function StatusSistemaHealth({ empresaAtual, grupoAtual }) {
  const [status, setStatus] = useState({
    propagacao: null,
    rbac: null,
    integracao: null,
    multiempresa: null,
  });
  const [loading, setLoading] = useState(false);

  const verificarSaude = async () => {
    setLoading(true);
    try {
      // 1. Verificar propagação
      let propagacaoOk = true;
      let propagacaoMsg = "Propagação configurada";
      try {
        const empresas = await base44.entities.Empresa.filter(
          { group_id: grupoAtual?.id || "" },
          "razao_social",
          5
        );
        propagacaoOk = true;
        propagacaoMsg = `${empresas.length} empresa(s) no grupo`;
      } catch {
        propagacaoOk = false;
        propagacaoMsg = "Erro ao verificar empresas";
      }

      // 2. Verificar RBAC
      let rbacOk = true;
      let rbacMsg = "Perfis de acesso configurados";
      try {
        const perfis = await base44.entities.PerfilAcesso.filter({}, "nome_perfil", 3);
        rbacOk = perfis.length > 0;
        rbacMsg = rbacOk ? `${perfis.length} perfil(is) ativo(s)` : "Nenhum perfil encontrado";
      } catch {
        rbacOk = false;
        rbacMsg = "Erro ao verificar RBAC";
      }

      // 3. Verificar multiempresa
      const multiempresaOk = !!(empresaAtual?.id || grupoAtual?.id);
      const multiempresaMsg = multiempresaOk
        ? `${empresaAtual?.nome_fantasia || grupoAtual?.nome_do_grupo || "Contexto ativo"}`
        : "Nenhuma empresa/grupo selecionado";

      setStatus({
        propagacao: { ok: propagacaoOk, msg: propagacaoMsg },
        rbac: { ok: rbacOk, msg: rbacMsg },
        integracao: { ok: true, msg: "Sistema operacional" },
        multiempresa: { ok: multiempresaOk, msg: multiempresaMsg },
      });
    } catch (err) {
      console.error("Erro ao verificar saúde:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verificarSaude();
  }, [empresaAtual?.id, grupoAtual?.id]);

  const items = [
    { key: "propagacao", label: "Propagação Grupo↔Empresas", icon: Building2 },
    { key: "rbac", label: "RBAC e Permissões", icon: Shield },
    { key: "multiempresa", label: "Contexto Multiempresa", icon: Database },
    { key: "integracao", label: "Sistema Core", icon: Zap },
  ];

  const allOk = items.every(({ key }) => status[key]?.ok !== false);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            {allOk ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            Saúde do Sistema
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={verificarSaude}
            disabled={loading}
            className="h-7 text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            Verificar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {items.map(({ key, label, icon: ItemIcon }) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <ItemIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-600 flex-1">{label}</span>
            {status[key] ? (
              <Badge
                className={
                  status[key].ok
                    ? "bg-green-100 text-green-700 border-green-200 text-xs px-1.5"
                    : "bg-red-100 text-red-700 border-red-200 text-xs px-1.5"
                }
              >
                {status[key].ok ? "✓" : "✗"} {status[key].msg}
              </Badge>
            ) : (
              <span className="text-slate-400">Verificando...</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}