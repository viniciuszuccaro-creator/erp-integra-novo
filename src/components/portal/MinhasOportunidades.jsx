import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Clock, DollarSign, Flame, Snowflake, ThermometerSun } from 'lucide-react';
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * V21.5 - Minhas Oportunidades COMPLETO
 * P2: Multi-tenant — todas as queries incluem group_id/empresa_id
 */
export default function MinhasOportunidades() {
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: oportunidades = [], isLoading } = useQuery({
    queryKey: ['minhas-oportunidades', contextoKey],
    queryFn: async () => {
      const user = await base44.auth.me();
      const clientes = await filterInContext('Cliente', { portal_usuario_id: user.id });
      const cliente = clientes[0];
      
      if (!cliente) {
        return await filterInContext('Oportunidade',
          { cliente_email: user.email },
          '-data_abertura',
          50
        );
      }
      
      return await filterInContext('Oportunidade',
        { cliente_id: cliente.id, group_id: cliente.group_id, empresa_id: cliente.empresa_id },
        '-data_abertura',
        50
      );
    },
    enabled: !!contextoKey,
  });

  const etapasFunil = [
    { nome: 'Prospecção', cor: 'bg-gray-400' },
    { nome: 'Contato Inicial', cor: 'bg-blue-400' },
    { nome: 'Qualificação', cor: 'bg-cyan-400' },
    { nome: 'Proposta', cor: 'bg-yellow-400' },
    { nome: 'Negociação', cor: 'bg-orange-400' },
    { nome: 'Fechamento', cor: 'bg-green-400' },
    { nome: 'Ganho', cor: 'bg-green-600' },
    { nome: 'Perdido', cor: 'bg-red-500' },
  ];

  const getEtapaProgress = (etapa) => {
    const map = {
      'Prospecção': 10,
      'Contato Inicial': 25,
      'Qualificação': 40,
      'Proposta': 60,
      'Negociação': 80,
      'Fechamento': 90,
      'Ganho': 100,
      'Perdido': 0,
    };
    return map[etapa] || 0;
  };

  const getTemperaturaIcon = (temperatura) => {
    switch (temperatura?.toLowerCase()) {
      case 'quente':
        return <Flame className="w-5 h-5 text-red-500" />;
      case 'morno':
        return <ThermometerSun className="w-5 h-5 text-yellow-500" />;
      case 'frio':
        return <Snowflake className="w-5 h-5 text-blue-500" />;
      default:
        return <ThermometerSun className="w-5 h-5 text-gray-400" />;
    }
  };

  const statusColor = {
    'Aberto': 'bg-blue-100 text-blue-800',
    'Em Andamento': 'bg-yellow-100 text-yellow-800',
    'Ganho': 'bg-green-100 text-green-800',
    'Perdido': 'bg-red-100 text-red-800',
    'Cancelado': 'bg-gray-100 text-gray-800',
  };

  if (isLoading) {
    return <div className="p-6">Carregando oportunidades...</div>;
  }

  const valorTotalPipeline = oportunidades
    .filter(o => o.status !== 'Perdido' && o.status !== 'Cancelado')
    .reduce((sum, o) => sum + (o.valor_estimado || 0), 0);

  const taxaConversao = oportunidades.length > 0
    ? ((oportunidades.filter(o => o.status === 'Ganho').length / oportunidades.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 w-full h-full">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total em Negociação</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalPipeline)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Oportunidades</p>
                <p className="text-2xl font-bold text-purple-600">{oportunidades.length}</p>
              </div>
              <Target className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-green-600">{taxaConversao}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Em Andamento</p>
                <p className="text-2xl font-bold text-orange-600">
                  {oportunidades.filter(o => o.status === 'Em Andamento').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Oportunidades */}
      <div className="grid gap-4 w-full">
        {oportunidades.map((oportunidade) => {
          const progress = getEtapaProgress(oportunidade.etapa);

          return (
            <Card key={oportunidade.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{oportunidade.titulo}</h3>
                      {oportunidade.descricao && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {oportunidade.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          {getTemperaturaIcon(oportunidade.temperatura)}
                          <span className="text-sm font-medium capitalize">
                            {oportunidade.temperatura || 'Morno'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Score: <span className="font-medium">{oportunidade.score || 50}/100</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          Probabilidade: <span className="font-medium">{oportunidade.probabilidade || 50}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColor[oportunidade.status] || 'bg-gray-100'}>
                      {oportunidade.status}
                    </Badge>
                    <p className="text-lg font-bold text-purple-600 mt-2">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(oportunidade.valor_estimado || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Etapa: {oportunidade.etapa}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-slate-600">Data de Abertura</p>
                    <p className="text-sm font-medium">
                      {new Date(oportunidade.data_abertura).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Previsão de Fechamento</p>
                    <p className="text-sm font-medium">
                      {oportunidade.data_previsao
                        ? new Date(oportunidade.data_previsao).toLocaleDateString('pt-BR')
                        : 'Não definida'}
                    </p>
                  </div>
                </div>

                {oportunidade.responsavel && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Responsável:</span> {oportunidade.responsavel}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {oportunidades.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma oportunidade em andamento</p>
              <p className="text-sm text-slate-400 mt-2">
                Solicite um orçamento para iniciar uma nova negociação
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}