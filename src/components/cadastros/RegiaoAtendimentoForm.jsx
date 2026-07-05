import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Truck, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { DEFAULT_FORM } from "./regiao/regiaoConstants";
import RegiaoTabGeral from "./regiao/RegiaoTabGeral";
import RegiaoTabLogistica from "./regiao/RegiaoTabLogistica";
import RegiaoTabComercial from "./regiao/RegiaoTabComercial";
import RegiaoTabMetricas from "./regiao/RegiaoTabMetricas";

export default function RegiaoAtendimentoForm({ regiaoId, regiaoAtendimento, item, data, open, onOpenChange, onSubmit, onSave, onClose, windowMode = false }) {
  const dadosIniciaisProps = regiaoAtendimento || item || data;
  const [formData, setFormData] = useState(dadosIniciaisProps || DEFAULT_FORM);
  const [novaCidade, setNovaCidade] = useState({ cidade: "", estado: "", cep_inicial: "", cep_final: "" });
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || "sem-grupo"}-${empresaAtual?.id || "sem-empresa"}`;
  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();

  const { data: vendedores = [] } = useQuery({ queryKey: ["colaboradores-vendedores", contextoKey], queryFn: () => filterInContext("Colaborador", {}, "nome_completo", 999), enabled: !!contexto });
  const { data: transportadoras = [] } = useQuery({ queryKey: ["transportadoras", contextoKey], queryFn: () => filterInContext("Transportadora", {}, "nome_transportadora", 999), enabled: !!contexto });

  useEffect(() => {
    if (dadosIniciaisProps && (open || windowMode)) { setFormData(dadosIniciaisProps); }
    else if (regiaoId && open && !dadosIniciaisProps) { base44.entities.RegiaoAtendimento.get(regiaoId).then((regiao) => { if (regiao) setFormData(regiao); }).catch(() => {}); }
    else if (!regiaoId && !dadosIniciaisProps && open) { setFormData(DEFAULT_FORM); }
  }, [regiaoId, open]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.nome_regiao) { toast.error("Nome da região é obrigatório"); return; }
    if (onSubmit) { onSubmit(formData); if (onOpenChange) onOpenChange(false); }
    else { if (onOpenChange) onOpenChange(false); if (onSave) onSave(); if (onClose) onClose(); }
  };

  const handleExcluir = async () => {
    const ok = await confirm({ title: "Confirmar Exclusão", description: "Tem certeza que deseja excluir esta região? Esta ação não pode ser desfeita.", confirmText: "Excluir" });
    if (ok) { onSubmit({ ...formData, _delete: true }); onOpenChange(false); }
  };

  const handleAlternarStatus = () => setFormData({ ...formData, ativo: !formData.ativo });

  const adicionarCidade = () => {
    if (!novaCidade.cidade || !novaCidade.estado) { toast.error("Preencha cidade e estado"); return; }
    setFormData({ ...formData, cidades_abrangidas: [...formData.cidades_abrangidas, { ...novaCidade }] });
    setNovaCidade({ cidade: "", estado: "", cep_inicial: "", cep_final: "" });
  };

  const removerCidade = (index) => setFormData({ ...formData, cidades_abrangidas: formData.cidades_abrangidas.filter((_, i) => i !== index) });
  const toggleEstado = (estado) => {
    const estados = formData.estados_abrangidos.includes(estado) ? formData.estados_abrangidos.filter((e) => e !== estado) : [...formData.estados_abrangidos, estado];
    setFormData({ ...formData, estados_abrangidos: estados });
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral"><MapPin className="w-4 h-4 mr-2" />Geral</TabsTrigger>
          <TabsTrigger value="logistica"><Truck className="w-4 h-4 mr-2" />Logística</TabsTrigger>
          <TabsTrigger value="comercial"><DollarSign className="w-4 h-4 mr-2" />Comercial</TabsTrigger>
          <TabsTrigger value="metricas"><TrendingUp className="w-4 h-4 mr-2" />Métricas</TabsTrigger>
        </TabsList>
        <TabsContent value="geral"><RegiaoTabGeral formData={formData} setFormData={setFormData} novaCidade={novaCidade} setNovaCidade={setNovaCidade} adicionarCidade={adicionarCidade} removerCidade={removerCidade} toggleEstado={toggleEstado} /></TabsContent>
        <TabsContent value="logistica"><RegiaoTabLogistica formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="comercial"><RegiaoTabComercial formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="metricas"><RegiaoTabMetricas formData={formData} /></TabsContent>
      </Tabs>
      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          {regiaoId && (
            <>
              <Button type="button" variant={formData.ativo ? "outline" : "default"} onClick={handleAlternarStatus}>{formData.ativo ? "Inativar" : "Ativar"}</Button>
              <Button type="button" variant="destructive" data-permission="Cadastros.RegiaoAtendimento.excluir" onClick={handleExcluir}>Excluir</Button>
            </>
          )}
        </div>
        <Button type="submit" data-permission="Cadastros.Regiao.salvar">{regiaoId || dadosIniciaisProps ? "Atualizar" : "Criar"} Região</Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-900">{regiaoId ? "Editar" : "Nova"} Região de Atendimento</h2></div>
        <div className="flex-1 overflow-y-auto p-4">{FormContent}</div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{regiaoId ? "Editar" : "Nova"} Região de Atendimento</DialogTitle></DialogHeader>
        {FormContent}
        <ConfirmExcluirDialog />
      </DialogContent>
    </Dialog>
  );
}