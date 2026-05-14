// IA de análise e recomendações de acesso (inovação, Regra-Mãe)
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Sparkles, AlertTriangle, CheckCircle2, Shield, RefreshCw, TrendingUp, Info } from "lucide-react";
import { toast } from "sonner";

export default function IAAccessAnalyzer({ perfis = [], usuarios = [], empresas = [] }) {
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const analisarRiscos = async () => {
    setAnalisando(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `
          Analise esta configuração de acesso RBAC de um ERP multiempresa:
          
          Perfis cadastrados: ${JSON.stringify(
            perfis.map((p) => ({
              nome: p.nome_perfil,
              nivel: p.nivel_perfil,
              modulos: Object.keys(p.permissoes || {}),
              totalPermissoes: Object.values(p.permissoes || {}).reduce(
                (t, m) => t + Object.values(m || {}).reduce((s, sec) => s + (sec?.length || 0), 0), 0
              ),
            }))
          )}
          
          Distribuição de usuários: ${usuarios.length} total, ${
            usuarios.filter((u) => u.role === "admin").length
          } admins, ${
            usuarios.filter((u) => u.perfil_acesso_id).length
          } com perfil
          
          Retorne um JSON com:
          - riscos: array de objetos {tipo, descricao, severidade: "alta"|"media"|"baixa", recomendacao}
          - pontuacaoSeguranca: número 0-100
          - recomendacoes: array de strings com melhorias
          - principiosMenorPrivilegio: booleano se está sendo seguido
          - resumo: string curta (1-2 frases) sobre o estado geral
        `,
        response_json_schema: {
          type: "object",
          properties: {
            riscos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  descricao: { type: "string" },
                  severidade: { type: "string" },
                  recomendacao: { type: "string" },
                },
              },
            },
            pontuacaoSeguranca: { type: "number" },
            recomendacoes: { type: "array", items: { type: "string" } },
            principiosMenorPrivilegio: { type: "boolean" },
            resumo: { type: "string" },
          },
        },
      });
      setResultado(res);
    } catch (e) {
      toast.error("Erro na análise IA: " + e.message);
    } finally {
      setAnalisando(false);
    }
  };

  const corSeveridade = (s) =>
    s === "alta"
      ? "bg-red-100 text-red-700 border-red-200"
      : s === "media"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-green-100 text-green-700 border-green-200";

  const corPontuacao = (p) =>
    p >= 80
      ? "text-emerald-600"
      : p >= 60
      ? "text-amber-600"
      : "text-red-600";

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white w-full">
      <CardHeader className="border-b border-purple-100 pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-900">
          <Sparkles className="w-4 h-4 text-purple-600" />
          IA — Análise de Riscos de Acesso
          <Badge className="bg-purple-100 text-purple-700 text-xs ml-auto">
            Experimental
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {!resultado && (
          <div className="text-center py-4">
            <Shield className="w-10 h-10 mx-auto mb-3 text-purple-300" />
            <p className="text-sm text-slate-600 mb-4">
              A IA analisará seus perfis RBAC e identificará riscos de segurança,
              violações do princípio do menor privilégio e recomendações de melhoria.
            </p>
            <Button
              onClick={analisarRiscos}
              disabled={analisando || perfis.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {analisando ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analisar com IA
                </>
              )}
            </Button>
          </div>
        )}

        {resultado && (
          <div className="space-y-4">
            {/* Pontuação de Segurança */}
            <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
              <div className="text-center">
                <p
                  className={`text-3xl font-bold ${corPontuacao(
                    resultado.pontuacaoSeguranca
                  )}`}
                >
                  {resultado.pontuacaoSeguranca}
                </p>
                <p className="text-xs text-slate-500">/ 100</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-800">
                  Pontuação de Segurança
                </p>
                <p className="text-xs text-slate-600 mt-1">{resultado.resumo}</p>
                <div className="flex gap-2 mt-2">
                  <Badge
                    className={
                      resultado.principiosMenorPrivilegio
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {resultado.principiosMenorPrivilegio ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Menor Privilégio OK
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Menor Privilégio Violado
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Riscos */}
            {resultado.riscos?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Riscos Detectados ({resultado.riscos.length})
                </p>
                <div className="space-y-2">
                  {resultado.riscos.map((risco, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border text-xs ${corSeveridade(
                        risco.severidade
                      )}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs border-current">
                          {risco.severidade}
                        </Badge>
                        <span className="font-semibold">{risco.tipo}</span>
                      </div>
                      <p className="mb-1">{risco.descricao}</p>
                      <p className="opacity-80">
                        <span className="font-semibold">Recomendação:</span>{" "}
                        {risco.recomendacao}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendações gerais */}
            {resultado.recomendacoes?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  Recomendações de Melhoria
                </p>
                <ul className="space-y-1">
                  {resultado.recomendacoes.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Re-analisar */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setResultado(null); analisarRiscos(); }}
              disabled={analisando}
              className="w-full"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Re-analisar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}