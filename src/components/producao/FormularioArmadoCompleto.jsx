import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Package, Ruler, Grid3x3, Building, Columns, Box as BoxIcon, FileText, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { useArmadoCalculo, PESOS_BITOLA } from "./useArmadoCalculo";
import ArmadoResumoCard from "./ArmadoResumoCard";

export default function FormularioArmadoCompleto({ onSalvar, onCancelar, itemInicial = null }) {
  const { toast } = useToast();
  const {
    tipoSelecionado, setTipoSelecionado,
    elementoEstrutural, setElementoEstrutural, elementoObrigatorio,
    formData, setFormData, resumo,
    descricaoAutomatica, calcularBloco, calcularElemento
  } = useArmadoCalculo(itemInicial);

  const handleSalvar = () => {
    if (!tipoSelecionado) {
      toast({ title: "❌ Erro", description: "Selecione o tipo de elemento estrutural", variant: "destructive" });
      return;
    }
    if (!formData.comprimento) {
      toast({ title: "❌ Erro", description: "Preencha o comprimento", variant: "destructive" });
      return;
    }
    if (tipoSelecionado === "Bloco" && (!formData.altura || !formData.largura)) {
      toast({ title: "❌ Erro", description: "Preencha altura e largura do bloco", variant: "destructive" });
      return;
    }
    if (!resumo) {
      toast({ title: "❌ Erro", description: "Clique em CALCULAR antes de salvar", variant: "destructive" });
      return;
    }
    if (elementoObrigatorio && !elementoEstrutural.trim()) {
      toast({ title: "⚠️ Elemento Estrutural Obrigatório!", description: "Este item foi processado por IA e requer o preenchimento do elemento estrutural (ex: V1, V2, C1, B1).", variant: "destructive" });
      return;
    }

    const itemCompleto = {
      ...formData,
      tipo_peca: tipoSelecionado,
      tipo_servico: "armado",
      identificador: elementoEstrutural.trim() || descricaoAutomatica,
      origem_ia: itemInicial?.origem_ia || false,
      descricao_automatica: descricaoAutomatica,
      resumo: resumo
    };

    onSalvar(itemCompleto);
    toast({ title: "✅ Item Adicionado ao Pedido!" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle>Armado Sob Medida - Cálculo Automático</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Label className="mb-3 block">Selecione o Tipo de Elemento Estrutural:</Label>
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => setTipoSelecionado("Coluna")}
              className={`p-6 border-2 rounded-lg transition-all ${
                tipoSelecionado === "Coluna" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <Columns className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold">Coluna</p>
            </button>
            <button
              onClick={() => setTipoSelecionado("Viga")}
              className={`p-6 border-2 rounded-lg transition-all ${
                tipoSelecionado === "Viga" ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-purple-300"
              }`}
            >
              <div className="w-12 h-3 mx-auto mb-4 bg-slate-600 rounded" />
              <p className="font-semibold">Viga</p>
            </button>
            <button
              onClick={() => setTipoSelecionado("Estaca/Broca")}
              className={`p-6 border-2 rounded-lg transition-all ${
                tipoSelecionado === "Estaca/Broca" ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-orange-300"
              }`}
            >
              <Building className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold">Estaca/Broca</p>
            </button>
            <button
              onClick={() => setTipoSelecionado("Bloco")}
              className={`p-6 border-2 rounded-lg transition-all ${
                tipoSelecionado === "Bloco" ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-green-300"
              }`}
            >
              <BoxIcon className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="font-semibold">Bloco de Fundação</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {tipoSelecionado && (
        <>
          {descricaoAutomatica && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Descrição Automática</h4>
                </div>
                <p className="text-sm text-blue-800 font-mono">{descricaoAutomatica}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <Label>
              Elemento Estrutural (Ex: V1, V2, C1, B1)
              {elementoObrigatorio && <span className="text-red-600 ml-1">*</span>}
            </Label>
            <Input
              value={elementoEstrutural}
              onChange={(e) => setElementoEstrutural(e.target.value)}
              placeholder={descricaoAutomatica || "V1, V2, C1, C2, B1..."}
              required={elementoObrigatorio}
              className={elementoObrigatorio ? "border-red-300" : ""}
            />
            {elementoObrigatorio && (
              <p className="text-xs text-red-600 mt-1">⚠️ Obrigatório: item processado por IA</p>
            )}
            {!elementoEstrutural && descricaoAutomatica && (
              <p className="text-xs text-blue-600 mt-1">💡 Deixe vazio para usar a descrição automática</p>
            )}
          </div>

          <Card>
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Dados Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Identificador Interno</Label>
                  <Input value={formData.identificador} disabled placeholder={`Ex: ${tipoSelecionado}-01`} />
                </div>
                <div>
                  <Label>Quantidade de Peças *</Label>
                  <Input
                    type="number" min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <Separator />

              {tipoSelecionado === "Bloco" ? (
                <>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Comprimento (cm) *</Label>
                      <div className="relative">
                        <Input type="number" step="1" value={formData.comprimento}
                          onChange={(e) => setFormData({ ...formData, comprimento: parseFloat(e.target.value) || 0 })} />
                        <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <Label>Altura (cm) *</Label>
                      <div className="relative">
                        <Input type="number" step="1" value={formData.altura}
                          onChange={(e) => setFormData({ ...formData, altura: parseFloat(e.target.value) || 0 })} />
                        <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <Label>Largura (cm) *</Label>
                      <div className="relative">
                        <Input type="number" step="1" value={formData.largura}
                          onChange={(e) => setFormData({ ...formData, largura: parseFloat(e.target.value) || 0 })} />
                        <Ruler className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <Label>Espaçamento (cm) *</Label>
                      <div className="relative">
                        <Input type="number" step="1" value={formData.espacamento_ferros}
                          onChange={(e) => setFormData({ ...formData, espacamento_ferros: parseFloat(e.target.value) || 15 })} />
                        <Grid3x3 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Bitola Ferros Principais</Label>
                    <Select value={formData.ferro_principal_bitola}
                      onValueChange={(v) => setFormData({ ...formData, ferro_principal_bitola: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(PESOS_BITOLA).filter(b => parseFloat(b) >= 8.0).map(bitola => (
                          <SelectItem key={bitola} value={bitola}>{bitola}mm</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded border border-yellow-200">
                    <div>
                      <Label className="font-semibold">Reforço - Bitola (Opcional)</Label>
                      <p className="text-sm text-slate-600 mt-1">Adicionar costelas de reforço ao bloco</p>
                    </div>
                    <Switch checked={formData.usar_costelas}
                      onCheckedChange={(checked) => setFormData({ ...formData, usar_costelas: checked })} />
                  </div>

                  {formData.usar_costelas && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 rounded border border-yellow-200">
                      <div>
                        <Label>Quantidade de Costelas *</Label>
                        <Input type="number" min="0" value={formData.quantidade_costelas}
                          onChange={(e) => setFormData({ ...formData, quantidade_costelas: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <Label>Bitola das Costelas *</Label>
                        <Select value={formData.bitola_costelas}
                          onValueChange={(v) => setFormData({ ...formData, bitola_costelas: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(PESOS_BITOLA).filter(b => parseFloat(b) >= 6.3 && parseFloat(b) <= 10.0).map(bitola => (
                              <SelectItem key={bitola} value={bitola}>{bitola}mm</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </>
              ) : tipoSelecionado === "Estaca/Broca" ? (
                <>
                  <div>
                    <Label>Comprimento (cm) *</Label>
                    <Input type="number" step="1" value={formData.comprimento}
                      onChange={(e) => setFormData({ ...formData, comprimento: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bitola Principal</Label>
                      <Select value={formData.ferro_principal_bitola}
                        onValueChange={(v) => setFormData({ ...formData, ferro_principal_bitola: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(PESOS_BITOLA).filter(b => parseFloat(b) >= 8.0).map(bitola => (
                            <SelectItem key={bitola} value={bitola}>{bitola}mm</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantidade de Ferros</Label>
                      <Input type="number" min="1" value={formData.ferro_principal_quantidade}
                        onChange={(e) => setFormData({ ...formData, ferro_principal_quantidade: parseInt(e.target.value) || 4 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Diâmetro do Estribo (cm)</Label>
                      <Input type="number" step="1" value={formData.estribo_diametro}
                        onChange={(e) => setFormData({ ...formData, estribo_diametro: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Distância entre Estribos (cm)</Label>
                      <Input type="number" step="1" value={formData.estribo_distancia}
                        onChange={(e) => setFormData({ ...formData, estribo_distancia: parseFloat(e.target.value) || 15 })} />
                    </div>
                    <div>
                      <Label>Bitola Estribos</Label>
                      <Select value={formData.estribo_bitola}
                        onValueChange={(v) => setFormData({ ...formData, estribo_bitola: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4.2">4.2mm</SelectItem>
                          <SelectItem value="5.0">5.0mm</SelectItem>
                          <SelectItem value="6.3">6.3mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Comprimento (cm) *</Label>
                    <Input type="number" step="1" value={formData.comprimento}
                      onChange={(e) => setFormData({ ...formData, comprimento: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bitola Principal</Label>
                      <Select value={formData.ferro_principal_bitola}
                        onValueChange={(v) => setFormData({ ...formData, ferro_principal_bitola: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(PESOS_BITOLA).filter(b => parseFloat(b) >= 8.0).map(bitola => (
                            <SelectItem key={bitola} value={bitola}>{bitola}mm</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantidade de Ferros</Label>
                      <Input type="number" min="1" value={formData.ferro_principal_quantidade}
                        onChange={(e) => setFormData({ ...formData, ferro_principal_quantidade: parseInt(e.target.value) || 4 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Largura Estribo (cm)</Label>
                      <Input type="number" step="1" value={formData.estribo_largura}
                        onChange={(e) => setFormData({ ...formData, estribo_largura: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Altura Estribo (cm)</Label>
                      <Input type="number" step="1" value={formData.estribo_altura}
                        onChange={(e) => setFormData({ ...formData, estribo_altura: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label>Distância (cm)</Label>
                      <Input type="number" step="1" value={formData.estribo_distancia}
                        onChange={(e) => setFormData({ ...formData, estribo_distancia: parseFloat(e.target.value) || 15 })} />
                    </div>
                  </div>
                  <div>
                    <Label>Bitola Estribos</Label>
                    <Select value={formData.estribo_bitola}
                      onValueChange={(v) => setFormData({ ...formData, estribo_bitola: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4.2">4.2mm</SelectItem>
                        <SelectItem value="5.0">5.0mm</SelectItem>
                        <SelectItem value="6.3">6.3mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={tipoSelecionado === "Bloco" ? calcularBloco : calcularElemento}
            className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            <Calculator className="w-6 h-6 mr-2" />
            CALCULAR {tipoSelecionado.toUpperCase()}
          </Button>

          {resumo && (
            <ArmadoResumoCard resumo={resumo} formData={formData} tipoSelecionado={tipoSelecionado} />
          )}
        </>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSalvar} disabled={!resumo} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>
    </div>
  );
}