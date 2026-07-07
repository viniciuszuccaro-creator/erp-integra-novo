import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectWithAudit } from "@/components/ui/SelectWithAudit";

import { DollarSign, Calendar, FileText, Building2, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import FormWrapper from "@/components/common/FormWrapper";
import { contaReceberSchema } from "@/components/financeiro/contaReceberSchema";
import ResumoValorStatus from "@/components/financeiro/ResumoValorStatus";
import ContaReceberDadosGerais from "./ContaReceberDadosGerais";
import ContaReceberFinanceiroSection from "@/components/financeiro/ContaReceberFinanceiroSection";
import ContaReceberVinculosSection from "@/components/financeiro/ContaReceberVinculosSection";

export default function ContaReceberForm({ conta, onSubmit, isSubmitting, windowMode = false }) {

  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const [errorMessages, setErrorMessages] = useState([]);
  const { user: authUser } = useUser();
  const { empresaAtual, filterInContext, carimbarContexto } = useContextoVisual();
  const [formData, setFormData] = useState(() => conta || {
    descricao: '',
    cliente: '',
    cliente_id: '',
    pedido_id: '',
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    forma_recebimento: 'Boleto',
    forma_recebimento_id: '',
    numero_documento: '',
    numero_parcela: '',
    centro_custo: '',
    centro_custo_id: '',
    plano_contas_id: '',
    projeto_obra: '',
    categoria: '',
    origem_tipo: 'manual',
    observacoes: '',
    empresa_id: '',
    visivel_no_portal: true
  });

  const { formasPagamento } = useFormasPagamento({ empresa_id: formData.empresa_id });

  const { data: clientes = [] } = useRLSQuery('Cliente', {}, '-updated_date', 9999);
  const { data: pedidos = [] } = useRLSQuery('Pedido', {}, '-updated_date', 9999);
  const { data: empresas = [] } = useRLSQuery('Empresa', {}, '-updated_date', 9999);
  const { data: centrosCusto = [] } = useRLSQuery('CentroCusto', {}, '-updated_date', 9999);
  const { data: planosContas = [] } = useRLSQuery('PlanoDeContas', {}, '-updated_date', 9999);

  // Recebe payload já validado e carimbado pelo FormWrapper quando externalData é usado
  const handleSubmit = async (payload) => {
    setErrorMessages([]);
    const enriched = {
      ...payload,
      valor: Number(payload?.valor) || 0,
      criado_por: authUser?.full_name || authUser?.email,
      criado_por_id: authUser?.id
    };
    onSubmit(enriched);
  };

  const content = (
    <FormWrapper schema={contaReceberSchema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className={`space-y-6 w-full h-full ${windowMode ? 'h-full overflow-auto p-6' : 'max-h-[75vh] overflow-auto p-6'}`}>

      <Alert className="border-green-300 bg-green-50">
        <AlertDescription className="text-sm text-green-900">
          <strong>💰 Conta a Receber:</strong> Registre valores a receber de clientes e gere cobranças
        </AlertDescription>
      </Alert>

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
        <TabsList className="grid grid-cols-4 w-full bg-slate-100">
          <TabsTrigger value="dados-gerais">
            <FileText className="w-4 h-4 mr-1" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="w-4 h-4 mr-1" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="vinculacao">
            <Building2 className="w-4 h-4 mr-1" />
            Vínculos
          </TabsTrigger>
          <TabsTrigger value="config">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: DADOS GERAIS */}
        <TabsContent value="dados-gerais" className="space-y-4">
          <ContaReceberDadosGerais formData={formData} setFormData={setFormData} clientes={clientes} empresas={empresas} />
        </TabsContent>

        {/* ABA 2: FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-4">
          <ContaReceberFinanceiroSection
            formData={formData}
            setFormData={setFormData}
            formasPagamento={formasPagamento}
          />
        </TabsContent>

        {/* ABA 3: VÍNCULOS */}
        <TabsContent value="vinculacao" className="space-y-4">
          <ContaReceberVinculosSection
            formData={formData}
            setFormData={setFormData}
            pedidos={pedidos}
            centrosCusto={centrosCusto}
            planosContas={planosContas}
          />
        </TabsContent>

        {/* ABA 4: CONFIGURAÇÕES */}
        <TabsContent value="config" className="space-y-4">
          <SelectWithAudit
            label="Origem do Título"
            value={formData.origem_tipo}
            onValueChange={(v) => setFormData({...formData, origem_tipo: v})}
            data-action="conta_receber.origem_tipo"
            items={[
              { value: 'pedido', label: 'Pedido' },
              { value: 'financeiro', label: 'Financeiro Direto' },
              { value: 'contrato', label: 'Contrato' },
              { value: 'manual', label: 'Manual' },
              { value: 'outro', label: 'Outro' },
            ]}
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div>
              <Label className="font-semibold">Visível no Portal do Cliente</Label>
              <p className="text-xs text-slate-500">Cliente pode ver no Portal</p>
            </div>
            <input
              type="checkbox"
              checked={formData.visivel_no_portal}
              onChange={(e) => setFormData({...formData, visivel_no_portal: e.target.checked})}
              className="w-5 h-5"
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações adicionais..."
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* RESUMO */}
      <ResumoValorStatus valor={formData.valor} badgeText={formData.status} tone={formData.status} variant="receber" />

      {/* BOTÃO SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" data-permission="Financeiro.ContaReceber.criar" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 px-8">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {conta ? 'Atualizar Conta' : 'Criar Conta'}
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}