/**
 * B2BPortalHub v1.0
 * Hub central do portal B2B para fornecedores, representantes e parceiros
 * Regra-Mãe: w-full, h-full, multi-partner, integrado com 22 passos
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Package, TrendingUp, Settings } from 'lucide-react';
import B2BPortalDashboard from './B2BPortalDashboard';
import B2BOrderManagement from './B2BOrderManagement';

export default function B2BPortalHub() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Header Premium */}
      <div className="bg-white/10 backdrop-blur border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Portal B2B</h1>
              <p className="text-sm text-slate-300">Fornecedores · Representantes · Parceiros</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-white">
            <div className="text-right">
              <p className="text-xs text-slate-300">Seu Saldo</p>
              <p className="text-2xl font-bold">R$ 12.450</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-300">Comissões Este Mês</p>
              <p className="text-2xl font-bold text-green-400">+8.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/10 backdrop-blur h-auto p-0">
            {[
              { value: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { value: 'pedidos', label: 'Pedidos', icon: Package },
              { value: 'comissoes', label: 'Comissões', icon: '💰' },
              { value: 'configuracoes', label: 'Configurações', icon: Settings },
            ].map((tab) => {
              const Icon = typeof tab.icon === 'string' ? null : tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  {Icon ? <Icon className="w-4 h-4 mr-2" /> : <span className="mr-2">{tab.icon}</span>}
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="flex-1 m-0">
            <B2BPortalDashboard />
          </TabsContent>

          {/* Pedidos */}
          <TabsContent value="pedidos" className="flex-1 m-0">
            <B2BOrderManagement />
          </TabsContent>

          {/* Comissões */}
          <TabsContent value="comissoes" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Comissões e Faturamento</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Comissões Este Mês', value: 'R$ 3.450', icon: '💰' },
                  { label: 'Comissões Pendentes', value: 'R$ 1.200', icon: '⏳' },
                  { label: 'Comissões Pagas', value: 'R$ 24.850', icon: '✅' },
                  { label: 'Taxa Média', value: '8.5%', icon: '📊' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/10 border border-white/20">
                    <p className="text-2xl mb-1">{item.icon}</p>
                    <p className="text-xs text-slate-300 mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-purple-300">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-lg bg-white/10 border border-white/20">
                <h3 className="font-bold text-white mb-3">Histórico de Comissões</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { data: '31/05/2026', descricao: 'Comissão Maio 2026', valor: '+R$ 3.450', status: 'pendente' },
                    { data: '30/04/2026', descricao: 'Comissão Abril 2026', valor: '+R$ 2.890', status: 'pago' },
                    { data: '31/03/2026', descricao: 'Comissão Março 2026', valor: '+R$ 3.210', status: 'pago' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div>
                        <p className="text-white font-semibold">{item.descricao}</p>
                        <p className="text-xs text-slate-400">{item.data}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{item.valor}</p>
                        <p className={`text-xs ${item.status === 'pago' ? 'text-green-400' : 'text-amber-400'}`}>
                          {item.status === 'pago' ? '✅ Pago' : '⏳ Pendente'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="configuracoes" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-4">Configurações da Conta</h2>

              <div className="p-6 rounded-lg bg-white/10 border border-white/20 space-y-4">
                {[
                  { label: 'Alterar Senha', icon: '🔐' },
                  { label: 'Dados Bancários', icon: '🏦' },
                  { label: 'Certificado Digital', icon: '📜' },
                  { label: 'Notificações', icon: '🔔' },
                  { label: 'Documentos', icon: '📁' },
                  { label: 'Suporte', icon: '💬' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <span className="text-slate-400">→</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}