import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Leaf, Users, Shield, BarChart3 } from 'lucide-react';
import CarbonFootprintPanel from './CarbonFootprintPanel';
import SocialImpactPanel from './SocialImpactPanel';
import GovernanceScorePanel from './GovernanceScorePanel';

export default function ESGScorecardHub() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('Dashboard', null, 'ver')) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar o ESG Dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Score ESG Geral', valor: 'B+', cor: 'text-emerald-400' },
    { label: 'Emissão Mensal', valor: '362 tCO₂', cor: 'text-blue-400' },
    { label: 'Satisfação RH', valor: '82%', cor: 'text-yellow-400' },
    { label: 'Compliance', valor: '84%', cor: 'text-purple-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Leaf className="w-7 h-7 text-emerald-400" />
              ESG & Sustentabilidade Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Carbono • Impacto Social • Governança Corporativa</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-900 text-emerald-200">GHG Protocol</Badge>
            <Badge className="bg-blue-900 text-blue-200">GRI Standards</Badge>
            <Badge className="bg-purple-900 text-purple-200">Multi-Empresa</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {kpis.map((k, idx) => (
            <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
              <p className="text-xs text-slate-400">{k.label}</p>
              <p className={`text-lg font-bold ${k.cor}`}>{k.valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="ambiental" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700 mb-4">
            <TabsTrigger value="ambiental" className="data-[state=active]:bg-emerald-700">
              <Leaf className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ambiental</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="governanca" className="data-[state=active]:bg-purple-600">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Governança</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ambiental" className="m-0">
            <CarbonFootprintPanel />
          </TabsContent>
          <TabsContent value="social" className="m-0">
            <SocialImpactPanel />
          </TabsContent>
          <TabsContent value="governanca" className="m-0">
            <GovernanceScorePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}