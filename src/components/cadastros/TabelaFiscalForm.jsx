import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";
import useTabelaFiscalIA from "@/components/cadastros/tabela-fiscal/useTabelaFiscalIA";
import TabelaFiscalSugestaoIA from "@/components/cadastros/tabela-fiscal/TabelaFiscalSugestaoIA";
import TabelaFiscalTabConfig from "@/components/cadastros/tabela-fiscal/TabelaFiscalTabConfig";
import TabelaFiscalTabTributos from "@/components/cadastros/tabela-fiscal/TabelaFiscalTabTributos";
import TabelaFiscalTabValidacao from "@/components/cadastros/tabela-fiscal/TabelaFiscalTabValidacao";

/**
 * FORMULÁRIO DE TABELA FISCAL V21.2 - FASE 2
 * P2: Multi-tenant | P3: RBAC | Refatorado em sub-componentes (Regra-Mãe)
 */
export default function TabelaFiscalForm({ tabela, windowMode = false, onSubmit, onCancel }) {
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contextoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || tabela?.group_id || null;
  const contextoValido = Boolean(empresaAtual?.id || groupId || tabela?.empresa_id || tabela?.group_id);
  const podeCriar = hasPermission?.("Cadastros.TabelaFiscal.criar") || hasPermission?.("Financeiro.TabelaFiscal.criar");
  const podeEditar = hasPermission?.("Cadastros.TabelaFiscal.editar") || hasPermission?.("Financeiro.TabelaFiscal.editar");
  const podeUsarIA = hasPermission?.("Cadastros.TabelaFiscal.ia") || hasPermission?.("Financeiro.TabelaFiscal.ia") || podeEditar || podeCriar;
  const podeSalvar = tabela?.id ? podeEditar : podeCriar;

  const [formData, setFormData] = useState({
    nome_regra: "", empresa_id: "", regime_tributario: "Simples Nacional",
    cenario_operacao: "Venda Consumidor Final", ncm: "", cfop: "",
    destino_operacao: "Dentro do Estado", tipo_cliente: "Pessoa Física",
    icms_cst_csosn: "", icms_aliquota: 0, icms_reducao_base: 0, icms_st_aliquota: 0, icms_st_mva: 0,
    pis_cst: "", pis_aliquota: 0, cofins_cst: "", cofins_aliquota: 0,
    ipi_cst: "", ipi_aliquota: 0, fcp_aliquota: 0, diferencial_aliquota: 0,
    origem_mercadoria: "0 - Nacional", regra_ativa: true, prioridade: 100, ...tabela
  });

  const [abaAtiva, setAbaAtiva] = useState("configuracao");
  const { validandoIA, sugestaoIA, handleValidarIA, handleAplicarSugestaoIA } = useTabelaFiscalIA(podeUsarIA, podeSalvar);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.nome_regra || !formData.cfop) { toast.error("Preencha os campos obrigatórios"); return; }
    if (!contextoValido) { toast.error("Selecione um grupo ou empresa antes de salvar."); return; }
    if (!podeSalvar) { toast.error("Sem permissão para salvar tabela fiscal."); return; }
    const payload = {
      ...formData,
      empresa_id: contextoAtual === "empresa" ? empresaAtual?.id : formData.empresa_id,
      group_id: groupId || formData.group_id,
      nome: formData.nome_regra,
      descricao: formData.cfop + ' - ' + formData.regime_tributario
    };
    const erroUnicidade = await checkGlobalUniqueness('TabelaFiscal', payload, { groupId, empresaId: empresaAtual?.id, currentId: tabela?.id, isEdit: !!tabela?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    if (onSubmit) {
      try { await onSubmit(payload); }
      catch (e) { toast.error(e?.message || 'Erro ao salvar tabela fiscal.'); }
    }
  };

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-hidden" : "p-6";
  const contentClass = windowMode ? "flex-1 overflow-y-auto p-6" : "";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <form onSubmit={handleSubmitForm} className="space-y-6">
          <TabelaFiscalSugestaoIA sugestaoIA={sugestaoIA} onAplicar={() => handleAplicarSugestaoIA(setFormData)} podeSalvar={podeSalvar} />
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="configuracao">⚙️ Configuração</TabsTrigger>
              <TabsTrigger value="tributos">💰 Tributos</TabsTrigger>
              <TabsTrigger value="validacao">✅ Validação</TabsTrigger>
            </TabsList>
            <TabsContent value="configuracao"><TabelaFiscalTabConfig formData={formData} setFormData={setFormData} /></TabsContent>
            <TabsContent value="tributos"><TabelaFiscalTabTributos formData={formData} setFormData={setFormData} /></TabsContent>
            <TabsContent value="validacao">
              <TabelaFiscalTabValidacao formData={formData} setFormData={setFormData}
                validandoIA={validandoIA} onValidarIA={() => handleValidarIA(formData)} podeUsarIA={podeUsarIA} />
            </TabsContent>
          </Tabs>
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              <Switch checked={formData.regra_ativa}
                onCheckedChange={(checked) => setFormData({ ...formData, regra_ativa: checked })}
                disabled={!podeSalvar} />
              <Label>Regra Ativa</Label>
            </div>
            <div className="flex gap-3">
              {onCancel && (<Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>)}
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700"
                disabled={!contextoValido || !podeSalvar}>
                <Receipt className="w-4 h-4 mr-2" />
                {tabela ? 'Atualizar' : 'Criar'} Tabela Fiscal
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}