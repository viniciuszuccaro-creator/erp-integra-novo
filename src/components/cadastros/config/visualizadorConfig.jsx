/**
 * visualizadorConfig.js — Configurações centrais do VisualizadorUniversalEntidadeV24
 * Extraído no Ciclo 24 (Regra-Mãe: centralizar constantes reutilizadas)
 */
import CadastroClienteCompleto from "@/components/cadastros/CadastroClienteCompleto";
import CadastroFornecedorCompleto from "@/components/cadastros/CadastroFornecedorCompleto";
import TransportadoraForm from "@/components/cadastros/TransportadoraForm";
import ColaboradorForm from "@/components/rh/ColaboradorForm";
import RepresentanteFormCompleto from "@/components/cadastros/RepresentanteFormCompleto";
import ContatoB2BForm from "@/components/cadastros/ContatoB2BForm";
import SegmentoClienteForm from "@/components/cadastros/SegmentoClienteForm";
import RegiaoAtendimentoForm from "@/components/cadastros/RegiaoAtendimentoForm";

export const DEFAULT_FORM_COMPONENTS = {
  Cliente: CadastroClienteCompleto,
  Fornecedor: CadastroFornecedorCompleto,
  Transportadora: TransportadoraForm,
  Colaborador: ColaboradorForm,
  Representante: RepresentanteFormCompleto,
  ContatoB2B: ContatoB2BForm,
  SegmentoCliente: SegmentoClienteForm,
  RegiaoAtendimento: RegiaoAtendimentoForm,
};

export const SELF_MANAGED_NAMES = new Set([
  "CadastroClienteCompleto", "CadastroFornecedorCompleto",
  "RepresentanteFormCompleto", "ProdutoFormV22_Completo",
  "ProdutoFormCompleto", "ProdutoForm",
]);

export const FORM_ALIASES = [
  "item","data","initialData","defaultValues","record","entity","value",
  "cliente","fornecedor","colaborador","transportadora","representante",
  "contato","contatoB2B","segmento","segmentoCliente","regiao","regiaoAtendimento",
  "produto","servico","banco","conta","formaPagamento","centroCusto","planoContas",
  "planoDeContas","veiculo","motorista","departamento","cargo","turno",
  "empresa","grupo","grupoEmpresarial","grupoProduto","marca","kitProduto",
  "catalogoWeb","unidade","unidadeMedida","setor","setorAtividade","tabelaPreco",
  "tipoDespesa","moedaIndice","moeda","operadorCaixa","operador",
  "tabelaFiscal","condicaoComercial","centroResultado","centro",
  "localEstoque","local","tipoFrete","rotaPadrao","rota",
  "gateway","gatewayPagamento","configuracaoDespesaRecorrente","despesaRecorrente",
  "perfilAcesso","perfil","modeloDocumento","apiExterna",
  "webhook","chatbotIntent","chatbotCanal","jobAgendado","eventoNotificacao",
  "evento","tabela","condicao","apiExternaForm","webhookForm",
];

export const ENTITY_CONTEXT_FIELD = {
  Fornecedor: "empresa_dona_id",
  Transportadora: "empresa_dona_id",
  Colaborador: "empresa_alocada_id",
};

export const SHARED_ENTITIES = new Set(["Cliente", "Fornecedor", "Transportadora"]);