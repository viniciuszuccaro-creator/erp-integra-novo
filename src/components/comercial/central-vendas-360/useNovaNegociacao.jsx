// Abertura de negociação na Central 360° — cria a proposta (OrcamentoCliente) no contexto ativo
// Multiempresa: createInContext carimba group_id/empresa_id e audita; RBAC verificado antes de gravar.
import { useState } from 'react';
import { toast } from 'sonner';
import usePermissions from '@/components/lib/usePermissions';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const hoje = () => new Date().toISOString().slice(0, 10);

const somarDias = (dias) => {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
};

/** Próximo número sequencial de orçamento a partir dos registros já carregados. */
export function proximoNumeroOrcamento(orcamentos = []) {
  const maior = (orcamentos || []).reduce((max, orcamento) => {
    const digitos = String(orcamento?.numero_orcamento || '').replace(/\D/g, '');
    return digitos ? Math.max(max, Number(digitos)) : max;
  }, 0);
  return `ORC-${String(maior + 1).padStart(4, '0')}`;
}

const nomeCliente = (cliente) =>
  cliente?.nome_fantasia || cliente?.razao_social || cliente?.nome || cliente?.nome_completo || 'Cliente';

export default function useNovaNegociacao({ orcamentos = [] } = {}) {
  const [salvando, setSalvando] = useState(false);
  const { hasPermission } = usePermissions();
  const { user } = useUser();
  const { createInContext, empresaAtual, grupoAtual } = useContextoVisual();

  const criarOrcamento = async ({ cliente, validade, condicaoPagamento, prazo, observacoes } = {}) => {
    if (!hasPermission('Comercial', 'Pedidos', 'criar')) {
      toast.error('Sem permissão para abrir negociações.');
      return null;
    }
    if (!cliente?.id) {
      toast.error('Selecione o cliente da negociação.');
      return null;
    }
    if (!grupoAtual?.id && !empresaAtual?.id) {
      toast.error('Defina o grupo ou a empresa antes de abrir a negociação.');
      return null;
    }

    setSalvando(true);
    try {
      const criado = await createInContext('OrcamentoCliente', {
        numero_orcamento: proximoNumeroOrcamento(orcamentos),
        cliente_id: cliente.id,
        cliente_nome: nomeCliente(cliente),
        cliente_email: cliente.email || null,
        vendedor_responsavel: user?.full_name || user?.email || 'Usuário',
        vendedor_responsavel_id: user?.id || null,
        data_criacao: hoje(),
        data_validade: validade || somarDias(7),
        itens: [],
        valor_total: 0,
        condicoes_pagamento: condicaoPagamento || 'À Vista',
        prazo_entrega: prazo || '7 dias úteis',
        observacoes: observacoes || null,
        status: 'Pendente',
      });
      toast.success(`Negociação ${criado?.numero_orcamento || ''} aberta.`);
      return criado;
    } catch (erro) {
      toast.error(`Erro ao abrir negociação: ${erro.message}`);
      return null;
    } finally {
      setSalvando(false);
    }
  };

  return { criarOrcamento, salvando, dataPadraoValidade: somarDias(7), dataHoje: hoje() };
}