import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TabelaFiscalTabTributos({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <Card className="bg-blue-50">
        <CardHeader className="pb-3"><CardTitle className="text-sm">ICMS</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">CST/CSOSN</Label>
              <Input value={formData.icms_cst_csosn} onChange={(e) => setFormData({ ...formData, icms_cst_csosn: e.target.value })} placeholder="Ex: 102" />
            </div>
            <div>
              <Label className="text-xs">Alíquota (%)</Label>
              <Input type="number" step="0.01" value={formData.icms_aliquota} onChange={(e) => setFormData({ ...formData, icms_aliquota: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Redução Base (%)</Label>
              <Input type="number" step="0.01" value={formData.icms_reducao_base} onChange={(e) => setFormData({ ...formData, icms_reducao_base: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs">MVA ST (%)</Label>
              <Input type="number" step="0.01" value={formData.icms_st_mva} onChange={(e) => setFormData({ ...formData, icms_st_mva: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">PIS</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">CST</Label>
              <Input value={formData.pis_cst} onChange={(e) => setFormData({ ...formData, pis_cst: e.target.value })} placeholder="Ex: 01" />
            </div>
            <div>
              <Label className="text-xs">Alíquota (%)</Label>
              <Input type="number" step="0.01" value={formData.pis_aliquota} onChange={(e) => setFormData({ ...formData, pis_aliquota: parseFloat(e.target.value) || 0 })} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">COFINS</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">CST</Label>
              <Input value={formData.cofins_cst} onChange={(e) => setFormData({ ...formData, cofins_cst: e.target.value })} placeholder="Ex: 01" />
            </div>
            <div>
              <Label className="text-xs">Alíquota (%)</Label>
              <Input type="number" step="0.01" value={formData.cofins_aliquota} onChange={(e) => setFormData({ ...formData, cofins_aliquota: parseFloat(e.target.value) || 0 })} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-orange-50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">IPI</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">CST</Label>
              <Input value={formData.ipi_cst} onChange={(e) => setFormData({ ...formData, ipi_cst: e.target.value })} placeholder="Ex: 53" />
            </div>
            <div>
              <Label className="text-xs">Alíquota (%)</Label>
              <Input type="number" step="0.01" value={formData.ipi_aliquota} onChange={(e) => setFormData({ ...formData, ipi_aliquota: parseFloat(e.target.value) || 0 })} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Outros</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">FCP (%)</Label>
              <Input type="number" step="0.01" value={formData.fcp_aliquota} onChange={(e) => setFormData({ ...formData, fcp_aliquota: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs">DIFAL (%)</Label>
              <Input type="number" step="0.01" value={formData.diferencial_aliquota} onChange={(e) => setFormData({ ...formData, diferencial_aliquota: parseFloat(e.target.value) || 0 })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}