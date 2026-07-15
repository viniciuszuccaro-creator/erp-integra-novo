import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { toast } from 'sonner';

/**
 * Hook extraído de ImportarXMLNFe — contém toda a lógica de importação
 * (criar fornecedor, produtos, OC, entrada estoque, contas a pagar)
 * com carimbagem multiempresa via createInContext.
 */
export function useImportarXMLNFe({ arquivo, dadosNFe, opcoes, empresaId }) {
  const queryClient = useQueryClient();
  const { carimbarContexto, createInContext, filterInContext, updateInContext } = useContextoVisual();

  const importarMutation = useMutation({
    mutationFn: async () => {
      const resultados = {
        fornecedor_id: null,
        ordem_compra_id: null,
        movimentacoes_ids: [],
        contas_pagar_ids: [],
        produtos_criados: []
      };

      // 1. Criar/Encontrar Fornecedor
      if (opcoes.criarFornecedor && !dadosNFe.fornecedorExistente) {
        const novoFornecedor = await createInContext('Fornecedor', {
          nome: dadosNFe.fornecedor.razao_social,
          nome_fantasia: dadosNFe.fornecedor.nome_fantasia,
          cnpj: dadosNFe.fornecedor.cnpj,
          inscricao_estadual: dadosNFe.fornecedor.inscricao_estadual,
          endereco: dadosNFe.fornecedor.endereco
            ? `${dadosNFe.fornecedor.endereco.logradouro}, ${dadosNFe.fornecedor.endereco.numero}` : '',
          cidade: dadosNFe.fornecedor.endereco?.cidade,
          estado: dadosNFe.fornecedor.endereco?.estado,
          telefone: dadosNFe.fornecedor.endereco?.telefone,
          categoria: 'Matéria Prima',
          status: 'Ativo'
        });
        resultados.fornecedor_id = novoFornecedor.id;
      } else {
        resultados.fornecedor_id = dadosNFe.fornecedorExistente?.id;
      }

      // 2. Criar Produtos Não Mapeados
      if (opcoes.criarProdutos && dadosNFe.produtosNaoMapeados.length > 0) {
        for (const item of dadosNFe.produtosNaoMapeados) {
          const novoProduto = await createInContext('Produto', {
            codigo: item.codigo_produto,
            codigo_barras: item.codigo_ean,
            descricao: item.descricao,
            ncm: item.ncm,
            unidade_medida: item.unidade,
            grupo: 'Matéria Prima',
            tipo_item: 'Matéria-Prima Produção',
            custo_aquisicao: item.valor_unitario,
            custo_medio: item.valor_unitario,
            preco_venda: item.valor_unitario * 1.3,
            estoque_atual: 0,
            estoque_minimo: 0,
            status: 'Ativo',
            fornecedor_id: resultados.fornecedor_id,
            fornecedor_principal: dadosNFe.fornecedor.razao_social,
            ultima_compra: dadosNFe.dataEmissao,
            ultimo_preco_compra: item.valor_unitario
          });
          resultados.produtos_criados.push(novoProduto.id);
          const itemIndex = dadosNFe.itensMapeados.findIndex(i => i.codigo_produto === item.codigo_produto);
          if (itemIndex >= 0) {
            dadosNFe.itensMapeados[itemIndex].produto_id_mapeado = novoProduto.id;
          }
        }
      }

      // 3. Criar Ordem de Compra
      if (opcoes.criarOrdemCompra) {
        const ordemCompra = await createInContext('OrdemCompra', {
          numero_oc: `OC-NFE-${dadosNFe.numeroNFe}`,
          fornecedor_id: resultados.fornecedor_id,
          fornecedor_nome: dadosNFe.fornecedor.razao_social,
          data_solicitacao: dadosNFe.dataEmissao,
          data_entrega_real: dadosNFe.dataEmissao,
          valor_total: dadosNFe.valores.total,
          status: 'Recebida',
          itens: dadosNFe.itensMapeados.map(item => ({
            produto_id: item.produto_id_mapeado,
            codigo_sku: item.codigo_produto,
            descricao: item.descricao,
            quantidade_solicitada: item.quantidade,
            quantidade_recebida: item.quantidade,
            unidade: item.unidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total
          })),
          nota_fiscal_entrada: dadosNFe.numeroNFe,
          observacoes: `Importado de XML NF-e ${dadosNFe.numeroNFe}. Chave: ${dadosNFe.chaveAcesso}`
        });
        resultados.ordem_compra_id = ordemCompra.id;
      }

      // 4. Dar Entrada no Estoque
      if (opcoes.darEntradaEstoque) {
        for (const item of dadosNFe.itensMapeados) {
          if (!item.produto_id_mapeado) continue;
          const produtoAtual = await filterInContext('Produto', { id: item.produto_id_mapeado });
          if (produtoAtual.length === 0) continue;
          const produto = produtoAtual[0];
          const novoEstoque = (produto.estoque_atual || 0) + item.quantidade;
          await updateInContext('Produto', produto.id, {
            estoque_atual: novoEstoque,
            ultima_compra: dadosNFe.dataEmissao,
            ultimo_preco_compra: item.valor_unitario
          });
          const movimentacao = await createInContext('MovimentacaoEstoque', {
            origem_movimento: 'nfe',
            origem_documento_id: resultados.ordem_compra_id,
            tipo_movimento: 'entrada',
            produto_id: produto.id,
            produto_descricao: produto.descricao,
            codigo_produto: produto.codigo,
            quantidade: item.quantidade,
            unidade_medida: item.unidade,
            estoque_anterior: produto.estoque_atual || 0,
            estoque_atual: novoEstoque,
            data_movimentacao: new Date().toISOString(),
            documento: `NF-e ${dadosNFe.numeroNFe}`,
            motivo: `Entrada de compra - NF-e ${dadosNFe.numeroNFe}`,
            responsavel: 'Sistema - Importação XML',
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total,
            observacoes: `Importado de XML. Chave: ${dadosNFe.chaveAcesso}`
          });
          resultados.movimentacoes_ids.push(movimentacao.id);
        }
      }

      // 5. Criar Contas a Pagar
      if (opcoes.criarContasPagar && dadosNFe.duplicatas.length > 0) {
        for (const duplicata of dadosNFe.duplicatas) {
          let centro_custo_id = null; let plano_contas_id = null;
          try {
            const cfgs = await base44.entities.ConfiguracaoSistema.filter({ chave: 'mapa_xml_centro_custo', empresa_id: empresaId }, undefined, 1);
            const mapa = cfgs?.[0]?.valor_json || {};
            const chave = dadosNFe.fornecedor.cnpj;
            const mapFornecedor = mapa[chave] || {};
            centro_custo_id = mapFornecedor?.centro_custo_id || null;
            plano_contas_id = mapFornecedor?.plano_contas_id || null;
          } catch (e) { console.error('[importar-xml] catch:', e); }
          const conta = await createInContext('ContaPagar', {
            descricao: `NF-e ${dadosNFe.numeroNFe} - Parcela ${duplicata.numero}`,
            fornecedor: dadosNFe.fornecedor.razao_social,
            fornecedor_id: resultados.fornecedor_id,
            favorecido_cpf_cnpj: dadosNFe.fornecedor.cnpj,
            centro_custo_id,
            plano_contas_id,
            categoria: 'Fornecedores',
            valor: duplicata.valor,
            data_emissao: dadosNFe.dataEmissao,
            data_vencimento: duplicata.vencimento,
            status: 'Pendente',
            numero_documento: dadosNFe.numeroNFe,
            numero_parcela: duplicata.numero,
            nota_fiscal_id: null,
            ordem_compra_id: resultados.ordem_compra_id,
            origem_tipo: 'nfe', canal_origem: 'Importação',
            observacoes: `Importado de XML NF-e. Chave: ${dadosNFe.chaveAcesso}`
          });
          resultados.contas_pagar_ids.push(conta.id);
        }
      } else if (opcoes.criarContasPagar && dadosNFe.duplicatas.length === 0) {
        const conta = await createInContext('ContaPagar', {
          descricao: `NF-e ${dadosNFe.numeroNFe}`,
          fornecedor: dadosNFe.fornecedor.razao_social,
          fornecedor_id: resultados.fornecedor_id,
          favorecido_cpf_cnpj: dadosNFe.fornecedor.cnpj,
          categoria: 'Fornecedores',
          valor: dadosNFe.valores.total,
          data_emissao: dadosNFe.dataEmissao,
          data_vencimento: dadosNFe.dataEmissao,
          status: 'Pendente',
          numero_documento: dadosNFe.numeroNFe,
          ordem_compra_id: resultados.ordem_compra_id,
          observacoes: `Importado de XML NF-e. Chave: ${dadosNFe.chaveAcesso}`
        });
        resultados.contas_pagar_ids.push(conta.id);
      }

      return resultados;
    },
    onSuccess: async (resultados) => {
      const arquivoUpload = await base44.integrations.Core.UploadFile({ file: arquivo });
      await createInContext('ImportacaoXMLNFe', {
        numero_importacao: `IMP-${Date.now()}`,
        data_importacao: new Date().toISOString(),
        tipo_nfe: 'Entrada',
        arquivo_xml_nome: arquivo.name,
        arquivo_xml_url: arquivoUpload.file_url,
        chave_acesso: dadosNFe.chaveAcesso,
        numero_nfe: dadosNFe.numeroNFe,
        serie_nfe: dadosNFe.serieNFe,
        data_emissao: dadosNFe.dataEmissao,
        fornecedor_cnpj: dadosNFe.fornecedor.cnpj,
        fornecedor_nome: dadosNFe.fornecedor.razao_social,
        fornecedor_id: resultados.fornecedor_id,
        fornecedor_criado: !dadosNFe.fornecedorExistente,
        valor_total_nfe: dadosNFe.valores.total,
        valor_produtos: dadosNFe.valores.produtos,
        valor_icms: dadosNFe.valores.icms,
        valor_ipi: dadosNFe.valores.ipi,
        valor_pis: dadosNFe.valores.pis,
        valor_cofins: dadosNFe.valores.cofins,
        quantidade_itens: dadosNFe.quantidadeItens,
        itens_xml: dadosNFe.itensMapeados,
        status_processamento: 'Processado',
        validado_usuario: true,
        ordem_compra_criada: opcoes.criarOrdemCompra,
        ordem_compra_id: resultados.ordem_compra_id,
        entrada_estoque_realizada: opcoes.darEntradaEstoque,
        movimentacoes_estoque_ids: resultados.movimentacoes_ids,
        conta_pagar_criada: opcoes.criarContasPagar,
        contas_pagar_ids: resultados.contas_pagar_ids,
        produtos_criados_automaticamente: resultados.produtos_criados.length,
        produtos_nao_mapeados: dadosNFe.produtosNaoMapeados.map(p => p.codigo_produto),
        usuario_importacao: 'Sistema'
      });

      queryClient.invalidateQueries({ queryKey: ['fornecedores'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['ordens-compra'] });
      queryClient.invalidateQueries({ queryKey: ['movimentacoes-estoque'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['importacoes-xml'] });

      toast.success('✅ NF-e importada com sucesso!', {
        description: `${resultados.movimentacoes_ids.length} entrada(s) no estoque, ${resultados.contas_pagar_ids.length} conta(s) a pagar`
      });
    },
    onError: (error) => {
      console.error('Erro ao importar:', error);
      toast.error('❌ Erro ao importar NF-e', { description: error.message });
    }
  });

  return { importarMutation, carimbarContexto };
}

export default useImportarXMLNFe;