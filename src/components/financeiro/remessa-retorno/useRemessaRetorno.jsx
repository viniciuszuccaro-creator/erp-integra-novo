import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useContextoVisual from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";

/**
 * Hook: Gerenciamento de Remessa/Retorno CNAB
 * Queries e mutations com multi-tenant e RBAC
 */
export default function useRemessaRetorno() {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, filterInContext, createInContext, updateInContext } = useContextoVisual();
  const { canCreate, canEdit, hasPermission } = usePermissions();

  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextKey = empresaAtual?.id || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";

  const podeGerarRemessa = canCreate("Financeiro", "Remessa Retorno") || canCreate("Financeiro", "Remessa") || hasPermission("Financeiro", null, "gerenciar");
  const podeProcessarRetorno = canEdit("Financeiro", "Remessa Retorno") || canEdit("Financeiro", "Contas a Receber") || hasPermission("Financeiro", null, "baixar");

  const [titulosSelecionados, setTitulosSelecionados] = useState([]);
  const [bancoSelecionado, setBancoSelecionado] = useState("");
  const [dialogRemessa, setDialogRemessa] = useState(false);
  const [processandoRetorno, setProcessandoRetorno] = useState(false);

  const { data: bancos = [] } = useQuery({
    queryKey: ['bancos', contextKey],
    queryFn: () => filterInContext('Banco', {}, 'nome', 100),
    enabled: contextoValido,
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', contextKey],
    queryFn: () => filterInContext('ContaReceber', {}, '-data_vencimento', 500),
    enabled: contextoValido,
  });

  const { data: arquivos = [] } = useQuery({
    queryKey: ['arquivos-remessa-retorno', contextKey],
    queryFn: () => filterInContext('ArquivoRemessaRetorno', {}, '-created_date', 200),
    enabled: contextoValido,
  });

  const titulosAptosRemessa = contasReceber.filter(c =>
    (c.status === 'Pendente' || c.status === 'Atrasado') && !c.arquivo_remessa_id && c.forma_cobranca === 'Boleto'
  );

  const titulosSelecionadosData = contasReceber.filter(c => titulosSelecionados.includes(c.id));
  const valorTotalSelecionado = titulosSelecionadosData.reduce((sum, t) => sum + (t.valor || 0), 0);

  const gerarRemessaMutation = useMutation({
    mutationFn: async ({ bancoId, titulosIds }) => {
      if (!contextoValido || !podeGerarRemessa) throw new Error("Sem contexto ou permissão para gerar remessa.");
      const banco = bancos.find(b => b.id === bancoId);
      const titulos = contasReceber.filter(c => titulosIds.includes(c.id));
      if (!titulos.length) throw new Error("Selecione ao menos um título.");

      const numeroArquivo = arquivos.filter(a => a.tipo_arquivo === 'Remessa').length + 1;
      const conteudoCNAB = titulos.map((t, idx) => {
        const nossoNumero = String(Date.now() + idx).substring(0, 10);
        return `REG:${nossoNumero}|CLIENTE:${t.cliente}|VALOR:${t.valor}|VENC:${t.data_vencimento}`;
      }).join('\n');

      const arquivo = await createInContext('ArquivoRemessaRetorno', {
        ...(titulos[0].empresa_id ? { empresa_id: titulos[0].empresa_id } : {}),
        ...(groupId ? { group_id: groupId } : {}),
        banco_id: bancoId,
        banco_codigo: banco.codigo,
        banco_nome: banco.nome,
        tipo_arquivo: 'Remessa',
        numero_arquivo: numeroArquivo,
        data_geracao: new Date().toISOString(),
        layout_cnab: 'CNAB400',
        quantidade_titulos: titulos.length,
        valor_total: titulos.reduce((sum, t) => sum + (t.valor || 0), 0),
        arquivo_nome: `REM${banco.codigo}_${numeroArquivo}.REM`,
        conteudo_arquivo: conteudoCNAB,
        status: 'Gerado',
        titulos_incluidos: titulos.map((t, idx) => ({
          titulo_id: t.id,
          nosso_numero: String(Date.now() + idx).substring(0, 10),
          valor: t.valor,
          vencimento: t.data_vencimento,
          cliente_nome: t.cliente,
          cliente_documento: t.cliente_id
        }))
      });

      for (const titulo of titulos) {
        const nossoNumero = String(Date.now()).substring(0, 10);
        await updateInContext('ContaReceber', titulo.id, {
          arquivo_remessa_id: arquivo.id,
          nosso_numero: nossoNumero,
          data_registro_banco: new Date().toISOString(),
          status_integracao: 'enviado'
        });
      }
      return arquivo;
    },
    onSuccess: (arquivo) => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['arquivos-remessa-retorno'] });
      toast.success(`✅ Remessa gerada! ${arquivo.quantidade_titulos} títulos`);
      setTitulosSelecionados([]);
      setDialogRemessa(false);
      const blob = new Blob([arquivo.conteudo_arquivo], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = arquivo.arquivo_nome;
      a.click();
    },
    onError: (error) => toast.error("Erro ao gerar remessa: " + error.message),
  });

  const processarRetornoMutation = useMutation({
    mutationFn: async (file) => {
      if (!contextoValido || !podeProcessarRetorno) throw new Error("Sem contexto ou permissão para processar retorno.");
      const conteudo = await file.text();
      const linhas = conteudo.split('\n').filter(l => l.trim());
      const ocorrencias = linhas.map(linha => {
        const partes = linha.split('|');
        return {
          nossoNumero: partes[0]?.replace('REG:', ''),
          codigoOcorrencia: partes[1]?.replace('OCR:', '') || '06',
          valorPago: parseFloat(partes[2]?.replace('VALOR:', '') || '0'),
          dataPagamento: partes[3]?.replace('DATA:', ''),
        };
      });

      const arquivo = await createInContext('ArquivoRemessaRetorno', {
        ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
        ...(groupId ? { group_id: groupId } : {}),
        tipo_arquivo: 'Retorno',
        banco_codigo: '000',
        banco_nome: 'Importado',
        data_geracao: new Date().toISOString(),
        data_processamento: new Date().toISOString(),
        layout_cnab: 'CNAB400',
        quantidade_titulos: ocorrencias.length,
        arquivo_nome: file.name,
        conteudo_arquivo: conteudo,
        status: 'Processado',
        ocorrencias_retorno: ocorrencias.map(o => ({
          nosso_numero: o.nossoNumero,
          codigo_ocorrencia: o.codigoOcorrencia,
          descricao_ocorrencia: o.codigoOcorrencia === '06' ? 'Liquidação' : 'Entrada Confirmada',
          valor_pago: o.valorPago,
          data_pagamento: o.dataPagamento,
          processado: false
        }))
      });

      let titulosBaixados = 0;
      for (const ocorrencia of ocorrencias) {
        const titulo = contasReceber.find(c => c.nosso_numero === ocorrencia.nossoNumero);
        if (titulo && ocorrencia.codigoOcorrencia === '06') {
          await updateInContext('ContaReceber', titulo.id, {
            status: 'Recebido',
            data_recebimento: ocorrencia.dataPagamento || new Date().toISOString(),
            valor_recebido: ocorrencia.valorPago || titulo.valor,
            arquivo_retorno_id: arquivo.id,
            codigo_ocorrencia_retorno: ocorrencia.codigoOcorrencia,
            data_ocorrencia_retorno: new Date().toISOString()
          });
          titulosBaixados++;
        }
      }
      return { arquivo, titulosBaixados };
    },
    onSuccess: ({ titulosBaixados }) => {
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      queryClient.invalidateQueries({ queryKey: ['arquivos-remessa-retorno'] });
      toast.success(`✅ Retorno processado! ${titulosBaixados} título(s) baixado(s)`);
      setProcessandoRetorno(false);
    },
    onError: (error) => {
      toast.error("Erro ao processar retorno: " + error.message);
      setProcessandoRetorno(false);
    },
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessandoRetorno(true);
      processarRetornoMutation.mutate(file);
    }
  };

  return {
    bancos, contasReceber, arquivos, titulosAptosRemessa,
    titulosSelecionados, setTitulosSelecionados,
    bancoSelecionado, setBancoSelecionado,
    dialogRemessa, setDialogRemessa,
    processandoRetorno, handleFileUpload,
    valorTotalSelecionado,
    gerarRemessaMutation, processarRetornoMutation,
    contextoValido, podeGerarRemessa, podeProcessarRetorno,
    groupId,
  };
}