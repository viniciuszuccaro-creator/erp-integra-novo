import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Package, DollarSign, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * V21.1 - Modal para Criar Etapa de Entrega/Faturamento
 * Usado na Aba 6 - Logística
 */
export default function CriarEtapaEntregaModal({ open, onClose, pedidoData, onCriarEtapa }) {
  const [etapaForm, setEtapaForm] = useState({
    nome_etapa: '',
    descricao_etapa: '',
    data_prevista_entrega: '',
    itens_selecionados: []
  });

  const itensDisponiveis = [
    ...(pedidoData.itens_revenda || []).map((item, idx) => ({
      id: `revenda-${idx}`,
      origem: 'revenda',
      descricao: item.descricao,
      quantidade: item.quantidade,
      peso_kg: (item.peso_unitario || 0) * (item.quantidade || 0),
      valor: item.valor_item || 0,
      unidade: item.unidade_medida
    })),
    ...(pedidoData.itens_armado_padrao || []).map((item, idx) => ({
      id: `armado-${idx}`,
      origem: 'armado_padrao',
      descricao: item.descricao_automatica || `Armado ${item.tipo_peca}`,
      quantidade: item.quantidade || 0,
      peso_kg: item.peso_total_kg || 0,
      valor: item.preco_venda_total || 0,
      unidade: 'PC'
    })),
    ...(pedidoData.itens_corte_dobra || []).map((item, idx) => ({
      id: `corte-${idx}`,
      origem: 'corte_dobra',
      descricao: `${item.tipo_peca || 'Peça'} - ${item.elemento}`,
      quantidade: item.quantidade || 0,
      peso_kg: item.peso_total_kg || 0,
      valor: item.preco_venda_total || 0,
      unidade: 'PC'
    }))
  ].filter(item => {
    // Filtrar apenas itens que NÃO estão em nenhuma etapa existente
    const jaUsado = (pedidoData.etapas_entrega || []).some(etapa =>
      (etapa.itens_etapa || []).some(ei => ei.item_pedido_id === item.id)
    );
    return !jaUsado;
  });

  const toggleItem = (itemId) => {
    setEtapaForm(prev => {
      const selecionados = prev.itens_selecionados.includes(itemId)
        ? prev.itens_selecionados.filter(id => id !== itemId)
        : [...prev.itens_selecionados, itemId];
      return { ...prev, itens_selecionados: selecionados };
    });
  };

  const calcularTotais = () => {
    const itensSelecionados = itensDisponiveis.filter(i => 
      etapaForm.itens_selecionados.includes(i.id)
    );

    return {
      quantidade: itensSelecionados.length,
      peso: itensSelecionados.reduce((sum, i) => sum + (i.peso_kg || 0), 0),
      valor: itensSelecionados.reduce((sum, i) => sum + (i.valor || 0), 0)
    };
  };

  const handleCriar = () => {
    if (!etapaForm.nome_etapa) {
      toast.error('Informe o nome da etapa');
      return;
    }

    if (etapaForm.itens_selecionados.length === 0) {
      toast.error('Selecione pelo menos um item');
      return;
    }

    const itensSelecionados = itensDisponiveis.filter(i => 
      etapaForm.itens_selecionados.includes(i.id)
    );

    const totais = calcularTotais();

    const novaEtapa = {
      id: `etapa-${Date.now()}`,
      nome_etapa: etapaForm.nome_etapa,
      descricao_etapa: etapaForm.descricao_etapa,
      data_prevista_entrega: etapaForm.data_prevista_entrega,
      itens_etapa: itensSelecionados.map(i => ({
        item_pedido_id: i.id,
        origem_item: i.origem,
        descricao: i.descricao,
        quantidade: i.quantidade,
        peso_kg: i.peso_kg,
        valor_item: i.valor
      })),
      quantidade_total_itens: totais.quantidade,
      peso_total_etapa_kg: totais.peso,
      valor_total_etapa: totais.valor,
      status_etapa: 'Pendente',
      faturada: false,
      visivel_portal: true
    };

    onCriarEtapa(novaEtapa);
    setEtapaForm({
      nome_etapa: '',
      descricao_etapa: '',
      data_prevista_entrega: '',
      itens_selecionados: []
    });
    onClose();
  };

  const totais = calcularTotais();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>➕ Criar Nova Etapa de Entrega/Faturamento</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Nome da Etapa *</Label>
              <Input
                value={etapaForm.nome_etapa}
                onChange={(e) => setEtapaForm(prev => ({ ...prev, nome_etapa: e.target.value }))}
                placeholder="Ex: Etapa 1 - Fundação"
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <Textarea
                value={etapaForm.descricao_etapa}
                onChange={(e) => setEtapaForm(prev => ({ ...prev, descricao_etapa: e.target.value }))}
                placeholder="Detalhes da etapa..."
                rows={2}
              />
            </div>

            <div>
              <Label>Data Prevista de Entrega</Label>
              <Input
                type="date"
                value={etapaForm.data_prevista_entrega}
                onChange={(e) => setEtapaForm(prev => ({ ...prev, data_prevista_entrega: e.target.value }))}
              />
            </div>
          </div>

          {/* Lista de Itens Disponíveis */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Selecione os Itens desta Etapa
            </h3>

            {itensDisponiveis.length === 0 ? (
              <Alert className="border-orange-300 bg-orange-50">
                <AlertDescription>
                  Todos os itens já foram alocados em etapas. Adicione novos itens nas Abas 2, 3 ou 4.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                {itensDisponiveis.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      etapaForm.itens_selecionados.includes(item.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox 
                          checked={etapaForm.itens_selecionados.includes(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.descricao}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                            <span>{item.quantidade} {item.unidade}</span>
                            <span>≈ {item.peso_kg.toFixed(2)} KG</span>
                            <Badge variant="outline" className="text-xs">
                              {item.origem === 'revenda' ? '🛒 Revenda' :
                               item.origem === 'armado_padrao' ? '🏗️ Armado' :
                               '✂️ Corte/Dobra'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-green-600">
                        R$ {(item.valor || 0).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo da Etapa */}
          {etapaForm.itens_selecionados.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Resumo da Etapa
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-blue-700">Itens Selecionados</p>
                  <p className="text-xl font-bold text-blue-900">{totais.quantidade}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Peso Total</p>
                  <p className="text-xl font-bold text-blue-900">{totais.peso.toFixed(2)} KG</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">Valor Total</p>
                  <p className="text-xl font-bold text-green-600">
                    R$ {totais.valor.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCriar}
            className="bg-green-600 hover:bg-green-700"
            disabled={!etapaForm.nome_etapa || etapaForm.itens_selecionados.length === 0}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Criar Etapa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}