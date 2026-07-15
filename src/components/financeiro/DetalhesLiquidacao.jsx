import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CreditCard, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import SeletorFormaPagamento from './SeletorFormaPagamento';

/**
 * V22.0 ETAPA 4 - Detalhes Completos de Liquidação
 * Registro completo de informações de pagamento: forma, bandeira, impostos, prazos, estágios
 */
export default function DetalhesLiquidacao({ item, onClose }) {
  const queryClient = useQueryClient();
  const ehReceber = !!item.cliente;
  const [dados, setDados] = useState({
    forma_pagamento: item.forma_recebimento || item.forma_pagamento || '',
    bandeira_cartao: '',
    numero_autorizacao: '',
    taxa_operadora: 0,
    valor_liquido: item.valor || 0,
    data_recebimento_caixa: new Date().toISOString().split('T')[0],
    data_compensacao_banco: '',
    observacoes_liquidacao: '',
  });

  // Calcular valor líquido
  const calcularLiquido = () => {
    const taxa = parseFloat(dados.taxa_operadora) || 0;
    const bruto = parseFloat(item.valor) || 0;
    return bruto - (bruto * taxa / 100);
  };

  // Mutation para liquidar
  const liquidarMutation = useMutation({
    mutationFn: async () => {
      const entity = ehReceber ? 'ContaReceber' : 'ContaPagar';
      const campoData = ehReceber ? 'data_recebimento' : 'data_pagamento';
      
      return base44.entities[entity].update(item.id, {
        status: ehReceber ? 'Recebido' : 'Pago',
        [campoData]: dados.data_recebimento_caixa,
        forma_recebimento: ehReceber ? dados.forma_pagamento : undefined,
        forma_pagamento: !ehReceber ? dados.forma_pagamento : undefined,
        // Detalhes de pagamento (ETAPA 4)
        detalhes_pagamento: {
          bandeira_cartao: dados.bandeira_cartao,
          numero_autorizacao: dados.numero_autorizacao,
          taxa_operadora: dados.taxa_operadora,
          valor_bruto: item.valor,
          valor_liquido: calcularLiquido(),
          // Estágios de recebimento por cartão (ETAPA 4)
          data_recebido_caixa: dados.data_recebimento_caixa,
          data_compensado_banco: dados.data_compensacao_banco || null,
          status_compensacao: dados.data_compensacao_banco ? 'Compensado' : 'Aguardando',
          observacoes: dados.observacoes_liquidacao,
        },
        valor_recebido: ehReceber ? calcularLiquido() : undefined,
        valor_pago: !ehReceber ? calcularLiquido() : undefined,
      });
    },
    onSuccess: () => {
      toast.success('Título liquidado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['liquidacao'] });
      onClose();
    },
    onError: () => {
      toast.error('Erro ao liquidar título');
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Liquidar {ehReceber ? 'Recebimento' : 'Pagamento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do Título */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-2">
            <p className="font-semibold text-lg text-slate-900">{item.descricao}</p>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{ehReceber ? item.cliente : item.fornecedor}</span>
              <span>•</span>
              <span>Venc: {item.data_vencimento ? new Date(item.data_vencimento).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Valor Original:</span>
              <span className={`text-2xl font-bold ${ehReceber ? 'text-green-600' : 'text-red-600'}`}>
                R$ {(item.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <SeletorFormaPagamento
            value={dados.forma_pagamento}
            onChange={(v) => setDados({ ...dados, forma_pagamento: v })}
            label="Forma de Pagamento"
            required
          />

          {/* Detalhes de Cartão */}
          {(dados.forma_pagamento.includes('Cartão')) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Bandeira do Cartão</Label>
                <select
                  value={dados.bandeira_cartao}
                  onChange={(e) => setDados({ ...dados, bandeira_cartao: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Selecione...</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Elo">Elo</option>
                  <option value="American Express">American Express</option>
                  <option value="Hipercard">Hipercard</option>
                </select>
              </div>
              <div>
                <Label>Nº Autorização</Label>
                <Input
                  value={dados.numero_autorizacao}
                  onChange={(e) => setDados({ ...dados, numero_autorizacao: e.target.value })}
                  placeholder="Ex: 123456"
                />
              </div>
            </div>
          )}

          {/* Taxas e Valores */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Taxa Operadora (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={dados.taxa_operadora}
                onChange={(e) => setDados({ ...dados, taxa_operadora: e.target.value })}
                placeholder="Ex: 2.5"
              />
            </div>
            <div>
              <Label>Valor Líquido</Label>
              <div className="px-3 py-2 border rounded bg-slate-50">
                <p className="text-lg font-bold text-green-600">
                  R$ {calcularLiquido().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Estágios de Recebimento (ETAPA 4) */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Estágios de Recebimento
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data Recebido no Caixa *</Label>
                <Input
                  type="date"
                  value={dados.data_recebimento_caixa}
                  onChange={(e) => setDados({ ...dados, data_recebimento_caixa: e.target.value })}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Quando entrou no caixa</p>
              </div>
              <div>
                <Label>Data Compensado no Banco</Label>
                <Input
                  type="date"
                  value={dados.data_compensacao_banco}
                  onChange={(e) => setDados({ ...dados, data_compensacao_banco: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">Quando compensou (opcional)</p>
              </div>
            </div>
            {dados.data_compensacao_banco && (
              <Badge className="bg-green-600 text-white mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                Compensado em {new Date(dados.data_compensacao_banco).toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <textarea
              value={dados.observacoes_liquidacao}
              onChange={(e) => setDados({ ...dados, observacoes_liquidacao: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              rows="3"
              placeholder="Informações adicionais sobre a liquidação..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => liquidarMutation.mutate()}
            disabled={!dados.forma_pagamento || !dados.data_recebimento_caixa || liquidarMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {liquidarMutation.isPending ? 'Processando...' : 'Confirmar Liquidação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}