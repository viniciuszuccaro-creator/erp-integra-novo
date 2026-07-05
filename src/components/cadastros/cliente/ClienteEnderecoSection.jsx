import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BotaoBuscaAutomatica } from '@/components/lib/BuscaDadosPublicos';

export default function ClienteEnderecoSection({ formData, setFormData }) {
  const updateEndereco = (field, value) => {
    setFormData(prev => ({
      ...prev,
      endereco_principal: { ...prev.endereco_principal, [field]: value },
    }));
  };

  return (
    <div className="col-span-2 pt-4 border-t">
      <h3 className="font-semibold mb-3">Endereço Principal</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="cep">CEP</Label>
          <Input id="cep" value={formData.endereco_principal?.cep || ''} onChange={(e) => updateEndereco('cep', e.target.value)} placeholder="00000-000" />
        </div>
        <div>
          <Label>&nbsp;</Label>
          <BotaoBuscaAutomatica
            tipo="cep"
            valor={formData.endereco_principal?.cep}
            onDadosEncontrados={(dados) => setFormData(prev => ({
              ...prev,
              endereco_principal: {
                ...prev.endereco_principal,
                logradouro: dados.logradouro || '',
                bairro: dados.bairro || '',
                cidade: dados.cidade || '',
                estado: dados.uf || '',
                latitude: dados.latitude || null,
                longitude: dados.longitude || null,
                mapa_url: dados.latitude && dados.longitude ? `https://www.google.com/maps?q=${dados.latitude},${dados.longitude}` : '',
              },
            }))}
            disabled={!formData.endereco_principal?.cep || formData.endereco_principal.cep.replace(/\D/g, '').length < 8}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input id="logradouro" value={formData.endereco_principal?.logradouro || ''} onChange={(e) => updateEndereco('logradouro', e.target.value)} />
        </div>
        <div><Label htmlFor="numero">Número</Label><Input id="numero" value={formData.endereco_principal?.numero || ''} onChange={(e) => updateEndereco('numero', e.target.value)} /></div>
        <div><Label htmlFor="bairro">Bairro</Label><Input id="bairro" value={formData.endereco_principal?.bairro || ''} onChange={(e) => updateEndereco('bairro', e.target.value)} /></div>
        <div><Label htmlFor="cidade">Cidade</Label><Input id="cidade" value={formData.endereco_principal?.cidade || ''} onChange={(e) => updateEndereco('cidade', e.target.value)} /></div>
        <div><Label htmlFor="estado">UF</Label><Input id="estado" value={formData.endereco_principal?.estado || ''} onChange={(e) => updateEndereco('estado', e.target.value)} maxLength={2} /></div>
      </div>
    </div>
  );
}