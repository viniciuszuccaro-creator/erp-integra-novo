import React, { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function ImportarExportarPerfis({ perfis, onImportar }) {
  const fileInputRef = useRef(null);

  const exportarPerfis = () => {
    const dados = {
      versao: "1.0",
      data_exportacao: new Date().toISOString(),
      perfis: perfis.map(p => ({
        nome_perfil: p.nome_perfil,
        descricao: p.descricao,
        nivel_perfil: p.nivel_perfil,
        permissoes: p.permissoes,
        ativo: p.ativo
      }))
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfis-acesso-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`${perfis.length} perfis exportados!`);
  };

  const importarPerfis = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result);
        
        if (!dados.perfis || !Array.isArray(dados.perfis)) {
          throw new Error("Formato inválido");
        }

        if (onImportar) {
          onImportar(dados.perfis);
        }

        toast.success(`${dados.perfis.length} perfis importados!`);
      } catch (error) {
        toast.error("Erro ao importar: " + error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base">Importar / Exportar Perfis</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            Use essa funcionalidade para fazer backup ou replicar perfis entre ambientes
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={exportarPerfis}
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
            disabled={perfis.length === 0}
            data-action="RBAC.Perfil.exportar"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar {perfis.length} Perfis
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full justify-start"
            data-action="RBAC.Perfil.importar.abrirArquivo"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Perfis
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={importarPerfis}
          className="hidden"
          data-action="RBAC.Perfil.importar.arquivo"
        />
      </CardContent>
    </Card>
  );
}
