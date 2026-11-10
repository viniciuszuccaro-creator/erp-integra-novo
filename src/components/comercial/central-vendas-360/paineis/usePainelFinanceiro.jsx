// Painéis Financeiro e Pagamento da Central 360° — recebíveis reais (ContaReceber)
// Somente leitura, escopo grupo/empresa injetado por useRLSQuery e permissão do módulo Financeiro.
import useRLSQuery from '@/components/lib/useRLSQuery';
import usePermissions from '@/components/lib/usePermissions';

// Estilos de situação reaproveitados por todos os painéis laterais (títulos e saldos)
export const ESTILO_TITULO = {
  Pendente: 'bg-amber-100 text-amber-800 border-amber-200',
  Parcial: 'bg-blue-100 text-blue-800 border-blue-200',
  Atrasado: 'bg-red-100 text-red-800 border-red-200',
  Recebido: 'bg-green-100 text-green-800 border-green-200',
  Cancelado: 'bg-slate-100 text-slate-600 border-slate-200',
  Suficiente: 'bg-green-100 text-green-800 border-green-200',
  'Saldo parcial': 'bg-amber-100 text-amber-800 border-amber-200',
  'Sem saldo': 'bg-red-100 text-red-800 border-red-200',
  'Sem cadastro': 'bg-slate-100 text-slate-600 border-slate-200',
  Hoje: 'bg-amber-100 text-amber-800 border-amber-200',
  Agendado: 'bg-blue-100 text-blue-800 border-blue-200',
  'Sem data': 'bg-slate-100 text-slate-600 border-slate-200',
};

const ABERTOS = ['Pendente', 'Atrasado', 'Parcial'];
const numero = (valor) => Number(valor || 0);

export function totaisTitulos(titulos = []) {
  return titulos.reduce(
    (acc, titulo) => {
      const valor = numero(titulo.valor);
      const recebido = numero(titulo.valor_recebido);
      acc.total += valor;
      acc.recebido += titulo.status === 'Recebido' ? valor : recebido;
      if (ABERTOS.includes(titulo.status)) {
        acc.aberto += Math.max(valor - recebido, 0);
        acc.abertos += 1;
      }
      return acc;
    },
    { total: 0, aberto: 0, recebido: 0, abertos: 0 }
  );
}

/**
 * Títulos reais do cliente (painel Financeiro) ou do pedido (painel Pagamento).
 * Sem cliente/pedido válido a consulta não executa e o painel permanece vazio.
 */
export default function useTitulosFinanceiros({ clienteId, pedidoId, modo = 'cliente', ativo = false }) {
  const { hasPermission, isLoading: carregandoPermissao } = usePermissions();
  const permitido = hasPermission('Financeiro', null, 'ver');
  const porPedido = modo === 'pedido' && !!pedidoId;
  const filtro = porPedido ? { pedido_id: pedidoId } : { cliente_id: clienteId };

  const { data = [], isLoading } = useRLSQuery(
    'ContaReceber',
    filtro,
    porPedido ? 'data_vencimento' : '-data_vencimento',
    40,
    { enabled: ativo && permitido && !!(porPedido ? pedidoId : clienteId), staleTime: 30000 }
  );

  return {
    titulos: data,
    totais: totaisTitulos(data),
    isLoading: isLoading || carregandoPermissao,
    permitido,
    porPedido,
  };
}