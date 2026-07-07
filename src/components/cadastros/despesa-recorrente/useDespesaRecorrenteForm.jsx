import { useState } from "react";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

const DEFAULT_FORM = {
  tipo_despesa_id: "",
  tipo_despesa_nome: "",
  descricao: "",
  categoria: "",
  fornecedor_id: "",
  fornecedor_nome: "",
  conta_contabil_id: "",
  conta_contabil_nome: "",
  centro_resultado_id: "",
  centro_resultado_nome: "",
  valor_base: 0,
  ajuste_inflacao: false,
  indice_ajuste: "Nenhum",
  percentual_ajuste_anual: 0,
  periodicidade: "Mensal",
  dia_vencimento: 5,
  meses_aplicacao: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  data_inicio: new Date().toISOString().split('T')[0],
  data_fim: "",
  forma_pagamento_id: "",
  forma_pagamento_nome: "",
  centro_custo_id: "",
  centro_custo_nome: "",
  gerar_automaticamente: true,
  antecedencia_dias: 5,
  notificar_criacao: true,
  usuarios_notificacao: [],
  rateio_automatico: false,
  empresas_rateio: [],
  ativa: true,
  empresa_id: "",
  origem: "empresa"
};

export const MESES_ANO = [
  { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" }, { value: 4, label: "Abril" },
  { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
  { value: 7, label: "Julho" }, { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" }, { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" }
];

export default function useDespesaRecorrenteForm(config, onSubmit) {
  const [formData, setFormData] = useState(config || DEFAULT_FORM);
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();

  const fornecedoresQ = useRLSQuery('Fornecedor', {}, 'nome_fantasia', 999);
  const centrosCustoQ = useRLSQuery('CentroCusto', {}, 'nome', 999);
  const formasPagamentoQ = useRLSQuery('FormaPagamento', {}, 'nome', 999);
  const empresasQ = useRLSQuery('Empresa', {}, 'nome_fantasia', 999);
  const tiposDespesaQ = useRLSQuery('TipoDespesa', { pode_ser_recorrente: true, ativo: true }, 'nome', 999);
  const planoContasQ = useRLSQuery('PlanoDeContas', {}, 'codigo', 999);
  const centrosResultadoQ = useRLSQuery('CentroResultado', {}, 'nome', 999);

  const queries = {
    fornecedores: fornecedoresQ,
    centrosCusto: centrosCustoQ,
    formasPagamento: formasPagamentoQ,
    empresas: empresasQ,
    tiposDespesa: tiposDespesaQ,
    planoContas: planoContasQ,
    centrosResultado: centrosResultadoQ,
  };

  const update = (patch) => setFormData(prev => ({ ...prev, ...patch }));

  const validate = () => {
    if (!formData.tipo_despesa_id) { toast.error("Selecione um Tipo de Despesa."); return false; }
    if (!formData.descricao) { toast.error("Preencha a descrição da despesa."); return false; }
    if (!formData.valor_base || formData.valor_base <= 0) { toast.error("O valor base deve ser maior que zero."); return false; }
    if (!formData.periodicidade) { toast.error("Selecione a periodicidade da despesa."); return false; }
    if (!formData.empresa_id && formData.origem === 'empresa' && !formData.rateio_automatico) { toast.error("Selecione a empresa para a despesa ou configure o rateio."); return false; }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ ...formData, nome: formData.descricao || formData.tipo_despesa_nome || '' });
  };

  return {
    formData, setFormData, update, handleSubmit, MESES_ANO,
    fornecedores: queries.fornecedores.data || [],
    centrosCusto: queries.centrosCusto.data || [],
    formasPagamento: queries.formasPagamento.data || [],
    empresas: queries.empresas.data || [],
    tiposDespesa: queries.tiposDespesa.data || [],
    planoContas: queries.planoContas.data || [],
    centrosResultado: queries.centrosResultado.data || [],
  };
}