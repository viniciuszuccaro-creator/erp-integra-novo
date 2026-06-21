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
import { DollarSign, Calendar, FileText, Building2, Package, Loader2, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import FormWrapper from "@/components/common/FormWrapper";
import { contaPagarSchema } from "@/components/financeiro/contaPagarSchema";
import ResumoValorStatus from "@/components/financeiro/ResumoValorStatus";
import ContaPagarDadosGerais from "./ContaPagarDadosGerais";
import ContaPagarFinanceiroSection from "@/components/financeiro/ContaPagarFinanceiroSection";
import ContaPagarVinculosSection from "@/components/financeiro/ContaPagarVinculosSection";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import { useUser } from "@/components/lib/UserContext";

export default function ContaPagarForm({ conta, onSubmit, isSubmitting, windowMode = false }) {
  const [errorMessages, setErrorMessages] = useState([]);
  const { empresaAtual, filterInContext, carimbarContexto } = useContextoVisual();

  const [abaAtiva, setAbaAtiva] = useState('dados-gerais');
  const { user: authUser } = useUser();
  const [formData, setFormData] = useState(() => conta || {
    descricao: '',
    fornecedor: '',
    fornecedor_id: '',
    valor: 0,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    status: 'Pendente',
    status_pagamento: 'Pendente',
    forma_pagamento: 'Boleto',
    forma_pagamento_id: '',
    numero_documento: '',
    numero_parcela: '',
    centro_custo: '',
    centro_custo_id: '',
    plano_contas_id: '',
    projeto_obra: '',
    categoria: 'Fornecedores',
    ordem_compra_id: '',
    nota_fiscal_id: '',
    observacoes: '',
    empresa_id: ''
  });

  const { formasPagamento } = useFormasPagamento({ empresa_id: formData.empresa_id });

  const { data: fornecedores = [] } = useQuery({
    queryKey: ['fornecedores', empresaAtual?.id],
    queryFn: () => filterInContext('Fornecedor', {}, '-updated_date', 9999),
  });

  const { data: ordensCompra = [] } = useQuery({
    queryKey: ['ordens-compra', empresaAtual?.id],
    queryFn: () => filterInContext('OrdemCompra', {}, '-updated_date', 9999),
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas', empresaAtual?.id],
    queryFn: () => filterInContext('Empresa', {}, '-updated_date', 9999),
  });

  const { data: centrosCusto = [] } = useQuery({
    queryKey: ['centrosCusto', empresaAtual?.id],
    queryFn: () => filterInContext('CentroCusto', {}, '-updated_date', 9999),
  });

  const { data: planosContas = [] } = useQuery({
    queryKey: ['planosContas', empresaAtual?.id],
    queryFn: () => filterInContext('PlanoDeContas', {}, '-updated_date', 9999),
  });

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
    <FormWrapper schema={contaPagarSchema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className={`space-y-6 w-full h-full ${windowMode ? 'overflow-auto p-6' : 'max-h-[75vh] overflow-auto p-6'}`}>

      <Alert className="border-red-300 bg-red-50">
        <AlertDescription className="text-sm text-red-900">
          <strong>💸 Conta a Pagar:</strong> Registre obrigações com fornecedores e controle pagamentos
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
            <Package className="w-4 h-4 mr-1" />
            Vínculos
          </TabsTrigger>
          <TabsTrigger value="aprovacao">
            <TrendingDown className="w-4 h-4 mr-1" />
            Aprovação
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: DADOS GERAIS */}
        <TabsContent value="dados-gerais" className="space-y-4">
          <ContaPagarDadosGerais formData={formData} setFormData={setFormData} fornecedores={fornecedores} empresas={empresas} />
        </TabsContent>

        {/* ABA 2: FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-4">
          <ContaPagarFinanceiroSection
            formData={formData}
            setFormData={setFormData}
            formasPagamento={formasPagamento}
          />
        </TabsContent>

        {/* ABA 3: VÍNCULOS */}
        <TabsContent value="vinculacao" className="space-y-4">
          <ContaPagarVinculosSection
            formData={formData}
            setFormData={setFormData}
            ordensCompra={ordensCompra}
            centrosCusto={centrosCusto}
            planosContas={planosContas}
          />
        </TabsContent>

        {/* ABA 4: APROVAÇÃO */}
        <TabsContent value="aprovacao" className="space-y-4">
          <Alert className="border-blue-300 bg-blue-50">
            <AlertDescription className="text-sm text-blue-900">
              <strong>ℹ️ Workflow de Aprovação:</strong> Contas de alto valor podem exigir aprovação do gestor
            </AlertDescription>
          </Alert>

          <SelectWithAudit
            label="Status do Pagamento"
            value={formData.status_pagamento}
            onValueChange={(v) => setFormData({...formData, status_pagamento: v})}
            data-action="conta_pagar.status_pagamento"
            items={[
              { value: 'Pendente', label: 'Pendente' },
              { value: 'Aguardando Aprovação', label: 'Aguardando Aprovação' },
              { value: 'Aprovado', label: 'Aprovado' },
              { value: 'Pago', label: 'Pago' },
              { value: 'Rejeitado', label: 'Rejeitado' },
              { value: 'Cancelado', label: 'Cancelado' },
            ]}
          />

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Observações sobre pagamento..."
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* RESUMO */}
      <ResumoValorStatus valor={formData.valor} badgeText={formData.status_pagamento} tone={formData.status} variant="pagar" />

      {/* BOTÃO SUBMIT */}
      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="bg-red-600 hover:bg-red-700 px-8"
          data-permission="Financeiro.ContaPagar.criar"
          data-sensitive
        >
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