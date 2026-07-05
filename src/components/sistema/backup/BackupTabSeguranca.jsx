import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";

export default function BackupTabSeguranca({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5 text-purple-600" />Segurança e Criptografia</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div><Label className="text-base">Criptografia</Label><p className="text-sm text-slate-600">Criptografar backups (recomendado)</p></div>
          <Switch data-action="Backup.criptografiaAtiva" checked={formData.criptografia_ativa} onCheckedChange={(c) => setFormData({...formData, criptografia_ativa: c})} />
        </div>
        {formData.criptografia_ativa && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-semibold text-purple-900 mb-2">🔒 Algoritmo: {formData.algoritmo_criptografia || 'AES-256-GCM'}</p>
            <p className="text-xs text-purple-700">• Criptografia de ponta a ponta<br/>• Chaves gerenciadas automaticamente<br/>• Padrão militar de segurança</p>
          </div>
        )}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div><Label>Compressão</Label><p className="text-sm text-slate-600">Reduz tamanho dos backups</p></div>
            <Switch data-action="Backup.compressaoAtiva" checked={formData.compressao_ativa} onCheckedChange={(c) => setFormData({...formData, compressao_ativa: c})} />
          </div>
          {formData.compressao_ativa && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Algoritmo</Label>
                <Select value={formData.algoritmo_compressao} onValueChange={(v) => setFormData({...formData, algoritmo_compressao: v})}>
                  <SelectTrigger className="text-sm" data-action="Backup.algoritmoCompressao"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gzip">gzip (balanceado)</SelectItem><SelectItem value="bzip2">bzip2 (alta compressão)</SelectItem>
                    <SelectItem value="lz4">lz4 (rápido)</SelectItem><SelectItem value="zstd">zstd (moderno)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Nível (1-9)</Label>
                <Input type="number" min="1" max="9" value={formData.nivel_compressao || 6}
                  onChange={(e) => setFormData({...formData, nivel_compressao: parseInt(e.target.value)})} className="text-sm" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}