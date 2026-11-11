// §37 do dossiê — indicadores do vendedor logado (hoje, mês, ticket, meta e retornos vencidos)
// Somente leitura das entidades dos módulos proprietários; a meta é persistida em ConfiguracaoSistema
// com carimbo de grupo/empresa e auditoria (Regra-Mãe 5a/5d).
import { useMemo, useState } from 'react';
import useRLSQuery from '@/components/lib/useRLSQuery';
import usePermissions from '@/components/lib/usePermissions';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const STATUS_IGNORADOS = ['Cancelado', 'Rascunho', 'Rejeitado'];
const LIMITE = 200;

const hojeISO = () => new Date().toISOString().slice(0, 10);
const inicioDoMesISO = () => {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();
};
const diaDe = (registro) => String(registro?.created_date || registro?.data_pedido || '').slice(0, 10);

export const chaveMeta = (userId) => `comercial.meta_vendas_mensal.${userId || 'anon'}`;

export default function usePainelVendedor({ ativo = false }) {
  const { user } = useUser();
  const { hasPermission } = usePermissions();
  const { createInContext, updateInContext } = useContextoVisual();
  const [salvando, setSalvando] = useState(false);

  const usuarioId = user?.id || null;
  const podeVer = hasPermission('Comercial', null, 'ver');
  const podeEditar = hasPermission('Comercial', null, 'editar');
  const habilitado = ativo && podeVer && Boolean(usuarioId);

  const { data: pedidos = [], isLoading: carregandoPedidos } = useRLSQuery(
    'Pedido',
    { vendedor_id: usuarioId },
    '-created_date',
    LIMITE,
    { enabled: habilitado, staleTime: 60000 }
  );

  const { data: interacoes = [], isLoading: carregandoRetornos } = useRLSQuery(
    'Interacao',
    { responsavel_id: usuarioId },
    'data_proxima_acao',
    LIMITE,
    { enabled: habilitado, staleTime: 60000 }
  );

  const { data: metaConfig = [] } = useRLSQuery(
    'ConfiguracaoSistema',
    { chave: chaveMeta(usuarioId) },
    '-updated_date',
    1,
    { enabled: habilitado, staleTime: 60000 }
  );

  const resumo = useMemo(() => {
    const inicio = inicioDoMesISO().slice(0, 10);
    const dia = hojeISO();
    const doMes = (pedidos || []).filter((pedido) => {
      if (STATUS_IGNORADOS.includes(pedido.status)) return false;
      const data = diaDe(pedido);
      return data ? data >= inicio : false;
    });
    const deHoje = doMes.filter((pedido) => diaDe(pedido) === dia);
    const total = doMes.reduce((soma, pedido) => soma + (Number(pedido.valor_total) || 0), 0);
    const totalHoje = deHoje.reduce((soma, pedido) => soma + (Number(pedido.valor_total) || 0), 0);
    const meta = Number(metaConfig?.[0]?.numero) || 0;
    return {
      qtdMes: doMes.length,
      qtdHoje: deHoje.length,
      totalMes: total,
      totalHoje,
      ticket: doMes.length ? total / doMes.length : 0,
      meta,
      atingimento: meta > 0 ? (total / meta) * 100 : null,
      aFaltar: meta > 0 ? Math.max(meta - total, 0) : 0,
    };
  }, [pedidos, metaConfig]);

  const retornosVencidos = useMemo(() => {
    const hoje = hojeISO();
    return (interacoes || [])
      .filter((interacao) => {
        const data = String(interacao.data_proxima_acao || '').slice(0, 10);
        return data && data <= hoje;
      })
      .sort((a, b) => String(a.data_proxima_acao).localeCompare(String(b.data_proxima_acao)));
  }, [interacoes]);

  const salvarMeta = async (valor) => {
    const numero = Number(String(valor).replace(',', '.')) || 0;
    if (numero <= 0) throw new Error('Informe um valor de meta maior que zero.');
    setSalvando(true);
    try {
      const existente = metaConfig?.[0];
      if (existente?.id) {
        await updateInContext('ConfiguracaoSistema', existente.id, { numero, ativa: true });
      } else {
        await createInContext('ConfiguracaoSistema', {
          chave: chaveMeta(usuarioId),
          categoria: 'Comercial',
          numero,
          ativa: true,
          valor: `Meta mensal de vendas do vendedor ${user?.full_name || user?.email || ''}`.trim(),
        });
      }
      return numero;
    } finally {
      setSalvando(false);
    }
  };

  return {
    resumo,
    retornosVencidos,
    salvarMeta,
    salvando,
    podeEditar,
    permitido: podeVer,
    isLoading: carregandoPedidos || carregandoRetornos,
  };
}