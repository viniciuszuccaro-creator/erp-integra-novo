import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CheckCircle2, AlertCircle } from "lucide-react";
import FormWrapper from "@/components/common/FormWrapper";
import useEntregaForm from "./useEntregaForm";
import EntregaEnderecoContato from "./EntregaEnderecoContato";
import EntregaTransporte from "./EntregaTransporte";

/**
 * V21.1.2 - REFACTORED (Regra-Mãe)
 * 715 → ~100 linhas
 * Lógica em useEntregaForm, seções em EntregaEnderecoContato + EntregaTransporte
 */
export default function FormularioEntrega({ formData, setFormData, onCancel, clientes = [], pedidos = [], empresasDoGrupo = [], estaNoGrupo = false, isEditing = false, isLoading = false, windowMode = false }) {
  const {
    previsaoIA, calculandoPrevisao, calcularPrevisaoEntrega, buscarDadosGoogleMaps,
    isSubmitting, handleSubmitForm, handleClienteChange, handlePedidoChange
  } = useEntregaForm({ formData, setFormData, onCancel, isEditing });

  const content = (
    <FormWrapper onSubmit={handleSubmitForm} externalData={formData} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      {estaNoGrupo && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <Label>Empresa Responsável *</Label>
          <Select value={formData.empresa_id} onValueChange={(v) => setFormData({ ...formData, empresa_id: v })} required>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>{empresasDoGrupo.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.nome_fantasia || emp.razao_social}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {/* Dados Gerais */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 border-b pb-2">Dados Gerais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Pedido Relacionado</Label>
            <Select value={formData.pedido_id} onValueChange={(v) => handlePedidoChange(v, pedidos, clientes)}>
              <SelectTrigger><SelectValue placeholder="Selecione um pedido" /></SelectTrigger>
              <SelectContent>{pedidos.map(p => <SelectItem key={p.id} value={p.id}>{p.numero_pedido} - {p.cliente_nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Cliente *</Label>
            <Select value={formData.cliente_id} onValueChange={(v) => handleClienteChange(v, clientes)} required>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome || c.razao_social}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Data Previsão</Label>
            <div className="flex gap-2">
              <Input type="date" value={formData.data_previsao} onChange={(e) => setFormData({ ...formData, data_previsao: e.target.value })} className="flex-1" />
              <Button type="button" data-permission="Expedicao.Entrega.editar" onClick={calcularPrevisaoEntrega} disabled={calculandoPrevisao} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50" title="Calcular com IA"><Zap className="w-4 h-4" /></Button>
            </div>
            {previsaoIA && <p className="text-xs text-green-600 mt-1">🤖 IA: {previsaoIA.prazo_dias} dia(s) • {previsaoIA.confianca_percentual}% confiança</p>}
          </div>
          <div><Label>Prioridade</Label>
            <Select value={formData.prioridade} onValueChange={(v) => setFormData({ ...formData, prioridade: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Baixa">Baixa</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Alta">Alta</SelectItem><SelectItem value="Urgente">🔥 Urgente</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Status Inicial</Label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Aguardando Separação">⏳ Aguardando</SelectItem><SelectItem value="Em Separação">📦 Em Separação</SelectItem><SelectItem value="Pronto para Expedir">✅ Pronto</SelectItem><SelectItem value="Saiu para Entrega">🚚 Saiu</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <EntregaEnderecoContato formData={formData} setFormData={setFormData} buscarDadosGoogleMaps={buscarDadosGoogleMaps} />
      <EntregaTransporte formData={formData} setFormData={setFormData} />

      <div><Label>Observações Logísticas</Label><Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={3} placeholder="Informações adicionais sobre a entrega..." /></div>

      {formData.peso_total_kg > 1000 && (
        <Card className="bg-orange-50 border-orange-300">
          <div className="p-3 text-sm text-orange-800">
            <p className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" />⚠️ Atenção: Carga Pesada</p>
            <p className="text-xs mt-1">Verifique se o veículo suporta {formData.peso_total_kg}kg. Considere reforço estrutural.</p>
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting} data-permission="Expedicao.Entrega.criar" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <CheckCircle2 className="w-4 h-4 mr-2" />{isEditing ? '💾 Atualizar' : '🚀 Criar'} Entrega
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) return <div className="w-full h-full bg-white overflow-auto">{content}</div>;
  return content;
}