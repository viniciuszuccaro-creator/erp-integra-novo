import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, FileText, DollarSign, MessageCircle } from 'lucide-react';
import integracaoNFe from '../lib/integracaoNFe';
import integracaoBoletos from '../lib/integracaoBoletos';
import integracaoWhatsApp from '../lib/integracaoWhatsApp';
import IntegracaoCard from './status-integracoes/IntegracaoCard';
import IntegracaoInstrucoes from './status-integracoes/IntegracaoInstrucoes';

export default function StatusIntegracoes({ empresaId, groupId }) {
  const [verificandoNFe, setVerificandoNFe] = useState(false);
  const [verificandoBoleto, setVerificandoBoleto] = useState(false);
  const [verificandoWhatsApp, setVerificandoWhatsApp] = useState(false);
  const [statusNFe, setStatusNFe] = useState(null);
  const [statusBoleto, setStatusBoleto] = useState(null);
  const [statusWhatsApp, setStatusWhatsApp] = useState(null);
  const scopeId = empresaId || groupId || null;
  const scope = empresaId ? { empresa_id: empresaId } : groupId ? { group_id: groupId } : {};

  const verificarConfigLocal = async (key) => {
    if (!scopeId) return { configurado: false, erro: 'Selecione um grupo ou empresa.' };
    const chave = `integracoes_${scopeId}`;
    const rows = await base44.entities.ConfiguracaoSistema.filter({ chave, ...scope }, undefined, 1);
    const cfg = rows?.[0]?.[key];
    const configurado = !!(cfg?.ativo || cfg?.api_key || cfg?.api_url || cfg?.provedor);
    return { configurado, conectado: configurado, integracao: cfg || null };
  };

  const handleVerificarNFe = async () => {
    setVerificandoNFe(true);
    try {
      const resultado = empresaId ? await integracaoNFe.verificarConfiguracao(empresaId) : await verificarConfigLocal('integracao_nfe');
      setStatusNFe(resultado);
    } catch (error) {
      setStatusNFe({ configurado: false, erro: error.message });
    } finally {
      setVerificandoNFe(false);
    }
  };

  const handleVerificarBoleto = async () => {
    setVerificandoBoleto(true);
    try {
      const resultado = empresaId ? await integracaoBoletos.verificarConfiguracao(empresaId) : await verificarConfigLocal('integracao_boletos');
      setStatusBoleto(resultado);
    } catch (error) {
      setStatusBoleto({ configurado: false, erro: error.message });
    } finally {
      setVerificandoBoleto(false);
    }
  };

  const handleVerificarWhatsApp = async () => {
    setVerificandoWhatsApp(true);
    try {
      const resultado = empresaId ? await integracaoWhatsApp.verificarConexao(empresaId) : await verificarConfigLocal('integracao_whatsapp');
      setStatusWhatsApp(resultado);
    } catch (error) {
      setStatusWhatsApp({ conectado: false, erro: error.message });
    } finally {
      setVerificandoWhatsApp(false);
    }
  };

  useEffect(() => {
    if (scopeId) {
      handleVerificarNFe();
      handleVerificarBoleto();
      handleVerificarWhatsApp();
    }
  }, [scopeId]);

  const integracoes = [
    {
      id: 'nfe', titulo: 'NF-e Eletrônica', descricao: 'Emissão de notas fiscais',
      icon: FileText, cor: 'blue', status: statusNFe, verificando: verificandoNFe,
      onVerificar: handleVerificarNFe, provedores: ['eNotas', 'NFe.io', 'Focus NFe'],
      provedor_atual: statusNFe?.integracao?.provedor,
    },
    {
      id: 'boleto', titulo: 'Boletos e PIX', descricao: 'Geração de cobranças',
      icon: DollarSign, cor: 'green', status: statusBoleto, verificando: verificandoBoleto,
      onVerificar: handleVerificarBoleto, provedores: ['Asaas', 'Juno', 'Mercado Pago'],
      provedor_atual: statusBoleto?.integracao?.provedor,
    },
    {
      id: 'whatsapp', titulo: 'WhatsApp Business', descricao: 'Envio de mensagens',
      icon: MessageCircle, cor: 'emerald', status: statusWhatsApp, verificando: verificandoWhatsApp,
      onVerificar: handleVerificarWhatsApp, provedores: ['Evolution API', 'Baileys', 'WPPCONNECT'],
      provedor_atual: statusWhatsApp?.whatsapp?.provedor || 'Evolution API',
    },
  ];

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto">
      <Alert className="border-blue-300 bg-blue-50">
        <Zap className="w-5 h-5 text-blue-600" />
        <AlertDescription>
          <p className="font-semibold text-blue-900 mb-1">🚀 Integrações Reais Implementadas!</p>
          <p className="text-sm text-blue-800">
            Sistema pronto para conectar com APIs reais de <strong>NF-e</strong>, <strong>Boletos/PIX</strong> e <strong>WhatsApp</strong>. Configure as credenciais para ativar.
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        {integracoes.map(integracao => (
          <IntegracaoCard key={integracao.id} integracao={integracao} empresaId={empresaId} groupId={groupId} />
        ))}
      </div>

      <IntegracaoInstrucoes />

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'NF-e Emitidas', cor: 'text-blue-600' },
          { label: 'Cobranças Geradas', cor: 'text-green-600' },
          { label: 'Mensagens Enviadas', cor: 'text-emerald-600' },
        ].map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.cor}`}>-</div>
              <p className="text-xs text-slate-500">Últimos 30 dias</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}