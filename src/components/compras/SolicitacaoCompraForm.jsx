import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Save, ShoppingCart } from "lucide-react";
import FormWrapper from "@/components/common/FormWrapper";
import { useContextoVisual } from "@/components/lib/useContextoVisual";


















/**
 * V21.1.2: Solicitação Compra Form - Adaptado para Window Mode
 */
export default function SolicitacaoCompraForm({ solicitacao, onSubmit, windowMode = false }) {
  const { carimbarContexto, filterInContext, empresaAtual } = useContextoVisual();
  
  const scSchema = z.object({
    numero_solicitacao: z.string(),
    data_solicitacao: z.string().min(8, 'Data inválida'),
    produto_id: z.string().min(1, 'Produto é obrigatório'),
    produto_descricao: z.string().optional(),
    quantidade_solicitada: z.number().positive('Quantidade deve ser maior que 0'),
    unidade_medida: z.string().min(1, 'Unidade obrigatória'),
    justificativa: z.string().min(5, 'Justificativa muito curta'),
    prioridade: z.enum(['Baixa','Média','Alta','Urgente']).default('Média'),
    data_necessidade: z.string().optional(),
    status: z.string().default('Pendente'),
    observacoes: z.string().optional()
  });

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(scSchema),
    defaultValues: solicitacao || {
      numero_solicitacao: `SC-${Date.now()}`,
      data_solicitacao: new Date().toISOString().split('T')[0],
      solicitante: '',
      setor: '',
      produto_id: '',
      produto_descricao: '',
      quantidade_solicitada: 1,
      unidade_medida: 'UN',
      justificativa: '',
      prioridade: 'Média',
      data_necessidade: '',
      status: 'Pendente',
      observacoes: ''
    }
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id],
    queryFn: () => filterInContext('Produto', {}, '-updated_date', 9999),
  });

  const handleProdutoChange = (produtoId) => {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setValue('produto_id', produtoId, { shouldValidate: true });
      setValue('produto_descricao', produto?.descricao || '', { shouldValidate: false });
      setValue('unidade_medida', produto?.unidade_medida || 'UN', { shouldValidate: false });
    }
  };

  const onValid = (data) => {
    onSubmit(carimbarContexto(data, 'empresa_id'));
  };
  const unifiedSubmit = React.useCallback(() => handleSubmit(onValid)(), [handleSubmit, onValid]);

  const content = (
    <FormWrapper onSubmit={unifiedSubmit} externalData={watch()} className={`space-y-6 w-full h-full ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Solicitação de Compra
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nº Solicitação</Label>
              <Input
                {...register('numero_solicitacao')}
                readOnly
                className="bg-slate-50"
              />
            </div>

            <div>
              <Label>Data *</Label>
              <Input
                type="date"
                {...register('data_solicitacao')}
              />
              {errors.data_solicitacao && <p className="text-red-600 text-xs mt-1">{errors.data_solicitacao.message}</p>}
            </div>

            <div className="col-span-2">
              <Label>Produto *</Label>
              <Controller
                control={control}
                name="produto_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => { field.onChange(v); handleProdutoChange(v); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.filter(p => p.status === 'Ativo').map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.codigo ? `${p.codigo} - ` : ''}{p.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.produto_id && <p className="text-red-600 text-xs mt-1">{errors.produto_id.message}</p>}
            </div>

            <div>
              <Label>Quantidade *</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('quantidade_solicitada', { valueAsNumber: true })}
                  className="flex-1"
                />
                {errors.quantidade_solicitada && <p className="text-red-600 text-xs mt-1">{errors.quantidade_solicitada.message}</p>}
                <span className="bg-slate-100 px-3 py-2 rounded border text-sm">
                  {watch('unidade_medida')}
                </span>
              </div>
            </div>

            <div>
              <Label>Prioridade</Label>
              <Controller
                control={control}
                name="prioridade"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="col-span-2">
              <Label>Data Necessidade</Label>
              <Input
                type="date"
                {...register('data_necessidade')}
              />
            </div>

            <div className="col-span-2">
              <Label>Justificativa *</Label>
              <Textarea
                {...register('justificativa')}
                placeholder="Explique o motivo da compra..."
                rows={3}
              />
              {errors.justificativa && <p className="text-red-600 text-xs mt-1">{errors.justificativa.message}</p>}
            </div>

            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea
                {...register('observacoes')}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button type="submit" data-permission="Compras.Solicitacao.salvar" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {solicitacao ? 'Atualizar' : 'Criar'} Solicitação
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}