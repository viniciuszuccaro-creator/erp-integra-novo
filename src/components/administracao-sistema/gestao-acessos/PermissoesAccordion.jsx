// Accordion de permissões granulares (pequeno arquivo, modular)
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare } from "lucide-react";
import { ESTRUTURA_SISTEMA, ACOES, COR_CLASS } from "./permissionsConfig";

export default function PermissoesAccordion({
  formPermissoes,
  onTogglePermissao,
  onToggleSecao,
  onToggleModulo,
  modulosExpandidos,
  onModulosExpandidosChange,
  disabled = false,
}) {
  const temPermissao = (modulo, secao, acao) =>
    formPermissoes?.[modulo]?.[secao]?.includes(acao) || false;

  const contarPermissoesModulo = (modulo) =>
    Object.values(formPermissoes?.[modulo] || {}).reduce(
      (t, s) => t + (s?.length || 0),
      0
    );

  return (
    <div className="border rounded-lg bg-slate-50 max-h-[50vh] overflow-auto">
      <Accordion
        type="multiple"
        value={modulosExpandidos}
        onValueChange={onModulosExpandidosChange}
      >
        {Object.entries(ESTRUTURA_SISTEMA).map(([modId, mod]) => {
          const qtd = contarPermissoesModulo(modId);
          const IconComponent = mod.icone;

          return (
            <AccordionItem key={modId} value={modId} className="border-b">
              <AccordionTrigger className="px-3 py-2 hover:bg-white/50">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-4 h-4 ${COR_CLASS[mod.cor] || "text-gray-600"}`}
                    title={mod.icone}
                  >
                    ⊙
                  </div>
                  <span className="text-sm font-medium">{mod.nome}</span>
                  {qtd > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">{qtd}</Badge>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-5 px-2 text-xs"
                    disabled={disabled}
                    data-action={`RBAC.Permissoes.modulo.${modId}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleModulo(modId);
                    }}
                  >
                    <CheckSquare className="w-3 h-3 mr-1" />
                    Tudo
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-2">
                  {Object.entries(mod.secoes).map(([secId, sec]) => {
                    const qtdSec = formPermissoes?.[modId]?.[secId]?.length || 0;

                    return (
                      <Card key={secId} className="border bg-white">
                        <CardHeader className="bg-slate-50 border-b py-2 px-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold">{sec.nome}</p>
                              {sec.abas?.length > 0 && (
                                <p className="text-xs text-slate-400">
                                  {sec.abas.join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {qtdSec > 0 && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  {qtdSec}
                                </Badge>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-5 px-2 text-xs"
                                disabled={disabled}
                                data-action={`RBAC.Permissoes.secao.${modId}.${secId}`}
                                onClick={() => onToggleSecao(modId, secId)}
                              >
                                <CheckSquare className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {ACOES.map((acao) => {
                              const marcado = temPermissao(modId, secId, acao.id);

                              return (
                                <label
                                  key={acao.id}
                                  className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded border text-xs transition-all ${
                                    marcado
                                      ? "bg-blue-100 border-blue-300 text-blue-700 font-semibold"
                                      : "bg-white border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  <Checkbox
                                    checked={marcado}
                                    disabled={disabled}
                                    data-action={`RBAC.Permissao.${modId}.${secId}.${acao.id}`}
                                    onCheckedChange={() =>
                                      onTogglePermissao(modId, secId, acao.id)
                                    }
                                  />
                                  <span title={acao.icone}>⊙</span>
                                  {acao.nome}
                                </label>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}