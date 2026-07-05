import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";
import { useToast } from "@/components/ui/use-toast";

/**
 * Sub-componente extraído de RepresentanteFormCompleto.jsx
 * Aba Dados Gerais: tipo de pessoa, contato, endereço, regiões.
 */
export default function RepresentanteTabDadosGerais({ formData, setFormData, regioes, handleDadosCNPJ, handleDadosCEP }) {
  const { toast } = useToast();
  return (
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Tipo de Pessoa *</Label>
        <Select value={formData.tipo_pessoa} onValueChange={(v) => setFormData({ ...formData, tipo_pessoa: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="Pessoa Física">Pessoa Física</SelectItem><SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label>Tipo de Representante *</Label>
        <Select value={formData.tipo_representante} onValueChange={(v) => setFormData({ ...formData, tipo_representante: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]">
            <SelectItem value="Representante Comercial">🤝 Representante Comercial</SelectItem><SelectItem value="Construtor">🏗️ Construtor</SelectItem>
            <SelectItem value="Arquiteto">📐 Arquiteto</SelectItem><SelectItem value="Engenheiro">⚙️ Engenheiro</SelectItem>
            <SelectItem value="Influenciador">📱 Influenciador</SelectItem><SelectItem value="Parceiro">🤝 Parceiro</SelectItem><SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2"><Label>Nome / Razão Social *</Label><Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required /></div>
      {formData.tipo_pessoa === "Pessoa Jurídica" && (
        <>
          <div><Label>Razão Social</Label><Input value={formData.razao_social} onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })} /></div>
          <div><Label>CNPJ</Label><Input value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} placeholder="00.000.000/0000-00" /></div>
          <div className="col-span-2"><BotaoBuscaAutomatica tipo="cnpj" valor={formData.cnpj} onDadosEncontrados={handleDadosCNPJ} disabled={!formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14} /></div>
        </>
      )}
      {formData.tipo_pessoa === "Pessoa Física" && (
        <>
          <div><Label>CPF</Label><Input value={formData.cpf} onChange={(e) => setFormData({ ...formData, cpf: e.target.value })} placeholder="000.000.000-00" /></div>
          <div><Label>&nbsp;</Label><BotaoBuscaAutomatica tipo="cpf" valor={formData.cpf} onDadosEncontrados={(dados) => { if (dados.valido) { setFormData({ ...formData, cpf: dados.formatado }); toast({ title: "✅ CPF validado!" }); } }} disabled={!formData.cpf || formData.cpf.replace(/\D/g, '').length < 11} /></div>
        </>
      )}
      {(formData.tipo_representante === 'Arquiteto' || formData.tipo_representante === 'Engenheiro') && (
        <>
          <div><Label>CREA / CAU</Label><Input value={formData.crea_cau} onChange={(e) => setFormData({ ...formData, crea_cau: e.target.value })} placeholder="Número do registro profissional" /></div>
          <div><Label>Registro Profissional</Label><Input value={formData.registro_profissional} onChange={(e) => setFormData({ ...formData, registro_profissional: e.target.value })} /></div>
        </>
      )}
      <div><Label>E-mail</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
      <div><Label>Telefone</Label><Input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} /></div>
      <div className="col-span-2"><Label>WhatsApp</Label><Input value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(00) 00000-0000" /></div>
      <div className="col-span-2 pt-4 border-t">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" />Endereço</h3>
        <div className="grid grid-cols-4 gap-4">
          <div><Label>CEP</Label><Input value={formData.endereco?.cep || ""} onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cep: e.target.value } })} /></div>
          <div><Label>&nbsp;</Label><BotaoBuscaAutomatica tipo="cep" valor={formData.endereco?.cep} onDadosEncontrados={handleDadosCEP} disabled={!formData.endereco?.cep || formData.endereco.cep.replace(/\D/g, '').length < 8} /></div>
          <div className="col-span-2"><Label>Logradouro</Label><Input value={formData.endereco?.logradouro || ""} onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, logradouro: e.target.value } })} /></div>
          <div><Label>Número</Label><Input value={formData.endereco?.numero || ""} onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, numero: e.target.value } })} /></div>
          <div><Label>Bairro</Label><Input value={formData.endereco?.bairro || ""} onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, bairro: e.target.value } })} /></div>
          <div><Label>Cidade</Label><Input value={formData.endereco?.cidade || ""} onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, cidade: e.target.value } })} /></div>
          <div><Label>UF</Label><Input value={formData.endereco?.estado || ""} onChange={(e) => setFormData({ ...formData, endereco: { ...formData.endereco, estado: e.target.value } })} maxLength={2} /></div>
        </div>
      </div>
      <div className="col-span-2">
        <Label>Regiões de Atendimento</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {regioes.filter(r => r.ativo).map(regiao => {
            const selecionada = (formData.regioes_atendimento || []).includes(regiao.id);
            return (
              <Badge key={regiao.id} variant={selecionada ? "default" : "outline"} className={`cursor-pointer ${selecionada ? 'bg-purple-600' : ''}`} onClick={() => {
                const atual = formData.regioes_atendimento || [];
                setFormData({ ...formData, regioes_atendimento: selecionada ? atual.filter(id => id !== regiao.id) : [...atual, regiao.id] });
              }}>{regiao.nome_regiao}</Badge>
            );
          })}
        </div>
      </div>
      <div className="col-span-2"><Label>Observações</Label><Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={3} /></div>
    </div>
  );
}