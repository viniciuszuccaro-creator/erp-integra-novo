import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TabelaFiscalTabConfig({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Nome da Regra *</Label>
        <Input value={formData.nome_regra}
          onChange={(e) => setFormData({ ...formData, nome_regra: e.target.value })}
          placeholder="Ex: Venda Simples Nacional - Dentro do Estado" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Regime Tributário *</Label>
          <Select value={formData.regime_tributario} onValueChange={(value) => setFormData({ ...formData, regime_tributario: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
              <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
              <SelectItem value="Lucro Real">Lucro Real</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Cenário de Operação *</Label>
          <Select value={formData.cenario_operacao} onValueChange={(value) => setFormData({ ...formData, cenario_operacao: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Venda Consumidor Final">Venda Consumidor Final</SelectItem>
              <SelectItem value="Venda para Revenda">Venda para Revenda</SelectItem>
              <SelectItem value="Venda Industrialização">Venda Industrialização</SelectItem>
              <SelectItem value="Devolução">Devolução</SelectItem>
              <SelectItem value="Remessa">Remessa</SelectItem>
              <SelectItem value="Transferência">Transferência</SelectItem>
              <SelectItem value="Compra Nacional">Compra Nacional</SelectItem>
              <SelectItem value="Importação">Importação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>NCM</Label>
          <Input value={formData.ncm} onChange={(e) => setFormData({ ...formData, ncm: e.target.value })} placeholder="Ex: 72142000" />
        </div>
        <div>
          <Label>CFOP *</Label>
          <Input value={formData.cfop} onChange={(e) => setFormData({ ...formData, cfop: e.target.value })} placeholder="Ex: 5102" required />
        </div>
        <div>
          <Label>Destino</Label>
          <Select value={formData.destino_operacao} onValueChange={(value) => setFormData({ ...formData, destino_operacao: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Dentro do Estado">Dentro do Estado</SelectItem>
              <SelectItem value="Fora do Estado">Fora do Estado</SelectItem>
              <SelectItem value="Exterior">Exterior</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Tipo de Cliente</Label>
        <Select value={formData.tipo_cliente} onValueChange={(value) => setFormData({ ...formData, tipo_cliente: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
            <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
            <SelectItem value="Contribuinte ICMS">Contribuinte ICMS</SelectItem>
            <SelectItem value="Não Contribuinte">Não Contribuinte</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}