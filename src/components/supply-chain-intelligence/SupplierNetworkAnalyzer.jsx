import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function SupplierNetworkAnalyzer() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const suppliers = {
    all: 324,
    active: 287,
    risk: 24,
    inactive: 13
  };

  const categoryData = [
    { name: 'Matéria-Prima', value: 98, color: '#06b6d4' },
    { name: 'Equipamentos', value: 67, color: '#3b82f6' },
    { name: 'Serviços', value: 89, color: '#8b5cf6' },
    { name: 'Logística', value: 70, color: '#ec4899' }
  ];

  const performanceData = [
    { name: 'On-time %', A: 96, B: 88, C: 72 },
    { name: 'Qualidade %', A: 98, B: 91, C: 78 },
    { name: 'Preço/Score', A: 92, B: 85, C: 68 },
    { name: 'Comunicação %', A: 94, B: 87, C: 75 }
  ];

  const riskSuppliers = [
    { id: 1, name: 'Fornecedor X', categoria: 'Matéria-Prima', risco: 'Alto', motivo: 'Atraso 3x mês', acao: 'Auditoria marcada' },
    { id: 2, name: 'Fornecedor Y', categoria: 'Equipamentos', risco: 'Médio', motivo: 'Qualidade baixa', acao: 'Plano corretivo' },
    { id: 3, name: 'Fornecedor Z', categoria: 'Serviços', risco: 'Crítico', motivo: 'Inadimplência', acao: 'Suspensão em análise' },
  ];

  const topSuppliers = [
    { id: 1, name: 'Premium Materials Co.', categoria: 'Matéria-Prima', score: 9.8, compras: 'R$ 2.3M', status: 'Excelente' },
    { id: 2, name: 'Tech Solutions Ltd', categoria: 'Equipamentos', score: 9.5, compras: 'R$ 1.8M', status: 'Ótimo' },
    { id: 3, name: 'Logistics Master', categoria: 'Logística', score: 9.2, compras: 'R$ 1.5M', status: 'Ótimo' },
    { id: 4, name: 'Service Plus', categoria: 'Serviços', score: 8.9, compras: 'R$ 890k', status: 'Muito bom' },
  ];

  return (
    <div className="w-full h-full space-y-4">
      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(suppliers).map(([key, value]) => (
          <Card key={key} className="bg-slate-800 border-slate-700 cursor-pointer hover:border-cyan-600 transition-all"
            onClick={() => setSelectedCategory(key)}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-400 capitalize">{key}</p>
              <p className="text-2xl font-bold text-cyan-400">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribuição por Categoria */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80} fill="#8884d8" dataKey="value">
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} fornecedores`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance por Tier */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Performance por Tier (A/B/C)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="A" fill="#06b6d4" />
              <Bar dataKey="B" fill="#3b82f6" />
              <Bar dataKey="C" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Fornecedores */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Top 4 Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{supplier.name}</p>
                  <Badge className="bg-green-900 text-green-200 text-xs">{supplier.score}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <p>{supplier.categoria}</p>
                  <p>Compras: {supplier.compras}</p>
                  <p className="text-green-400">{supplier.status}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fornecedores em Risco */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Fornecedores em Risco (3)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-slate-700/50 p-3 rounded-lg border border-red-600/30">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-white text-sm">{supplier.name}</p>
                  <Badge className={supplier.risco === 'Crítico' ? 'bg-red-900 text-red-200' : 'bg-orange-900 text-orange-200'}>
                    {supplier.risco}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-1">{supplier.motivo}</p>
                <p className="text-xs text-yellow-400">→ {supplier.acao}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}