import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cloud } from "lucide-react";

export default function BackupTabArmazenamento({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="w-5 h-5 text-blue-600" />Provedor de Armazenamento</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Provedor</Label>
          <Select value={formData.provider_storage} onValueChange={(v) => setFormData({...formData, provider_storage: v})}>
            <SelectTrigger data-action="Backup.providerStorage"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Base44 Cloud">Base44 Cloud (Recomendado)</SelectItem>
              <SelectItem value="AWS S3">AWS S3</SelectItem>
              <SelectItem value="Google Cloud Storage">Google Cloud Storage</SelectItem>
              <SelectItem value="Azure Blob">Azure Blob Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.provider_storage === 'Base44 Cloud' && (
          <Alert className="border-blue-300 bg-blue-50">
            <Cloud className="w-5 h-5 text-blue-600" />
            <AlertDescription>
              <p className="font-semibold text-blue-900">Base44 Cloud - Configuração Automática</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Redundância geográfica automática</li><li>Criptografia AES-256 em repouso</li>
                <li>Backup contínuo com Point-in-Time Recovery</li><li>SLA de 99.99% de disponibilidade</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        {formData.provider_storage === 'AWS S3' && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-semibold text-slate-900">Configuração AWS S3</p>
            <div className="grid grid-cols-2 gap-3">
              {[{k:'bucket_name',l:'Bucket Name',p:'my-backups'},
                {k:'region',l:'Region',p:'us-east-1'},
                {k:'access_key_id',l:'Access Key ID',p:'AKIA...',pw:true},
                {k:'secret_access_key',l:'Secret Access Key',p:'***',pw:true}
              ].map(f => (
                <div key={f.k}>
                  <Label className="text-xs">{f.l}</Label>
                  <Input type={f.pw ? 'password' : 'text'} placeholder={f.p}
                    value={formData.aws_s3_config?.[f.k] || ''}
                    onChange={(e) => setFormData({...formData, aws_s3_config: {...(formData.aws_s3_config || {}), [f.k]: e.target.value}})}
                    className="text-sm" />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-4 border-t">
          <div><Label>Replicação Geográfica</Label><p className="text-xs text-slate-600">Replicar em múltiplas regiões</p></div>
          <Switch data-action="Backup.replicacaoGeografica" checked={formData.replicacao_geografica} onCheckedChange={(c) => setFormData({...formData, replicacao_geografica: c})} />
        </div>
      </CardContent>
    </Card>
  );
}