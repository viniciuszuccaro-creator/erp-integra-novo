import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Upload, CheckCircle } from "lucide-react";

/** Sub-componente: Aba Certificado Digital */
export default function FiscalTabCertificado({ formData, setFormData, certificadoValido, diasRestantes }) {
  return (
    <Card>
      <CardHeader className="bg-green-50"><CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5 text-green-600" />Certificado Digital</CardTitle></CardHeader>
      <CardContent className="p-6 space-y-4">
        <div><Label>Tipo de Certificado</Label>
          <Select value={formData.certificado_tipo} onValueChange={(v) => setFormData({ ...formData, certificado_tipo: v })}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="A1">A1 (Arquivo .pfx)</SelectItem><SelectItem value="A3">A3 (Token/Smartcard)</SelectItem></SelectContent>
          </Select>
        </div>
        {formData.certificado_tipo === "A1" && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8">
            <div className="text-center"><Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" /><p className="text-sm text-slate-600 mb-2">Faça upload do certificado .pfx ou .p12</p><Button type="button" variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />Selecionar Arquivo</Button></div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Senha do Certificado</Label><Input type="password" value={formData.senha_certificado} onChange={(e) => setFormData({ ...formData, senha_certificado: e.target.value })} className="mt-2" /></div>
          <div><Label>Data de Validade</Label><Input type="date" value={formData.data_validade_certificado} onChange={(e) => setFormData({ ...formData, data_validade_certificado: e.target.value })} className="mt-2" /></div>
        </div>
        {certificadoValido && <Alert className="border-green-200 bg-green-50"><CheckCircle className="h-5 w-5 text-green-600" /><AlertDescription className="text-green-900">Certificado válido por mais {diasRestantes} dias</AlertDescription></Alert>}
      </CardContent>
    </Card>
  );
}