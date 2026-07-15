import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, XCircle, AlertTriangle, Building2, TrendingUp, FileText } from 'lucide-react';
import ResumoNFeCard from './importar-xml/ResumoNFeCard';
import ItensTabela from './importar-xml/ItensTabela';
import DuplicatasTabela from './importar-xml/DuplicatasTabela';
import OpcoesImportacao from './importar-xml/OpcoesImportacao';
import useImportarXMLNFe from './importar-xml/useImportarXMLNFe';
import { toast } from 'sonner';
import { parseNFeXML, validarXMLNFe, lerArquivoXML } from '../lib/parserXMLNFe';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Componente de Importação de XML de NF-e
 * Processa XML, cria fornecedor, ordem de compra, entrada de estoque e contas a pagar
 * Lógica de importação extraída para useImportarXMLNFe hook (Regra-Mãe)
 */
export default function ImportarXMLNFe({ empresaId }) {
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [dadosNFe, setDadosNFe] = useState(null);
  const [erros, setErros] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [opcoes, setOpcoes] = useState({
    criarFornecedor: true,
    criarProdutos: true,
    criarOrdemCompra: true,
    darEntradaEstoque: true,
    criarContasPagar: true
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', contextoKey],
    queryFn: () => filterInContext('Produto', {}, 'descricao', 999),
    enabled: !!contexto,
  });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores', contextoKey],
    queryFn: () => filterInContext('Fornecedor', {}, 'nome_fantasia', 999),
    enabled: !!contexto,
  });

  // Hook extraído com toda a lógica de importação multiempresa
  const { importarMutation } = useImportarXMLNFe({ arquivo, dadosNFe, opcoes, empresaId });

  // Processar arquivo XML
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      toast.error('Por favor, selecione um arquivo XML');
      return;
    }

    setArquivo(file);
    setProcessando(true);
    setErros([]);
    setAvisos([]);
    setDadosNFe(null);

    try {
      const xmlString = await lerArquivoXML(file);
      const validacao = validarXMLNFe(xmlString);
      if (!validacao.valido) {
        setErros(validacao.erros);
        setProcessando(false);
        toast.error('XML inválido');
        return;
      }

      const dados = parseNFeXML(xmlString);
      const fornecedorExistente = fornecedores.find(f => f.cnpj === dados.fornecedor.cnpj);

      const itensMapeados = dados.itens.map(item => {
        const produtoEncontrado = produtos.find(p =>
          p.codigo === item.codigo_produto ||
          p.codigo_barras === item.codigo_ean ||
          p.descricao?.toLowerCase() === item.descricao?.toLowerCase()
        );
        return {
          ...item,
          produto_id_mapeado: produtoEncontrado?.id || null,
          produto_encontrado: !!produtoEncontrado,
          produto_descricao_sistema: produtoEncontrado?.descricao || null
        };
      });

      const produtosNaoMapeados = itensMapeados.filter(i => !i.produto_encontrado);
      const avisosTemp = [];
      if (fornecedorExistente) {
        avisosTemp.push(`Fornecedor "${fornecedorExistente.nome}" já existe no sistema`);
      }
      if (produtosNaoMapeados.length > 0) {
        avisosTemp.push(`${produtosNaoMapeados.length} produto(s) não encontrado(s) - serão criados automaticamente`);
      }

      setDadosNFe({
        ...dados,
        fornecedorExistente,
        itensMapeados,
        produtosNaoMapeados,
        xmlOriginal: xmlString
      });
      setAvisos(avisosTemp);
      setProcessando(false);
      toast.success('XML processado com sucesso!');
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      setErros([error.message]);
      setProcessando(false);
      toast.error('Erro ao processar XML');
    }
  };

  return (
    <div className="w-full h-full space-y-6">
      {/* Upload */}
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Importar XML de NF-e
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Envie o XML da Nota Fiscal de Entrada para processar automaticamente
            </p>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="hidden"
              id="xml-upload"
              disabled={processando}
            />
            <label htmlFor="xml-upload">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <span>
                  {processando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processando XML...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Selecionar Arquivo XML
                    </>
                  )}
                </span>
              </Button>
            </label>
            {arquivo && (
              <p className="text-xs text-blue-600 mt-3">📎 {arquivo.name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Erros */}
      {erros.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <XCircle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <p className="font-semibold text-red-900 mb-2">Erros ao processar XML:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {erros.map((erro, i) => <li key={i}>{erro}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Avisos */}
      {avisos.length > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <AlertDescription>
            <p className="font-semibold text-orange-900 mb-2">Avisos:</p>
            <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
              {avisos.map((aviso, i) => <li key={i}>{aviso}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview dos Dados */}
      {dadosNFe && (
        <div className="space-y-6">
          <ResumoNFeCard dadosNFe={dadosNFe} />

          {/* Dados do Fornecedor */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Fornecedor
                {dadosNFe.fornecedorExistente ? (
                  <Badge className="bg-green-600">Já Cadastrado</Badge>
                ) : (
                  <Badge className="bg-blue-600">Será Criado</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600">Razão Social</p>
                  <p className="font-semibold">{dadosNFe.fornecedor.razao_social}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">CNPJ</p>
                  <p className="font-mono font-semibold">{dadosNFe.fornecedor.cnpj}</p>
                </div>
                {dadosNFe.fornecedor.inscricao_estadual && (
                  <div>
                    <p className="text-xs text-slate-600">Inscrição Estadual</p>
                    <p className="font-semibold">{dadosNFe.fornecedor.inscricao_estadual}</p>
                  </div>
                )}
                {dadosNFe.fornecedor.endereco && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-600 mb-1">Endereço</p>
                    <p className="text-sm">
                      {dadosNFe.fornecedor.endereco.logradouro}, {dadosNFe.fornecedor.endereco.numero}<br />
                      {dadosNFe.fornecedor.endereco.bairro} - {dadosNFe.fornecedor.endereco.cidade}/{dadosNFe.fornecedor.endereco.estado}<br />
                      CEP: {dadosNFe.fornecedor.endereco.cep}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <ItensTabela itens={dadosNFe.itensMapeados} quantidadeItens={dadosNFe.quantidadeItens} />
          <DuplicatasTabela duplicatas={dadosNFe.duplicatas} />
          <OpcoesImportacao opcoes={opcoes} setOpcoes={setOpcoes} dadosNFe={dadosNFe} />

          {/* Resumo de Valores */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">Produtos</p>
                  <p className="text-lg font-bold text-blue-600">
                    R$ {dadosNFe.valores.produtos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">ICMS</p>
                  <p className="text-lg font-bold text-purple-600">
                    R$ {dadosNFe.valores.icms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">IPI</p>
                  <p className="text-lg font-bold text-orange-600">
                    R$ {dadosNFe.valores.ipi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-600 mb-1">Frete</p>
                  <p className="text-lg font-bold text-yellow-600">
                    R$ {dadosNFe.valores.frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <p className="text-xs text-green-700 mb-1">TOTAL NF-e</p>
                  <p className="text-xl font-bold text-green-700">
                    R$ {dadosNFe.valores.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => { setDadosNFe(null); setArquivo(null); setErros([]); setAvisos([]); }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => importarMutation.mutate()}
              disabled={importarMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {importarMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}