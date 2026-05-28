import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, Legend } from "recharts";
import { BarChart3, Users, ShoppingCart, DollarSign } from "lucide-react";
import DashboardForecastWidget from "./DashboardForecastWidget";
import DashboardAnomaliaWidget from "./DashboardAnomaliaWidget";
import IAChurnWidget from "@/components/crm/IAChurnWidget";

export default function AdvancedAnalysisSection({ vendasPorMes, top5Clientes, statusPedidos, fluxoCaixaMensal, COLORS }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-4">Análise Detalhada</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <DashboardForecastWidget />
        <DashboardAnomaliaWidget />
        <IAChurnWidget compact />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Vendas por Mês (Ano Atual)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {vendasPorMes.length > 0 ? (
              <div style={{ width: '100%', height: '250px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vendasPorMes || []}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                             contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="valor" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVendas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhuma venda registrada no ano atual</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Top 5 Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {top5Clientes.length > 0 ? (
              <div style={{ width: '100%', height: '250px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5Clientes || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="cliente" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                             contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum cliente com vendas</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-500" />
              Pedidos por Status (Todos)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {statusPedidos.length > 0 ? (
              <div style={{ width: '100%', height: '250px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={statusPedidos || []} cx="50%" cy="50%" labelLine={false}
                         label={({ status, quantidade }) => `${status}: ${quantidade}`}
                         outerRadius={80} dataKey="quantidade">
                      {(statusPedidos || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} pedidos`, props.payload.status]}
                             contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum pedido registrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-500" />
              Fluxo de Caixa Mensal (Ano Atual)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {fluxoCaixaMensal.length > 0 ? (
              <div style={{ width: '100%', height: '250px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fluxoCaixaMensal || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                             contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                    <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum movimento financeiro registrado no ano atual</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}