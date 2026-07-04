import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

/**
 * Wizard de Criação de Pedido com 4 Etapas
 * Substituterá o formulário tradicional por fluxo guiado
 */
export default function WizardPedido({ pedido, onSalvar, onCancelar, clientes }) {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosPedido, setDadosPedido] = useState(pedido || {
    cliente_id: '',
    cliente_nome: '',
    itens_revenda: [],
    itens_producao: [],
    valor_total: 0,
    percentual_conclusao_wizard: 0,
    etapa_atual_wizard: 1
  });

  const etapas = [
    {
      numero: 1,
      titulo: 'Dados e Cliente',
      descricao: 'Selecione o cliente e dados básicos',
      campos: ['cliente_id', 'vendedor', 'data_pedido'],
      icone: Circle
    },
    {
      numero: 2,
      titulo: 'Itens e IA de Produção',
      descricao: 'Adicione produtos ou use IA para ler projetos',
      campos: ['itens_revenda', 'itens_producao'],
      icone: Circle
    },
    {
      numero: 3,
      titulo: 'Pagamento e Condições',
      descricao: 'Configure forma de pagamento e condições',
      campos: ['forma_pagamento', 'condicao_pagamento', 'parcelas'],
      icone: Circle
    },
    {
      numero: 4,
      titulo: 'Documentos e Aprovação',
      descricao: 'Revise e aprove o pedido',
      campos: ['observacoes', 'anexos'],
      icone: Circle
    }
  ];

  const calcularProgressoEtapa = (numeroEtapa) => {
    const etapa = etapas.find(e => e.numero === numeroEtapa);
    if (!etapa) return 0;

    const camposPreenchidos = etapa.campos.filter(campo => {
      const valor = dadosPedido[campo];
      if (Array.isArray(valor)) return valor.length > 0;
      return valor && valor !== '';
    }).length;

    return (camposPreenchidos / etapa.campos.length) * 100;
  };

  const calcularProgressoTotal = () => {
    const progressoEtapas = etapas.map(e => calcularProgressoEtapa(e.numero));
    return progressoEtapas.reduce((sum, p) => sum + p, 0) / etapas.length;
  };

  const progressoTotal = calcularProgressoTotal();

  const podeAvancar = () => {
    // Validações mínimas por etapa
    if (etapaAtual === 1) {
      return dadosPedido.cliente_id && dadosPedido.data_pedido;
    }
    if (etapaAtual === 2) {
      return (dadosPedido.itens_revenda?.length > 0 || dadosPedido.itens_producao?.length > 0);
    }
    if (etapaAtual === 3) {
      return dadosPedido.forma_pagamento;
    }
    return true;
  };

  const handleProxima = () => {
    if (etapaAtual < 4) {
      setEtapaAtual(etapaAtual + 1);
      setDadosPedido({
        ...dadosPedido,
        etapa_atual_wizard: etapaAtual + 1,
        percentual_conclusao_wizard: calcularProgressoTotal()
      });
    }
  };

  const handleAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
      setDadosPedido({
        ...dadosPedido,
        etapa_atual_wizard: etapaAtual - 1
      });
    }
  };

  const handleSalvarRascunho = () => {
    onSalvar({
      ...dadosPedido,
      status: 'Rascunho',
      percentual_conclusao_wizard: progressoTotal
    });
  };

  const handleFinalizar = () => {
    onSalvar({
      ...dadosPedido,
      status: 'Aguardando Aprovação',
      percentual_conclusao_wizard: 100
    });
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar com Etapas */}
      <div className="w-72 space-y-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={progressoTotal} className="h-2" />
            <p className="text-xs text-slate-600 text-center">
              {progressoTotal.toFixed(0)}% concluído
            </p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {etapas.map((etapa) => {
            const progresso = calcularProgressoEtapa(etapa.numero);
            const concluida = progresso === 100;
            const atual = etapa.numero === etapaAtual;
            const Icon = concluida ? CheckCircle2 : etapa.icone;

            return (
              <button
                key={etapa.numero}
                onClick={() => setEtapaAtual(etapa.numero)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  atual 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : concluida
                    ? 'border-green-300 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${
                    atual 
                      ? 'text-blue-600' 
                      : concluida 
                      ? 'text-green-600' 
                      : 'text-slate-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${
                        atual ? 'text-blue-900' : concluida ? 'text-green-900' : 'text-slate-700'
                      }`}>
                        {etapa.titulo}
                      </p>
                      {concluida && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{etapa.descricao}</p>
                    {!concluida && (
                      <div className="mt-2">
                        <Progress value={progresso} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Etapa Atual */}
      <div className="flex-1">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>
              Etapa {etapaAtual} de 4: {etapas[etapaAtual - 1].titulo}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 min-h-[500px]">
            {etapaAtual === 1 && (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Conteúdo da Etapa 1 - Selecionar cliente, vendedor, data...
                </p>
                {/* TODO: Implementar formulário da etapa 1 */}
              </div>
            )}

            {etapaAtual === 2 && (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Conteúdo da Etapa 2 - Adicionar produtos ou usar IA para ler projetos...
                </p>
                {/* TODO: Implementar formulário da etapa 2 */}
              </div>
            )}

            {etapaAtual === 3 && (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Conteúdo da Etapa 3 - Forma de pagamento, condições comerciais...
                </p>
                {/* TODO: Implementar formulário da etapa 3 */}
              </div>
            )}

            {etapaAtual === 4 && (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Conteúdo da Etapa 4 - Revisão final e aprovação...
                </p>
                {/* TODO: Implementar formulário da etapa 4 */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rodapé Fixo com Ações */}
        <div className="mt-4 flex justify-between items-center p-4 bg-white border rounded-lg shadow-md">
          <div className="flex gap-2">
            <Button
              variant="outline"
              data-permission="Comercial.Pedido.criar"
              onClick={handleSalvarRascunho}
            >
              Salvar Rascunho
            </Button>
            <Button
              variant="outline"
              data-permission="Comercial.Pedido.visualizar"
              onClick={onCancelar}
            >
              Cancelar
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              data-permission="Comercial.Pedido.visualizar"
              onClick={handleAnterior}
              disabled={etapaAtual === 1}
            >
              ← Anterior
            </Button>
            
            {etapaAtual < 4 ? (
              <Button
                onClick={handleProxima}
                data-permission="Comercial.Pedido.criar"
                disabled={!podeAvancar()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Próxima →
              </Button>
            ) : (
              <Button
                onClick={handleFinalizar}
                data-permission="Comercial.Pedido.criar"
                disabled={!podeAvancar()}
                className="bg-green-600 hover:bg-green-700"
              >
                Finalizar Pedido
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}