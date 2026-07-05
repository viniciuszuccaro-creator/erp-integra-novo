import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * V21.1.2: Formulário de Inspeção de Qualidade - Adaptado para Window Mode
 */
export default function FormularioInspecao({ op, item, onConcluido, windowMode = false }) {
  const queryClient = useQueryClient();
  const { grupoAtual, empresaAtual, carimbarContexto } = useContextoVisual();
  
  const [formData, setFormData] = useState({
    op_id: op?.id || '',
    numero_op: op?.numero_op || '',
    item_producao_id: item?.id || '',
    tipo_inspecao: 'Final',
    status_qualidade: 'Aprovado',
    defeitos_encontrados: [],
    medidas_verificadas: [],
    peso_verificado: 0,
    observacoes: '',
    aprovado_por: '',
    data_inspecao: new Date().toISOString()
  });

  const [novoDefeito, setNovoDefeito] = useState({
    tipo: 'Visual',
    descricao: '',
    severidade: 'Média'
  });

  const criarInspecaoMutation = useMutation({
    mutationFn: (data) => base44.entities.InspecaoQualidade.create(carimbarContexto(data, 'empresa_id')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens-producao'] });
      queryClient.invalidateQueries({ queryKey: ['inspecoes'] });
      toast.success("✅ Inspeção registrada!");
      if (onConcluido) onConcluido();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    criarInspecaoMutation.mutate(formData);
  };

  const adicionarDefeito = () => {
    if (!novoDefeito.descricao) return;
    
    setFormData({
      ...formData,
      defeitos_encontrados: [
        ...formData.defeitos_encontrados,
        { ...novoDefeito, id: Date.now() }
      ]
    });
    
    setNovoDefeito({ tipo: 'Visual', descricao: '', severidade: 'Média' });
  };

  const content = (
    <form onSubmit={handleSubmit} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg text-purple-900 mb-4">
            Inspeção: {op?.numero_op}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Inspeção</Label>
              <Select value={formData.tipo_inspecao} onValueChange={(v) => setFormData({ ...formData, tipo_inspecao: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inicial">Inicial</SelectItem>
                  <SelectItem value="Processual">Processual</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status da Qualidade</Label>
              <Select value={formData.status_qualidade} onValueChange={(v) => setFormData({ ...formData, status_qualidade: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aprovado">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Aprovado
                    </div>
                  </SelectItem>
                  <SelectItem value="Aprovado com Ressalvas">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Aprovado com Ressalvas
                    </div>
                  </SelectItem>
                  <SelectItem value="Reprovado">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Reprovado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Peso Verificado (kg)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.peso_verificado}
                onChange={(e) => setFormData({ ...formData, peso_verificado: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Aprovado Por</Label>
              <Input
                value={formData.aprovado_por}
                onChange={(e) => setFormData({ ...formData, aprovado_por: e.target.value })}
                placeholder="Nome do inspetor"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold">Registrar Defeitos</h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={novoDefeito.tipo} onValueChange={(v) => setNovoDefeito({ ...novoDefeito, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Visual">Visual</SelectItem>
                  <SelectItem value="Dimensional">Dimensional</SelectItem>
                  <SelectItem value="Estrutural">Estrutural</SelectItem>
                  <SelectItem value="Acabamento">Acabamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severidade</Label>
              <Select value={novoDefeito.severidade} onValueChange={(v) => setNovoDefeito({ ...novoDefeito, severidade: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="button" onClick={adicionarDefeito} className="w-full">
                Adicionar
              </Button>
            </div>

            <div className="col-span-3">
              <Label>Descrição do Defeito</Label>
              <Input
                value={novoDefeito.descricao}
                onChange={(e) => setNovoDefeito({ ...novoDefeito, descricao: e.target.value })}
                placeholder="Descreva o defeito..."
              />
            </div>
          </div>

          {formData.defeitos_encontrados.length > 0 && (
            <div className="space-y-2">
              <Label>Defeitos Registrados</Label>
              {formData.defeitos_encontrados.map((def, idx) => (
                <div key={def.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                  <div>
                    <Badge className="mr-2">{def.tipo}</Badge>
                    <Badge variant="outline">{def.severidade}</Badge>
                    <p className="text-sm mt-1">{def.descricao}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      defeitos_encontrados: formData.defeitos_encontrados.filter((_, i) => i !== idx)
                    })}
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Label>Observações Gerais</Label>
        <Textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={4}
          placeholder="Detalhes da inspeção..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" data-permission="Qualidade.Inspecao.salvar" disabled={criarInspecaoMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-2" />
          {criarInspecaoMutation.isPending ? 'Salvando...' : 'Salvar Inspeção'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}