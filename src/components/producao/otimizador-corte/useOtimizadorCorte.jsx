import { useState } from "react";
import { toast } from "sonner";

const PESOS_POR_METRO = {
  "6.3mm": 0.245, "8.0mm": 0.395, "10.0mm": 0.617, "12.5mm": 0.963,
  "16.0mm": 1.578, "20.0mm": 2.466, "25.0mm": 3.853
};
const CUSTO_FERRO_KG = 6.50;
const MARGEM_CORTE_CM = 5;
const TAMANHO_BARRA_PADRAO = 1200;

/**
 * Hook extraído de OtimizadorCorte.jsx
 * Algoritmo First Fit Decreasing (FFD) para otimização de corte de barras
 */
export function useOtimizadorCorte({ itens, onOtimizacaoCalculada }) {
  const [tamanhoBarraPadrao, setTamanhoBarraPadrao] = useState(TAMANHO_BARRA_PADRAO);
  const [otimizacao, setOtimizacao] = useState(null);
  const [calculando, setCalculando] = useState(false);

  const calcularPesoRefugo = (barras) => {
    let pesoTotal = 0;
    barras.forEach(barra => {
      const bitola = barra.cortes[0]?.bitola || "12.5mm";
      const usado = barra.cortes.reduce((s, c) => s + c.comprimento, 0);
      const sobra = barra.tamanho_padrao - usado;
      pesoTotal += (sobra / 100) * (PESOS_POR_METRO[bitola] || 0.963);
    });
    return pesoTotal.toFixed(2);
  };

  const calcularEconomia = (pontas) => {
    const pesoTotal = pontas.reduce((sum, ponta) => {
      const peso = (ponta.tamanho / 100) * (PESOS_POR_METRO[ponta.bitola] || 0.963);
      return sum + peso;
    }, 0);
    return (pesoTotal * CUSTO_FERRO_KG).toFixed(2);
  };

  const calcularOtimizacao = () => {
    setCalculando(true);
    try {
      const cortes = [];
      itens.forEach(item => {
        for (let i = 0; i < item.quantidade; i++) {
          cortes.push({
            posicao: item.posicao,
            comprimento: item.comprimento_total,
            bitola: item.bitola,
            elemento: item.elemento_estrutural
          });
        }
      });
      cortes.sort((a, b) => b.comprimento - a.comprimento);

      const barras = [];
      cortes.forEach(corte => {
        let alocado = false;
        for (const barra of barras) {
          const espacoUsado = barra.cortes.reduce((sum, c) => sum + c.comprimento, 0) +
            (barra.cortes.length * MARGEM_CORTE_CM);
          const espacoDisponivel = tamanhoBarraPadrao - espacoUsado;
          if (espacoDisponivel >= (corte.comprimento + MARGEM_CORTE_CM)) {
            barra.cortes.push(corte);
            alocado = true;
            break;
          }
        }
        if (!alocado) {
          barras.push({ numero: barras.length + 1, cortes: [corte], tamanho_padrao: tamanhoBarraPadrao });
        }
      });

      const totalCortes = cortes.length;
      const barrasUsadas = barras.length;
      const totalRefugo = barras.reduce((sum, barra) => {
        const usado = barra.cortes.reduce((s, c) => s + c.comprimento, 0) + (barra.cortes.length * MARGEM_CORTE_CM);
        return sum + (tamanhoBarraPadrao - usado);
      }, 0);

      const totalComprimentoUtil = cortes.reduce((sum, c) => sum + c.comprimento, 0);
      const totalComprimentoTotal = barrasUsadas * tamanhoBarraPadrao;
      const aproveitamento = ((totalComprimentoUtil / totalComprimentoTotal) * 100).toFixed(2);

      const pontasReutilizaveis = barras
        .map(barra => {
          const usado = barra.cortes.reduce((s, c) => s + c.comprimento, 0) + (barra.cortes.length * MARGEM_CORTE_CM);
          const sobra = tamanhoBarraPadrao - usado;
          return { barra: barra.numero, tamanho: sobra, bitola: barra.cortes[0]?.bitola };
        })
        .filter(ponta => ponta.tamanho >= 100);

      const resultado = {
        barras,
        estatisticas: {
          total_cortes: totalCortes,
          barras_usadas: barrasUsadas,
          total_refugo_cm: totalRefugo,
          total_refugo_kg: calcularPesoRefugo(barras),
          aproveitamento_percentual: parseFloat(aproveitamento),
          pontas_reutilizaveis: pontasReutilizaveis,
          economia_estimada: calcularEconomia(pontasReutilizaveis)
        }
      };

      setOtimizacao(resultado);
      if (onOtimizacaoCalculada) onOtimizacaoCalculada(resultado);
    } catch (error) {
      console.error("Erro na otimização:", error);
    } finally {
      setCalculando(false);
    }
  };

  const salvarPontasNoEstoque = async () => {
    if (!otimizacao) return;
    try {
      for (const ponta of otimizacao.estatisticas.pontas_reutilizaveis) {
        console.log("Salvando ponta:", ponta);
      }
      toast.success(`${otimizacao.estatisticas.pontas_reutilizaveis.length} pontas salvas no estoque!`);
    } catch (error) {
      console.error("Erro ao salvar pontas:", error);
    }
  };

  return {
    tamanhoBarraPadrao, setTamanhoBarraPadrao,
    otimizacao, calculando,
    calcularOtimizacao, salvarPontasNoEstoque
  };
}