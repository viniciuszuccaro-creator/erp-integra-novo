import { useState, useMemo } from "react";
import { differenceInDays } from "date-fns";

/**
 * Hook extraído de DashboardInadimplencia.jsx
 * Encapsula análise de inadimplência por cliente com score de risco.
 */
export default function useInadimplencia(contasReceber, clientes, empresaId) {
  const [filtroRisco, setFiltroRisco] = useState("todos");
  const hoje = new Date();

  const dados = useMemo(() => {
    const porCliente = {};

    contasReceber
      .filter(c => (!empresaId || c.empresa_id === empresaId))
      .forEach(conta => {
        const key = conta.cliente_id || conta.cliente;
        if (!key) return;

        if (!porCliente[key]) {
          const cliente = clientes.find(cl => cl.id === conta.cliente_id || cl.nome === conta.cliente);
          porCliente[key] = {
            cliente_id: conta.cliente_id,
            cliente_nome: conta.cliente,
            classificacao_abc: cliente?.classificacao_abc || 'Novo',
            titulos_total: 0, titulos_vencidos: 0, titulos_a_vencer: 0,
            valor_total: 0, valor_vencido: 0, valor_a_vencer: 0,
            dias_atraso_medio: 0, maior_atraso: 0,
            titulos: [], score_pagamento: cliente?.score_pagamento || 100,
            limite_credito: cliente?.condicao_comercial?.limite_credito || 0,
          };
        }

        const vencimento = new Date(conta.data_vencimento);
        const diasAtraso = differenceInDays(hoje, vencimento);

        porCliente[key].titulos_total += 1;
        porCliente[key].valor_total += conta.valor || 0;

        if (conta.status === 'Pendente') {
          porCliente[key].titulos.push({
            numero: conta.numero_documento, vencimento: conta.data_vencimento,
            valor: conta.valor, dias_atraso: Math.max(0, diasAtraso),
            status: diasAtraso > 0 ? 'Vencido' : 'A Vencer'
          });

          if (diasAtraso > 0) {
            porCliente[key].titulos_vencidos += 1;
            porCliente[key].valor_vencido += conta.valor || 0;
            if (diasAtraso > porCliente[key].maior_atraso) porCliente[key].maior_atraso = diasAtraso;
          } else {
            porCliente[key].titulos_a_vencer += 1;
            porCliente[key].valor_a_vencer += conta.valor || 0;
          }
        }
      });

    return Object.values(porCliente)
      .map(c => {
        const titulosVencidos = c.titulos.filter(t => t.dias_atraso > 0);
        c.dias_atraso_medio = titulosVencidos.length > 0
          ? titulosVencidos.reduce((sum, t) => sum + t.dias_atraso, 0) / titulosVencidos.length : 0;

        c.score_risco = Math.min(100,
          (c.dias_atraso_medio * 2) + (c.titulos_vencidos * 5) + (c.maior_atraso) +
          ((c.valor_vencido / Math.max(1, c.limite_credito)) * 20)
        );

        if (c.score_risco >= 70 || c.dias_atraso_medio > 60) c.nivel_risco = 'Crítico';
        else if (c.score_risco >= 40 || c.dias_atraso_medio > 30) c.nivel_risco = 'Alto';
        else if (c.score_risco >= 20 || c.dias_atraso_medio > 15) c.nivel_risco = 'Médio';
        else if (c.titulos_vencidos > 0) c.nivel_risco = 'Baixo';
        else c.nivel_risco = 'OK';

        c.previsao_recebimento_dias = Math.ceil(c.dias_atraso_medio + 7);
        return c;
      })
      .filter(c => c.titulos_vencidos > 0 || filtroRisco === "todos")
      .sort((a, b) => b.score_risco - a.score_risco);
  }, [contasReceber, clientes, empresaId, filtroRisco]);

  const dadosFiltrados = filtroRisco === "todos" ? dados : dados.filter(c => c.nivel_risco === filtroRisco);

  const totais = useMemo(() => ({
    totalVencido: dados.reduce((sum, c) => sum + c.valor_vencido, 0),
    totalAVencer: dados.reduce((sum, c) => sum + c.valor_a_vencer, 0),
    totalTitulosVencidos: dados.reduce((sum, c) => sum + c.titulos_vencidos, 0),
    diasAtrasoMedioGeral: dados.length > 0 ? dados.reduce((sum, c) => sum + c.dias_atraso_medio, 0) / dados.length : 0,
    clientesComAtraso: dados.filter(c => c.titulos_vencidos > 0).length,
  }), [dados]);

  const distribuicaoRisco = useMemo(() => {
    return ['Crítico', 'Alto', 'Médio', 'Baixo', 'OK'].map(nivel => {
      const clientesNivel = dados.filter(c => c.nivel_risco === nivel);
      return { nivel, quantidade: clientesNivel.length, valor: clientesNivel.reduce((sum, c) => sum + c.valor_vencido, 0) };
    });
  }, [dados]);

  return { filtroRisco, setFiltroRisco, dados, dadosFiltrados, totais, distribuicaoRisco };
}