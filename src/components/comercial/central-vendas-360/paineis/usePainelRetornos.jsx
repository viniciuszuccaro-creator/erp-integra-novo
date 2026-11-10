// Painel Retornos da Central 360° — follow-ups agendados no CRM (Interacao) para o cliente da negociação
// Somente leitura, escopo grupo/empresa injetado por useRLSQuery e permissão do módulo CRM.
import useRLSQuery from '@/components/lib/useRLSQuery';
import usePermissions from '@/components/lib/usePermissions';

const hojeISO = () => new Date().toISOString().slice(0, 10);

/** Compara a data do retorno com hoje para destacar atrasos na Central. */
export function situacaoRetorno(dataProxima) {
  const dia = String(dataProxima || '').slice(0, 10);
  if (!dia) return 'Sem data';
  const hoje = hojeISO();
  if (dia < hoje) return 'Atrasado';
  if (dia === hoje) return 'Hoje';
  return 'Agendado';
}

/** Retornos ainda em aberto: com próxima ação datada e sem desfecho positivo registrado. */
export function retornosPendentes(interacoes = []) {
  return (interacoes || [])
    .filter((interacao) => interacao.data_proxima_acao && interacao.resultado !== 'Positivo')
    .map((interacao) => ({
      ...interacao,
      situacao: situacaoRetorno(interacao.data_proxima_acao),
    }))
    .sort((a, b) => String(a.data_proxima_acao).localeCompare(String(b.data_proxima_acao)));
}

export function totaisRetornos(retornos = []) {
  return retornos.reduce(
    (acc, retorno) => {
      acc.total += 1;
      if (retorno.situacao === 'Atrasado') acc.atrasados += 1;
      if (retorno.situacao === 'Hoje') acc.hoje += 1;
      if (retorno.situacao === 'Agendado') acc.agendados += 1;
      return acc;
    },
    { total: 0, atrasados: 0, hoje: 0, agendados: 0 }
  );
}

/**
 * Retornos agendados do cliente da negociação selecionada.
 * Sem cliente válido a consulta não executa e o painel permanece vazio.
 */
export default function usePainelRetornos({ clienteId, ativo = false }) {
  const { hasPermission, isLoading: carregandoPermissao } = usePermissions();
  const permitido = hasPermission('CRM', null, 'ver');

  const { data = [], isLoading } = useRLSQuery(
    'Interacao',
    { cliente_id: clienteId },
    '-data_proxima_acao',
    40,
    { enabled: ativo && permitido && !!clienteId, staleTime: 30000 }
  );

  const retornos = retornosPendentes(data);

  return {
    retornos,
    totais: totaisRetornos(retornos),
    isLoading: isLoading || carregandoPermissao,
    permitido,
    temCliente: !!clienteId,
  };
}