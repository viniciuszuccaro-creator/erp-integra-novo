import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";
import { Loader2, Building2, AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import usePermissions from "@/components/lib/usePermissions";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function EmpresaForm({ empresa, onSubmit, isSubmitting, windowMode = false }) {
  const { canCreate, canEdit } = usePermissions();
  const podeCriar = canCreate("Cadastros", "Empresa") || canCreate("Cadastros", null) || canCreate("Sistema", "Empresas");
  const podeEditar = canEdit("Cadastros", "Empresa") || canEdit("Cadastros", null) || canEdit("Sistema", "Empresas");
  const [formData, setFormData] = useState(empresa || {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    regime_tributario: 'Simples Nacional',
    tipo: 'Matriz',
    status: 'Ativa',
    certificado_digital: {
      tipo: 'A1',
      arquivo_certificado: '',
      senha_certificado: '',
      data_validade: ''
    },
    configuracao_fiscal: {
      ambiente_nfe: 'Homologação',
      serie_nfe: '1',
      proximo_numero_nfe: 1
    }
  });

  const [alertaCertificado, setAlertaCertificado] = useState(null);

  // IA de Alerta de Certificado (V18.0)
  useEffect(() => {
    if (formData.certificado_digital?.data_validade) {
      const dataValidade = new Date(formData.certificado_digital.data_validade);
      const hoje = new Date();
      const diasRestantes = Math.floor((dataValidade - hoje) / (1000 * 60 * 60 * 24));

      if (diasRestantes <= 30 && diasRestantes > 0) {
        setAlertaCertificado({
          tipo: 'warning',
          mensagem: `⚠️ Certificado vence em ${diasRestantes} dias! Renove urgentemente.`
        });
      } else if (diasRestantes <= 0) {
        setAlertaCertificado({
          tipo: 'error',
          mensagem: '🚨 Certificado VENCIDO! Emissão de NF-e bloqueada.'
        });
      } else {
        setAlertaCertificado(null);
      }
    }
  }, [formData.certificado_digital?.data_validade]);

  const schema = z.object({
    razao_social: z.string().min(1, 'Razão Social é obrigatória'),
    cnpj: z.string().min(11, 'CNPJ é obrigatório')
  });

  const handleSubmit = async () => {
    if (empresa && !podeEditar) {
      toast.error("Seu perfil nao permite editar empresas.");
      return;
    }
    if (!empresa && !podeCriar) {
      toast.error("Seu perfil nao permite criar empresas.");
      return;
    }
    const payload = { ...formData, nome: formData.razao_social || formData.nome_fantasia || formData.nome || '' };
    const erroUnicidade = await checkGlobalUniqueness('Empresa', payload, { groupId: formData.group_id, empresaId: empresa?.id, currentId: empresa?.id, isEdit: !!empresa?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    onSubmit(payload);
  };

  const formContent = (
    <FormWrapper schema={schema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Razão Social *</Label>
          <Input
            value={formData.razao_social}
            onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
          />
        </div>

        <div>
          <Label>Nome Fantasia</Label>
          <Input
            value={formData.nome_fantasia}
            onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNPJ *</Label>
          <Input
            value={formData.cnpj}
            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div>
          <Label>Inscrição Estadual</Label>
          <Input
            value={formData.inscricao_estadual}
            onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Regime Tributário</Label>
        <Select value={formData.regime_tributario} onValueChange={(v) => setFormData({...formData, regime_tributario: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
            <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
            <SelectItem value="Lucro Real">Lucro Real</SelectItem>
            <SelectItem value="MEI">MEI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-amber-50 rounded border border-amber-200">
        <h4 className="font-semibold mb-3">Certificado Digital</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <Label>Data de Validade</Label>
            <Input
              type="date"
              value={formData.certificado_digital?.data_validade}
              onChange={(e) => setFormData({
                ...formData,
                certificado_digital: {...formData.certificado_digital, data_validade: e.target.value}
              })}
            />
          </div>

          <div>
            <Label>Tipo</Label>
            <Select 
              value={formData.certificado_digital?.tipo} 
              onValueChange={(v) => setFormData({
                ...formData,
                certificado_digital: {...formData.certificado_digital, tipo: v}
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 (arquivo)</SelectItem>
                <SelectItem value="A3">A3 (token)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {alertaCertificado && (
          <Alert className={alertaCertificado.tipo === 'error' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              {alertaCertificado.mensagem}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || (empresa ? !podeEditar : !podeCriar)}
          data-permission="Cadastros.Empresa.salvar"
          data-sensitive
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {empresa ? 'Atualizar' : 'Criar Empresa'}
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {empresa ? 'Editar Empresa' : 'Nova Empresa'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}