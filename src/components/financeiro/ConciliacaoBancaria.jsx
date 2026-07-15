import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import ConciliacaoAutomaticaIA from "./ConciliacaoAutomaticaIA";
import HeaderConciliacaoCompacto from "./conciliacao/HeaderConciliacaoCompacto";
import KPIsConciliacao from "./conciliacao/KPIsConciliacao";
import ConciliacaoTabPendentes from "./conciliacao/ConciliacaoTabPendentes";
import ConciliacaoTabConciliados from "./conciliacao/ConciliacaoTabConciliados";
import ConciliacaoTabDivergencias from "./conciliacao/ConciliacaoTabDivergencias";
import ConciliacaoManualModal from "./conciliacao/ConciliacaoManualModal";
import useConciliacaoForm from "./conciliacao/useConciliacaoForm";

const NULL_VALUE = "__null__";

/**
 * REFACTORED (Regra-Mãe): 402 → ~90 linhas
 * Lógica em useConciliacaoForm, tabelas em sub-componentes.
 * Corrigido: multi-tenant (filterInContext), RBAC (data-permission), botões funcionais.
 */
export default function ConciliacaoBancaria({ windowMode = false }) {
  const fileInputRef = useRef(null);
  const {
    empresaSelecionada, setEmpresaSelecionada, tabAtiva, setTabAtiva,
    movimentoParaConciliar, setMovimentoParaConciliar,
    empresas, extratosPendentes, extratosConciliados, extratosComDivergencia,
    conciliar, resolverDivergencia, handleImportarExtrato, importando,
    contextoValido, podeEditar, podeImportar
  } = useConciliacaoForm();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleImportarExtrato(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const content = (
    <div className="w-full h-full flex flex-col space-y-1.5 overflow-hidden">
      <HeaderConciliacaoCompacto />
      <KPIsConciliacao
        extratosPendentes={extratosPendentes.length}
        extratosConciliados={extratosConciliados.length}
        divergencias={extratosComDivergencia.length}
      />

      <Card className="border-0 shadow-sm min-h-[80px] max-h-[80px]">
        <CardContent className="p-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs">Empresa</Label>
              <Select
                value={empresaSelecionada || NULL_VALUE}
                onValueChange={(v) => setEmpresaSelecionada(v === NULL_VALUE ? "" : v)}
              >
                <SelectTrigger className="h-8"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NULL_VALUE}>Todas</SelectItem>
                  {empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.nome_fantasia || emp.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">&nbsp;</Label>
              <input ref={fileInputRef} type="file" accept=".csv,.txt,.ofx" onChange={handleFileSelect} className="hidden" />
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                data-sensitive
                onClick={() => fileInputRef.current?.click()}
                disabled={!podeImportar || importando || !contextoValido}
              >
                <Upload className="w-3 h-3 mr-1" />{importando ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-4 w-full bg-white border shadow-sm">
          <TabsTrigger value="pendentes" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Pendentes ({extratosPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="conciliados" className="text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Conciliados ({extratosConciliados.length})
          </TabsTrigger>
          <TabsTrigger value="divergencias" className="text-xs data-[state=active]:bg-orange-600 data-[state=active]:text-white">
            Divergências ({extratosComDivergencia.length})
          </TabsTrigger>
          <TabsTrigger value="ia" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Sparkles className="w-3 h-3 mr-1" />IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-2 flex-1 min-h-0 overflow-hidden">
          <ConciliacaoTabPendentes
            extratosPendentes={extratosPendentes}
            onConciliar={(extrato) => setMovimentoParaConciliar(extrato)}
            podeEditar={podeEditar}
          />
        </TabsContent>

        <TabsContent value="conciliados" className="mt-2 flex-1 min-h-0 overflow-hidden">
          <ConciliacaoTabConciliados extratosConciliados={extratosConciliados} />
        </TabsContent>

        <TabsContent value="divergencias" className="mt-2 flex-1 min-h-0 overflow-hidden">
          <ConciliacaoTabDivergencias
            divergencias={extratosComDivergencia}
            onResolver={(id) => resolverDivergencia.mutate(id)}
            podeEditar={podeEditar}
          />
        </TabsContent>

        <TabsContent value="ia" className="mt-2 flex-1 min-h-0 overflow-auto">
          <ConciliacaoAutomaticaIA empresaId={empresaSelecionada} />
        </TabsContent>
      </Tabs>

      {movimentoParaConciliar && (
        <ConciliacaoManualModal
          movimento={movimentoParaConciliar}
          onConfirm={(lancamentoBanco) => conciliar.mutate({ lancamentoBanco, movimento: movimentoParaConciliar })}
          onClose={() => setMovimentoParaConciliar(null)}
          isPending={conciliar.isPending}
        />
      )}
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-teal-50 overflow-auto p-1.5">{content}</div>;
  }

  return content;
}