import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Package, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * V21.5 - Exportação de Dados
 * P2: Multi-tenant — usa filterInContext
 */
export default function ExportarDadosPortal({ clienteId }) {
  const [exportando, setExportando] = useState(null);
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: pedidos = [] } = useQuery({
    queryKey: ['export-pedidos', clienteId, contextoKey],
    queryFn: () => filterInContext('Pedido', { cliente_id: clienteId }, '-data_pedido', 1000),
    enabled: !!clienteId && !!contextoKey,
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['export-contas', clienteId, contextoKey],
    queryFn: () => filterInContext('ContaReceber', { cliente_id: clienteId }, '-data_vencimento', 1000),
    enabled: !!clienteId && !!contextoKey,
  });

  const exportarParaCSV = (dados, nomeArquivo, colunas) => {
    setExportando(nomeArquivo);
    
    try {
      const headers = colunas.map(c => c.label).join(',');
      const rows = dados.map(item => 
        colunas.map(c => {
          const valor = c.field.split('.').reduce((obj, key) => obj?.[key], item);
          return typeof valor === 'string' && valor.includes(',') ? `"${valor}"` : valor;
        }).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`✅ ${nomeArquivo} exportado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar dados');
      console.error(error);
    } finally {
      setExportando(null);
    }
  };

  const handleExportPedidos = () => {
    const colunas = [
      { label: 'Número', field: 'numero_pedido' },
      { label: 'Data', field: 'data_pedido' },
      { label: 'Status', field: 'status' },
      { label: 'Valor Total', field: 'valor_total' },
      { label: 'Forma Pagamento', field: 'forma_pagamento' },
    ];
    exportarParaCSV(pedidos, 'Meus_Pedidos', colunas);
  };

  const handleExportBoletos = () => {
    const colunas = [
      { label: 'Descrição', field: 'descricao' },
      { label: 'Valor', field: 'valor' },
      { label: 'Vencimento', field: 'data_vencimento' },
      { label: 'Status', field: 'status' },
      { label: 'Documento', field: 'numero_documento' },
    ];
    exportarParaCSV(contasReceber, 'Minhas_Financas', colunas);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="w-5 h-5 text-blue-600" />
          Exportar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={handleExportPedidos}
            disabled={exportando === 'Meus_Pedidos' || pedidos.length === 0}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50"
          >
            {exportando === 'Meus_Pedidos' ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            ) : (
              <Package className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <p className="font-semibold">Exportar Pedidos</p>
              <p className="text-xs text-slate-600">{pedidos.length} pedidos • CSV</p>
            </div>
          </Button>

          <Button
            onClick={handleExportBoletos}
            disabled={exportando === 'Minhas_Financas' || contasReceber.length === 0}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50"
          >
            {exportando === 'Minhas_Financas' ? (
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            ) : (
              <DollarSign className="w-8 h-8 text-green-600" />
            )}
            <div>
              <p className="font-semibold">Exportar Financeiro</p>
              <p className="text-xs text-slate-600">{contasReceber.length} títulos • CSV</p>
            </div>
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Sobre a Exportação</p>
              <p>
                Os dados são exportados em formato CSV, compatível com Excel, Google Sheets e outros.
                Ideal para análises personalizadas e integração com outros sistemas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}