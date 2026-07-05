import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Sub-componente: Aba Séries e Numeração (NF-e, NFC-e, NFS-e) */
export default function FiscalTabSeries({ formData, setFormData }) {
  const SerieCard = ({ titulo, cor, serieField, numField }) => (
    <Card>
      <CardHeader className={cor}><CardTitle className="text-sm">{titulo}</CardTitle></CardHeader>
      <CardContent className="p-6 space-y-4">
        <div><Label>Série</Label><Input value={formData[serieField]} onChange={(e) => setFormData({ ...formData, [serieField]: e.target.value })} className="mt-2" /></div>
        <div><Label>Próximo Número</Label><Input type="number" value={formData[numField]} onChange={(e) => setFormData({ ...formData, [numField]: parseInt(e.target.value) })} className="mt-2" /></div>
      </CardContent>
    </Card>
  );
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <SerieCard titulo="NF-e (Modelo 55)" cor="bg-blue-50" serieField="serie_nfe" numField="proximo_numero_nfe" />
      <SerieCard titulo="NFC-e (Modelo 65)" cor="bg-purple-50" serieField="serie_nfce" numField="proximo_numero_nfce" />
      <SerieCard titulo="NFS-e" cor="bg-green-50" serieField="serie_nfse" numField="proximo_numero_nfse" />
    </div>
  );
}