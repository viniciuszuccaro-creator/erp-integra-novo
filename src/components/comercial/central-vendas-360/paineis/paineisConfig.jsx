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