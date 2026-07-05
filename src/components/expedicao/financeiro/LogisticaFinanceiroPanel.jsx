import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConfigFinanceiroLogistica from "./ConfigFinanceiroLogistica";

function Section({ title, children, extra }) {
  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        {extra}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function LogisticaFinanceiroPanel({ empresaId }) {
  const { filterInContext, createInContext, updateInContext } = useContextoVisual();

  // Config
  const cfgKey = React.useMemo(() => empresaId ? `log_finance_cfg_${empresaId}` : `log_finance_cfg_global`, [empresaId]);
  const { data: cfg } = useQuery({
    queryKey: ['log-fin-cfg', cfgKey],
    queryFn: async () => {
      const rows = await filterInContext('ConfiguracaoSistema', { chave: cfgKey }, undefined, 1);
      return rows?.[0]?.valor_json || {};
    }
  });

  // Entregas recentes
  const { data: entregas = [] } = useQuery({
    queryKey: ['log-entregas-fin', empresaId],
    queryFn: async () => await filterInContext('Entrega', {}, '-updated_date', 300)
  });

  // Contas CR/CP recentes (filtra localmente por [LOG])
  const { data: contasReceber = [] } = useQuery({
    queryKey: ['log-cr'],
    queryFn: async () => await filterInContext('ContaReceber', {}, '-updated_date', 400)
  });
  const { data: contasPagar = [] } = useQuery({
    queryKey: ['log-cp'],
    queryFn: async () => await filterInContext('ContaPagar', {}, '-updated_date', 400)
  });

  const crLog = React.useMemo(() => (contasReceber || []).filter(c => (c.descricao||'').includes('[LOG]')), [contasReceber]);
  const cpLog = React.useMemo(() => (contasPagar || []).filter(c => (c.descricao||'').includes('[LOG]')), [contasPagar]);

  const totalFretePrevisto = React.useMemo(() => (entregas || []).reduce((s, e) => s + (e.valor_frete || 0), 0), [entregas]);
  const totalCR = React.useMemo(() => crLog.reduce((s, c) => s + (c.valor || 0), 0), [crLog]);
  const totalCP = React.useMemo(() => cpLog.reduce((s, c) => s + (c.valor || 0), 0), [cpLog]);

  const gerarCRMutation = useMutation({
    mutationFn: async () => {
      if (!cfg?.centro_custo_id || !cfg?.plano_contas_id) throw new Error('Configure centro de custo e plano de contas.');
      const hoje = new Date();
      const venc = new Date(hoje.getTime() + (cfg?.dias_vencimento || 7) * 86400000).toISOString().slice(0,10);
      const entregasElegiveis = (entregas || []).filter(e => e.status === 'Entregue' && (e.valor_frete || 0) > 0);
      for (const e of entregasElegiveis) {
        await createInContext('ContaReceber', {
          descricao: `Serviço de Entrega [LOG] entrega_id:${e.id} pedido:${e.numero_pedido || ''}`,
          cliente: e.cliente_nome || 'Cliente',
          cliente_id: e.cliente_id || null,
          valor: e.valor_frete,
          data_emissao: hoje.toISOString().slice(0,10),
          data_vencimento: venc,
          centro_custo_id: cfg.centro_custo_id,
          plano_contas_id: cfg.plano_contas_id,
          forma_cobranca: cfg.forma_recebimento || 'PIX',
          projeto_obra: e.rota_id ? `Rota ${e.rota_id}` : undefined,
          status: 'Pendente',
        });
      }
    }
  });

  const gerarCPCombustivelMutation = useMutation({
    mutationFn: async () => {
      if (!cfg?.centro_custo_id || !cfg?.plano_contas_id) throw new Error('Configure centro de custo e plano de contas.');
      const hoje = new Date();
      const venc = new Date(hoje.getTime() + (cfg?.dias_vencimento || 7) * 86400000).toISOString().slice(0,10);
      const custoKm = Number(cfg?.custo_km || 0);
      const entregasElegiveis = (entregas || []).filter(e => (e.km_rodado || 0) > 0 && custoKm > 0);
      for (const e of entregasElegiveis) {
        const valor = (e.km_rodado || 0) * custoKm;
        await createInContext('ContaPagar', {
          descricao: `Combustível [LOG] entrega_id:${e.id} rota:${e.rota_id || ''}`,
          fornecedor: e.motorista || 'Motorista',
          valor,
          data_emissao: hoje.toISOString().slice(0,10),
          data_vencimento: venc,
          centro_custo_id: cfg.centro_custo_id,
          plano_contas_id: cfg.plano_contas_id,
          categoria: 'Transporte',
          forma_pagamento: cfg.forma_pagamento || 'Cartão',
          status: 'Pendente',
        });
      }
    }
  });

  const conciliarCR = async (cr) => {
    await updateInContext('ContaReceber', cr.id, {
      status: 'Recebido',
      data_recebimento: new Date().toISOString().slice(0,10),
      detalhes_pagamento: { ...(cr.detalhes_pagamento||{}), status_compensacao: 'Conciliado' }
    });
  };
  const conciliarCP = async (cp) => {
    await updateInContext('ContaPagar', cp.id, {
      status: 'Pago',
      data_pagamento: new Date().toISOString().slice(0,10),
      detalhes_pagamento: { ...(cp.detalhes_pagamento||{}), status_compensacao: 'Conciliado' }
    });
  };

  return (
    <div className="w-full h-full space-y-3">
      <div className="grid md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm">Frete Previsto</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-semibold">R$ {totalFretePrevisto.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm">CR (Gerado)</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-semibold text-emerald-700">R$ {totalCR.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-sm">CP (Gerado)</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-semibold text-rose-700">R$ {totalCP.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div></CardContent>
        </Card>
      </div>

      <Section title="Ações Rápidas" extra={<Badge variant="outline" className="text-xs">Config necessária para gerar títulos</Badge>}>
        <div className="flex flex-wrap gap-2">
          <Button data-permission="Financeiro.ContaReceber.criar" onClick={() => gerarCRMutation.mutate()} disabled={gerarCRMutation.isPending}>Gerar Contas a Receber por Entregas Entregues</Button>
          <Button data-permission="Financeiro.ContaPagar.criar" variant="outline" onClick={() => gerarCPCombustivelMutation.mutate()} disabled={gerarCPCombustivelMutation.isPending}>Gerar Contas a Pagar de Combustível</Button>
        </div>
      </Section>

      <Section title="Conciliação de Recebimentos">
        <div className="grid gap-2 max-h-[260px] overflow-auto">
          {crLog.length === 0 && <div className="text-sm text-slate-500">Sem títulos gerados [LOG].</div>}
          {crLog.map((c) => (
            <div key={c.id} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.descricao}</div>
                <div className="text-slate-600">R$ {Number(c.valor||0).toLocaleString('pt-BR',{minimumFractionDigits:2})} • Venc: {c.data_vencimento}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{c.status}</Badge>
                {c.status !== 'Recebido' && <Button data-permission="Financeiro.ContaReceber.baixar" size="sm" onClick={() => conciliarCR(c)}>Conciliar</Button>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Conciliação de Despesas">
        <div className="grid gap-2 max-h-[260px] overflow-auto">
          {cpLog.length === 0 && <div className="text-sm text-slate-500">Sem despesas geradas [LOG].</div>}
          {cpLog.map((c) => (
            <div key={c.id} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="font-medium truncate">{c.descricao}</div>
                <div className="text-slate-600">R$ {Number(c.valor||0).toLocaleString('pt-BR',{minimumFractionDigits:2})} • Venc: {c.data_vencimento}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{c.status}</Badge>
                {c.status !== 'Pago' && <Button data-permission="Financeiro.ContaPagar.baixar" size="sm" onClick={() => conciliarCP(c)}>Conciliar</Button>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Configuração Padrão">
        <ConfigFinanceiroLogistica empresaId={empresaId} />
      </Section>
    </div>
  );
}