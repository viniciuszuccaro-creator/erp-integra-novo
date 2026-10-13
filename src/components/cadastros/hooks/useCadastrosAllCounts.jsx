import useEntityCounts from '@/components/lib/useEntityCounts';

// Entidades de cada bloco
export const BLOCOS_ENTITIES = {
  bloco1: ["Cliente","Fornecedor","Transportadora","Colaborador","Representante","ContatoB2B","SegmentoCliente","RegiaoAtendimento"],
  bloco2: ["Produto","Servico","SetorAtividade","GrupoProduto","Marca","TabelaPreco","KitProduto","CatalogoWeb","UnidadeMedida"],
  bloco3: ["Banco","FormaPagamento","PlanoDeContas","CentroCusto","CentroResultado","TipoDespesa","MoedaIndice","OperadorCaixa","ConfiguracaoDespesaRecorrente","TabelaFiscal","CondicaoComercial"],
  bloco4: ["Veiculo","Motorista","TipoFrete","LocalEstoque","RotaPadrao","ModeloDocumento"],
  bloco5: ["Empresa","GrupoEmpresarial","Departamento","Cargo","Turno","PerfilAcesso"],
  bloco6: ["ApiExterna","ChatbotCanal","ChatbotIntent","JobAgendado","Webhook","ConfiguracaoNFe","GatewayPagamento","EventoNotificacao"],
};

const ALL_ENTITIES = Object.values(BLOCOS_ENTITIES).flat();

export default function useCadastrosAllCounts() {
  const { counts, isLoading, isError, refetch } = useEntityCounts(ALL_ENTITIES);
  const totals = Object.fromEntries(Object.entries(BLOCOS_ENTITIES).map(([bloco, entities]) => [
    bloco,
    entities.every(e => Number.isFinite(counts[e])) ? entities.reduce((sum, e) => sum + counts[e], 0) : undefined,
  ]));
  return { counts, totals, isLoading, isError, refetch };
}