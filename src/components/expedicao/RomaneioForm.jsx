import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import FormWrapper from "@/components/common/FormWrapper";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";
import RomaneioChecklist from "./romaneio-form/RomaneioChecklist";
import RomaneioEntregasTable from "./romaneio-form/RomaneioEntregasTable";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";

export default function RomaneioForm({ isOpen, onClose, empresaId, windowMode = false }) {
  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-hidden" : "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, contexto, createInContext, updateInContext } = useContextoVisual();

  const { data: motoristas = [] } = useRLSQuery('Motorista', { ativo: true }, '-updated_date', 999);
  const { data: veiculos = [] } = useRLSQuery('Veiculo', { ativo: true }, '-updated_date', 999);

  const veic_label = (ve) => {
    const parts = [];
    if (ve.modelo) parts.push(ve.modelo);
    if (ve.placa) parts.push(ve.placa);
    if (ve.tipo) parts.push(ve.tipo);
    return parts.join(' - ') || ve.id;
  };
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaId || 'sem-empresa'}`;

  const [formData, setFormData] = useState({
    motorista: "", motorista_telefone: "", veiculo: "", placa: "",
    tipo_veiculo: "Caminhão", instrucoes_motorista: "", entregas_selecionadas: []
  });

  const [checklist, setChecklist] = useState({
    documentos_ok: false, veiculo_ok: false, carga_conferida: false, combustivel_ok: false, observacoes: ""
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-para-romaneio', contextoKey],
    queryFn: async () => {
      const todas = await filterInContext('Entrega', { status: "Pronto para Expedir" }, '-created_date', 200);
      return todas.filter(e => !e.romaneio_id);
    },
    enabled: isOpen && !!contexto,
  });

  const toggleEntrega = (entregaId) => {
    setFormData(prev => ({
      ...prev,
      entregas_selecionadas: prev.entregas_selecionadas.includes(entregaId)
        ? prev.entregas_selecionadas.filter(id => id !== entregaId)
        : [...prev.entregas_selecionadas, entregaId]
    }));
  };

  const toggleAll = (checked) => {
    setFormData(prev => ({
      ...prev,
      entregas_selecionadas: checked ? entregas.map(e => e.id) : []
    }));
  };

  const gerarRomaneioMutation = useMutation({
    mutationFn: async () => {
      const entregasSelecionadas = entregas.filter(e => formData.entregas_selecionadas.includes(e.id));
      if (entregasSelecionadas.length === 0) throw new Error("Selecione pelo menos uma entrega");

      const pesoTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0);
      const volumesTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.volumes || 0), 0);
      const valorTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.valor_mercadoria || 0), 0);
      const numeroRomaneio = `ROM-${Date.now()}`;

      const romaneio = await createInContext('Romaneio', {
        group_id: entregasSelecionadas[0].group_id,
        empresa_id: empresaId,
        numero_romaneio: numeroRomaneio,
        data_romaneio: new Date().toISOString().split('T')[0],
        data_saida: new Date().toISOString(),
        motorista: formData.motorista,
        motorista_telefone: formData.motorista_telefone,
        veiculo: formData.veiculo,
        placa: formData.placa,
        tipo_veiculo: formData.tipo_veiculo,
        entregas_ids: formData.entregas_selecionadas,
        quantidade_entregas: entregasSelecionadas.length,
        quantidade_volumes: volumesTotal,
        peso_total_kg: pesoTotal,
        valor_total_mercadoria: valorTotal,
        status: "Aprovado",
        instrucoes_motorista: formData.instrucoes_motorista,
        checklist_saida: checklist,
        entregas_realizadas: 0,
        entregas_frustradas: 0
      });

      for (const entrega of entregasSelecionadas) {
        await updateInContext('Entrega', entrega.id, {
          romaneio_id: romaneio.id,
          status: "Saiu para Entrega",
          data_saida: new Date().toISOString(),
          historico_status: [
            ...(entrega.historico_status || []),
            { status: "Saiu para Entrega", data_hora: new Date().toISOString(), usuario: "Sistema", observacao: `Incluído no romaneio ${numeroRomaneio}` }
          ]
        });
      }
      return romaneio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['romaneios'] });
      toast({ title: "✅ Romaneio gerado com sucesso!" });
      onClose();
    },
  });

  const unifiedSubmit = React.useCallback(() => gerarRomaneioMutation.mutate(), [gerarRomaneioMutation]);
  const entregasSelecionadas = entregas.filter(e => formData.entregas_selecionadas.includes(e.id));

  const content = (
    <div className={containerClass}>
      {windowMode && (
        <div className="flex-shrink-0 p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Gerar Romaneio de Entrega
          </h2>
        </div>
      )}

      <FormWrapper onSubmit={unifiedSubmit} externalData={{...formData, checklist}} className={`space-y-6 ${windowMode ? 'flex-1 overflow-auto p-6' : ''}`}>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Motorista *</Label>
                <Select
                  value={formData.motorista_id || ''}
                  onValueChange={(v) => {
                    const m = motoristas.find(m => m.id === v);
                    setFormData({ ...formData, motorista_id: v, motorista: m?.nome_completo || '', motorista_telefone: m?.telefone || m?.celular || '' });
                  }}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {motoristas.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nome_completo}{m.cnh_categoria ? ` - CNH ${m.cnh_categoria}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Telefone Motorista</Label>
                <Input value={formData.motorista_telefone} onChange={(e) => setFormData({ ...formData, motorista_telefone: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label>Veículo</Label>
                <Select
                  value={formData.veiculo_id || ''}
                  onValueChange={(v) => {
                    const veic = veiculos.find(ve => ve.id === v);
                    setFormData({ ...formData, veiculo_id: v, veiculo: veic?.modelo || veic?.descricao || '', placa: veic?.placa || '', tipo_veiculo: veic?.tipo || 'Caminhão' });
                  }}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {veiculos.map(ve => (
                      <SelectItem key={ve.id} value={ve.id}>{veic_label(ve)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Placa</Label>
                <Input value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} placeholder="ABC-1234" className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <RomaneioEntregasTable
          entregas={entregas}
          selecionadas={formData.entregas_selecionadas}
          onToggle={toggleEntrega}
          onToggleAll={toggleAll}
        />

        {entregasSelecionadas.length > 0 && (
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-5">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-purple-700">Entregas</p>
                  <p className="text-2xl font-bold text-purple-900">{entregasSelecionadas.length}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700">Volumes</p>
                  <p className="text-2xl font-bold text-purple-900">{entregasSelecionadas.reduce((sum, e) => sum + (e.volumes || 0), 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700">Peso Total</p>
                  <p className="text-2xl font-bold text-purple-900">{entregasSelecionadas.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0).toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-xs text-purple-700">Valor</p>
                  <p className="text-xl font-bold text-purple-900">R$ {entregasSelecionadas.reduce((sum, e) => sum + (e.valor_mercadoria || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <RomaneioChecklist checklist={checklist} setChecklist={setChecklist} />

        <div>
          <Label>Instruções para o Motorista</Label>
          <Textarea value={formData.instrucoes_motorista} onChange={(e) => setFormData({ ...formData, instrucoes_motorista: e.target.value })} rows={3} placeholder="Observações e instruções especiais..." className="mt-2" />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <RBACButton type="submit" module="Expedicao" action="criar" disabled={!formData.motorista || formData.entregas_selecionadas.length === 0 || gerarRomaneioMutation.isPending} className="flex-1 bg-purple-600 hover:bg-purple-700">
            {gerarRomaneioMutation.isPending ? 'Gerando...' : 'Gerar Romaneio'}
          </RBACButton>
        </div>
      </FormWrapper>
    </div>
  );

  if (windowMode) return content;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Gerar Romaneio de Entrega
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}