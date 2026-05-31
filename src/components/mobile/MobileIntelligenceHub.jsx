/**
 * MobileIntelligenceHub v1.0
 * Hub centralizado mobile com bottom navigation
 * Regra-Mãe: w-full, h-full, mobile-first, offline-capable
 */
import { useState } from 'react';
import { BarChart3, Package, Smartphone, Bell, Settings } from 'lucide-react';
import MobileAppDashboard from './MobileAppDashboard';
import MobileNotifications from './MobileNotifications';

export default function MobileIntelligenceHub() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'pedidos', label: 'Pedidos', icon: Package },
    { id: 'notificacoes', label: 'Alertas', icon: Bell },
    { id: 'configuracoes', label: 'Config', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MobileAppDashboard />;
      case 'notificacoes':
        return <MobileNotifications />;
      case 'pedidos':
        return (
          <div className="w-full h-full flex items-center justify-center flex-col gap-4 p-6 text-center">
            <Package className="w-12 h-12 text-slate-400" />
            <p className="text-slate-600">Pedidos em desenvolvimento</p>
          </div>
        );
      case 'configuracoes':
        return (
          <div className="w-full h-full flex items-center justify-center flex-col gap-4 p-6 text-center">
            <Settings className="w-12 h-12 text-slate-400" />
            <p className="text-slate-600">Configurações em desenvolvimento</p>
          </div>
        );
      default:
        return <MobileAppDashboard />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-blue-900">
      {/* Status Bar Simulator */}
      <div className="bg-black text-white px-4 py-1 flex justify-between items-center text-xs">
        <span>9:41</span>
        <div className="flex gap-1">
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-slate-200">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all ${
                  isActive ? 'text-blue-600 border-t-2 border-blue-600' : 'text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}