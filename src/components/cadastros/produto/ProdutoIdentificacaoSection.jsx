import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Package, Upload, Factory, CheckCircle2 } from "lucide-react";

export default function ProdutoIdentificacaoSection({
  formData, setFormData, modoManual, setModoManual,
  iaSugestao, processandoIA, uploadingFoto,
  analisarDescricaoIA, aplicarSugestaoIA, handleUploadFoto, enviarParaProducao,
}) {
  return (
    <>
      <Alert className="border-blue-300 bg-blue-50">
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-blue-900">🤖 Assistência de IA</p>
              <p className="text-xs text-blue-700">A IA pode sugerir NCM, grupo, bitola e unidades automaticamente</p>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Preencher manualmente (ignorar IA)</Label>
              <Switch checked={modoManual} onCheckedChange={setModoManual} />
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-purple-900"><Package className="w-5 h-5" /> Identificação do Produto</h3>
          <div>
            <Label>Descrição do Produto *</Label>
            <div className="flex gap-2">
              <Input value={formData.descricao} onChange={(e) => setFormData(prev => ({...prev, descricao: e.target.value}))} placeholder="Ex: Vergalhão 8mm 12m CA-50" className="flex-1" />
              <Button type="button" size="sm" variant="outline" onClick={() => analisarDescricaoIA(formData.descricao)} disabled={processandoIA || modoManual}>
                {processandoIA ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-1">✨ IA preenche automaticamente NCM, peso e unidades</p>
          </div>

          {iaSugestao && !modoManual && (
            <Alert className="border-purple-300 bg-purple-100">
              <AlertDescription>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm text-purple-900 mb-1">🤖 IA Classificou:</p>
                    <p className="text-xs text-purple-800">{iaSugestao.explicacao}</p>
                    <div className="text-xs text-purple-700 mt-2 space-y-1">
                      {iaSugestao.eh_bitola && <p>• <strong>É bitola:</strong> Sim</p>}
                      {iaSugestao.peso_teorico_kg_m > 0 && <p>• <strong>Peso Teórico (kg/m):</strong> {iaSugestao.peso_teorico_kg_m}</p>}
                      {iaSugestao.bitola_diametro_mm > 0 && <p>• <strong>Diâmetro (mm):</strong> {iaSugestao.bitola_diametro_mm}</p>}
                      {iaSugestao.tipo_aco && <p>• <strong>Tipo de Aço:</strong> {iaSugestao.tipo_aco}</p>}
                      {iaSugestao.ncm && <p>• <strong>NCM:</strong> {iaSugestao.ncm}</p>}
                      {iaSugestao.grupo_produto && <p>• <strong>Grupo:</strong> {iaSugestao.grupo_produto}</p>}
                      {iaSugestao.unidade_principal && <p>• <strong>Unidade Principal:</strong> {iaSugestao.unidade_principal}</p>}
                      {iaSugestao.unidades_secundarias?.length > 0 && <p>• <strong>Unidades Habilitadas:</strong> {iaSugestao.unidades_secundarias.join(', ')}</p>}
                    </div>
                  </div>
                  <Button size="sm" data-permission="Cadastros.Produto.editar" onClick={aplicarSugestaoIA} className="bg-purple-600">Aplicar Tudo</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {modoManual && iaSugestao && (
            <Alert className="border-orange-200 bg-orange-50"><AlertDescription className="text-sm text-orange-900">ℹ️ <strong>Modo Manual Ativo:</strong> IA encontrou sugestões, mas não as aplicará automaticamente. Você pode revisar: {iaSugestao.explicacao}</AlertDescription></Alert>
          )}

          {processandoIA && !modoManual && (formData.descricao || '').length >= 5 && !iaSugestao && (
            <Alert className="border-blue-200 bg-blue-50"><AlertDescription className="flex items-center text-sm text-blue-900"><Loader2 className="w-4 h-4 mr-2 animate-spin" /><span>Analisando descrição com IA...</span></AlertDescription></Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código/SKU</Label>
              <Input value={formData.codigo} onChange={(e) => setFormData(prev => ({...prev, codigo: e.target.value}))} placeholder="SKU-001" />
            </div>
            <div>
              <Label>Tipo de Item</Label>
              <Select value={formData.tipo_item} onValueChange={(v) => { setFormData(prev => ({...prev, tipo_item: v})); if (v === 'Matéria-Prima Produção') setModoManual(false); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revenda">Revenda</SelectItem>
                  <SelectItem value="Matéria-Prima Produção">Matéria-Prima Produção</SelectItem>
                  <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tipo_item !== 'Matéria-Prima Produção' && (
            <Alert className="border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-orange-900 mb-1">🏭 Usar este produto na Produção?</p>
                    <p className="text-xs text-orange-700">Converte para Matéria-Prima e habilita uso em Ordens de Produção</p>
                  </div>
                  <Button type="button" variant="outline" className="bg-orange-600 text-white hover:bg-orange-700 border-orange-600" onClick={enviarParaProducao}><Factory className="w-4 h-4 mr-2" /> Enviar para Produção</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {formData.tipo_item === 'Matéria-Prima Produção' && (
            <Alert className="border-green-300 bg-green-50"><CheckCircle2 className="w-4 h-4 text-green-700" /><AlertDescription className="text-sm text-green-900">✅ <strong>Produto configurado para Produção</strong> - Disponível em Ordens de Produção e Fábrica</AlertDescription></Alert>
          )}

          <div>
            <Label>Foto do Produto</Label>
            <div className="flex items-center gap-4">
              {formData.foto_produto_url && <img src={formData.foto_produto_url} alt="Produto" className="w-20 h-20 object-cover rounded border" />}
              <div className="flex-1">
                <input type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" id="foto-upload" />
                <label htmlFor="foto-upload">
                  <Button type="button" variant="outline" size="sm" disabled={uploadingFoto} asChild>
                    <span>{uploadingFoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}{formData.foto_produto_url ? 'Alterar Foto' : 'Upload Foto'}</span>
                  </Button>
                </label>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">📸 Usada em Pedidos, E-commerce e Portal</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}