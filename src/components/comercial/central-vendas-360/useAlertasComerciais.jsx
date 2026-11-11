// Alertas proativos da Central 360° — calculados sobre as negociações já carregadas (sem consulta nova)
import { useMemo } from 'react';

const ORDEM_SEVERIDADE = { critico: 0, alto: 1, medio: 2 };

const diasDesde = (valor) => {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return Math.floor((Date.now() - data.getTime()) / 86400000);
};

const diasAte = (valor) => {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  const alvo = new Date(data); alvo.setHours(0, 0, 0, 0);
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / 86400000);
};

export default function useAlertasComerciais({ negociacoes = [] } = {}) {
  return useMemo(() => {
    const alertas = [];

    (negociacoes || []).forEach((negociacao) => {
      const registro = negociacao.registro || {};
      const base = {
        chave: negociacao.chave,
        numero: negociacao.numero,
        cliente: negociacao.cliente_nome,
        origem: negociacao.origem,
        negociacao,
      };

      if (['aberto', 'aguardando', 'aprovacao'].includes(negociacao.grupo)) {
        const validade = diasAte(registro.data_validade);
        if (validade !== null && validade < 0) {
          alertas.push({ ...base, tipo: 'validade', severidade: 'critico',
            titulo: 'Proposta vencida',
            detalhe: `Venceu há ${Math.abs(validade)} dia(s) — revalidar ou encerrar.` });
        } else if (validade !== null && validade <= 3) {
          alertas.push({ ...base, tipo: 'validade', severidade: 'alto',
            titulo: 'Proposta vencendo',
            detalhe: validade === 0 ? 'Vence hoje.' : `Vence em ${validade} dia(s).` });
        }
      }

      if (negociacao.grupo === 'aprovacao') {
        const parado = diasDesde(registro.updated_date || negociacao.data);
        if (parado !== null && parado >= 2) {
          alertas.push({ ...base, tipo: 'aprovacao', severidade: 'alto',
            titulo: 'Aguardando aprovação',
            detalhe: `Há ${parado} dia(s) sem decisão.` });
        }
      }

      if (['aberto', 'aguardando'].includes(negociacao.grupo)) {
        const parado = diasDesde(registro.updated_date || negociacao.data);
        if (parado !== null && parado >= 7) {
          alertas.push({ ...base, tipo: 'parado', severidade: 'medio',
            titulo: 'Negociação parada',
            detalhe: `Sem movimento há ${parado} dia(s) — agendar retorno.` });
        }
      }
    });

    alertas.sort((a, b) => ORDEM_SEVERIDADE[a.severidade] - ORDEM_SEVERIDADE[b.severidade]);

    return {
      alertas,
      total: alertas.length,
      criticos: alertas.filter((a) => a.severidade === 'critico').length,
      altos: alertas.filter((a) => a.severidade === 'alto').length,
    };
  }, [negociacoes]);
}