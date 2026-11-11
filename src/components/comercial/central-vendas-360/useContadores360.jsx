// Contadores da faixa compacta — consultados no servidor, sempre com o contexto grupo/empresa ativo
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const STATUS_ENTREGA_ABERTA = [
  'Aguardando Separação', 'Em Separação', 'Pronto para Expedir',
  'Saiu para Entrega', 'Em Trânsito', 'Entrega Frustrada',
];

const hoje = () => {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
};

export default function useContadores360() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const escopo = contexto === 'grupo' && grupoAtual?.id
    ? { group_id: grupoAtual.id }
    : (empresaAtual?.id ? { empresa_id: empresaAtual.id } : null);
  const chave = escopo ? JSON.stringify(escopo) : 'sem-contexto';

  const { data } = useQuery({
    queryKey: ['central360-contadores', chave],
    enabled: !!escopo,
    staleTime: 60000,
    refetchInterval: 120000,
    queryFn: async () => {
      const [atendimento, bot, entregas, aprovacoes] = await Promise.all([
        base44.entities.ConversaOmnicanal.count({ ...escopo, status: 'Em Progresso' }),
        base44.entities.ConversaOmnicanal.count({
          ...escopo,
          tipo_atendimento: { $in: ['Bot', 'Híbrido'] },
          status: { $in: ['Aguardando', 'Não Atribuída'] },
        }),
        base44.entities.Entrega.count({ ...escopo, data_previsao: hoje(), status: { $in: STATUS_ENTREGA_ABERTA } }),
        base44.entities.Pedido.count({ ...escopo, status_aprovacao: 'pendente' }),
      ]);
      return {
        atendimento: Number(atendimento || 0),
        bot: Number(bot || 0),
        entregas: Number(entregas || 0),
        aprovacoes: Number(aprovacoes || 0),
      };
    },
  });

  return data || { atendimento: 0, bot: 0, entregas: 0, aprovacoes: 0 };
}