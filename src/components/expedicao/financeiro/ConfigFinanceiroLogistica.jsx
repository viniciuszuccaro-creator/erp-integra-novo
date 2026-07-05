import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConfigFinanceiroLogistica({ empresaId }) {
  const queryClient = useQueryClient();
  const { filterInContext, getFiltroContexto } = useContextoVisual();
  const cfgKey = React.useMemo(() => empresaId ? `log_finance_cfg_${empresaId}` : `log_finance_cfg_global`, [empresaId]);

  const { data: cfg } = useQuery({
    queryKey: ['log-fin-cfg', cfgKey],
    queryFn: async () => {
      const rows = await filterInContext('ConfiguracaoSistema', { chave: cfgKey }, undefined, 1);
      return rows?.[0]?.valor_json || {};
    }
  });

  const { data: centros = [] } = useQuery({
    queryKey: ['centros-custo'],
    queryFn: () => filterInContext('CentroCusto', {}, 'descricao', 200),
    staleTime: 120000
  });

  const { data: planos = [] } = useQuery({
    queryKey: ['plano-contas'],
    queryFn: async () => {
      try { return await filterInContext('PlanoDeContas', {}, 'descricao', 200); } catch { return []; }
    },
    staleTime: 120000
  });

  const [form, setForm] = React.useState({
    centro_custo_id: '',
    plano_contas_id: '',
    forma_recebimento: 'PIX',
    forma_pagamento: 'Cartão',
    custo_km: 2.5,
    dias_vencimento: 7,
  });

  React.useEffect(() => {
    if (cfg) setForm({
      centro_custo_id: cfg.centro_custo_id || '',
      plano_contas_id: cfg.plano_contas_id || '',
      forma_recebimento: cfg.forma_recebimento || 'PIX',
      forma_pagamento: cfg.forma_pagamento || 'Cartão',
      custo_km: typeof cfg.custo_km === 'number' ? cfg.custo_km : 2.5,
      dias_vencimento: cfg.dias_vencimento || 7,
    });
  }, [cfg]);

  const saveMutation = useMutation({
    mutationFn: async (values) => {
      const rows = await filterInContext('ConfiguracaoSistema', { chave: cfgKey }, undefined, 1);
      if (rows?.length) {
        await base44.entities.ConfiguracaoSistema.update(rows[0].id, { valor_json: values });
      } else {
        const scope = getFiltroContexto?.('empresa_id', true) || {};
        await base44.entities.ConfiguracaoSistema.create({ chave: cfgKey, valor_json: values, group_id: scope.group_id, empresa_id: scope.empresa_id });
      }
      return values;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['log-fin-cfg', cfgKey] })
  });

  return (
    <Card>
      <CardHeader><CardTitle>Configuração Financeira de Logística</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Centro de Custo Padrão</label>
            <Select value={form.centro_custo_id} onValueChange={(v) => setForm({ ...form, centro_custo_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {centros.map(c => <SelectItem key={c.id} value={c.id}>{c.codigo ? `${c.codigo} — ` : ''}{c.descricao}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">Plano de Contas Padrão</label>
            <Select value={form.plano_contas_id} onValueChange={(v) => setForm({ ...form, plano_contas_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {planos.map(p => <SelectItem key={p.id} value={p.id}>{p.descricao || p.codigo || p.id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">Forma de Recebimento (CR)</label>
            <Input value={form.forma_recebimento} onChange={(e) => setForm({ ...form, forma_recebimento: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">Forma de Pagamento (CP)</label>
            <Input value={form.forma_pagamento} onChange={(e) => setForm({ ...form, forma_pagamento: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">Custo por KM (R$)</label>
            <Input type="number" value={form.custo_km} onChange={(e) => setForm({ ...form, custo_km: Number(e.target.value)||0 })} />
          </div>
          <div>
            <label className="text-sm">Dias para Vencimento</label>
            <Input type="number" value={form.dias_vencimento} onChange={(e) => setForm({ ...form, dias_vencimento: Number(e.target.value)||0 })} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>Salvar Configuração</Button>
        </div>
      </CardContent>
    </Card>
  );
}