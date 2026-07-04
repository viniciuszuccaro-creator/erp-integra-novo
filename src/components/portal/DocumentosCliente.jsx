import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Search, CreditCard, Eye, Calendar } from 'lucide-react';

/**
 * V21.5 - Documentos & Boletos COMPLETO
 * ✅ NFes com XML/DANFE download
 * ✅ Boletos com PIX copia-cola
 * ✅ Links de pagamento
 * ✅ Alertas de vencimento
 * ✅ w-full h-full
 */
export default function DocumentosCliente() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: notasFiscais = [], isLoading: loadingNFe } = useQuery({
    queryKey: ['minhas-nfes'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const clientes = await base44.entities.Cliente.filter({ portal_usuario_id: user.id });
      const cliente = clientes[0];
      
      if (!cliente) return [];
      
      return await base44.entities.NotaFiscal.filter({ 
        cliente_fornecedor_id: cliente.id 
      }, '-data_emissao', 100);
    },
  });

  const { data: contasReceber = [], isLoading: loadingBoletos } = useQuery({
    queryKey: ['meus-boletos'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const clientes = await base44.entities.Cliente.filter({ portal_usuario_id: user.id });
      const cliente = clientes[0];
      
      if (!cliente) return [];
      
      return await base44.entities.ContaReceber.filter({ 
        cliente_id: cliente.id,
        visivel_no_portal: true 
      }, '-data_vencimento', 100);
    },
  });

  const statusColorBoleto = {
    'Pendente': 'bg-yellow-100 text-yellow-800',
    'Recebido': 'bg-green-100 text-green-800',
    'Atrasado': 'bg-red-100 text-red-800',
    'Cancelado': 'bg-gray-100 text-gray-800',
  };

  const handleDownloadNFe = async (nfe) => {
    if (nfe.xml_url) {
      window.open(nfe.xml_url, '_blank');
    } else {
      alert('XML não disponível');
    }
  };

  const handleVisualizarBoleto = (conta) => {
    if (conta.url_boleto_pdf) {
      window.open(conta.url_boleto_pdf, '_blank');
    } else if (conta.linha_digitavel) {
      alert(`Linha Digitável: ${conta.linha_digitavel}`);
    } else {
      alert('Boleto não disponível');
    }
  };

  const handleCopiarPix = (conta) => {
    if (conta.pix_copia_cola) {
      navigator.clipboard.writeText(conta.pix_copia_cola);
      alert('Código PIX copiado!');
    } else {
      alert('PIX não disponível');
    }
  };

  const filteredNFes = notasFiscais.filter(nfe =>
    nfe.numero?.toString().includes(searchTerm) ||
    nfe.chave_acesso?.includes(searchTerm)
  );

  const filteredBoletos = contasReceber.filter(conta =>
    conta.numero_documento?.includes(searchTerm) ||
    conta.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full h-full">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="nfes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nfes">
            <FileText className="w-4 h-4 mr-2" />
            Notas Fiscais ({notasFiscais.length})
          </TabsTrigger>
          <TabsTrigger value="boletos">
            <CreditCard className="w-4 h-4 mr-2" />
            Boletos & PIX ({contasReceber.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nfes" className="space-y-4 mt-6 w-full">
          {loadingNFe ? (
            <p>Carregando notas fiscais...</p>
          ) : (
            <div className="grid gap-4 w-full">
              {filteredNFes.map((nfe) => (
                <Card key={nfe.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">NF-e Nº {nfe.numero}</h3>
                          <p className="text-sm text-slate-600">
                            Série: {nfe.serie} | Chave: {nfe.chave_acesso?.substring(0, 20)}...
                          </p>
                          <p className="text-sm text-slate-600">
                            Emissão: {new Date(nfe.data_emissao).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm font-medium text-green-600 mt-1">
                            Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nfe.valor_total)}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {nfe.status || 'Autorizada'}
                      </Badge>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        data-permission="Portal.Documento.baixar"
                        onClick={() => handleDownloadNFe(nfe)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download XML
                      </Button>
                      {nfe.danfe_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          data-permission="Portal.Documento.visualizar"
                          onClick={() => window.open(nfe.danfe_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver DANFE
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredNFes.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhuma nota fiscal encontrada</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="boletos" className="space-y-4 mt-6 w-full">
          {loadingBoletos ? (
            <p>Carregando boletos...</p>
          ) : (
            <div className="grid gap-4 w-full">
              {filteredBoletos.map((conta) => {
                const isVencido = new Date(conta.data_vencimento) < new Date() && conta.status === 'Pendente';
                const diasAtraso = isVencido ? Math.floor((new Date() - new Date(conta.data_vencimento)) / (1000 * 60 * 60 * 24)) : 0;

                return (
                  <Card key={conta.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            isVencido ? 'bg-red-500' : 'bg-blue-500'
                          }`}>
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{conta.descricao}</h3>
                            <p className="text-sm text-slate-600">
                              Doc: {conta.numero_documento || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-600">
                              Vencimento: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                            </p>
                            {isVencido && (
                              <p className="text-sm font-medium text-red-600 mt-1">
                                ⚠️ Vencido há {diasAtraso} dias
                              </p>
                            )}
                            <p className="text-lg font-bold text-blue-600 mt-2">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusColorBoleto[conta.status] || 'bg-gray-100'}>
                          {conta.status}
                        </Badge>
                      </div>

                      {conta.status === 'Pendente' && (
                        <div className="flex gap-2">
                          {conta.linha_digitavel && (
                            <Button
                              size="sm"
                              data-permission="Portal.Boleto.visualizar"
                              onClick={() => handleVisualizarBoleto(conta)}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Boleto
                            </Button>
                          )}
                          {conta.pix_copia_cola && (
                            <Button
                              size="sm"
                              variant="outline"
                              data-permission="Portal.Boleto.visualizar"
                              onClick={() => handleCopiarPix(conta)}
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Copiar PIX
                            </Button>
                          )}
                          {conta.url_fatura && (
                            <Button
                              size="sm"
                              variant="outline"
                              data-permission="Portal.Boleto.visualizar"
                              onClick={() => window.open(conta.url_fatura, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Link de Pagamento
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {filteredBoletos.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Nenhum boleto encontrado</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}