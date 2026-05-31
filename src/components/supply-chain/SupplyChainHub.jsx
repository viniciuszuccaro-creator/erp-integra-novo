/**
 * SupplyChainHub v1.0
 * Hub central da cadeia de suprimentos
 * Regra-Mãe: w-full, h-full, integração 25 passos
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Zap, BarChart3 } from 'lucide-react';
import SupplyChainDashboard from './SupplyChainDashboard';
import SupplyChainOptimizer from './SupplyChainOptimizer';

export default function SupplyChainHub() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-teal-900">
      <div className="bg-white/10 backdrop-blur border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <Truck className="w-8 h-8 text-teal-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Supply Chain Hub</h1>
              <p className="text-sm text-slate-300">Otimização · Previsão · Automação de Cadeia</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-300">OTIF</p>
            <p className="text-2xl font-bold text-teal-300">94.1%</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/10 backdrop-blur h-auto p-0">
            {[
              { value: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { value: 'otimizador', label: 'Otimizador IA', icon: Zap },
              { value: 'resumo', label: 'Consolidado 25 Passos', icon: Truck },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-teal-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="dashboard" className="flex-1 m-0">
            <SupplyChainDashboard />
          </TabsContent>

          <TabsContent value="otimizador" className="flex-1 m-0">
            <SupplyChainOptimizer />
          </TabsContent>

          <TabsContent value="resumo" className="flex-1 m-0 p-6 overflow-auto">
            <h2 className="text-2xl font-bold text-white mb-6">🏆 Consolidado 25 Passos — ERP Zuccaro V21.9</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { passo: 1, nome: 'Setup Multi-Empresa', modulo: 'Base', status: '✅' },
                { passo: 2, nome: 'Cadastros Gerais', modulo: 'Cadastros', status: '✅' },
                { passo: 3, nome: 'Comercial & Vendas', modulo: 'Comercial', status: '✅' },
                { passo: 4, nome: 'Estoque & Almoxarifado', modulo: 'Estoque', status: '✅' },
                { passo: 5, nome: 'Financeiro & Contábil', modulo: 'Financeiro', status: '✅' },
                { passo: 6, nome: 'Compras & Suprimentos', modulo: 'Compras', status: '✅' },
                { passo: 7, nome: 'Produção & Manufatura', modulo: 'Produção', status: '✅' },
                { passo: 8, nome: 'Expedição & Logística', modulo: 'Logística', status: '✅' },
                { passo: 9, nome: 'Fiscal & Tributário', modulo: 'Fiscal', status: '✅' },
                { passo: 10, nome: 'RH & Colaboradores', modulo: 'RH', status: '✅' },
                { passo: 11, nome: 'CRM & Relacionamento', modulo: 'CRM', status: '✅' },
                { passo: 12, nome: 'Portal do Cliente', modulo: 'Portal', status: '✅' },
                { passo: 13, nome: 'Dashboard Corporativo', modulo: 'BI', status: '✅' },
                { passo: 14, nome: 'IA Avançada & BI', modulo: 'IA', status: '✅' },
                { passo: 15, nome: 'Performance & Gamificação', modulo: 'Gamificação', status: '✅' },
                { passo: 16, nome: 'Inteligência Coletiva', modulo: 'Grupo', status: '✅' },
                { passo: 17, nome: 'Previsões Avançadas', modulo: 'Forecast', status: '✅' },
                { passo: 18, nome: 'Omnichannel & Governança', modulo: 'Omni', status: '✅' },
                { passo: 19, nome: 'Analytics Intelligence Center', modulo: 'Analytics', status: '✅' },
                { passo: 20, nome: 'Automation Hub & RPA', modulo: 'RPA', status: '✅' },
                { passo: 21, nome: 'Ecosystem Marketplace', modulo: 'Marketplace', status: '✅' },
                { passo: 22, nome: 'Mobile Intelligence', modulo: 'Mobile', status: '✅' },
                { passo: 23, nome: 'Advanced B2B Portal', modulo: 'B2B', status: '✅' },
                { passo: 24, nome: 'AI Recommendations', modulo: 'AI', status: '✅' },
                { passo: 25, nome: 'Supply Chain Optimization', modulo: 'SCM', status: '✅' },
              ].map((p) => (
                <div
                  key={p.passo}
                  className="p-3 rounded-lg bg-white/10 border border-white/20 flex items-center gap-3 hover:bg-white/15 transition-all"
                >
                  <span className="text-xl font-bold text-teal-300 w-8">#{p.passo}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{p.nome}</p>
                    <p className="text-slate-400 text-xs">{p.modulo}</p>
                  </div>
                  <span className="text-lg">{p.status}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-400/30 text-center">
              <p className="text-4xl font-black text-white mb-2">🏆 100% COMPLETO</p>
              <p className="text-teal-300 text-lg font-bold">ERP Zuccaro V21.9 — Production Ready</p>
              <p className="text-slate-300 mt-2 text-sm">25 passos · Multi-empresa · IA Embarcada · Mobile · B2B · SCM</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}