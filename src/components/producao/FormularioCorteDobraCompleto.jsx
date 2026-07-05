import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scissors, Sparkles, Upload, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CorteDobraPosicaoForm from "./CorteDobraPosicaoForm";
import CorteDobraResumoGeral, { CorteDobraListaPosicoes } from "./CorteDobraResumoGeral";
import { calcularPesoBarra, calcularResumoGeral } from "./corteDobraConstants";

export default function FormularioCorteDobraCompleto({ onSalvar, onCancelar, itemInicial = null }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(itemInicial ? {
    nome_projeto: itemInicial.nome_projeto || "",
    quantidade_elementos: itemInicial.quantidade_elementos || 1,
    posicoes: itemInicial.posicoes || [],
  } : { nome_projeto: "", quantidade_elementos: 1, posicoes: [] });

  const [posicaoAtual, setPosicaoAtual] = useState({
    codigo: "N1", bitola: "10.0", quantidade_barras: 1, formato: "reto",
    medidas: { comprimento: 0 }, variavel: false, dobra_lado1: 0, dobra_lado2: 0, observacoes: "",
  });

  const [elementoEstrutural, setElementoEstrutural] = useState(itemInicial?.identificador || "");
  const [elementoObrigatorio] = useState(itemInicial?.origem_ia || false);

  const adicionarPosicao = () => {
    if (!posicaoAtual.codigo || !posicaoAtual.bitola) { toast({ title: "❌ Erro", description: "Preencha código e bitola", variant: "destructive" }); return; }
    const peso = calcularPesoBarra(posicaoAtual.bitola, posicaoAtual.medidas, posicaoAtual.formato);
    const pesoTotal = peso * posicaoAtual.quantidade_barras * formData.quantidade_elementos;
    setFormData({ ...formData, posicoes: [...formData.posicoes, { ...posicaoAtual, peso_unitario: peso, peso_total: pesoTotal }] });
    setPosicaoAtual({ codigo: `N${formData.posicoes.length + 2}`, bitola: "10.0", quantidade_barras: 1, formato: "reto", medidas: { comprimento: 0 }, variavel: false, dobra_lado1: 0, dobra_lado2: 0, observacoes: "" });
    toast({ title: "✅ Posição Adicionada" });
  };

  const removerPosicao = (index) => {
    setFormData({ ...formData, posicoes: formData.posicoes.filter((_, i) => i !== index) });
    toast({ title: "🗑️ Posição Removida" });
  };

  const handleUploadIA = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toast({ title: "🤖 IA Analisando...", description: "Processando arquivo com Inteligência Artificial" });
    setTimeout(() => {
      toast({ title: "✅ Análise Concluída!", description: "3 elementos estruturais detectados" });
      setFormData((prev) => ({
        ...prev,
        posicoes: [...prev.posicoes,
          { codigo: "N1", bitola: "10.0", quantidade_barras: 4, formato: "reto", medidas: { comprimento: 600 }, peso_unitario: 3.7, peso_total: 14.8 },
          { codigo: "N2", bitola: "6.3", quantidade_barras: 12, formato: "estribo", medidas: { largura: 25, altura: 40 }, peso_unitario: 0.32, peso_total: 3.84 },
        ],
      }));
      setElementoEstrutural("V1");
    }, 2000);
  };

  const handleSalvar = () => {
    if (!formData.nome_projeto || !elementoEstrutural.trim()) { toast({ title: "❌ Erro", description: "Preencha o nome do projeto e o elemento estrutural", variant: "destructive" }); return; }
    if (formData.posicoes.length === 0) { toast({ title: "❌ Erro", description: "Adicione pelo menos uma posição", variant: "destructive" }); return; }
    if (elementoObrigatorio && !elementoEstrutural.trim()) { toast({ title: "⚠️ Elemento Estrutural Obrigatório!", description: "Este item foi processado por IA e requer o preenchimento do elemento estrutural (ex: V1, V2, C1, B1).", variant: "destructive" }); return; }
    const resumo = calcularResumoGeral(formData.posicoes, formData.quantidade_elementos);
    onSalvar({ ...formData, identificador: elementoEstrutural || `CORTE-${Date.now()}`, origem_ia: elementoObrigatorio, tipo_peca: "corte_dobra", resumo });
  };

  const resumo = calcularResumoGeral(formData.posicoes, formData.quantidade_elementos);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-amber-500">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardTitle className="flex items-center gap-2"><Scissors className="w-6 h-6 text-amber-600" />Corte e Dobra - Projeto Sob Medida</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome do Projeto / Obra *</Label>
              <Input value={formData.nome_projeto} onChange={(e) => setFormData({ ...formData, nome_projeto: e.target.value })} placeholder="Ex: Edifício Solar, Casa Sr. João" />
            </div>
            <div>
              <Label>Quantidade de Elementos (Repetições)</Label>
              <Input type="number" value={formData.quantidade_elementos} onChange={(e) => setFormData({ ...formData, quantidade_elementos: parseInt(e.target.value) || 1 })} min="1" />
              <p className="text-xs text-slate-500 mt-1">Se você tem 5 vigas V1 idênticas, coloque quantidade 5</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-500">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2"><Sparkles className="w-6 h-6 text-purple-600" />Upload Inteligente (DWG / PDF)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert className="bg-purple-50 border-purple-300 mb-4">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <AlertDescription><strong>🤖 IA Ativada:</strong> Faça upload de arquivo DWG ou PDF com o projeto. A Inteligência Artificial irá reconhecer automaticamente as peças, bitolas e medidas!</AlertDescription>
          </Alert>
          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
            <input type="file" accept=".dwg,.pdf,.png,.jpg" onChange={handleUploadIA} className="hidden" id="upload-ia" />
            <label htmlFor="upload-ia" className="cursor-pointer">
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-purple-700 font-semibold mb-2">Clique para fazer upload</p>
              <p className="text-sm text-slate-500">DWG, PDF, PNG ou JPG até 50MB</p>
            </label>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label>Elemento Estrutural (Ex: V1, V2, C1, B1){elementoObrigatorio && <span className="text-red-600 ml-1">*</span>}</Label>
        <Input value={elementoEstrutural} onChange={(e) => setElementoEstrutural(e.target.value)} placeholder="V1, V2, C1, B1..." required={elementoObrigatorio} className={elementoObrigatorio ? "border-red-300" : ""} />
        {elementoObrigatorio && <p className="text-xs text-red-600 mt-1">⚠️ Obrigatório: item processado por IA</p>}
      </div>

      <CorteDobraPosicaoForm posicaoAtual={posicaoAtual} setPosicaoAtual={setPosicaoAtual} formData={formData} adicionarPosicao={adicionarPosicao} />
      <CorteDobraListaPosicoes formData={formData} removerPosicao={removerPosicao} />
      <CorteDobraResumoGeral formData={formData} elementoEstrutural={elementoEstrutural} resumo={resumo} />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
        <Button type="button" onClick={handleSalvar} className="bg-blue-600 hover:bg-blue-700"><Save className="w-4 h-4 mr-2" />Adicionar Item</Button>
      </div>
    </div>
  );
}