import React, { useState } from 'react';
import { Lock, Shield, Zap, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import usePermissions from '@/components/lib/usePermissions';

import ZeroTrustPanel from './panels/ZeroTrustPanel';
import QuantumEncryptionPanel from './panels/QuantumEncryptionPanel';
import AISecurityIntelligencePanel from './panels/AISecurityIntelligencePanel';
import ThreatDetectionPanel from './panels/ThreatDetectionPanel';

export default function QuantumSecurityHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('zero-trust');

  if (!hasPermission('Sistema', null, 'ver')) {
    return (
      <Card className="border-red-300 bg-red-50 m-4">
        <CardContent className="pt-6 text-red-900">
          Acesso negado: módulo de segurança requer permissão de sistema.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 border-b border-blue-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Quantum-Safe Security & Zero-Trust Hub</h1>
          </div>
          <p className="text-blue-100">Arquitetura de segurança futurista com criptografia quântica e controle zero-trust</p>
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-blue-100">Conformidade Zero-Trust</p>
              <p className="text-2xl font-bold">94%</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-blue-100">Ameaças Detectadas (7d)</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-blue-100">Chaves Quânticas Ativas</p>
              <p className="text-2xl font-bold">2.3k</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-blue-100">IA Segurança (Confiança)</p>
              <p className="text-2xl font-bold">96%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="bg-white border-b border-slate-200 rounded-none w-full justify-start px-6 py-0">
              <TabsTrigger value="zero-trust" className="border-b-2 data-[state=active]:border-blue-600">
                <Shield className="w-4 h-4 mr-2" />
                Zero-Trust Architecture
              </TabsTrigger>
              <TabsTrigger value="quantum-encryption" className="border-b-2 data-[state=active]:border-purple-600">
                <Zap className="w-4 h-4 mr-2" />
                Quantum Encryption
              </TabsTrigger>
              <TabsTrigger value="ai-intelligence" className="border-b-2 data-[state=active]:border-pink-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                AI Security Intelligence
              </TabsTrigger>
              <TabsTrigger value="threat-detection" className="border-b-2 data-[state=active]:border-red-600">
                <Zap className="w-4 h-4 mr-2" />
                Threat Detection
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="zero-trust" className="w-full h-full">
                <ZeroTrustPanel />
              </TabsContent>
              <TabsContent value="quantum-encryption" className="w-full h-full">
                <QuantumEncryptionPanel />
              </TabsContent>
              <TabsContent value="ai-intelligence" className="w-full h-full">
                <AISecurityIntelligencePanel />
              </TabsContent>
              <TabsContent value="threat-detection" className="w-full h-full">
                <ThreatDetectionPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}