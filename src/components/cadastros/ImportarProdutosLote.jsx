import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.1.2 - IMPORTAR PRODUTOS EM LOTE (CSV/XLSX)
 * Com mapeamento de colunas e preview antes de salvar
 */
export default function ImportarProdutosLote({ onProdutosCriados, onClose }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [dadosParsed, setDadosParsed] = useState(null);
  const [mapeamento, setMapeamento] = useState({
    descricao: '',
    codigo: '',
    ncm: '',
    unidade_medida: '',
    custo_aquisicao: '',
    preco_venda: '',
    peso_teorico_kg_m: '',
    grupo: ''
  });

  const handleUploadArquivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArquivo(file);
    setProcessando(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extrair dados com IA
      const resultado = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            colunas: {
              type: "array",
              items: { type: "string" }
            },
            linhas: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: true
              }
            }
          }
        }
      });

      if (resultado.status === 'success') {
        setDadosParsed(resultado.output);
        
        // Tentar mapear automaticamente
        const colunasAuto = {};
        resultado.output.colunas.forEach(col => {
          const colLower = col.toLowerCase();
          if (colLower.includes('descri') || colLower.includes('nome')) colunasAuto.descricao = col;
          if (colLower.includes('codigo') || colLower.includes('sku')) colunasAuto.codigo = col;
          if (colLower.includes('ncm')) colunasAuto.ncm = col;
          if (colLower.includes('unidade') || colLower.includes('un')) colunasAuto.unidade_medida = col;
          if (colLower.includes('custo')) colunasAuto.custo_aquisicao = col;
          if (colLower.includes('preco') || colLower.includes('venda')) colunasAuto.preco_venda = col;
          if (colLower.includes('peso')) colunasAuto.peso_teorico_kg_m = col;
          if (colLower.includes('grupo') || colLower.includes('categoria')) colunasAuto.grupo = col;
        });
        setMapeamento(colunasAuto);
        
        toast.success(`✅ ${resultado.output.linhas.length} linhas encontradas`);
      } else {
        toast.error('❌ Erro ao processar arquivo: ' + resultado.details);
      }
    } catch (error) {
      toast.error('❌ Erro: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleCriarProdutos = async () => {
    if (!dadosParsed || !mapeamento.descricao) {
      toast.error('Configure o mapeamento de colunas');
      return;
    }

    setProcessando(true);

    try {
      const produtosCriados = [];

      for (const linha of dadosParsed.linhas) {
        const novoProduto = {
          descricao: linha[mapeamento.descricao] || '',
          codigo: mapeamento.codigo ? linha[mapeamento.codigo] : '',
          ncm: mapeamento.ncm ? linha[mapeamento.ncm] : '',
          unidade_medida: mapeamento.unidade_medida ? linha[mapeamento.unidade_medida] : 'UN',
          unidade_principal: mapeamento.unidade_medida ? linha[mapeamento.unidade_medida] : 'UN',
          unidades_secundarias: mapeamento.unidade_medida ? [linha[mapeamento.unidade_medida]] : ['UN'],
          custo_aquisicao: mapeamento.custo_aquisicao ? parseFloat(linha[mapeamento.custo_aquisicao]) || 0 : 0,
          preco_venda: mapeamento.preco_venda ? parseFloat(linha[mapeamento.preco_venda]) || 0 : 0,
          peso_teorico_kg_m: mapeamento.peso_teorico_kg_m ? parseFloat(linha[mapeamento.peso_teorico_kg_m]) || 0 : 0,
          grupo: mapeamento.grupo ? linha[mapeamento.grupo] : 'Outros',
          tipo_item: 'Revenda',
          status: 'Ativo',
          empresa_id: empresaAtual?.id,
          group_id: grupoAtual?.id || empresaAtual?.group_id,
        };

        // IA pode sugerir eh_bitola se tiver peso_teorico
        if (novoProduto.peso_teorico_kg_m > 0 && novoProduto.descricao.toLowerCase().includes('barra')) {
          novoProduto.eh_bitola = true;
        }

        const produtoCriado = await base44.entities.Produto.create(novoProduto);
        produtosCriados.push(produtoCriado);
      }

      toast.success(`✅ ${produtosCriados.length} produtos criados!`);
      onProdutosCriados && onProdutosCriados(produtosCriados);
      onClose && onClose();
    } catch (error) {
      toast.error('❌ Erro ao criar produtos: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="border-purple-200 bg-purple-50">
        <FileSpreadsheet className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          📊 <strong>Importação em Lote:</strong> Envie CSV ou XLSX com seus produtos
        </AlertDescription>
      </Alert>

      {/* UPLOAD */}
      {!dadosParsed && (
        <Card>
          <CardContent className="p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleUploadArquivo}
              className="hidden"
              id="lote-upload"
              disabled={processando}
            />
            <label htmlFor="lote-upload">
              <Button variant="outline" size="lg" disabled={processando} asChild>
                <span>
                  {processando ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {processando ? 'Processando...' : 'Selecionar Arquivo'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-slate-500 mt-3">Formatos: .csv, .xlsx, .xls</p>
          </CardContent>
        </Card>
      )}

      {/* MAPEAMENTO */}
      {dadosParsed && (
        <>
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Mapeamento de Colunas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold">Descrição do Produto *</label>
                  <Select value={mapeamento.descricao} onValueChange={(v) => setMapeamento({...mapeamento, descricao: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      {dadosParsed.colunas.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Código/SKU</label>
                  <Select value={mapeamento.codigo} onValueChange={(v) => setMapeamento({...mapeamento, codigo: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="(Opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhuma</SelectItem>
                      {dadosParsed.colunas.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold">NCM</label>
                  <Select value={mapeamento.ncm} onValueChange={(v) => setMapeamento({...mapeamento, ncm: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="(Opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhuma</SelectItem>
                      {dadosParsed.colunas.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Unidade</label>
                  <Select value={mapeamento.unidade_medida} onValueChange={(v) => setMapeamento({...mapeamento, unidade_medida: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="(Opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhuma</SelectItem>
                      {dadosParsed.colunas.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Custo</label>
                  <Select value={mapeamento.custo_aquisicao} onValueChange={(v) => setMapeamento({...mapeamento, custo_aquisicao: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="(Opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhuma</SelectItem>
                      {dadosParsed.colunas.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Preço Venda</label>
                  <Select value={mapeamento.preco_venda} onValueChange={(v) => setMapeamento({...mapeamento, preco_venda: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="(Opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhuma</SelectItem>
                      {dadosParsed.colunas.map(col => (
                        <SelectItem key={col} value={col}>{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PREVIEW */}
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Preview ({dadosParsed.linhas.length} produtos)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dadosParsed.linhas.slice(0, 10).map((linha, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded text-sm border">
                    <p className="font-semibold">
                      {mapeamento.descricao ? linha[mapeamento.descricao] : '(Sem descrição)'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {mapeamento.codigo && `Código: ${linha[mapeamento.codigo]} • `}
                      {mapeamento.ncm && `NCM: ${linha[mapeamento.ncm]} • `}
                      {mapeamento.unidade_medida && `Un: ${linha[mapeamento.unidade_medida]}`}
                    </p>
                  </div>
                ))}
              </div>
              {dadosParsed.linhas.length > 10 && (
                <p className="text-xs text-slate-500 mt-2 text-center">
                  ... e mais {dadosParsed.linhas.length - 10} linhas
                </p>
              )}
            </CardContent>
          </Card>

          {/* AÇÕES */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border rounded-lg">
            <div className="text-sm">
              <p className="font-semibold text-slate-900">{dadosParsed.linhas.length} produtos serão criados</p>
              <p className="text-xs text-slate-600">IA pode sugerir melhorias durante a criação</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button 
                data-permission="Cadastros.Produto.importar"
                onClick={handleCriarProdutos}
                disabled={processando || !mapeamento.descricao}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {processando ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Criar Todos
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}