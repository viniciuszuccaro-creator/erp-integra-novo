// Painel Retornos da Central 360° — follow-ups agendados no CRM (Interacao) do cliente da negociação
// Leitura por useRLSQuery (escopo grupo/empresa + permissão CRM), desfecho gravado com auditoria.
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import useRLSQuery from '@/components/lib/useRLSQuery';
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export const CATEGORIAS_RETORNO = ['Negociação', 'Pós-venda', 'Cobrança', 'Entrega', 'Outros'];

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

/** Classifica registros antigos (sem categoria gravada) pelo texto do título. */
export function categoriaDoRetorno(interacao = {}) {
  if (CATEGORIAS_RETORNO.includes(interacao.categoria_retorno)) return interacao.categoria_retorno;
  const texto = `${interacao.titulo || ''} ${interacao.proxima_acao || ''}`.toLowerCase();
  if (/cobran|t[ií]tulo|boleto|inadimpl/.test(texto)) return 'Cobrança';
  if (/entrega|log[ií]stica|romaneio|expedi/.test(texto)) return 'Entrega';
  if (/p[oó]s-venda|satisfa|avalia|suporte/.test(texto)) return 'Pós-venda';
  return 'Negociação';
}

/** Retornos ainda em aberto: com próxima ação datada e sem desfecho registrado. */
export function retornosPendentes(interacoes = []) {
  return (interacoes || [])
    .filter((interacao) => interacao.data_proxima_acao)
    .map((interacao) => ({
      ...interacao,
      categoria: categoriaDoRetorno(interacao),
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
      acc.porCategoria[retorno.categoria] = (acc.porCategoria[retorno.categoria] || 0) + 1;
      return acc;
    },
    { total: 0, atrasados: 0, hoje: 0, agendados: 0, porCategoria: {} }
  );
}

/** Retornos positivos/negativos encerram o follow-up; os demais seguem pendentes com nova data. */
const encerraRetorno = (resultado) => resultado === 'Positivo' || resultado === 'Negativo';

export default function usePainelRetornos({ clienteId, ativo = false }) {
  const { hasPermission, isLoading: carregandoPermissao } = usePermissions();
  const permitido = hasPermission('CRM', null, 'ver');
  const editarPermitido = hasPermission('CRM', null, 'editar');
  const { updateInContext } = useContextoVisual();
  const queryClient = useQueryClient();
  const [categoria, setCategoria] = useState('todos');
  const [salvando, setSalvando] = useState(false);

  const { data = [], isLoading } = useRLSQuery(
    'Interacao',
    { cliente_id: clienteId },
    '-data_proxima_acao',
    60,
    { enabled: ativo && permitido && !!clienteId, staleTime: 30000 }
  );

  const retornos = useMemo(() => retornosPendentes(data), [data]);
  const totais = useMemo(() => totaisRetornos(retornos), [retornos]);
  const lista = useMemo(
    () => (categoria === 'todos' ? retornos : retornos.filter((retorno) => retorno.categoria === categoria)),
    [retornos, categoria]
  );

  const registrarDesfecho = async (retorno, dados) => {
    if (!retorno?.id) return false;
    setSalvando(true);
    try {
      const encerra = encerraRetorno(dados.resultado);
      const observacao = [retorno.observacoes, dados.observacao].filter(Boolean).join(' | ');
      const atualizacao = {
        resultado: dados.resultado,
        categoria_retorno: dados.categoria,
        observacoes: observacao || retorno.observacoes || null,
        data_proxima_acao: encerra ? null : (dados.novaData || retorno.data_proxima_acao),
        proxima_acao: encerra ? null : (dados.proximaAcao || retorno.proxima_acao),
      };

      // updateInContext carimba grupo/empresa, sanitiza e grava AuditLog com antes/depois
      await updateInContext('Interacao', retorno.id, atualizacao);

      await queryClient.invalidateQueries({ queryKey: ['Interacao'] });
      toast.success(encerra ? `Desfecho "${dados.resultado}" registrado.` : 'Retorno reagendado.');
      return true;
    } catch (erro) {
      toast.error(`Não foi possível registrar o desfecho: ${erro.message}`);
      return false;
    } finally {
      setSalvando(false);
    }
  };

  return {
    lista,
    retornos,
    totais,
    contagens: totais.porCategoria,
    categoria,
    setCategoria,
    isLoading: isLoading || carregandoPermissao,
    permitido,
    editarPermitido,
    temCliente: !!clienteId,
    registrarDesfecho,
    salvando,
  };
}