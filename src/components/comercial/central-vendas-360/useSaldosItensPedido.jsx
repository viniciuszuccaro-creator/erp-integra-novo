import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useAcoesComerciais from '@/components/comercial/central-vendas-360/useAcoesComerciais';

export default function useSaldosItensPedido(pedido, ativo) {
  const { user } = useUser(); const permissoes = useAcoesComerciais();
  const { grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const client = useQueryClient();
  const permitido = Boolean(user?.id && pedido?.id && pedido.group_id && pedido.empresa_id && grupoAtual?.id === pedido.group_id
    && (contexto === 'grupo' || empresaAtual?.id === pedido.empresa_id) && !permissoes.carregando && permissoes.podeVisualizar);
  const queryKey = ['saldos-itens-pedido', user?.id, user?.perfil_acesso_id, pedido?.group_id, pedido?.empresa_id, pedido?.id, pedido?.updated_date];
  const consulta = useQuery({
    queryKey, enabled: Boolean(ativo && permitido),
    queryFn: async () => {
      const { data } = await base44.functions.invoke('onEntregaUpdated', { acao: 'consultar_saldos_pedido', pedido_id: pedido.id, group_id: pedido.group_id, empresa_id: pedido.empresa_id });
      if (!data?.ok) throw new Error(data?.error || 'Não foi possível consultar os saldos.');
      if (pedido.updated_date && data.pedido_versao !== pedido.updated_date) throw new Error('O pedido foi alterado. Atualize a negociação antes de consultar os saldos.');
      return data;
    },
    staleTime: 15000, refetchOnWindowFocus: false, retry: false,
  });
  useEffect(() => {
    if (!ativo || !permitido) return undefined;
    let timer;
    const atualizar = (evento) => {
      if (evento.type !== 'delete' && evento.id !== pedido.id && evento.data?.pedido_id !== pedido.id) return;
      if (timer) return;
      timer = setTimeout(() => { timer = null; client.invalidateQueries({ queryKey: ['saldos-itens-pedido', user.id, user.perfil_acesso_id, pedido.group_id, pedido.empresa_id, pedido.id], refetchType: document.hidden ? 'none' : 'active' }); }, 1000);
    };
    const entidades = ['Pedido', ...(consulta.data?.permissoes?.separacao ? ['SeparacaoConferencia'] : []), ...(consulta.data?.permissoes?.producao ? ['OrdemProducao'] : []), ...(consulta.data?.permissoes?.entregas ? ['Entrega', 'EntregaItens'] : [])];
    const cancelar = entidades.map((nome) => base44.entities[nome].subscribe(atualizar));
    return () => { clearTimeout(timer); cancelar.forEach((fn) => fn()); };
  }, [ativo, permitido, user?.id, user?.perfil_acesso_id, pedido?.id, pedido?.group_id, pedido?.empresa_id, consulta.data?.permissoes, client]);
  return { ...consulta, permitido, porChave: new Map((consulta.data?.itens || []).map((i) => [i.chave, i])) };
}