import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";

/**
 * Hook extraído de ConciliacaoBancaria.jsx
 * Corrige multi-tenant (filterInContext), RBAC, e auditoria.
 */
export default function useConciliacaoForm() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual, contexto, createInContext, updateInContext } = useContextoVisual();
  const { canEdit, canCreate } = usePermissions();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const contextoValido = !!contexto && contextoKey !== 'sem-grupo-sem-empresa';

  const [filtros, setFiltros] = useState({ banco_id: "", data_inicio: "", data_fim: "" });
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [tabAtiva, setTabAtiva] = useState("pendentes");
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState(null);
  const [movimentoParaConciliar, setMovimentoParaConciliar] = useState(null);
  const [importando, setImportando] = useState(false);

  const podeEditar = canEdit("Financeiro", "ConciliacaoBancaria") || canEdit("Financeiro", null);
  const podeImportar = canCreate("Financeiro", "ConciliacaoBancaria") || canCreate("Financeiro", null);

  // Multi-tenant: usa filterInContext que injeta group_id/empresa_id automaticamente
  const queryFilter = empresaSelecionada ? { empresa_id: empresaSelecionada } : {};

  const { data: empresas = [] } = useRLSQuery('Empresa', {}, 'nome_fantasia', 999, { enabled: contextoValido });
  const { data: extratos = [] } = useRLSQuery('ExtratoBancario', queryFilter, '-data_movimento', 500, { enabled: contextoValido });
  const { data: conciliacoes = [] } = useRLSQuery('ConciliacaoBancaria', queryFilter, '-created_date', 500, { enabled: contextoValido });
  const { data: movimentos = [] } = useRLSQuery('CaixaMovimento', queryFilter, '-data_movimento', 500, { enabled: contextoValido });

  const conciliar = useMutation({
    mutationFn: async ({ lancamentoBanco, movimento }) => {
      if (!podeEditar) throw new Error("Sem permissão para conciliar");
      if (!contextoValido) throw new Error("Contexto de grupo/empresa obrigatório para conciliar (Regra-Mãe 5a)");

      if (movimento.tipo === "pagamento_omnichannel") {
        await updateInContext('PagamentoOmnichannel', movimento.id, {
          status_conferencia: "Conciliado",
          data_credito_efetiva: lancamentoBanco.data
        });
      }

      // Regra-Mãe 5d: auditoria completa da conciliação manual (antes/depois, grupo/empresa, usuário)
      await base44.entities.AuditLog.create({
        group_id: grupoAtual?.id, grupo_id: grupoAtual?.id, empresa_id: empresaAtual?.id,
        usuario: user?.full_name || 'Sistema', usuario_id: user?.id,
        acao: "Conciliação", modulo: "Financeiro", tipo_auditoria: "operacional",
        entidade: movimento?.tipo === "pagamento_omnichannel" ? "PagamentoOmnichannel" : "ExtratoBancario",
        registro_id: movimento?.id,
        descricao: "Conciliação bancária manual realizada",
        data_hora: new Date().toISOString(), sucesso: true,
        dados_anteriores: { status_conferencia: movimento?.status_conferencia },
        dados_novos: { status_conferencia: "Conciliado", data_credito_efetiva: lancamentoBanco?.data }
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['extratos-bancarios']);
      queryClient.invalidateQueries(['caixa-movimentos']);
      setLancamentoSelecionado(null);
      setMovimentoParaConciliar(null);
      toast.success("Conciliação realizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao conciliar: " + error.message);
    }
  });

  const resolverDivergencia = useMutation({
    mutationFn: async (concId) => {
      if (!podeEditar) throw new Error("Sem permissão para resolver divergências");
      if (!contextoValido) throw new Error("Contexto de grupo/empresa obrigatório (Regra-Mãe 5a)");
      const anterior = await base44.entities.ConciliacaoBancaria.get(concId).catch(() => null);
      await updateInContext('ConciliacaoBancaria', concId, { status: 'resolvido', tem_divergencia: false });
      await base44.entities.AuditLog.create({
        group_id: grupoAtual?.id, grupo_id: grupoAtual?.id,
        empresa_id: empresaAtual?.id,
        usuario: user?.full_name || 'Sistema',
        usuario_id: user?.id,
        acao: "Edição",
        modulo: "Financeiro",
        tipo_auditoria: "operacional",
        entidade: "ConciliacaoBancaria",
        registro_id: concId,
        descricao: "Divergência de conciliação resolvida",
        data_hora: new Date().toISOString(),
        sucesso: true,
        dados_anteriores: anterior ? { status: anterior.status, tem_divergencia: anterior.tem_divergencia } : undefined,
        dados_novos: { status: 'resolvido', tem_divergencia: false }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['conciliacoes-bancarias']);
      toast.success("Divergência resolvida!");
    },
    onError: (error) => toast.error("Erro: " + error.message)
  });

  const handleImportarExtrato = async (file) => {
    if (!file) return;
    if (!podeImportar) { toast.error("Sem permissão para importar extratos"); return; }
    if (!contextoValido) { toast.error("Contexto de grupo/empresa obrigatório (Regra-Mãe 5a)"); return; }
    setImportando(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await createInContext('ExtratoBancario', {
        group_id: grupoAtual?.id,
        empresa_id: empresaSelecionada || empresaAtual?.id,
        descricao: `Importação: ${file.name}`,
        arquivo_url: file_url,
        data_importacao: new Date().toISOString(),
        conciliado: false
      });
      queryClient.invalidateQueries(['extratos-bancarios']);
      toast.success("Extrato importado!");
    } catch (error) {
      toast.error("Erro ao importar: " + error.message);
    } finally {
      setImportando(false);
    }
  };

  const extratosPendentes = (extratos || []).filter(e => !e.conciliado);
  const extratosConciliados = (extratos || []).filter(e => e.conciliado);
  const extratosComDivergencia = (conciliacoes || []).filter(c => c.tem_divergencia && c.status !== 'resolvido');

  return {
    filtros, setFiltros, empresaSelecionada, setEmpresaSelecionada, tabAtiva, setTabAtiva,
    lancamentoSelecionado, setLancamentoSelecionado, movimentoParaConciliar, setMovimentoParaConciliar,
    empresas, extratosPendentes, extratosConciliados, extratosComDivergencia, movimentos,
    conciliar, resolverDivergencia, handleImportarExtrato, importando,
    contextoValido, podeEditar, podeImportar, contextoKey
  };
}