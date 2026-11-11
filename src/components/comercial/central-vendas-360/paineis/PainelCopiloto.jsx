// Copiloto comercial da Central 360° — alertas proativos + análise assistida da negociação
import React, { useState } from 'react';
import { AlertTriangle, Loader2, Sparkles, Target, TrendingDown, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { brl, dataCurta } from '../negociacaoUtils';

const ESTILO_SEVERIDADE = {
  critico: { Icone: XCircle, cor: 'text-red-600' },
  alto: { Icone: AlertTriangle, cor: 'text-amber-600' },
  medio: { Icone: TrendingDown, cor: 'text-slate-500' },
};

const montarPrompt = ({ negociacao, validacao, alertas, contexto }) => {
  const registro = negociacao?.registro || {};
  const itens = (negociacao?.itens || [])
    .slice(0, 15)
    .map((item) => `- ${item.descricao} · ${item.quantidade} ${item.unidade || ''} · ${brl(item.valor_total)}`)
    .join('\n');

  const pendencias = (validacao?.checagens || [])
    .filter((c) => c.status !== 'ok')
    .map((c) => `- [${c.status}] ${c.titulo}: ${c.detalhe}`)
    .join('\n') || '- nenhuma';

  return `Você é o copiloto comercial de uma distribuidora/indústria de aço (ERP Integra).
Analise a negociação abaixo e responda em português do Brasil, objetivo, sem inventar dados.

Contexto: ${contexto || 'não informado'}
Negociação: ${negociacao?.numero} (${negociacao?.origem === 'orcamento' ? 'orçamento' : 'pedido'})
Cliente: ${negociacao?.cliente_nome || 'não informado'}
Vendedor: ${negociacao?.vendedor || 'não informado'} · Canal: ${negociacao?.canal || 'não informado'}
Situação atual: ${negociacao?.situacao || registro.status || 'não informada'}
Data: ${dataCurta(negociacao?.data)}
Total: ${brl(negociacao?.totais?.total)} · Desconto: ${brl(negociacao?.totais?.desconto)} (${(validacao?.descontoPercentual || 0).toFixed(1)}%)
Condição de pagamento: ${negociacao?.condicao_pagamento || registro.condicao_pagamento || 'não informada'}

Itens:
${itens || '- nenhum item'}

Pendências do motor de fechamento:
${pendencias}

Alertas ativos: ${alertas.length ? alertas.map((a) => `${a.titulo} (${a.detalhe})`).join('; ') : 'nenhum'}

Responda exatamente neste formato, em no máximo 140 palavras:
RESUMO: uma frase sobre a saúde da negociação.
RISCOS: até 2 riscos concretos.
PRÓXIMAS AÇÕES: 3 ações prática, cada uma começando com verbo no infinitivo.
ARGUMENTO: 1 argumento de valor para o cliente, baseado apenas nos itens e no desconto informados.`;
};

export default function PainelCopiloto({
  negociacao, alertas = [], validacao, onSelecionarNegociacao,
}) {
  const [analise, setAnalise] = useState('');
  const [analisando, setAnalisando] = useState(false);
  const { user } = useUser();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const gerarAnalise = async () => {
    if (!negociacao) {
      toast.error('Selecione uma negociação para analisar.');
      return;
    }
    setAnalisando(true);
    try {
      const prompt = montarPrompt({
        negociacao,
        validacao,
        alertas: alertas.filter((a) => a.chave === negociacao.chave),
        contexto: empresaAtual?.nome || grupoAtual?.nome,
      });
      const resposta = await base44.integrations.Core.InvokeLLM({ prompt });
      setAnalise(String(resposta || '').trim());

      void base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id || null,
        acao: 'Análise',
        modulo: 'Comercial',
        tipo_auditoria: 'venda',
        entidade: negociacao.origem === 'orcamento' ? 'OrcamentoCliente' : 'Pedido',
        descricao: `Copiloto comercial analisou a negociação ${negociacao.numero}`,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtual?.id || null,
        data_hora: new Date().toISOString(),
      }).catch((erro) => console.warn('AuditLog do copiloto falhou:', erro));
    } catch (erro) {
      toast.error(`Não foi possível gerar a análise: ${erro.message}`);
    } finally {
      setAnalisando(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
          Alertas proativos ({alertas.length})
        </p>
        {alertas.length === 0 ? (
          <p className="text-[11px] text-slate-500">Nenhum alerta nas negociações abertas.</p>
        ) : (
          <ul className="space-y-1 max-h-52 overflow-auto">
            {alertas.map((alerta) => {
              const estilo = ESTILO_SEVERIDADE[alerta.severidade] || ESTILO_SEVERIDADE.medio;
              const Icone = estilo.Icone;
              return (
                <li key={`${alerta.chave}-${alerta.tipo}`}>
                  <button
                    type="button"
                    onClick={() => onSelecionarNegociacao?.(alerta.negociacao)}
                    className="w-full text-left flex items-start gap-1.5 rounded px-1 py-1 hover:bg-white"
                    title="Abrir negociação"
                  >
                    <Icone className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${estilo.cor}`} />
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold text-slate-700 truncate">
                        {alerta.numero} · {alerta.cliente}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {alerta.titulo} — {alerta.detalhe}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-md border border-indigo-200 bg-indigo-50/60 p-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700 inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Copiloto
          </p>
          <button
            type="button"
            onClick={gerarAnalise}
            disabled={analisando || !negociacao}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
          >
            {analisando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
            {analisando ? 'Analisando…' : 'Analisar com IA'}
          </button>
        </div>

        {negociacao ? (
          <p className="text-[11px] text-slate-600 mt-1">
            {negociacao.numero} · {negociacao.cliente_nome} · {brl(negociacao?.totais?.total)}
          </p>
        ) : (
          <p className="text-[11px] text-slate-600 mt-1">Selecione uma negociação na tabela.</p>
        )}

        {analise && (
          <pre className="mt-2 whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-700 bg-white rounded border border-indigo-100 p-2 max-h-60 overflow-auto">
            {analise}
          </pre>
        )}
      </div>
    </div>
  );
}