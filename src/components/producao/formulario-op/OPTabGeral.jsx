import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, AlertTriangle } from "lucide-react";

export default function OPTabGeral({
  formData, setFormData, pedidos, empresas, onGerarIA,
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Número OP *</Label>
          <Input value={formData.numero_op} onChange={(e) => setFormData({ ...formData, numero_op: e.target.value })} placeholder="OP-2025-001" required />
        </div>
        <div>
          <Label>Tipo de Produção *</Label>
          <select value={formData.tipo_producao} onChange={(e) => setFormData({ ...formData, tipo_producao: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option>Armado Padrão</option><option>Corte e Dobra</option><option>Produção Sob Medida</option><option>Misto</option>
          </select>
        </div>
        <div>
          <Label>Pedido Origem</Label>
          <select value={formData.pedido_id}
            onChange={(e) => {
              const pedido = pedidos.find(p => p.id === e.target.value);
              setFormData({ ...formData, pedido_id: e.target.value, numero_pedido: pedido?.numero_pedido, cliente_id: pedido?.cliente_id, cliente_nome: pedido?.cliente_nome });
            }}
            className="w-full px-3 py-2 border rounded-lg">
            <option value="">Selecione...</option>
            {pedidos.map(p => <option key={p.id} value={p.id}>{p.numero_pedido} - {p.cliente_nome}</option>)}
          </select>
        </div>
        <div>
          <Label>Cliente</Label>
          <Input value={formData.cliente_nome} onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })} placeholder="Nome do cliente" />
        </div>
        <div>
          <Label>Empresa Produção</Label>
          <select value={formData.empresa_id} onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Selecione...</option>
            {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome_fantasia || emp.razao_social}</option>)}
          </select>
        </div>
        <div>
          <Label>Peso Total (KG)</Label>
          <Input type="number" value={formData.peso_total_kg} onChange={(e) => setFormData({ ...formData, peso_total_kg: parseFloat(e.target.value) })} />
        </div>
        <div>
          <Label>Prioridade</Label>
          <select value={formData.prioridade} onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option>Baixa</option><option>Normal</option><option>Alta</option><option>Urgente</option>
          </select>
        </div>
        <div>
          <Label>Status</Label>
          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
            <option>Planejada</option><option>Aguardando Matéria-Prima</option><option>Em Corte</option><option>Em Dobra</option><option>Em Montagem</option><option>Inspeção</option><option>Pronto para Expedição</option><option>Concluída</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Observações</Label>
        <Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={4} placeholder="Observações sobre a ordem de produção..." />
      </div>
      {formData.pedido_id && (
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4" />Otimização com IA</CardTitle></CardHeader>
          <CardContent>
            <Button data-permission="Producao.OPGeral.gerar" type="button" onClick={onGerarIA} variant="outline" className="w-full">🤖 Gerar Sugestões de Produção com IA</Button>
          </CardContent>
        </Card>
      )}
      {formData.gargalos_detectados?.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-orange-700"><AlertTriangle className="w-4 h-4" />Gargalos Detectados pela IA</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {formData.gargalos_detectados.map((g, idx) => (
              <div key={idx} className="p-3 bg-white rounded border">
                <p className="font-semibold text-sm">{g.descricao}</p>
                <p className="text-xs text-slate-600 mt-1">💡 {g.sugestao_ia}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}