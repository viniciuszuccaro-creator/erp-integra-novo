import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from "@/components/lib/usePermissions";
import { toast } from 'sonner';

const TIPOS_PAGAMENTO = ['Dinheiro', 'PIX', 'Boleto', 'Cartão Crédito', 'Cartão Débito', 'Transferência', 'Cheque', 'Crédito em Conta', 'Fidelidade/Cashback', 'Outro'];
const ICONES = [{ icon: '💵', label: 'Dinheiro' }, { icon: '⚡', label: 'PIX' }, { icon: '📄', label: 'Boleto' }, { icon: '💳', label: 'Cartão' }, { icon: '🏦', label: 'Banco' }, { icon: '📝', label: 'Cheque' }, { icon: '🎁', label: 'Crédito' }, { icon: '🏆', label: 'Fidelidade' }];

export { TIPOS_PAGAMENTO, ICONES };

const gerarConfiguracaoParcelas = (maxParcelas) => {
  const config = [];
  for (let i = 1; i <= maxParcelas; i++) config.push({ numero_parcela: i, dias_vencimento: 30 * i, taxa_percentual: i === 1 ? 0 : 1.99 });
  return config;
};

/**
 * Hook extraído de FormaPagamentoFormCompleto.jsx
 * Encapsula estado, queries, handlers de forma de pagamento.
 */
export default function useFormaPagamentoForm({ formaPagamento, item, data, onSubmit, onSave, onClose }) {
  const formaPagamentoNorm = formaPagamento || item || data;
  const [abaAtiva, setAbaAtiva] = useState('geral');
  const { empresaAtual, grupoAtual, contextoAtual, filterInContext } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || formaPagamentoNorm?.group_id || null;
  const contextoValido = Boolean(empresaAtual?.id || groupId || formaPagamentoNorm?.empresa_id || formaPagamentoNorm?.group_id);
  const podeCriar = hasPermission?.("Cadastros.FormaPagamento.criar") || hasPermission?.("Financeiro.FormaPagamento.criar");
  const podeEditar = hasPermission?.("Cadastros.FormaPagamento.editar") || hasPermission?.("Financeiro.FormaPagamento.editar");
  const podeSalvar = formaPagamentoNorm?.id ? podeEditar : podeCriar;

  const { data: bancos = [] } = useQuery({ queryKey: ['bancos', groupId, empresaAtual?.id], queryFn: () => filterInContext('Banco', {}, 'nome_banco', 200), enabled: contextoValido });
  const { data: gateways = [] } = useQuery({ queryKey: ['gateways-pagamento', groupId, empresaAtual?.id], queryFn: () => filterInContext('GatewayPagamento', { ativo: true }, 'nome', 200), enabled: contextoValido });

  const [formData, setFormData] = useState(() => formaPagamentoNorm || {
    group_id: contextoAtual === 'grupo' ? empresaAtual?.group_id : undefined,
    empresa_id: contextoAtual === 'empresa' ? empresaAtual?.id : undefined,
    codigo: '', descricao: '', tipo: 'Dinheiro', ativa: true,
    aceita_desconto: true, percentual_desconto_padrao: 0, aplicar_acrescimo: false, percentual_acrescimo_padrao: 0,
    prazo_compensacao_dias: 0, gerar_cobranca_online: false, integracao_obrigatoria: false,
    permite_parcelamento: false, maximo_parcelas: 1, intervalo_parcelas_dias: 30, taxa_por_parcela: 0,
    configuracao_parcelas_cartao: [], icone: '💵', cor: '#10b981', ordem_exibicao: 0,
    disponivel_ecommerce: false, disponivel_pdv: true, observacoes: ''
  });

  useEffect(() => { if (formaPagamentoNorm?.id) setFormData({ ...formaPagamentoNorm }); }, [formaPagamentoNorm?.id]);

  const handleMaxParcelasChange = (novoMax) => {
    setFormData({ ...formData, maximo_parcelas: novoMax, configuracao_parcelas_cartao: formData.tipo === 'Cartão Crédito' ? gerarConfiguracaoParcelas(novoMax) : formData.configuracao_parcelas_cartao });
  };

  const atualizarParcelaIndividual = (numeroParcela, campo, valor) => {
    const novaConfig = [...(formData.configuracao_parcelas_cartao || [])];
    const index = novaConfig.findIndex(p => p.numero_parcela === numeroParcela);
    if (index >= 0) novaConfig[index] = { ...novaConfig[index], [campo]: parseFloat(valor) || 0 };
    setFormData({ ...formData, configuracao_parcelas_cartao: novaConfig });
  };

  const handleSubmit = async () => {
    if (!formData.codigo || !formData.descricao) { toast.error('Preencha código e descrição'); return; }
    if (!contextoValido) { toast.error('Selecione um grupo ou empresa antes de salvar.'); return; }
    if (!podeSalvar) { toast.error('Sem permissão para salvar forma de pagamento.'); return; }
    const payload = { ...formData, group_id: groupId || formData.group_id, empresa_id: contextoAtual === 'empresa' ? empresaAtual?.id : formData.empresa_id };
    if (onSubmit) onSubmit(payload);
    if (onSave) onSave();
    if (onClose) onClose();
  };

  return {
    formaPagamentoNorm, formData, setFormData, abaAtiva, setAbaAtiva,
    contextoValido, podeSalvar, bancos, gateways, groupId, contextoAtual,
    gerarConfiguracaoParcelas, handleMaxParcelasChange, atualizarParcelaIndividual, handleSubmit
  };
}