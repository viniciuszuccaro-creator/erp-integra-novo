import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FormWrapper from "@/components/common/FormWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Truck, CheckCircle, MapPin } from "lucide-react";

/**
 * Formulário para Geração de Romaneio
 */
export default function RomaneioForm({ isOpen, onClose, empresaId, windowMode = false }) {
  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-hidden" : "";
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    motorista: "",
    motorista_telefone: "",
    veiculo: "",
    placa: "",
    tipo_veiculo: "Caminhão",
    instrucoes_motorista: "",
    entregas_selecionadas: []
  });

  const [checklist, setChecklist] = useState({
    documentos_ok: false,
    veiculo_ok: false,
    carga_conferida: false,
    combustivel_ok: false,
    observacoes: ""
  });

  const { data: entregas = [] } = useQuery({
    queryKey: ['entregas-para-romaneio', empresaId],
    queryFn: async () => {
      const todas = await base44.entities.Entrega.list('-created_date');
      return todas.filter(e => 
        e.empresa_id === empresaId && 
        e.status === "Pronto para Expedir" &&
        !e.romaneio_id
      );
    },
    enabled: isOpen && !!empresaId,
  });

  const toggleEntrega = (entregaId) => {
    if (formData.entregas_selecionadas.includes(entregaId)) {
      setFormData({
        ...formData,
        entregas_selecionadas: formData.entregas_selecionadas.filter(id => id !== entregaId)
      });
    } else {
      setFormData({
        ...formData,
        entregas_selecionadas: [...formData.entregas_selecionadas, entregaId]
      });
    }
  };

  const gerarRomaneioMutation = useMutation({
    mutationFn: async () => {
      const entregasSelecionadas = entregas.filter(e => 
        formData.entregas_selecionadas.includes(e.id)
      );

      if (entregasSelecionadas.length === 0) {
        throw new Error("Selecione pelo menos uma entrega");
      }

      const pesoTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0);
      const volumesTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.volumes || 0), 0);
      const valorTotal = entregasSelecionadas.reduce((sum, e) => sum + (e.valor_mercadoria || 0), 0);

      const numeroRomaneio = `ROM-${Date.now()}`;

      const romaneio = await base44.entities.Romaneio.create({
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

      // Atualizar entregas
      for (const entrega of entregasSelecionadas) {
        await base44.entities.Entrega.update(entrega.id, {
          romaneio_id: romaneio.id,
          status: "Saiu para Entrega",
          data_saida: new Date().toISOString(),
          historico_status: [
            ...(entrega.historico_status || []),
            {
              status: "Saiu para Entrega",
              data_hora: new Date().toISOString(),
              usuario: "Sistema",
              observacao: `Incluído no romaneio ${numeroRomaneio}`
            }
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
          {/* Dados do Motorista */}
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-base">Dados do Motorista e Veículo</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Motorista *</Label>
                  <Input
                    value={formData.motorista}
                    onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Telefone Motorista</Label>
                  <Input
                    value={formData.motorista_telefone}
                    onChange={(e) => setFormData({ ...formData, motorista_telefone: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Veículo</Label>
                  <Input
                    value={formData.veiculo}
                    onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                    placeholder="Ex: Caminhão Iveco"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Placa</Label>
                  <Input
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    placeholder="ABC-1234"
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seleção de Entregas */}
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-base">
                Selecionar Entregas ({formData.entregas_selecionadas.length} selecionadas)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={formData.entregas_selecionadas.length === entregas.length}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            entregas_selecionadas: checked ? entregas.map(e => e.id) : []
                          });
                        }}
                      />
                    </TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Volumes</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Prioridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entregas.map(entrega => (
                    <TableRow key={entrega.id}>
                      <TableCell>
                        <Checkbox
                          checked={formData.entregas_selecionadas.includes(entrega.id)}
                          onCheckedChange={() => toggleEntrega(entrega.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{entrega.numero_pedido || '-'}</TableCell>
                      <TableCell>{entrega.cliente_nome}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                        </div>
                      </TableCell>
                      <TableCell>{entrega.volumes || 0}</TableCell>
                      <TableCell>{entrega.peso_total_kg?.toFixed(1) || 0} kg</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          entrega.prioridade === 'Urgente' ? 'border-red-500 text-red-700' :
                          entrega.prioridade === 'Alta' ? 'border-orange-500 text-orange-700' :
                          'border-slate-400'
                        }>
                          {entrega.prioridade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {entregas.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma entrega pronta para romaneio</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo */}
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
                    <p className="text-2xl font-bold text-purple-900">
                      {entregasSelecionadas.reduce((sum, e) => sum + (e.volumes || 0), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Peso Total</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {entregasSelecionadas.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0).toFixed(1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Valor</p>
                    <p className="text-xl font-bold text-purple-900">
                      R$ {entregasSelecionadas.reduce((sum, e) => sum + (e.valor_mercadoria || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checklist */}
          <Card>
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle className="text-base">Checklist de Saída</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checklist.documentos_ok}
                  onCheckedChange={(v) => setChecklist({ ...checklist, documentos_ok: v })}
                />
                <Label>Documentos conferidos (NF-e, romaneio, etc.)</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checklist.veiculo_ok}
                  onCheckedChange={(v) => setChecklist({ ...checklist, veiculo_ok: v })}
                />
                <Label>Veículo em boas condições</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checklist.carga_conferida}
                  onCheckedChange={(v) => setChecklist({ ...checklist, carga_conferida: v })}
                />
                <Label>Carga conferida e amarrada</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checklist.combustivel_ok}
                  onCheckedChange={(v) => setChecklist({ ...checklist, combustivel_ok: v })}
                />
                <Label>Combustível suficiente</Label>
              </div>
              <div className="mt-3">
                <Label>Observações do Checklist</Label>
                <Textarea
                  value={checklist.observacoes}
                  onChange={(e) => setChecklist({ ...checklist, observacoes: e.target.value })}
                  rows={2}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <div>
            <Label>Instruções para o Motorista</Label>
            <Textarea
              value={formData.instrucoes_motorista}
              onChange={(e) => setFormData({ ...formData, instrucoes_motorista: e.target.value })}
              rows={3}
              placeholder="Observações e instruções especiais..."
              className="mt-2"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              data-permission="Expedicao.Romaneio.criar"
              disabled={
                !formData.motorista ||
                formData.entregas_selecionadas.length === 0 ||
                gerarRomaneioMutation.isPending
              }
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {gerarRomaneioMutation.isPending ? 'Gerando...' : 'Gerar Romaneio'}
            </Button>
          </div>
        </FormWrapper>
      </div>
    );

  if (windowMode) {
    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {!windowMode && (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Gerar Romaneio de Entrega
            </DialogTitle>
          </DialogHeader>
        )}
        {content}
      </DialogContent>
    </Dialog>
  );
}