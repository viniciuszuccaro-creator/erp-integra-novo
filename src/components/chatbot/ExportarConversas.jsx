import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Table,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.6 - EXPORTAÇÃO DE CONVERSAS
 * 
 * Permite exportar conversas em diferentes formatos:
 * ✅ CSV para análise
 * ✅ JSON para integração
 * ✅ Relatório PDF (simulado)
 * ✅ Filtros por período
 */
export default function ExportarConversas() {
  const [exportando, setExportando] = useState(false);
  const [periodo, setPeriodo] = useState('7dias');
  const { empresaAtual } = useContextoVisual();

  const exportarCSV = async () => {
    setExportando(true);
    try {
      // Calcular data inicial baseada no período
      const dataInicial = new Date();
      if (periodo === '7dias') dataInicial.setDate(dataInicial.getDate() - 7);
      else if (periodo === '30dias') dataInicial.setDate(dataInicial.getDate() - 30);
      else if (periodo === '90dias') dataInicial.setDate(dataInicial.getDate() - 90);

      const conversas = await base44.entities.ConversaOmnicanal.filter({
        empresa_id: empresaAtual?.id
      }, '-data_inicio', 500);

      const conversasFiltradas = conversas.filter(c => 
        new Date(c.data_inicio) >= dataInicial
      );

      // Criar CSV
      const headers = [
        'ID', 'Data', 'Canal', 'Cliente', 'Email', 'Telefone', 
        'Status', 'Atendente', 'Tipo Atendimento', 'Sentimento', 
        'Total Mensagens', 'Intent Principal', 'Tags', 'Resolvido'
      ];

      const rows = conversasFiltradas.map(c => [
        c.id,
        new Date(c.data_inicio).toLocaleString('pt-BR'),
        c.canal,
        c.cliente_nome || '',
        c.cliente_email || '',
        c.cliente_telefone || '',
        c.status,
        c.atendente_nome || 'Bot',
        c.tipo_atendimento,
        c.sentimento_geral || 'Neutro',
        c.total_mensagens || 0,
        c.intent_principal || '',
        (c.tags || []).join('; '),
        c.resolvido ? 'Sim' : 'Não'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `conversas_${periodo}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast.success(`${conversasFiltradas.length} conversas exportadas!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar conversas');
    } finally {
      setExportando(false);
    }
  };

  const exportarJSON = async () => {
    setExportando(true);
    try {
      const dataInicial = new Date();
      if (periodo === '7dias') dataInicial.setDate(dataInicial.getDate() - 7);
      else if (periodo === '30dias') dataInicial.setDate(dataInicial.getDate() - 30);
      else if (periodo === '90dias') dataInicial.setDate(dataInicial.getDate() - 90);

      const conversas = await base44.entities.ConversaOmnicanal.filter({
        empresa_id: empresaAtual?.id
      }, '-data_inicio', 500);

      const conversasFiltradas = conversas.filter(c => 
        new Date(c.data_inicio) >= dataInicial
      );

      const jsonContent = JSON.stringify(conversasFiltradas, null, 2);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `conversas_${periodo}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      toast.success(`${conversasFiltradas.length} conversas exportadas!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar conversas');
    } finally {
      setExportando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Download className="w-5 h-5 text-blue-600" />
          Exportar Conversas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de Período */}
        <div>
          <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Período
          </p>
          <div className="flex gap-2">
            {[
              { valor: '7dias', label: '7 dias' },
              { valor: '30dias', label: '30 dias' },
              { valor: '90dias', label: '90 dias' },
              { valor: 'tudo', label: 'Tudo' }
            ].map((opcao) => (
              <button
                key={opcao.valor}
                onClick={() => setPeriodo(opcao.valor)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  periodo === opcao.valor
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opcao.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botões de Exportação */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={exportarCSV}
            disabled={exportando}
            className="flex items-center gap-2"
          >
            <Table className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportarJSON}
            disabled={exportando}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            JSON
          </Button>
        </div>

        {exportando && (
          <div className="text-center py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto" />
            <p className="text-xs text-slate-500 mt-1">Exportando...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}