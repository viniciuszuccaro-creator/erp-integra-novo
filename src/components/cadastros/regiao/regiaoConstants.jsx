export const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const DEFAULT_FORM = {
  nome_regiao: "",
  codigo_regiao: "",
  descricao: "",
  tipo_regiao: "Personalizada",
  estados_abrangidos: [],
  cidades_abrangidas: [],
  cor_identificacao: "#3B82F6",
  vendedores_ids: [],
  transportadoras_preferenciais_ids: [],
  logistica: {
    prazo_entrega_padrao_dias: 0,
    custo_frete_base: 0,
    permite_entrega_expressa: false,
    prazo_entrega_expressa_dias: 0,
    acrescimo_frete_expresso_percentual: 0,
    distancia_centro_distribuicao_km: 0,
    dificuldade_acesso: "Fácil",
  },
  comercial: {
    meta_vendas_mensal: 0,
    comissao_extra_percentual: 0,
    desconto_maximo_permitido_percentual: 0,
    exige_aprovacao_acima_valor: 0,
    prioridade_atendimento: "Normal",
  },
  ativo: true,
  observacoes: "",
};