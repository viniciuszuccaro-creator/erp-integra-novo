import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, Clock, Plus, Package, Calculator, Calendar, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import SeletorEnderecoEntregaPedido from './SeletorEnderecoEntregaPedido';
import BuscaCEP from './BuscaCEP';
import usePermissions from '@/components/lib/usePermissions';
import CriarEtapaEntregaModal from './CriarEtapaEntregaModal';

/**
 * Aba 5: Logística e Entrega
 * V12.0 - Com campo Link Google Maps para roteirização
 * V21.1 - Novo gerenciamento de Etapas de Entrega
 */
export default function LogisticaEntregaTab({ formData, setFormData, clientes = [], onNext }) {
  const { isAdmin, canApprove } = usePermissions(); // Keep usePermissions if other parts might need it, even if podeGerenciarEtapas is removed.
  const [modalEtapaOpen, setModalEtapaOpen] = useState(false);

  const clienteSelecionado = clientes?.find(c => c.id === formData?.cliente_id) || null;

  // Regra 30kg: Frete grátis
  const freteGratis = (formData?.peso_total_kg || 0) >= 30;

  const handleCriarEtapa = (novaEtapa) => {
    const etapasAtuais = formData.etapas_entrega || [];
    
    const etapaCompleta = {
      ...novaEtapa,
      // Ensure unique ID for the new etapa
      id: `etapa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
      sequencia: etapasAtuais.length + 1,
      data_criacao: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      etapas_entrega: [...etapasAtuais, etapaCompleta]
    }));

    toast.success(`✅ Etapa "${novaEtapa.nome_etapa}" criada com ${novaEtapa.quantidade_total_itens} itens`);
  };

  const removerEtapa = (etapaId) => {
    setFormData(prev => {
      const updatedEtapas = (prev.etapas_entrega || []).filter(e => e.id !== etapaId);
      // Re-sequence the remaining stages after removal
      const reSequencedEtapas = updatedEtapas.map((etapa, index) => ({
        ...etapa,
        sequencia: index + 1
      }));

      return {
        ...prev,
        etapas_entrega: reSequencedEtapas
      };
    });
    toast.success('Etapa removida');
  };

  const etapas = formData.etapas_entrega || [];
  const totalItensAlocados = etapas.reduce((sum, e) => sum + (e.quantidade_total_itens || 0), 0);
  
  // Combine all raw items to get total count for comparison with alocated items
  const totalItens = 
    (formData.itens_revenda?.length || 0) +
    (formData.itens_armado_padrao?.length || 0) +
    (formData.itens_corte_dobra?.length || 0);

  // Calcular frete automaticamente
  const calcularFreteAutomatico = async () => {
    if (!formData?.endereco_entrega_principal?.cep) {
      toast.error('Configure o endereço de entrega primeiro');
      return;
    }

    const peso = formData.peso_total_kg || 0;

    if (peso === 0) {
      toast.error('Adicione itens ao pedido primeiro');
      return;
    }

    // Regra de frete grátis
    if (peso >= 30) {
      setFormData(prev => ({ ...prev, valor_frete: 0, tipo_frete: 'CIF' }));
      toast.success('✅ Frete GRÁTIS! Peso acima de 30kg');
      return;
    }

    // Calcular frete baseado em peso e distância
    // Simulação: R$ 2,50 por KG
    const valorFrete = peso * 2.5;
    
    setFormData(prev => ({ ...prev, valor_frete: parseFloat(valorFrete.toFixed(2)) })); // Ensure float with 2 decimal places
    toast.success(`✅ Frete calculado: R$ ${valorFrete.toFixed(2)}`);
  };

  // Sugerir data de entrega baseada em produção
  const sugerirDataEntrega = () => {
    const diasProducao = (formData?.itens_armado_padrao?.length || 0) > 0 || 
                         (formData?.itens_corte_dobra?.length || 0) > 0 ? 7 : 2;
    const diasFrete = 3;
    const diasTotal = diasProducao + diasFrete;

    const dataEntrega = new Date();
    dataEntrega.setDate(dataEntrega.getDate() + diasTotal);

    const dataFormatada = dataEntrega.toISOString().split('T')[0];
    
    setFormData(prev => ({ 
      ...prev, 
      data_prevista_entrega: dataFormatada 
    }));

    toast.success(`📅 Data sugerida: +${diasProducao} dias produção + ${diasFrete} dias frete`);
  };

  return (
    <div className="space-y-6">
      {/* Alerta Frete Grátis */}
      {freteGratis && (
        <Alert className="border-green-300 bg-green-50">
          <Truck className="w-5 h-5 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900">🎉 Frete Grátis!</p>
            <p className="text-sm text-green-700">
              Peso total: {formData?.peso_total_kg?.toFixed(2) || '0.00'} kg (acima de 30 kg)
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Endereço de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {clienteSelecionado ? (
            <SeletorEnderecoEntregaPedido
              cliente={clienteSelecionado}
              enderecoSelecionado={formData?.endereco_entrega_principal || {}}
              onSelect={(endereco) => setFormData(prev => ({
                ...prev,
                endereco_entrega_principal: endereco
              }))}
            />
          ) : (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertDescription className="text-sm text-orange-700">
                Selecione um cliente na aba "Identificação" primeiro
              </AlertDescription>
            </Alert>
          )}

          <BuscaCEP
            onEnderecoEncontrado={(endereco) => setFormData(prev => ({
              ...prev,
              endereco_entrega_principal: endereco
            }))}
          />

          {/* NOVO: Campo Link Google Maps */}
          <div className="border-t pt-4">
            <Label>🗺️ Link do Google Maps (Opcional - Para Roteirização Precisa)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={formData?.endereco_entrega_principal?.mapa_url || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    mapa_url: e.target.value
                  }
                }))}
                placeholder="Cole o link do Google Maps aqui..."
                className="flex-1"
              />
              {formData?.endereco_entrega_principal?.mapa_url && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(formData.endereco_entrega_principal.mapa_url, '_blank')}
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              💡 Cole o link do Google Maps para garantir roteirização precisa. Ex: https://maps.app.goo.gl/ABC123
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bloco: Etapas de Entrega/Faturamento - V21.1 */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Etapas de Entrega / Faturamento Parcial
            </CardTitle>
            <Button
              onClick={() => setModalEtapaOpen(true)}
              data-permission="Comercial.Pedido.editar"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Etapa
            </Button>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            💡 Divida o pedido em etapas para: produção, faturamento e entrega separados
          </p>
        </CardHeader>
        <CardContent className="p-4">
          {etapas.length === 0 ? (
            <Alert className="border-slate-200 bg-slate-50">
              <AlertDescription className="text-sm text-slate-600">
                Nenhuma etapa criada. Clique em "Criar Nova Etapa" para dividir o pedido.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {etapas.map((etapa) => ( // Removed idx as etapa.id is stable
                <div key={etapa.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-600">Etapa {etapa.sequencia}</Badge>
                        <h3 className="font-bold text-slate-900">{etapa.nome_etapa}</h3>
                      </div>
                      {etapa.descricao_etapa && (
                        <p className="text-xs text-slate-600">{etapa.descricao_etapa}</p>
                      )}
                    </div>
                    <Badge className={
                      etapa.status_etapa === 'Faturada' ? 'bg-green-600' :
                      etapa.status_etapa === 'Em Produção' ? 'bg-orange-600' :
                      'bg-slate-600'
                    }>
                      {etapa.status_etapa}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="bg-white p-2 rounded border text-center">
                      <p className="text-xs text-slate-600">Itens</p>
                      <p className="text-lg font-bold text-blue-600">{etapa.quantidade_total_itens}</p>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <p className="text-xs text-slate-600">Peso (KG)</p>
                      <p className="text-lg font-bold text-purple-600">
                        {etapa.peso_total_etapa_kg?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <p className="text-xs text-slate-600">Valor</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {(etapa.valor_total_etapa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded border text-center">
                      <p className="text-xs text-slate-600">Previsão</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {etapa.data_prevista_entrega ? 
                          new Date(etapa.data_prevista_entrega).toLocaleDateString('pt-BR') : 
                          '-'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => removerEtapa(etapa.id)}
                      data-permission="Comercial.Pedido.editar"
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-green-50 rounded border border-green-200 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-green-800">
                    ✅ {totalItensAlocados} de {totalItens} itens alocados em etapas
                  </span>
                  {totalItensAlocados === totalItens && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      100% Alocado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frete - COM CÁLCULO AUTOMÁTICO */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Informações de Frete
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={calcularFreteAutomatico}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Frete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Logística *</Label>
              <select
                value={formData?.tipo_frete || 'CIF'}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, tipo_frete: e.target.value }));
                  if (e.target.value === 'Retirada') {
                    setFormData(prev => ({ ...prev, valor_frete: 0 }));
                    toast.info('💡 Pedido configurado para RETIRADA - cliente buscará no local');
                  } else {
                    toast.info('💡 Pedido configurado para ENTREGA - será enviado ao cliente');
                  }
                }}
                className="w-full p-2 border rounded-lg"
              >
                <option value="CIF">🚚 ENTREGA - CIF (Por nossa conta)</option>
                <option value="FOB">🚚 ENTREGA - FOB (Por conta do cliente)</option>
                <option value="Retirada">📦 RETIRADA no local</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                {formData?.tipo_frete === 'Retirada' 
                  ? '📦 Cliente retirará o pedido na empresa' 
                  : '🚚 Pedido será entregue no endereço'}
              </p>
            </div>

            <div>
              <Label>Valor do Frete</Label>
              <Input
                type="number"
                step="0.01"
                value={freteGratis ? 0 : (formData?.valor_frete || 0)}
                onChange={(e) => !freteGratis && setFormData(prev => ({
                  ...prev,
                  valor_frete: parseFloat(e.target.value) || 0
                }))}
                disabled={freteGratis}
                className={freteGratis ? 'bg-green-50 font-bold text-green-600' : ''}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Previsão Entrega</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={sugerirDataEntrega}
                  className="h-6 text-xs"
                >
                  Sugerir
                </Button>
              </div>
              <Input
                type="date"
                value={formData?.data_prevista_entrega || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  data_prevista_entrega: e.target.value 
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Janela de Entrega - Início</Label>
              <Input
                type="time"
                value={formData?.endereco_entrega_principal?.horario_inicio || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    horario_inicio: e.target.value
                  }
                }))}
              />
            </div>
            <div>
              <Label>Janela de Entrega - Fim</Label>
              <Input
                type="time"
                value={formData?.endereco_entrega_principal?.horario_fim || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  endereco_entrega_principal: {
                    ...(prev?.endereco_entrega_principal || {}),
                    horario_fim: e.target.value
                  }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instruções de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData?.endereco_entrega_principal?.instrucoes_entrega || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              endereco_entrega_principal: {
                ...(prev?.endereco_entrega_principal || {}),
                instrucoes_entrega: e.target.value
              }
            }))}
            className="w-full p-3 border rounded-lg"
            rows="4"
            placeholder="Ex: Portaria 2, avisar com 30min de antecedência..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Próximo: Financeiro
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <CriarEtapaEntregaModal
        open={modalEtapaOpen}
        onClose={() => setModalEtapaOpen(false)}
        pedidoData={formData}
        onCriarEtapa={handleCriarEtapa}
      />
    </div>
  );
}