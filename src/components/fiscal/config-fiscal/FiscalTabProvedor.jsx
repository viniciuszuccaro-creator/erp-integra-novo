import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle } from "lucide-react";

/** Sub-componente: Aba Provedor NF-e */
export default function FiscalTabProvedor({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader className="bg-purple-50"><CardTitle className="text-base">Provedor de NF-e</CardTitle></CardHeader>
      <CardContent className="p-6 space-y-4">
        <div><Label>Ambiente *</Label>
          <Select value={formData.ambiente_nfe} onValueChange={(v) => setFormData({ ...formData, ambiente_nfe: v })}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Homologação"><div className="flex items-center gap-2"><Badge className="bg-yellow-500">Teste</Badge><span>Homologação</span></div></SelectItem>
              <SelectItem value="Produção"><div className="flex items-center gap-2"><Badge className="bg-green-600">Real</Badge><span>Produção</span></div></SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Provedor de NF-e *</Label>
          <Select value={formData.provedor_nf} onValueChange={(v) => setFormData({ ...formData, provedor_nf: v })}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Nenhum">Nenhum (Mock/Simulação)</SelectItem><SelectItem value="eNotas">eNotas</SelectItem><SelectItem value="Focus NFe">Focus NFe</SelectItem>
              <SelectItem value="NFe.io">NFe.io</SelectItem><SelectItem value="Bling">Bling</SelectItem><SelectItem value="WebMania">WebMania</SelectItem><SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.provedor_nf !== "Nenhum" && (
          <>
            <div><Label>URL da API</Label><Input value={formData.api_url} onChange={(e) => setFormData({ ...formData, api_url: e.target.value })} placeholder="https://api.enotas.com.br/..." className="mt-2" /></div>
            <div><Label>API Key / Token</Label><Input type="password" value={formData.api_key} onChange={(e) => setFormData({ ...formData, api_key: e.target.value })} placeholder="Sua chave de API" className="mt-2" /></div>
            <Alert className="border-blue-200 bg-blue-50"><CheckCircle className="h-5 w-5 text-blue-600" /><AlertDescription className="text-blue-900"><strong>Modo Simulação:</strong> Enquanto o provedor estiver como "Nenhum", o sistema gera XMLs locais mas não transmite para SEFAZ.</AlertDescription></Alert>
          </>
        )}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2"><input type="checkbox" id="emite-nfe" checked={formData.emite_nfe} onChange={(e) => setFormData({ ...formData, emite_nfe: e.target.checked })} /><Label htmlFor="emite-nfe">Emitir NF-e</Label></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="emite-nfce" checked={formData.emite_nfce} onChange={(e) => setFormData({ ...formData, emite_nfce: e.target.checked })} /><Label htmlFor="emite-nfce">Emitir NFC-e</Label></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="emite-nfse" checked={formData.emite_nfse} onChange={(e) => setFormData({ ...formData, emite_nfse: e.target.checked })} /><Label htmlFor="emite-nfse">Emitir NFS-e</Label></div>
        </div>
      </CardContent>
    </Card>
  );
}