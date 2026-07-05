import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotaoBuscaAutomatica } from '@/components/lib/BuscaDadosPublicos';

export default function TransportadoraFormContato({ formData, setFormData }) {
  return (
    <>
      <div>
        <Label>CEP</Label>
        <Input value={formData.cep} onChange={(e) => setFormData({ ...formData, cep: e.target.value })} placeholder="00000-000" />
      </div>
      <div>
        <Label>&nbsp;</Label>
        <BotaoBuscaAutomatica tipo="cep" valor={formData.cep} onDadosEncontrados={(dados) => setFormData(prev => ({
          ...prev,
          endereco: dados.logradouro || prev.endereco,
          cidade: dados.cidade || prev.cidade,
          estado: dados.uf || prev.estado,
        }))} disabled={!formData.cep || formData.cep.replace(/\D/g, '').length < 8} />
      </div>
      <div className="col-span-2">
        <Label>Endereço</Label>
        <Input value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} placeholder="Rua, Número, Bairro" />
      </div>
      <div><Label>Cidade</Label><Input value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} /></div>
      <div><Label>Estado</Label><Input value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })} maxLength={2} placeholder="SP" /></div>
      <div><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
      <div><Label>Telefone</Label><Input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} /></div>
      <div><Label>WhatsApp</Label><Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(00) 00000-0000" /></div>
      <div><Label>Contato Responsável</Label><Input value={formData.contato_responsavel} onChange={(e) => setFormData({ ...formData, contato_responsavel: e.target.value })} placeholder="Nome do responsável" /></div>
      <div><Label>Prazo Entrega Padrão (dias)</Label><Input type="number" value={formData.prazo_entrega_padrao} onChange={(e) => setFormData({ ...formData, prazo_entrega_padrao: parseInt(e.target.value) || 0 })} /></div>
    </>
  );
}