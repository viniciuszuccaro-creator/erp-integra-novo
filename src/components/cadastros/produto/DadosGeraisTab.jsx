import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Package, Upload, Calculator, CheckCircle2 } from 'lucide-react';

/**
 * Aba Dados Gerais do formulário de produto
 * Extraído de ProdutoFormV22_Completo para reduzir tamanho do arquivo
 */
export default function DadosGeraisTab({
  formData, setFormData, produto, todosProdutos,
  setores, grupos, marcas,
  iaSugestao, modoManual, processandoIA,
  analisarDescricaoIA, aplicarSugestaoIA, gerarImagemIA,
  uploadingFoto, handleUploadFoto, calculoConversao,
  carimbarContexto, createInContext, updateInContext, deleteInContext,
  contextoValido, podeCriar, podeEditar, podeExcluir
}) {
  return (
    <>
      <Card className="border-purple-200 bg-white/60 backdrop-blur-md shadow-lg">
        <CardContent className="p-4 space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-purple-900">
            <Package className="w-5 h-5" />
            Identificação do Produto
          </h3>

          <div>
            <Label>Descrição do Produto *</Label>
            <div className="flex gap-2">
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Ex: Vergalhão 8mm 12m CA-50"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => analisarDescricaoIA(formData.descricao)}
                disabled={processandoIA || modoManual}
              >
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
                    {iaSugestao.confianca && (
                      <Badge className="mt-2 bg-purple-600 text-white">Confiança: {iaSugestao.confianca}%</Badge>
                    )}
                  </div>
                  <Button size="sm" onClick={aplicarSugestaoIA} className="bg-purple-600">
                    Aplicar Tudo
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <strong className="text-blue-900">FASE 2:</strong> Classificação tripla obrigatória para rastreabilidade total
            </AlertDescription>
          </Alert>

          {/* TRIPLA CLASSIFICAÇÃO */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="flex items-center gap-2"><span className="text-indigo-600">🏭</span> Setor de Atividade *</Label>
              <Select
                value={formData.setor_atividade_id}
                onValueChange={(v) => {
                  const setor = setores.find(s => s.id === v);
                  setFormData(prev => ({ ...prev, setor_atividade_id: v, setor_atividade_nome: setor?.nome }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {setores.filter(s => s.ativo !== false).map(setor => (
                    <SelectItem key={setor.id} value={setor.id}>{setor.icone} {setor.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2"><span className="text-cyan-600">📦</span> Grupo de Produto *</Label>
              <Select
                value={formData.grupo_produto_id}
                onValueChange={(v) => {
                  const grupo = grupos.find(g => g.id === v);
                  setFormData(prev => ({
                    ...prev,
                    grupo_produto_id: v,
                    grupo_produto_nome: grupo?.nome_grupo,
                    ncm: grupo?.ncm_padrao || prev.ncm,
                    margem_minima_percentual: grupo?.margem_sugerida || prev.margem_minima_percentual
                  }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {grupos.filter(g => g.ativo !== false).map(grupo => (
                    <SelectItem key={grupo.id} value={grupo.id}>{grupo.icone} {grupo.nome_grupo} ({grupo.codigo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center gap-2"><span className="text-amber-600">🏆</span> Marca *</Label>
              <Select
                value={formData.marca_id}
                onValueChange={(v) => {
                  const marca = marcas.find(m => m.id === v);
                  setFormData(prev => ({ ...prev, marca_id: v, marca_nome: marca?.nome_marca }));
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {marcas.filter(m => m.ativo !== false).map(marca => (
                    <SelectItem key={marca.id} value={marca.id}>{marca.pais_origem !== 'Brasil' && '🌍'} {marca.nome_marca}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.setor_atividade_nome && formData.grupo_produto_nome && formData.marca_nome && (
            <Alert className="border-green-300 bg-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <AlertDescription className="text-sm text-green-900">
                <strong>Classificação Completa:</strong> {formData.setor_atividade_nome} → {formData.grupo_produto_nome} → {formData.marca_nome}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Código/SKU *</Label>
              <Input
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="0001"
                required
              />
              <p className="text-xs text-slate-500 mt-1">{produto ? 'Código do produto' : `Próximo: ${formData.codigo}`}</p>
            </div>
            <div>
              <Label>Código de Barras</Label>
              <Input
                value={formData.codigo_barras}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo_barras: e.target.value }))}
                placeholder="7891234567890"
              />
            </div>
            <div>
              <Label>Tipo de Item</Label>
              <Select value={formData.tipo_item} onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_item: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Revenda">Revenda</SelectItem>
                  <SelectItem value="Matéria-Prima Produção">Matéria-Prima Produção</SelectItem>
                  <SelectItem value="Produto Acabado">Produto Acabado</SelectItem>
                  <SelectItem value="Consumo Interno">Consumo Interno</SelectItem>
                  <SelectItem value="Serviço">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Foto do Produto</Label>
            <div className="flex items-center gap-4">
              {formData.foto_produto_url && (
                <img src={formData.foto_produto_url} alt="Produto" className="w-20 h-20 object-cover rounded border" />
              )}
              <div className="flex-1 flex gap-2">
                <input type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" id="foto-upload" />
                <label htmlFor="foto-upload" className="flex-1">
                  <Button type="button" variant="outline" size="sm" disabled={uploadingFoto} className="w-full" asChild>
                    <span>
                      {uploadingFoto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {formData.foto_produto_url ? 'Alterar' : 'Upload'}
                    </span>
                  </Button>
                </label>
                {!modoManual && (
                  <Button
                    type="button" size="sm"
                    onClick={gerarImagemIA}
                    disabled={uploadingFoto}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {uploadingFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* É BITOLA? */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-dashed">
        <div>
          <Label className="text-base font-semibold">É uma Bitola de Aço?</Label>
          <p className="text-xs text-slate-500">Habilita campos específicos e conversão PÇ ↔ KG ↔ MT</p>
        </div>
        <Switch
          checked={formData.eh_bitola}
          onCheckedChange={(v) => {
            setFormData(prev => ({ ...prev, eh_bitola: v }));
            if (v) {
              setFormData(prev => ({ ...prev, unidade_principal: 'KG', unidades_secundarias: ['PÇ', 'KG', 'MT'] }));
            }
          }}
        />
      </div>

      {/* CAMPOS DE BITOLA */}
      {formData.eh_bitola && (
        <Card className="border-blue-300 bg-white/60 backdrop-blur-md shadow-lg">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-bold text-blue-900">📏 Especificações da Bitola</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Diâmetro (mm) *</Label>
                <Input
                  type="number" step="0.1"
                  value={formData.bitola_diametro_mm}
                  onChange={(e) => setFormData(prev => ({ ...prev, bitola_diametro_mm: parseFloat(e.target.value) || 0 }))}
                  placeholder="8.0"
                />
              </div>
              <div>
                <Label>Peso Teórico (kg/m) *</Label>
                <Input
                  type="number" step="0.001"
                  value={formData.peso_teorico_kg_m}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso_teorico_kg_m: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.395"
                />
              </div>
              <div>
                <Label>Tipo de Aço</Label>
                <Select value={formData.tipo_aco} onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_aco: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CA-25">CA-25</SelectItem>
                    <SelectItem value="CA-50">CA-50</SelectItem>
                    <SelectItem value="CA-60">CA-60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>Comprimento Padrão da Barra (metros)</Label>
                <Input
                  type="number" step="0.1"
                  value={formData.comprimento_barra_padrao_m}
                  onChange={(e) => setFormData(prev => ({ ...prev, comprimento_barra_padrao_m: parseFloat(e.target.value) || 12 }))}
                  placeholder="12"
                />
              </div>
            </div>

            {calculoConversao && (
              <Alert className="border-green-300 bg-green-50">
                <Calculator className="w-4 h-4 text-green-700" />
                <AlertDescription>
                  <p className="font-semibold text-sm text-green-900 mb-2">✅ Conversões Calculadas:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
                    <p>• 1 PÇ = <strong>{calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
                    <p>• 1 MT = <strong>{calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
                    <p>• 1 TON = <strong>{calculoConversao.peca_por_ton.toFixed(1)} PÇ</strong></p>
                    <p>• 1 PÇ = <strong>{calculoConversao.metros_por_peca} MT</strong></p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}