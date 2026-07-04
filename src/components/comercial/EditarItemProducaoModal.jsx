import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Calculator } from "lucide-react";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function EditarItemProducaoModal({ open, onClose, item, onSave, windowMode = false }) {
  const [formData, setFormData] = useState(item || {});

  React.useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const calcularPesos = () => {
    const qtd = parseFloat(formData.quantidade) || 0;
    const pesoUnit = parseFloat(formData.peso_unitario_kg) || 0;
    const pesoTotal = qtd * pesoUnit;

    setFormData(prev => ({
      ...prev,
      peso_total_kg: pesoTotal
    }));
  };

  const calcularCustos = () => {
    const custoMaterial = parseFloat(formData.custo_material) || 0;
    const custoMaoObra = parseFloat(formData.custo_mao_obra) || 0;
    const custoTotal = custoMaterial + custoMaoObra;

    setFormData(prev => ({
      ...prev,
      custo_total: custoTotal
    }));
  };

  const calcularPrecoVenda = () => {
    const qtd = parseFloat(formData.quantidade) || 0;
    const precoUnit = parseFloat(formData.preco_venda_unitario) || 0;
    const precoTotal = qtd * precoUnit;

    setFormData(prev => ({
      ...prev,
      preco_venda_total: precoTotal
    }));
  };

  const handleSave = () => {
    calcularPesos();
    calcularCustos();
    calcularPrecoVenda();
    
    onSave({
      ...formData,
      peso_total_kg: (parseFloat(formData.quantidade) || 0) * (parseFloat(formData.peso_unitario_kg) || 0),
      custo_total: (parseFloat(formData.custo_material) || 0) + (parseFloat(formData.custo_mao_obra) || 0),
      preco_venda_total: (parseFloat(formData.quantidade) || 0) * (parseFloat(formData.preco_venda_unitario) || 0)
    });
    onClose();
  };

  const content = (
    <div className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
          {/* Identificação */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Identificador *</Label>
              <Input
                value={formData.identificador || ''}
                onChange={(e) => setFormData({ ...formData, identificador: e.target.value })}
                placeholder="COLUNA-01"
              />
            </div>
            <div>
              <Label>Tipo de Peça</Label>
              <Select
                value={formData.tipo_peca || 'Coluna'}
                onValueChange={(value) => setFormData({ ...formData, tipo_peca: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coluna">Coluna</SelectItem>
                  <SelectItem value="Viga">Viga</SelectItem>
                  <SelectItem value="Sapata">Sapata</SelectItem>
                  <SelectItem value="Bloco">Bloco</SelectItem>
                  <SelectItem value="Laje">Laje</SelectItem>
                  <SelectItem value="Estaca">Estaca</SelectItem>
                  <SelectItem value="Corte e Dobra">Corte e Dobra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Modelo Base</Label>
              <Input
                value={formData.modelo_base || ''}
                onChange={(e) => setFormData({ ...formData, modelo_base: e.target.value })}
                placeholder="Modelo ou referência"
              />
            </div>
          </div>

          {/* Dimensões */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Dimensões (cm)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Comprimento</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.comprimento || 0}
                  onChange={(e) => setFormData({ ...formData, comprimento: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Largura</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.largura || 0}
                  onChange={(e) => setFormData({ ...formData, largura: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Altura</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.altura || 0}
                  onChange={(e) => setFormData({ ...formData, altura: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Ferros (se armado) */}
          {formData.ferro_principal_bitola && (
            <div>
              <Label className="text-base font-semibold mb-3 block">Armação</Label>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Ferro Principal - Bitola</Label>
                  <Select
                    value={formData.ferro_principal_bitola || '10.0mm'}
                    onValueChange={(value) => setFormData({ ...formData, ferro_principal_bitola: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6.3mm">6.3mm</SelectItem>
                      <SelectItem value="8.0mm">8.0mm</SelectItem>
                      <SelectItem value="10.0mm">10.0mm</SelectItem>
                      <SelectItem value="12.5mm">12.5mm</SelectItem>
                      <SelectItem value="16.0mm">16.0mm</SelectItem>
                      <SelectItem value="20.0mm">20.0mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={formData.ferro_principal_quantidade || 4}
                    onChange={(e) => setFormData({ ...formData, ferro_principal_quantidade: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Estribo - Bitola</Label>
                  <Select
                    value={formData.estribo_bitola || '6.3mm'}
                    onValueChange={(value) => setFormData({ ...formData, estribo_bitola: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.2mm">4.2mm</SelectItem>
                      <SelectItem value="5.0mm">5.0mm</SelectItem>
                      <SelectItem value="6.3mm">6.3mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Distância (cm)</Label>
                  <Input
                    type="number"
                    value={formData.estribo_distancia || 15}
                    onChange={(e) => setFormData({ ...formData, estribo_distancia: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantidade e Peso */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Quantidade e Peso</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Quantidade de Peças *</Label>
                <Input
                  type="number"
                  value={formData.quantidade || 1}
                  onChange={(e) => {
                    setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 });
                    setTimeout(calcularPesos, 100);
                  }}
                />
              </div>
              <div>
                <Label>Peso Unitário (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.peso_unitario_kg || 0}
                  onChange={(e) => {
                    setFormData({ ...formData, peso_unitario_kg: parseFloat(e.target.value) || 0 });
                    setTimeout(calcularPesos, 100);
                  }}
                />
              </div>
              <div>
                <Label>Peso Total (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.peso_total_kg || 0}
                  disabled
                  className="bg-slate-100"
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-permission="Producao.ItemProducao.editar"
              onClick={calcularPesos}
              className="mt-2"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Recalcular Peso
            </Button>
          </div>

          {/* Custos */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Custos</Label>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Custo Material (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_material || 0}
                  onChange={(e) => {
                    setFormData({ ...formData, custo_material: parseFloat(e.target.value) || 0 });
                    setTimeout(calcularCustos, 100);
                  }}
                />
              </div>
              <div>
                <Label>Custo Mão de Obra (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_mao_obra || 0}
                  onChange={(e) => {
                    setFormData({ ...formData, custo_mao_obra: parseFloat(e.target.value) || 0 });
                    setTimeout(calcularCustos, 100);
                  }}
                />
              </div>
              <div>
                <Label>Overhead (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_overhead || 0}
                  onChange={(e) => setFormData({ ...formData, custo_overhead: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Custo Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custo_total || 0}
                  disabled
                  className="bg-slate-100 font-bold"
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              data-permission="Producao.ItemProducao.editar"
              onClick={calcularCustos}
              className="mt-2"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Recalcular Custos
            </Button>
          </div>

          {/* Preço de Venda */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Preço de Venda</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Preço Unit (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco_venda_unitario || 0}
                  onChange={(e) => {
                    setFormData({ ...formData, preco_venda_unitario: parseFloat(e.target.value) || 0 });
                    setTimeout(calcularPrecoVenda, 100);
                  }}
                />
              </div>
              <div>
                <Label>Preço Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco_venda_total || 0}
                  disabled
                  className="bg-green-100 font-bold text-green-700"
                />
              </div>
              <div>
                <Label>Margem (%)</Label>
                <Input
                  value={
                    formData.preco_venda_total > 0
                      ? ((((formData.preco_venda_total || 0) - (formData.custo_total || 0)) / (formData.preco_venda_total || 1)) * 100).toFixed(1)
                      : 0
                  }
                  disabled
                  className="bg-slate-100 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações Técnicas</Label>
            <Textarea
              value={formData.observacoes_tecnicas || ''}
              onChange={(e) => setFormData({ ...formData, observacoes_tecnicas: e.target.value })}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" data-permission="Producao.ItemProducao.visualizar" onClick={onClose}>
              Cancelar
            </Button>
            <Button data-permission="Producao.ItemProducao.editar" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Item
            </Button>
          </div>
        </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Item de Produção</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}