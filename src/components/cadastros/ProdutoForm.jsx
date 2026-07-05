import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";
import useProdutoFormLogic from "@/components/cadastros/produto/useProdutoFormLogic";
import ProdutoIdentificacaoSection from "@/components/cadastros/produto/ProdutoIdentificacaoSection";
import ProdutoBitolaConversoesSection from "@/components/cadastros/produto/ProdutoBitolaConversoesSection";
import ProdutoPrecificacaoFiscalSection from "@/components/cadastros/produto/ProdutoPrecificacaoFiscalSection";

/**
 * V22.0 - Cadastro de Produtos com IA, Conversão de Unidades e Multiempresa.
 * Refatorado (Regra-Mãe regra 3): lógica em useProdutoFormLogic, JSX em 3 sub-componentes.
 */
export default function ProdutoForm({ produto, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(() => produto ? {
    ...produto,
    unidades_secundarias: produto.unidades_secundarias || ['KG'],
    fatores_conversao: produto.fatores_conversao || { kg_por_peca: 0, kg_por_metro: 0, metros_por_peca: 0, peca_por_ton: 0, kg_por_ton: 1000 },
    peso_liquido_kg: produto.peso_liquido_kg || 0, peso_bruto_kg: produto.peso_bruto_kg || 0,
    altura_cm: produto.altura_cm || 0, largura_cm: produto.largura_cm || 0, comprimento_cm: produto.comprimento_cm || 0,
  } : {
    descricao: '', codigo: '', tipo_item: 'Revenda', grupo: 'Outros', eh_bitola: false,
    peso_teorico_kg_m: 0, bitola_diametro_mm: 0, tipo_aco: 'CA-50', comprimento_barra_padrao_m: 12,
    unidade_principal: 'KG', unidades_secundarias: ['KG'],
    fatores_conversao: { kg_por_peca: 0, kg_por_metro: 0, metros_por_peca: 0, peca_por_ton: 0, kg_por_ton: 1000 },
    foto_produto_url: '', custo_aquisicao: 0, preco_venda: 0, estoque_minimo: 0,
    ncm: '', cest: '', unidade_medida: '', status: 'Ativo',
    peso_liquido_kg: 0, peso_bruto_kg: 0, altura_cm: 0, largura_cm: 0, comprimento_cm: 0,
  });

  const logic = useProdutoFormLogic({ formData, setFormData });

  const produtoSchema = z.object({
    descricao: z.string().min(3, 'Descrição é obrigatória'),
    unidades_secundarias: z.array(z.string()).min(1, 'Selecione pelo menos 1 unidade'),
    eh_bitola: z.boolean().optional().default(false),
    peso_teorico_kg_m: z.number().optional().transform(v => v ?? 0)
  }).refine((data) => !data.eh_bitola || (data.peso_teorico_kg_m || 0) > 0, { message: 'Bitolas precisam ter peso teórico preenchido' });

  return (
    <FormWrapper schema={produtoSchema} defaultValues={formData} onSubmit={() => onSubmit(formData)} externalData={formData} className="space-y-6 w-full h-full">
      <ProdutoIdentificacaoSection formData={formData} setFormData={setFormData} {...logic} />
      <ProdutoBitolaConversoesSection formData={formData} setFormData={setFormData} calculoConversao={logic.calculoConversao} toggleUnidadeSecundaria={logic.toggleUnidadeSecundaria} />
      <ProdutoPrecificacaoFiscalSection formData={formData} setFormData={setFormData} sugestoesIA={logic.sugestoesIA} handleDadosNCM={logic.handleDadosNCM} />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" data-permission="Cadastros.Produto.salvar" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {produto ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>

      {formData.eh_bitola && logic.calculoConversao && (
        <Alert className="border-purple-300 bg-purple-100">
          <AlertDescription>
            <p className="font-semibold text-sm text-purple-900 mb-2">🎯 Resumo da Configuração:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-800">
              <p>✅ Produto: <strong>{formData.descricao || 'Não informado'}</strong></p>
              <p>✅ Unidade Principal: <strong>{formData.unidade_principal}</strong></p>
              <p>✅ Venda/Compra em: <strong>{(formData.unidades_secundarias || []).join(', ')}</strong></p>
              <p>✅ Estoque sempre em: <strong>KG</strong></p>
              <p>✅ 1 Peça = <strong>{logic.calculoConversao.kg_por_peca.toFixed(2)} KG</strong></p>
              <p>✅ 1 Metro = <strong>{logic.calculoConversao.kg_por_metro.toFixed(3)} KG</strong></p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </FormWrapper>
  );
}