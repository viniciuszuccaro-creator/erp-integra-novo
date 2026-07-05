import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, BarChart3, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function FormasPagamentoAnalyticsTab({ dadosAnalytics, formasPagamento }) {
  return (
    <div className="space-y-6 w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Uso por Forma de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosAnalytics.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="forma.descricao" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="total_usos" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Distribuição de Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosAnalytics.slice(0, 6)}
                  dataKey="total_usos"
                  nameKey="forma.descricao"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dadosAnalytics.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-green-200 bg-green-50">
        <CardHeader className="bg-green-100 border-b border-green-200">
          <CardTitle className="flex items-center gap-2 text-green-900">
            <TrendingUp className="w-5 h-5" />
            Top 5 Mais Utilizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {dadosAnalytics.slice(0, 5).map((item, index) => (
              <div key={item.forma.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-600 text-white">#{index + 1}</Badge>
                  <span className="text-2xl">{item.forma.icone}</span>
                  <div>
                    <p className="font-semibold">{item.forma.descricao}</p>
                    <p className="text-xs text-slate-500">
                      {item.pedidos} pedidos • {item.contas} contas a receber
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{item.total_usos}</p>
                  <p className="text-xs text-slate-500">usos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="bg-amber-100 border-b border-amber-200">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {dadosAnalytics.filter(d => d.total_usos === 0).length > 0 && (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertDescription className="text-sm">
                <strong>⚠️ Formas sem uso:</strong> {dadosAnalytics.filter(d => d.total_usos === 0).length} formas cadastradas não foram utilizadas ainda. Considere desativá-las.
              </AlertDescription>
            </Alert>
          )}
          {formasPagamento.filter(f => f.tipo === 'PIX' && !f.gerar_cobranca_online).length > 0 && (
            <Alert className="border-blue-300 bg-blue-50">
              <AlertDescription className="text-sm">
                <strong>💡 Dica:</strong> Você tem formas PIX sem cobrança online. Ative a integração para gerar QR Codes automaticamente.
              </AlertDescription>
            </Alert>
          )}
          {formasPagamento.filter(f => f.disponivel_ecommerce && !f.gerar_cobranca_online).length > 0 && (
            <Alert className="border-purple-300 bg-purple-50">
              <AlertDescription className="text-sm">
                <strong>🚀 Melhoria:</strong> Formas disponíveis no e-commerce sem cobrança online. Configure gateways de pagamento.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}