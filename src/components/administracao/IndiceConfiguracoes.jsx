import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building2, FileJson, DollarSign } from 'lucide-react';

/**
 * ÍNDICE 1: CONFIGURAÇÕES GERAIS
 * Consolida: Empresa, Fiscal, Integração, Parâmetros
 * Refatorado de: AdminTabs (Configurações), ConfigCenter, etc
 * Regra-Mãe: Melhorar existente
 */
export default function IndiceConfiguracoes() {
  const [activeTab, setActiveTab] = useState('empresa');

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Configurações Gerais do Sistema</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa">
            <Building2 className="w-4 h-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="fiscal">
            <FileJson className="w-4 h-4 mr-2" />
            Fiscal
          </TabsTrigger>
          <TabsTrigger value="integracao">
            <DollarSign className="w-4 h-4 mr-2" />
            Integração
          </TabsTrigger>
          <TabsTrigger value="parametros">
            <Settings className="w-4 h-4 mr-2" />
            Parâmetros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Dados da Empresa & Filiais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: EmpresaForm + FilialForm</p>
              {/* Renderizar EmpresaForm aqui */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Configurações Fiscais (NF-e, SPED)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: ConfigFiscalAutomatica + ConfiguracaoNFeForm</p>
              {/* Renderizar ConfigFiscal aqui */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integracao" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>APIs & Integrações Externas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: ApiExternaForm + GatewayPagamentoForm + WebhookForm</p>
              {/* Renderizar Integrações aqui */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parametros" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Parâmetros Globais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: UnidadeMedida + Banco + MoedaIndice + TipoFrete</p>
              {/* Renderizar Parâmetros aqui */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}