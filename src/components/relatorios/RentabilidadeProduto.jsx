import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import ExportMenu from '@/components/ui/ExportMenu';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { useRentabilidadeProduto, useCurvaABC } from './rentabilidade-produto/useRentabilidadeProduto';
import RentabilidadeKPIs from './rentabilidade-produto/RentabilidadeKPIs';
import RentabilidadeCharts from './rentabilidade-produto/RentabilidadeCharts';
import RentabilidadeTable from './rentabilidade-produto/RentabilidadeTable';

export default function RentabilidadeProduto({ empresaId }) {
  const [periodo, setPeriodo] = useState(12);
  const [ordenacao, setOrdenacao] = useState('margem_valor');
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', contextoKey],
    queryFn: () => filterInContext('Produto', {}, 'descricao', 999),
    enabled: !!contexto,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', contextoKey],
    queryFn: () => filterInContext('Pedido', {}, '-data_pedido', 999),
    enabled: !!contexto,
  });

  const dados = useRentabilidadeProduto(produtos, pedidos, periodo, ordenacao);
  const top20 = dados.slice(0, 20);
  const curvaABCData = useCurvaABC(dados);

  const totalReceita = dados.reduce((sum, p) => sum + p.receita_total, 0);
  const totalMargem = dados.reduce((sum, p) => sum + p.margem_valor, 0);
  const margemMediaPonderada = totalReceita > 0 ? (totalMargem / totalReceita) * 100 : 0;
  const produtosMargemNegativa = dados.filter(p => p.margem_percentual < 0);

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rentabilidade por Produto (Curva ABC)</h2>
          <p className="text-sm text-slate-600">Classificação ABC de produtos</p>
        </div>
        <div className="flex gap-3">
          <select value={periodo} onChange={(e) => setPeriodo(parseInt(e.target.value))} className="border rounded-lg px-3 py-2">
            <option value={3}>3 meses</option><option value={6}>6 meses</option>
            <option value={12}>12 meses</option><option value={24}>24 meses</option>
          </select>
          <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="margem_valor">Margem (R$)</option>
            <option value="margem_percentual">Margem (%)</option>
            <option value="receita">Receita</option>
            <option value="quantidade">Quantidade</option>
          </select>
          <ExportMenu
            data={dados.map(p => ({
              'Código': p.codigo, 'Produto': p.descricao, 'ABC': p.classificacao_abc,
              'Qtd Vendida': p.quantidade_vendida.toFixed(2),
              'Receita Total': `R$ ${p.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              'Custo Total': `R$ ${p.custo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              'Margem R$': `R$ ${p.margem_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              'Margem %': `${p.margem_percentual.toFixed(1)}%`,
              'Preço Médio': `R$ ${p.preco_medio_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              'Pedidos': p.quantidade_pedidos,
              'Giro Estoque': p.giro_estoque.toFixed(2),
            }))}
            fileName="rentabilidade_produtos"
            title="Rentabilidade por Produto - Curva ABC"
          />
        </div>
      </div>

      <RentabilidadeKPIs
        dados={dados}
        totalReceita={totalReceita}
        totalMargem={totalMargem}
        margemMediaPonderada={margemMediaPonderada}
        produtosMargemNegativa={produtosMargemNegativa}
      />

      <RentabilidadeCharts top20={top20} curvaABCData={curvaABCData} />

      {produtosMargemNegativa.length > 0 && (
        <Card className="border-0 shadow-md bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">⚠️ Produtos com Margem Negativa</p>
                <p className="text-sm text-red-700">{produtosMargemNegativa.length} produto(s) estão vendendo abaixo do custo</p>
                <p className="text-xs text-red-600 mt-1">
                  Produtos: {produtosMargemNegativa.slice(0, 3).map(p => p.descricao).join(', ')}
                  {produtosMargemNegativa.length > 3 && ` e mais ${produtosMargemNegativa.length - 3}...`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <RentabilidadeTable top20={top20} />
    </div>
  );
}