// Central de Vendas 360 — atalhos laterais e configuração dos painéis
import {
  MessageSquare, User, History, DollarSign, Box, Factory, Truck, FileText, CreditCard,
  CalendarClock, Sparkles, MapPinned, Target,
} from 'lucide-react';

export const ATALHOS_360 = [
  { id: 'copiloto', label: 'Copiloto', icon: Sparkles },
  { id: 'atendimento', label: 'Atendimento', icon: MessageSquare },
  { id: 'cliente', label: 'Cliente', icon: User },
  { id: 'historico', label: 'Histórico', icon: History },
  { id: 'vendedor', label: 'Vendedor', icon: Target },
  { id: 'retornos', label: 'Retornos', icon: CalendarClock },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'estoque', label: 'Estoque', icon: Box },
  { id: 'producao', label: 'Produção', icon: Factory },
  { id: 'entregas', label: 'Entregas', icon: Truck },
  { id: 'mapa', label: 'Mapa', icon: MapPinned },
  { id: 'fiscal', label: 'Fiscal', icon: FileText },
  { id: 'pagamento', label: 'Pagamento', icon: CreditCard },
];

export const PERMISSOES_PAINEL = {
  copiloto: ['Comercial', 'Pedidos'], cliente: ['Comercial', 'Pedidos'], vendedor: ['Comercial', 'Pedidos'],
  atendimento: ['HubAtendimento', null], historico: ['CRM', null], retornos: ['CRM', null],
  financeiro: ['Financeiro', 'Contas a Receber'], pagamento: ['Financeiro', 'Contas a Receber'],
  estoque: ['Estoque', 'Produtos'], producao: ['Produção', 'Ordens de Produção'],
  entregas: ['Expedição', 'Entregas'], mapa: ['Expedição', 'Entregas'], fiscal: ['Fiscal', 'Notas Fiscais'],
};

// Os perfis legados usam rótulos; a gestão atual também grava as chaves de seção abaixo.
const CHAVES_SECAO = {
  'Contas a Receber': ['contas_receber'], Produtos: ['Produto', 'produtos'],
  'Ordens de Produção': ['ordens_producao'], Entregas: ['Entrega', 'entregas'], 'Notas Fiscais': ['notas_fiscais'],
};
export function podeVerPainel(hasPermission, painel) {
  const permissao = PERMISSOES_PAINEL[painel];
  return !!permissao && [permissao[1], ...(CHAVES_SECAO[permissao[1]] || [])].some((secao) => hasPermission(permissao[0], secao, 'visualizar'));
}

export const TITULOS_PAINEL = ATALHOS_360.reduce((acc, atalho) => {
  acc[atalho.id] = atalho.label;
  return acc;
}, {});

export const FILTRO_RELACIONADO = (negociacao) => {
  const pedidoId = negociacao?.origem === 'pedido' ? negociacao.registro?.id : null;
  return {
    pedidoId,
    clienteId: negociacao?.cliente_id || null,
  };
};