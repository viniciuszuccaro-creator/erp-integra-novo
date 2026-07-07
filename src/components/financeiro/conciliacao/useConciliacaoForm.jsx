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
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
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

      if (movimento.tipo === "pagamento_omnichannel") {
        await base44.entities.PagamentoOmnichannel.update(movimento.id, {
          status_conferencia: "Conciliado",
          data_credito_efetiva: lancamentoBanco.data
        });
      }

      await base44.entities.AuditLog.create({
        group_id: movimento.group_id || grupoAtual?.id,
        empresa_id: movimento.empresa_id || empresaAtual?.id,
        usuario: user?.full_name || 'Sistema',
        usuario_id: user?.id,
        acao: "Conciliação Bancária",
        modulo: "Financeiro",
        tipo_auditoria: "entidade",
        entidade: "ConciliacaoBancaria",
        registro_id: movimento.id,
        descricao: `Conciliação manual: ${movimento.cliente_nome || 'N/A'}`,
        dados_anteriores: { status_conferencia: movimento.status_conferencia || 'Pendente' },
        dados_novos: { status_conferencia: "Conciliado", data_credito: lancamentoBanco.data },
        data_hora: new Date().toISOString(),
        sucesso: true
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
      await base44.entities.ConciliacaoBancaria.update(concId, { status: 'resolvido', tem_divergencia: false });
      await base44.entities.AuditLog.create({
        group_id: grupoAtual?.id,
        empresa_id: empresaAtual?.id,
        usuario: user?.full_name || 'Sistema',
        usuario_id: user?.id,
        acao: "Edição",
        modulo: "Financeiro",
        tipo_auditoria: "entidade",
        entidade: "ConciliacaoBancaria",
        registro_id: concId,
        descricao: "Divergência de conciliação resolvida",
        data_hora: new Date().toISOString(),
        sucesso: true
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
    setImportando(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ExtratoBancario.create({
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