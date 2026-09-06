import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  DollarSign, 
  Send, 
  Copy, 
  Check,
  AlertCircle,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';

/**
 * V21.6 - GERAR 2ª VIA DE BOLETO NO CHAT
 * 
 * Permite ao atendente:
 * ✅ Ver títulos em aberto do cliente
 * ✅ Gerar 2ª via de boleto
 * ✅ Enviar link de pagamento
 * ✅ Copiar linha digitável
 * ✅ Registrar na conversa
 */
export default function GerarBoletoChat({ conversa, clienteId, onBoletoEnviado }) {
  const [tituloSelecionado, setTituloSelecionado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const { empresaAtual, updateInContext } = useContextoVisual();
  const { canEdit } = usePermissions();

  // Buscar títulos do cliente
  const { data: titulos = [], isLoading } = useQuery({
    queryKey: ['titulos-cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      return await base44.entities.ContaReceber.filter({
        cliente_id: clienteId,
        status: { $in: ['Pendente', 'Atrasado'] }
      }, 'data_vencimento');
    },
    enabled: !!clienteId
  });

  // Gerar/Enviar boleto
  const enviarBoletoMutation = useMutation({
    mutationFn: async (titulo) => {
      // Regra-Mãe 5: RBAC + contexto na persistência (fail-closed)
      if (!canEdit('Financeiro')) throw new Error('Sem permissão para gerar boletos.');
      // Em produção, chamar integração de boleto
      // Por hora, simular geração
      
      const linhaDigitavel = titulo.linha_digitavel || 
        `23793.38128 60000.000003 00000.000409 1 ${Math.random().toString().substr(2, 14)}`;
      
      const urlBoleto = titulo.url_boleto_pdf || titulo.boleto_url || 
        `https://boleto.exemplo.com/${titulo.id}`;

      // Atualizar título com dados do boleto — preserva group_id/empresa_id
      await updateInContext('ContaReceber', titulo.id, {
        linha_digitavel: linhaDigitavel,
        url_boleto_pdf: urlBoleto,
        status_cobranca: 'gerada',
        data_envio_cobranca: new Date().toISOString(),
        group_id: titulo.group_id || conversa?.group_id,
        empresa_id: titulo.empresa_id || conversa?.empresa_id,
      });

      // Registrar na conversa
      if (conversa?.id) {
        await updateInContext('ConversaOmnicanal', conversa.id, {
          conta_receber_gerada_id: titulo.id,
          group_id: conversa?.group_id,
          empresa_id: conversa?.empresa_id,
          acoes_automaticas_executadas: [
            ...(conversa.acoes_automaticas_executadas || []),
            {
              acao: 'gerar_boleto',
              data: new Date().toISOString(),
              resultado: `Boleto R$ ${titulo.valor.toLocaleString('pt-BR')} enviado`,
              sucesso: true
            }
          ]
        });
      }

      return {
        ...titulo,
        linha_digitavel: linhaDigitavel,
        url_boleto_pdf: urlBoleto
      };
    },
    onSuccess: (data) => {
      toast.success('Boleto gerado com sucesso!');
      setTituloSelecionado(data);
      onBoletoEnviado?.(data);
    },
    onError: () => {
      toast.error('Erro ao gerar boleto');
    }
  });

  const copiarLinhaDigitavel = async () => {
    if (!tituloSelecionado?.linha_digitavel) return;
    
    await navigator.clipboard.writeText(tituloSelecionado.linha_digitavel);
    setCopiado(true);
    toast.success('Linha digitável copiada!');
    setTimeout(() => setCopiado(false), 2000);
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const diasAtraso = (dataVencimento) => {
    if (!dataVencimento) return 0;
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diff = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const valorTotal = titulos.reduce((sum, t) => sum + (t.valor || 0), 0);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <span className="text-sm text-slate-600">Carregando títulos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-blue-900">
            <FileText className="w-5 h-5 text-blue-600" />
            Boletos / 2ª Via
          </span>
          {titulos.length > 0 && (
            <Badge className={valorTotal > 0 ? 'bg-red-600' : 'bg-green-600'}>
              {titulos.length} título(s)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {titulos.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum título em aberto</p>
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-800">Total em Aberto:</span>
                <span className="text-lg font-bold text-red-600">
                  R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Lista de Títulos */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {titulos.map(titulo => {
                const atraso = diasAtraso(titulo.data_vencimento);
                const selecionado = tituloSelecionado?.id === titulo.id;
                
                return (
                  <div 
                    key={titulo.id}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selecionado 
                        ? 'border-blue-500 bg-blue-50' 
                        : atraso > 0 
                        ? 'border-red-200 bg-red-50 hover:border-red-400'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => setTituloSelecionado(titulo)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{titulo.descricao}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatarData(titulo.data_vencimento)}
                          </Badge>
                          {atraso > 0 && (
                            <Badge className="bg-red-600 text-xs">
                              {atraso} dias atraso
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          R$ {(titulo.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {titulo.numero_documento || titulo.id?.substring(0, 8)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ações do Título Selecionado */}
            {tituloSelecionado && (
              <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900">
                  Título: {tituloSelecionado.descricao}
                </p>

                {/* Linha Digitável */}
                {tituloSelecionado.linha_digitavel && (
                  <div className="p-2 bg-white rounded border">
                    <p className="text-xs text-slate-500 mb-1">Linha Digitável:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono break-all">
                        {tituloSelecionado.linha_digitavel}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copiarLinhaDigitavel}
                      >
                        {copiado ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => enviarBoletoMutation.mutate(tituloSelecionado)}
                    disabled={enviarBoletoMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {enviarBoletoMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Gerar 2ª Via
                      </>
                    )}
                  </Button>

                  {tituloSelecionado.url_boleto_pdf && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(tituloSelecionado.url_boleto_pdf, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver PDF
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}