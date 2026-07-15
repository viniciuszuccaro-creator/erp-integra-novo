import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Save } from "lucide-react";

export default function ParametroPortalClienteForm({ parametro, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(parametro || {
    habilitar_portal: true,
    permitir_visualizar_pedidos: true,
    permitir_aprovar_orcamentos: true,
    permitir_upload_projetos: true,
    permitir_chat: true,
    permitir_chamados: true,
    permitir_download_documentos: true,
    prazo_expiracao_link_dias: 30,
    observacoes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "space-y-6";

  return (
    <div className={containerClass}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Parâmetros do Portal do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Habilitar Portal</Label>
                <Switch
                  checked={formData.habilitar_portal}
                  onCheckedChange={(val) => setFormData({ ...formData, habilitar_portal: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Visualizar Pedidos</Label>
                <Switch
                  checked={formData.permitir_visualizar_pedidos}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_visualizar_pedidos: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Aprovar Orçamentos</Label>
                <Switch
                  checked={formData.permitir_aprovar_orcamentos}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_aprovar_orcamentos: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Upload de Projetos</Label>
                <Switch
                  checked={formData.permitir_upload_projetos}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_upload_projetos: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Chat com Vendedor</Label>
                <Switch
                  checked={formData.permitir_chat}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_chat: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Chamados</Label>
                <Switch
                  checked={formData.permitir_chamados}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_chamados: val })}
                />
              </div>
            </div>

            <div>
              <Label>Prazo de Expiração (dias)</Label>
              <Input
                type="number"
                value={formData.prazo_expiracao_link_dias}
                onChange={(e) => setFormData({ ...formData, prazo_expiracao_link_dias: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Parâmetros
          </Button>
        </div>
      </form>
    </div>
  );
}