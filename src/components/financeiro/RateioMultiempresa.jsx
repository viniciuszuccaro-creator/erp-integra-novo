import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Split, Shuffle } from 'lucide-react';
import usePermissions from '@/components/lib/usePermissions';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import RateioFormFields from './rateio-multiempresa/RateioFormFields';
import RateioDistribuicaoCard from './rateio-multiempresa/RateioDistribuicaoCard';

const buildDistribuicao = (empresas) => empresas.map(emp => ({
  empresa_id: emp.id, empresa_nome: emp.nome_fantasia || emp.razao_social,
  percentual: 0, valor: 0, observacao: '',
}));

const initialForm = (empresas) => ({
  tipo_documento: 'ContaPagar', descricao: '', categoria: 'Aluguel',
  valor_total: 0, data_vencimento: '', criterio_rateio: 'percentual',
  distribuicao: buildDistribuicao(empresas),
});

export default function RateioMultiempresa({ empresas, grupoId, windowMode = false }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formRateio, setFormRateio] = useState(initialForm(empresas));
  const { user } = useUser();
  const { canCreate, hasPermission } = usePermissions();
  const { createInContext, updateInContext } = useContextoVisual();
  const contextoValido = !!(grupoId && empresas?.length);
  const podeRatear = canCreate('Financeiro', 'Rateio') || canCreate('Financeiro', 'Rateio Multiempresa') || hasPermission('Financeiro', null, 'gerenciar');

  const criarRateioMutation = useMutation({
    mutationFn: async (dados) => {
      // Regra-Mãe 5a/5b: contexto multiempresa e permissão obrigatórios na persistência
      if (!contextoValido) throw new Error('Contexto de grupo/empresas obrigatório para ratear (Regra-Mãe 5a).');
      if (!podeRatear) throw new Error('Seu perfil não permite criar rateios financeiros.');

      const rateio = await createInContext('RateioFinanceiro', {
        group_id: grupoId, tipo_documento: dados.tipo_documento, descricao: dados.descricao,
        valor_total: dados.valor_total, criterio_rateio: dados.criterio_rateio,
        data_rateio: new Date().toISOString().split('T')[0], distribuicao: dados.distribuicao,
        categoria: dados.categoria, responsavel: user?.full_name || 'Sistema', status_consolidacao: 'pendente',
      });

      const titulosCriados = [];
      for (const dist of dados.distribuicao) {
        if (dist.valor > 0) {
          const entidadeTitulo = dados.tipo_documento === 'ContaPagar' ? 'ContaPagar' : 'ContaReceber';
          const titulo = await createInContext(entidadeTitulo, {
            group_id: grupoId, empresa_id: dist.empresa_id, origem: 'grupo', e_replicado: true,
            documento_grupo_id: rateio.id, rateio_id: rateio.id,
            descricao: `${dados.descricao} (${dist.empresa_nome})`,
            [dados.tipo_documento === 'ContaPagar' ? 'fornecedor' : 'cliente']: dados.descricao,
            valor: parseFloat(dist.valor), valor_original_grupo: dados.valor_total,
            percentual_rateio: dist.percentual, data_emissao: new Date().toISOString().split('T')[0],
            data_vencimento: dados.data_vencimento, categoria: dados.categoria, status: 'Pendente',
            observacoes: `Rateio do grupo - ${dist.observacao}`,
          });
          titulosCriados.push(titulo);
        }
      }

      await updateInContext('RateioFinanceiro', rateio.id, {
        distribuicao_realizada: titulosCriados.map((t, idx) => ({
          empresa_id: dados.distribuicao[idx].empresa_id, empresa_nome: dados.distribuicao[idx].empresa_nome,
          titulo_id: t.id, valor: t.valor, percentual: t.percentual_rateio, status: t.status,
        })),
      });

      // Regra-Mãe 5d: auditoria completa do rateio (grupo, usuário, títulos gerados)
      try { await base44.entities.AuditLog.create({
        acao: 'Criação', modulo: 'Financeiro', entidade: 'RateioFinanceiro', registro_id: rateio.id,
        descricao: `Rateio multiempresa criado (${titulosCriados.length} título(s) distribuído(s))`,
        data_hora: new Date().toISOString(),
        group_id: grupoId, grupo_id: grupoId,
        usuario: user?.full_name || 'Sistema', usuario_id: user?.id,
        tipo_auditoria: 'operacional', sucesso: true,
        dados_novos: {
          tipo_documento: dados.tipo_documento, valor_total: dados.valor_total, criterio_rateio: dados.criterio_rateio,
          categoria: dados.categoria, titulos_ids: titulosCriados.map(t => t.id),
          distribuicao: dados.distribuicao,
        },
      }); } catch (e) { console.error('[Rateio] Falha ao auditar:', e?.message || e); }

      return { rateio, titulos: titulosCriados };
    },
    onSuccess: (resultado) => {
      queryClient.invalidateQueries({ queryKey: ['rateios'] });
      queryClient.invalidateQueries({ queryKey: ['contasPagar'] });
      queryClient.invalidateQueries({ queryKey: ['contasReceber'] });
      toast({ title: '✅ Rateio criado!', description: `${resultado.titulos.length} títulos distribuídos entre as empresas` });
      setFormRateio(initialForm(empresas));
    },
    onError: (error) => toast({ title: '❌ Erro ao criar rateio', description: error.message, variant: 'destructive' }),
  });

  const handlePercentualChange = (empresaId, percentual) => {
    const novaDistribuicao = formRateio.distribuicao.map(d => {
      if (d.empresa_id === empresaId) {
        const perc = parseFloat(percentual) || 0;
        return { ...d, percentual: perc, valor: ((perc / 100) * formRateio.valor_total).toFixed(2) };
      }
      return d;
    });
    setFormRateio({ ...formRateio, distribuicao: novaDistribuicao });
  };

  const distribuirIgual = () => {
    const percentualIgual = 100 / empresas.length;
    setFormRateio({
      ...formRateio,
      distribuicao: formRateio.distribuicao.map(d => ({
        ...d, percentual: percentualIgual,
        valor: ((percentualIgual / 100) * formRateio.valor_total).toFixed(2),
      })),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalPercentual = formRateio.distribuicao.reduce((sum, d) => sum + (parseFloat(d.percentual) || 0), 0);
    if (Math.abs(totalPercentual - 100) > 0.01) {
      toast({ title: '⚠️ Erro no Rateio', description: `A soma dos percentuais deve ser 100%. Atual: ${totalPercentual.toFixed(2)}%`, variant: 'destructive' });
      return;
    }
    criarRateioMutation.mutate(formRateio);
  };

  const totalPercentual = formRateio.distribuicao.reduce((s, d) => s + (parseFloat(d.percentual) || 0), 0);
  const totalValor = formRateio.distribuicao.reduce((s, d) => s + (parseFloat(d.valor) || 0), 0);

  const content = (
    <Card className="border-2 border-purple-200 w-full h-full">
      <CardHeader className="bg-purple-50 border-b">
        <CardTitle className="flex items-center gap-2"><Split className="w-5 h-5 text-purple-600" />Rateio Multi-Empresa</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <RateioFormFields formRateio={formRateio} setFormRateio={setFormRateio} />

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-semibold">Distribuição por Empresa</Label>
              <Button type="button" variant="outline" size="sm" onClick={distribuirIgual}>
                <Shuffle className="w-4 h-4 mr-2" />Distribuir Igual
              </Button>
            </div>
            <div className="space-y-3">
              {formRateio.distribuicao.map(dist => (
                <RateioDistribuicaoCard key={dist.empresa_id} dist={dist} onPercentualChange={handlePercentualChange} />
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900">TOTAL:</span>
                <div className="flex gap-6 items-center">
                  <div>
                    <span className="text-sm text-blue-700">Percentual: </span>
                    <span className={`font-bold text-lg ${Math.abs(totalPercentual - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>{totalPercentual.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Valor: </span>
                    <span className="font-bold text-lg text-blue-900">R$ {totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setFormRateio(initialForm(empresas))}>Limpar</Button>
            <Button type="submit" disabled={criarRateioMutation.isPending || !contextoValido || !podeRatear} data-permission="Financeiro.Rateio.criar" data-action="criar_rateio" data-sensitive="true" data-context-required="true" className="bg-purple-600 hover:bg-purple-700">
              {criarRateioMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Criando...</>
              ) : (
                <><Split className="w-4 h-4 mr-2" />Criar e Distribuir</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  if (windowMode) return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-purple-50 overflow-auto p-1.5">{content}</div>;
  return content;
}