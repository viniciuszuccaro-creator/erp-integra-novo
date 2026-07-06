import React, { useState } from 'react';
import { BarChart3, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function DashboardIAGerador() {
  const [tipo, setTipo] = useState('vendas');
  const [periodo, setPeriodo] = useState('30');
  const [gerando, setGerando] = useState(false);
  const [relatorio, setRelatorio] = useState(null);

  const gerar = async () => {
    setGerando(true);
    try {
      const prompt = `Gere um relatório executivo de ${tipo} dos últimos ${periodo} dias com KPIs, tendências, recomendações e conclusões. Formato: markdown com seções numeradas.`;
      
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        model: 'gpt_5_4'
      });

      setRelatorio({ tipo, periodo, conteudo: res, data: new Date() });

      // Auditoria
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me()).email,
        acao: 'Geração',
        modulo: 'Dashboard',
        tipo_auditoria: 'ia',
        entidade: 'Relatório',
        descricao: `Relatório de ${tipo} gerado por IA`,
        dados_novos: { tipo, periodo },
        data_hora: new Date().toISOString(),
      });
    } catch (err) {
      setRelatorio({ erro: err.message });
    } finally {
      setGerando(false);
    }
  };

  const exportarPDF = async () => {
    if (!relatorio?.conteudo) return;
    const link = document.createElement('a');
    link.href = `data:text/plain,${encodeURIComponent(relatorio.conteudo)}`;
    link.download = `relatorio-${relatorio.tipo}-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="w-full space-y-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold">Gerador de Relatórios IA</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full px-3 py-2 border rounded text-sm">
            <option value="vendas">Vendas</option>
            <option value="financeiro">Financeiro</option>
            <option value="estoque">Estoque</option>
            <option value="clientes">Clientes</option>
            <option value="operacoes">Operações</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Período (dias):</label>
          <input type="number" value={periodo} onChange={(e) => setPeriodo(e.target.value)} min="1" max="365" className="w-full px-3 py-2 border rounded text-sm" />
        </div>
      </div>

      <Button data-permission="Dashboard.DashboardIAGerador.gerar" onClick={gerar} disabled={gerando} className="w-full">
        {gerando ? 'Gerando...' : 'Gerar Relatório'}
      </Button>

      {relatorio && (
        <div className="space-y-3">
          {relatorio.erro ? (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm">{relatorio.erro}</div>
          ) : (
            <>
              <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40 border whitespace-pre-wrap">{relatorio.conteudo}</pre>
              <Button data-permission="Dashboard.DashboardIAGerador.exportar" onClick={exportarPDF} size="sm" variant="outline" className="w-full gap-1">
                <Download className="w-4 h-4" /> Exportar
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}