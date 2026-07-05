import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ValidadorCPFCNPJ from '../fiscal/ValidadorCPFCNPJ';
import { formatarTelefone, formatarCEP } from '../lib/validacoes';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormWrapper from '@/components/common/FormWrapper';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { clienteSchema } from './cliente/clienteSchema';
import ClienteFormEndereco from './cliente/ClienteFormEndereco';
import ClienteFormComercial from './cliente/ClienteFormComercial';

export default function ClienteForm({ cliente, onSubmit, isSubmitting }) {
  const { carimbarContexto } = useContextoVisual();
  const defaultValues = cliente || {
    nome: '', razao_social: '', nome_fantasia: '', tipo: 'Pessoa Física',
    cpf_cnpj: '', inscricao_estadual: '', email: '', telefone: '', whatsapp: '',
    endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
    limite_credito: '', condicao_pagamento: 'À Vista', vendedor_responsavel: '',
    observacoes: '', status: 'Prospect',
  };

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(clienteSchema),
    mode: 'onBlur',
    defaultValues,
  });

  const formData = watch();
  const setFormData = (updater) => {
    const next = typeof updater === 'function' ? updater(formData) : updater;
    Object.entries(next || {}).forEach(([k, v]) => setValue(k, v, { shouldValidate: false }));
  };

  const [cpfCnpjValido, setCpfCnpjValido] = useState(false);
  const [dadosReceita, setDadosReceita] = useState(null);

  const handleCPFCNPJChange = (valor, valido, dadosConsulta) => {
    setCpfCnpjValido(valido);
    setDadosReceita(dadosConsulta);
    if (dadosConsulta && formData.tipo === 'Pessoa Jurídica') {
      setFormData({
        ...formData, cpf_cnpj: valor,
        razao_social: dadosConsulta.razao_social || formData.razao_social,
        nome_fantasia: dadosConsulta.nome_fantasia || formData.nome_fantasia,
        nome: dadosConsulta.razao_social || formData.nome,
        endereco: dadosConsulta.logradouro || formData.endereco,
        numero: dadosConsulta.numero || formData.numero,
        complemento: dadosConsulta.complemento || formData.complemento,
        bairro: dadosConsulta.bairro || formData.bairro,
        cidade: dadosConsulta.municipio || formData.cidade,
        estado: dadosConsulta.uf || formData.estado,
        cep: dadosConsulta.cep ? formatarCEP(dadosConsulta.cep) : formData.cep,
        telefone: dadosConsulta.telefone ? formatarTelefone(dadosConsulta.telefone) : formData.telefone,
        email: dadosConsulta.email || formData.email,
      });
    } else {
      setFormData({ ...formData, cpf_cnpj: valor });
    }
  };

  const onSubmitForm = (values) => {
    const result = clienteSchema.safeParse({
      nome: (formData.nome || '').trim(), tipo: formData.tipo, cpf_cnpj: formData.cpf_cnpj,
      email: formData.email, telefone: formData.telefone, whatsapp: formData.whatsapp,
      cep: formData.cep, limite_credito: formData.limite_credito,
      condicao_pagamento: formData.condicao_pagamento, status: formData.status,
    });
    if (!result.success) {
      toast.error(result.error.issues?.[0]?.message || 'Dados inválidos');
      return;
    }
    if (!cpfCnpjValido && formData.cpf_cnpj) {
      toast.error('CPF/CNPJ inválido. Verifique os dígitos.');
      return;
    }
    const dataToSubmit = {
      ...formData, nome: (formData.nome || '').trim(),
      limite_credito: formData.limite_credito ? parseFloat(formData.limite_credito) : 0,
    };
    onSubmit(carimbarContexto(dataToSubmit, 'empresa_id'));
  };

  const unifiedSubmit = React.useCallback(() => handleSubmit(onSubmitForm)(), [handleSubmit, onSubmitForm]);

  return (
    <FormWrapper onSubmit={unifiedSubmit} externalData={formData} className="space-y-4 w-full h-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="tipo">Tipo de Pessoa *</Label>
          <Controller
            control={control} name="tipo"
            render={({ field }) => (
              <>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setFormData({ ...formData, tipo: value, cpf_cnpj: '', razao_social: '', nome_fantasia: '', inscricao_estadual: '' });
                    setCpfCnpjValido(false);
                    setDadosReceita(null);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                    <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && <p className="text-xs text-red-600 mt-1">{errors.tipo.message}</p>}
              </>
            )}
          />
        </div>

        <div className="col-span-2">
          <ValidadorCPFCNPJ
            value={formData.cpf_cnpj}
            onChange={handleCPFCNPJChange}
            tipo={formData.tipo === 'Pessoa Física' ? 'cpf' : 'cnpj'}
            label={formData.tipo === 'Pessoa Física' ? 'CPF' : 'CNPJ'}
            required
            consultarReceita={formData.tipo === 'Pessoa Jurídica'}
          />
        </div>

        {dadosReceita && (
          <div className="col-span-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900 font-semibold mb-2">✅ Dados da Receita Federal preenchidos automaticamente</p>
            <p className="text-xs text-green-700">Verifique os campos abaixo e ajuste se necessário</p>
          </div>
        )}

        <div className="col-span-2">
          <Label htmlFor="nome">Nome / Razão Social *</Label>
          <Controller
            control={control} name="nome"
            render={({ field }) => (
              <>
                <Input id="nome" {...field} required />
                {errors.nome && <p className="text-xs text-red-600 mt-1">{errors.nome.message}</p>}
              </>
            )}
          />
        </div>

        {formData.tipo === 'Pessoa Jurídica' && (
          <>
            <div>
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input id="razao_social" value={formData.razao_social} onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input id="nome_fantasia" value={formData.nome_fantasia} onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
              <Input id="inscricao_estadual" value={formData.inscricao_estadual} onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })} />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Controller control={control} name="email" render={({ field }) => (
            <>
              <Input id="email" type="email" {...field} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </>
          )} />
        </div>

        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Controller control={control} name="telefone" render={({ field }) => (
            <Input id="telefone" {...field} onChange={(e) => field.onChange(formatarTelefone(e.target.value))} placeholder="(00) 0000-0000" />
          )} />
        </div>

        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Controller control={control} name="whatsapp" render={({ field }) => (
            <Input id="whatsapp" {...field} onChange={(e) => field.onChange(formatarTelefone(e.target.value))} placeholder="(00) 00000-0000" />
          )} />
        </div>

        <div>
          <Label htmlFor="cep">CEP</Label>
          <Controller control={control} name="cep" render={({ field }) => (
            <Input id="cep" {...field} onChange={(e) => field.onChange(formatarCEP(e.target.value))} placeholder="00000-000" maxLength={9} />
          )} />
        </div>

        <ClienteFormEndereco formData={formData} setFormData={setFormData} />

        <ClienteFormComercial control={control} formData={formData} setFormData={setFormData} />

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" data-permission="Comercial.Cliente.salvar" disabled={isSubmitting || (formData.cpf_cnpj && !cpfCnpjValido)} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </FormWrapper>
  );
}