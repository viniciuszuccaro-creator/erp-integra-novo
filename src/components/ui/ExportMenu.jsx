import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { base44 } from "@/api/base44Client";

/**
 * Menu de exportação reutilizável
 * Exporta dados em Excel ou PDF
 */
export default function ExportMenu({ data, fileName = "relatorio", title = "Relatório", module = "Sistema", section = "Exportacao", action = "exportar" }) {
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const allowed = hasPermission(module, section, 'exportar');
  const exportToExcel = () => {
    if (!allowed) {
      base44.entities.AuditLog.create({
        usuario: 'UI', acao: 'Bloqueio', modulo: module, tipo_auditoria: 'seguranca',
        entidade: 'Exportacao', descricao: `Tentativa sem permissão (${section})`,
        empresa_id: empresaAtual?.id || null, group_id: grupoAtual?.id || null,
        data_hora: new Date().toISOString(), sucesso: false
      });
      toast.error('Você não tem permissão para exportar.');
      return;
    }
    base44.entities.AuditLog.create({
      usuario: 'UI', acao: 'Exportação', modulo: module, tipo_auditoria: 'ui',
      entidade: 'Exportacao', descricao: `Exportar Excel (${section})`,
      empresa_id: empresaAtual?.id || null, group_id: grupoAtual?.id || null,
      data_hora: new Date().toISOString(), sucesso: true
    });
    if (!data || data.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    // Criar CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(";"),
      ...data.map(row => headers.map(h => row[h] || "").join(";"))
    ].join("\n");

    // Download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (!allowed) {
      base44.entities.AuditLog.create({
        usuario: 'UI', acao: 'Bloqueio', modulo: module, tipo_auditoria: 'seguranca',
        entidade: 'Exportacao', descricao: `Tentativa sem permissão (${section})`,
        empresa_id: empresaAtual?.id || null, group_id: grupoAtual?.id || null,
        data_hora: new Date().toISOString(), sucesso: false
      });
      toast.error('Você não tem permissão para exportar.');
      return;
    }
    base44.entities.AuditLog.create({
      usuario: 'UI', acao: 'Exportação', modulo: module, tipo_auditoria: 'ui',
      entidade: 'Exportacao', descricao: `Exportar PDF (${section})`,
      empresa_id: empresaAtual?.id || null, group_id: grupoAtual?.id || null,
      data_hora: new Date().toISOString(), sucesso: true
    });
    if (!data || data.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    // Criar HTML para impressão
    const headers = Object.keys(data[0]);
    const htmlTable = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e293b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f1f5f9; padding: 10px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600; }
            td { padding: 8px; border: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${headers.map(h => `<td>${row[h] || '-'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Gerado em ${new Date().toLocaleString('pt-BR')} - ERP Integra</p>
          </div>
        </body>
      </html>
    `;

    // Abrir em nova janela e imprimir
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(htmlTable);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-permission="Sistema.ExportMenu.exportar" variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Exportar Excel (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          Exportar PDF (Imprimir)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}