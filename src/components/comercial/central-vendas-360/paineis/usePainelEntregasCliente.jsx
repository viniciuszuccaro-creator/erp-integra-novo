// §25/§26 do dossiê — contadores reais de entregas do cliente no Cliente 360°
// Somente leitura; escopo grupo/empresa injetado por useRLSQuery e permissão do módulo Expedição.
import useRLSQuery from '@/components/lib/useRLSQuery';
import usePermissions from '@/components/lib/usePermissions';

const EM_ROTA = ['Saiu para Entrega', 'Em Trânsito'];
const CONCLUIDAS = ['Entregue', 'Devolvido', 'Cancelado'];

const hojeISO = () => new Date().toISOString().slice(0, 10);

/** Contadores de acompanhamento de entrega por cliente (hoje, rota, rejeitadas, reagendadas). */
export function contarEntregas(entregas = []) {
  const hoje = hojeISO();
  return (entregas || []).reduce((acc, entrega) => {
    const previsao = String(entrega.data_previsao || '').slice(0, 10);
    acc.total += 1;
    if (previsao === hoje && !CONCLUIDAS.includes(entrega.status)) acc.hoje += 1;
    if (EM_ROTA.includes(entrega.status)) acc.emRota += 1;
    if (entrega.status === 'Pronto para Expedir') acc.prontas += 1;
    if (entrega.status === 'Entrega Frustrada') acc.rejeitadas += 1;
    if (entrega.entrega_frustrada?.reagendamento) acc.reagendadas += 1;
    if ((entrega.ocorrencias || []).length > 0) acc.comOcorrencia += 1;
    if (previsao && previsao < hoje && !CONCLUIDAS.includes(entrega.status)) acc.atrasadas += 1;
    return acc;
  }, { total: 0, hoje: 0, emRota: 0, prontas: 0, rejeitadas: 0, reagendadas: 0, comOcorrencia: 0, atrasadas: 0 });
}

export default function usePainelEntregasCliente({ clienteId, ativo = false }) {
  const { hasPermission, isLoading: carregandoPermissao } = usePermissions();
  const permitido = hasPermission('Expedicao', null, 'ver');

  const { data: entregas = [], isLoading } = useRLSQuery(
    'Entrega',
    { cliente_id: clienteId },
    '-data_previsao',
    100,
    { enabled: ativo && permitido && Boolean(clienteId), staleTime: 30000 }
  );

  return {
    entregas,
    totais: contarEntregas(entregas),
    isLoading: isLoading || carregandoPermissao,
    permitido,
  };
}