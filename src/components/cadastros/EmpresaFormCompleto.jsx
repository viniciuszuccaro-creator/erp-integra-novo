import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, FileText, MapPin, Webhook, Sparkles, Upload, Calendar, Trash2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import BuscaCEP from "../comercial/BuscaCEP";
import usePermissions from "@/components/lib/usePermissions";

/**
 * Formulário Completo de Empresa - V16.1
 * Com abas internas e IA Fiscal
 */
export default function EmpresaFormCompleto({ empresa, onSubmit, isSubmitting }) {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const podeCriar = canCreate("Cadastros", "Empresa") || canCreate("Cadastros", null) || canCreate("Sistema", "Empresas");
  const podeEditar = canEdit("Cadastros", "Empresa") || canEdit("Cadastros", null) || canEdit("Sistema", "Empresas");
  const podeExcluir = canDelete("Cadastros", "Empresa") || canDelete("Cadastros", null) || canDelete("Sistema", "Empresas");
  const [activeTab, setActiveTab] = useState('dados');
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    regime_tributario: 'Simples Nacional',
    endereco: {},
    certificado_digital: {},
    configuracao_fiscal: {
      ambiente_nfe: 'Homologação',
      serie_nfe: '1',
      proximo_numero_nfe: 1
    },
    urls_webhook_padrao: {},
    status: 'Ativa',
    ...empresa
  });

  const handleCEPFound = (endereco) => {
    setFormData({...formData, endereco});
    toast.success('✅ Endereço preenchido automaticamente');
  };

  const handleCertificadoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.pfx')) {
      toast.error('❌ Apenas arquivos .pfx são aceitos');
      return;
    }
    toast.info('📤 Fazendo upload do certificado...');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({
      ...formData,
      certificado_digital: {
        ...formData.certificado_digital,
        arquivo_certificado: file_url,
        tipo: 'A1'
      }
    });
    toast.success('✅ Certificado enviado! A IA validará o CNPJ e a validade.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (empresa && !podeEditar) {
      toast.error('Seu perfil nao permite editar empresas.');
      return;
    }
    if (!empresa && !podeCriar) {
      toast.error('Seu perfil nao permite criar empresas.');
      return;
    }
    if (!formData.razao_social || !formData.cnpj) {
      toast.error('❌ Preencha Razão Social e CNPJ');
      return;
    }
    onSubmit(formData);
  };

  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();

  const handleExcluir = async () => {
    if (!podeExcluir) {
      toast.error('Seu perfil nao permite excluir empresas.');
      return;
    }
    const ok = await confirm({ title: 'Confirmar Exclusão', description: `Tem certeza que deseja excluir a empresa "${formData.razao_social}"? Esta ação não pode ser desfeita.`, confirmText: 'Excluir' });
    if (!ok) return;
    if (onSubmit) onSubmit({ ...formData, _action: 'delete' });
  };

  const handleAlternarStatus = () => {
    setFormData({ ...formData, status: formData.status === 'Ativa' ? 'Inativa' : 'Ativa' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dados"><Building2 className="w-4 h-4 mr-2" />Dados</TabsTrigger>
          <TabsTrigger value="fiscal"><FileText className="w-4 h-4 mr-2" />Fiscal</TabsTrigger>
          <TabsTrigger value="endereco"><MapPin className="w-4 h-4 mr-2" />Endereço</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="w-4 h-4 mr-2" />Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="space-y-4">
          <div>
            <Label>Razão Social *</Label>
            <Input value={formData.razao_social} onChange={(e) => setFormData({...formData, razao_social: e.target.value})} />
          </div>
          <div>
            <Label>Nome Fantasia</Label>
            <Input value={formData.nome_fantasia} onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>CNPJ *</Label>
              <Input value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <Label>Inscrição Estadual</Label>
              <Input value={formData.inscricao_estadual} onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Regime Tributário</Label>
            <Select value={formData.regime_tributario} onValueChange={(value) => setFormData({...formData, regime_tributario: value})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                <SelectItem value="MEI">MEI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-purple-900">🤖 IA de Otimização Tributária</p>
                  <p className="text-xs text-purple-700">Digite o faturamento anual para a IA sugerir o melhor regime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal" className="space-y-4">
          <div>
            <Label>Ambiente NF-e</Label>
            <Select value={formData.configuracao_fiscal?.ambiente_nfe} onValueChange={(value) => setFormData({...formData, configuracao_fiscal: {...formData.configuracao_fiscal, ambiente_nfe: value}})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Homologação">Homologação (Testes)</SelectItem>
                <SelectItem value="Produção">Produção (Real)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Série NF-e</Label>
              <Input value={formData.configuracao_fiscal?.serie_nfe} onChange={(e) => setFormData({...formData, configuracao_fiscal: {...formData.configuracao_fiscal, serie_nfe: e.target.value}})} />
            </div>
            <div>
              <Label>Próximo Número</Label>
              <Input type="number" value={formData.configuracao_fiscal?.proximo_numero_nfe} onChange={(e) => setFormData({...formData, configuracao_fiscal: {...formData.configuracao_fiscal, proximo_numero_nfe: Number(e.target.value)}})} />
            </div>
          </div>
          <div>
            <Label>Certificado Digital (.pfx)</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <input type="file" accept=".pfx" onChange={handleCertificadoUpload} className="hidden" id="upload-cert" />
              <label htmlFor="upload-cert" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm">Selecionar Certificado</Button>
              </label>
              {formData.certificado_digital?.arquivo_certificado && <p className="text-xs text-green-600 mt-2">✅ Certificado enviado</p>}
            </div>
          </div>
          {formData.certificado_digital?.data_validade && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <p className="text-sm"><strong>Validade:</strong> {new Date(formData.certificado_digital.data_validade).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="endereco" className="space-y-4">
          <BuscaCEP onEnderecoEncontrado={handleCEPFound} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Logradouro</Label>
              <Input value={formData.endereco?.logradouro || ''} onChange={(e) => setFormData({...formData, endereco: {...formData.endereco, logradouro: e.target.value}})} />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={formData.endereco?.numero || ''} onChange={(e) => setFormData({...formData, endereco: {...formData.endereco, numero: e.target.value}})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Cidade</Label><Input value={formData.endereco?.cidade || ''} disabled /></div>
            <div><Label>Estado</Label><Input value={formData.endereco?.estado || ''} disabled /></div>
            <div><Label>CEP</Label><Input value={formData.endereco?.cep || ''} disabled /></div>
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div>
            <Label>Webhook: Pagamento Recebido</Label>
            <Input value={formData.urls_webhook_padrao?.pagamento_recebido || ''} onChange={(e) => setFormData({...formData, urls_webhook_padrao: {...formData.urls_webhook_padrao, pagamento_recebido: e.target.value}})} placeholder="https://api.seusite.com/webhook/pagamento" />
          </div>
          <div>
            <Label>Webhook: NF-e Emitida</Label>
            <Input value={formData.urls_webhook_padrao?.nfe_emitida || ''} onChange={(e) => setFormData({...formData, urls_webhook_padrao: {...formData.urls_webhook_padrao, nfe_emitida: e.target.value}})} placeholder="https://api.seusite.com/webhook/nfe" />
          </div>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-3">
              <p className="text-xs text-slate-600">💡 Os webhooks serão chamados automaticamente quando os eventos ocorrerem</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {empresa && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleAlternarStatus}
              disabled={!podeEditar}
              data-permission="Cadastros.Empresa.alterarStatus"
              data-sensitive
              className={formData.status === 'Ativa' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
            >
              {formData.status === 'Ativa' ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleExcluir}
              disabled={!podeExcluir}
              data-permission="Cadastros.Empresa.excluir"
              data-sensitive
            ><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>
          </>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || (empresa ? !podeEditar : !podeCriar)}
          data-permission="Cadastros.Empresa.salvar"
          data-sensitive
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Salvando...' : (empresa ? 'Salvar Alterações' : 'Criar Empresa')}
        </Button>
      </div>
      <ConfirmExcluirDialog />
    </form>
  );
}