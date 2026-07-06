import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Mail, Clock } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Agendamento Inteligente de Relatórios
 * Envia relatórios automáticos por e-mail
 */
export default function AgendamentoRelatorios({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, createInContext } = useContextoVisual();

  const [agendamento, setAgendamento] = useState({
    ativo: false,
    relatorio: 'dre',
    frequencia: 'mensal',
    dia_mes: 1,
    horario: '09:00',
    destinatarios: '',
    incluir_graficos: true,
    formato: 'PDF'
  });

  const salvarMutation = useMutation({
    mutationFn: async (data) => {
      // Salvar configuração com contexto multiempresa
      const configs = await filterInContext('ConfiguracaoSistema', {
        chave: 'agendamento_relatorios'
      });

      if (configs.length > 0) {
        return await base44.entities.ConfiguracaoSistema.update(configs[0].id, {
          categoria: 'Sistema',
          configuracoes_sistema: data
        });
      } else {
        return await createInContext('ConfiguracaoSistema', {
          chave: 'agendamento_relatorios',
          categoria: 'Sistema',
          configuracoes_sistema: data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-sistema'] });
      toast({ title: '✅ Agendamento salvo!' });
    }
  });

  return (
    <Card>
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Agendamento de Envio Automático
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
          <div>
            <Label className="font-semibold">Ativar Envio Automático</Label>
            <p className="text-xs text-slate-600">Envia relatórios por e-mail periodicamente</p>
          </div>
          <Switch
            checked={agendamento.ativo}
            onCheckedChange={(v) => setAgendamento({...agendamento, ativo: v})}
          />
        </div>

        {agendamento.ativo && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Relatório</Label>
                <Select
                  value={agendamento.relatorio}
                  onValueChange={(v) => setAgendamento({...agendamento, relatorio: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dre">DRE Mensal</SelectItem>
                    <SelectItem value="inadimplencia">Inadimplência</SelectItem>
                    <SelectItem value="fluxo_caixa">Fluxo de Caixa</SelectItem>
                    <SelectItem value="vendas">Vendas do Período</SelectItem>
                    <SelectItem value="producao">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frequência</Label>
                <Select
                  value={agendamento.frequencia}
                  onValueChange={(v) => setAgendamento({...agendamento, frequencia: v})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dia do Mês</Label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={agendamento.dia_mes}
                  onChange={(e) => setAgendamento({...agendamento, dia_mes: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label>Horário de Envio</Label>
                <Input
                  type="time"
                  value={agendamento.horario}
                  onChange={(e) => setAgendamento({...agendamento, horario: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label>Destinatários (separados por vírgula)</Label>
              <Input
                placeholder="email1@empresa.com, email2@empresa.com"
                value={agendamento.destinatarios}
                onChange={(e) => setAgendamento({...agendamento, destinatarios: e.target.value})}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded border">
              <Label className="text-sm">Incluir Gráficos</Label>
              <Switch
                checked={agendamento.incluir_graficos}
                onCheckedChange={(v) => setAgendamento({...agendamento, incluir_graficos: v})}
              />
            </div>
          </>
        )}

        <Button data-permission="Relatorios.AgendamentoRelatorios.salvar"
          onClick={() => salvarMutation.mutate(agendamento)}
          disabled={salvarMutation.isPending}
          className="w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          Salvar Agendamento
        </Button>
      </CardContent>
    </Card>
  );
}