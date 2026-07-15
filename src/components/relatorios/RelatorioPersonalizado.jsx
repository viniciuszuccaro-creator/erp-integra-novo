import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import RelatorioConfigPanel from './relatorio-personalizado/RelatorioConfigPanel';
import RelatorioVisualizacao from './relatorio-personalizado/RelatorioVisualizacao';

const ENTIDADES = [
  { value: 'Pedido', label: 'Pedidos', campos: ['numero_pedido', 'cliente_nome', 'vendedor', 'valor_total', 'status', 'data_pedido'] },
  { value: 'Cliente', label: 'Clientes', campos: ['nome', 'tipo', 'cidade', 'estado', 'status', 'limite_credito'] },
  { value: 'Produto', label: 'Produtos', campos: ['codigo', 'descricao', 'grupo', 'estoque_atual', 'preco_venda', 'custo_aquisicao'] },
  { value: 'ContaReceber', label: 'Contas a Receber', campos: ['cliente', 'valor', 'data_vencimento', 'status', 'forma_recebimento'] },
  { value: 'ContaPagar', label: 'Contas a Pagar', campos: ['fornecedor', 'valor', 'data_vencimento', 'status', 'categoria'] },
  { value: 'NotaFiscal', label: 'Notas Fiscais', campos: ['numero', 'tipo', 'cliente_fornecedor', 'valor_total', 'status', 'data_emissao'] },
  { value: 'Oportunidade', label: 'Oportunidades CRM', campos: ['titulo', 'cliente_nome', 'etapa', 'valor_estimado', 'probabilidade', 'responsavel'] },
];

export default function RelatorioPersonalizado() {
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const [config, setConfig] = useState({
    entidade: 'Pedido', tipo_visualizacao: 'tabela', campos: [], filtros: {},
    agrupamento: '', data_inicio: '', data_fim: '', ordenacao: '-created_date',
  });
  const [showConfig, setShowConfig] = useState(true);

  const entidadeAtual = ENTIDADES.find(e => e.value === config.entidade);

  const { data: dados = [], isLoading } = useQuery({
    queryKey: ['relatorio-personalizado', config, contextoKey],
    queryFn: async () => {
      let query = {};
      if (config.data_inicio) query.created_date = { $gte: config.data_inicio };
      if (config.data_fim) {
        if (query.created_date) query.created_date.$lte = config.data_fim;
        else query.created_date = { $lte: config.data_fim };
      }
      Object.keys(config.filtros).forEach(campo => { if (config.filtros[campo]) query[campo] = config.filtros[campo]; });
      return await filterInContext(config.entidade, query, config.ordenacao, 1000);
    },
    enabled: !showConfig && !!contexto,
  });

  const handleExportarCSV = () => {
    if (!dados.length) return;
    const camposExport = config.campos.length > 0 ? config.campos : entidadeAtual.campos;
    const csvHeader = camposExport.join(',');
    const csvRows = dados.map(item =>
      camposExport.map(campo => {
        const valor = item[campo];
        if (valor === null || valor === undefined) return '';
        return typeof valor === 'string' ? `"${valor}"` : valor;
      }).join(',')
    );
    const csv = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${config.entidade}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const dadosGrafico = (() => {
    if (!config.agrupamento || !dados.length) return [];
    const agrupado = {};
    dados.forEach(item => {
      const chave = item[config.agrupamento] || 'Sem Informação';
      if (!agrupado[chave]) agrupado[chave] = { nome: chave, valor: 0, quantidade: 0 };
      agrupado[chave].quantidade++;
      if (item.valor_total) agrupado[chave].valor += item.valor_total;
      if (item.valor) agrupado[chave].valor += item.valor;
    });
    return Object.values(agrupado);
  })();

  const camposExibir = config.campos.length > 0 ? config.campos : entidadeAtual.campos;

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatório Personalizado</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowConfig(!showConfig)}>
                {showConfig ? 'Ocultar' : 'Mostrar'} Configurações
              </Button>
              {!showConfig && (
                <>
                  <Button variant="outline" size="sm" onClick={handleExportarCSV}>
                    <Download className="w-4 h-4 mr-2" />CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { handleExportarCSV(); toast.info('Para exportar para Excel real, integre com biblioteca xlsx'); }}>
                    <FileText className="w-4 h-4 mr-2" />Excel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        {showConfig && (
          <RelatorioConfigPanel
            config={config} setConfig={setConfig}
            entidadeAtual={entidadeAtual} entidadesDisponiveis={ENTIDADES}
            onGerar={() => setShowConfig(false)}
          />
        )}

        {!showConfig && (
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <Badge variant="outline" className="mr-2">{entidadeAtual?.label}</Badge>
                <Badge variant="outline">{dados.length} registro(s)</Badge>
              </div>
            </div>
            <RelatorioVisualizacao
              tipo={config.tipo_visualizacao}
              dados={dados}
              dadosGrafico={dadosGrafico}
              camposExibir={camposExibir}
              isLoading={isLoading}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}