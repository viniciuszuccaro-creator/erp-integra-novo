import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotaoBuscaAutomatica } from '@/components/lib/BuscaDadosPublicos';

export default function TransportadoraFormDados({ formData, setFormData }) {
  return (
    <>
      <div className="col-span-2">
        <Label>Razão Social *</Label>
        <Input value={formData.razao_social} onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })} required />
      </div>
      <div>
        <Label>Nome Fantasia</Label>
        <Input value={formData.nome_fantasia} onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })} />
      </div>
      <div>
        <Label>CNPJ *</Label>
        <Input value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} required placeholder="00.000.000/0000-00" />
      </div>
      <div>
        <Label>&nbsp;</Label>
        <BotaoBuscaAutomatica tipo="cnpj" valor={formData.cnpj} onDadosEncontrados={(dados) => setFormData(prev => ({
          ...prev,
          razao_social: dados.razao_social || prev.razao_social,
          nome_fantasia: dados.nome_fantasia || prev.nome_fantasia,
          inscricao_estadual: dados.inscricao_estadual || prev.inscricao_estadual,
          endereco: dados.endereco_completo?.logradouro ? `${dados.endereco_completo.logradouro}, ${dados.endereco_completo.numero || 'S/N'}` : prev.endereco,
          cidade: dados.endereco_completo?.cidade || prev.cidade,
          estado: dados.endereco_completo?.uf || prev.estado,
          cep: dados.endereco_completo?.cep || prev.cep,
          email: dados.email || prev.email,
          telefone: dados.telefone || prev.telefone,
        }))} disabled={!formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14} />
      </div>
      <div>
        <Label>Inscrição Estadual</Label>
        <Input value={formData.inscricao_estadual} onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })} />
      </div>
      <div>
        <Label>RNTRC (ANTT)</Label>
        <Input value={formData.rntrc} onChange={(e) => setFormData({ ...formData, rntrc: e.target.value })} placeholder="Registro Nacional" />
      </div>
    </>
  );
}