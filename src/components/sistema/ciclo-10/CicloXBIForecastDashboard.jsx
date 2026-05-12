import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function CicloXBIForecastDashboard() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const { empresaAtual, grupoAtual } = useContextoVisual();

  useEffect(() => {
    loadForecast();
  }, [empresaAtual?.id, grupoAtual?.id]);

  const loadForecast = async () => {
    try {
      const res = await base44.functions.invoke('biForecastPreditivo', {
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id,
        horizon_days: 30
      });
      setForecast(res.data);
    } catch (error) {
      console.error('Erro ao carregar forecast:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando previsões...</div>;
  if (!forecast) return null;

  const data = [
    { mes: 'Atual', vendas: forecast.forecast?.vendas_previstas || 0, margem: forecast.forecast?.margem_prevista || 0 },
    { mes: '+30d', vendas: forecast.forecast?.vendas_previstas || 0, margem: forecast.forecast?.margem_prevista || 0 }
  ];

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            BI Forecast — Próximos 30 dias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-600">Vendas Previstas</p>
              <p className="text-2xl font-bold text-blue-600">R$ {forecast.forecast?.vendas_previstas?.toLocaleString?.('pt-BR')}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-slate-600">Margem Esperada</p>
              <p className="text-2xl font-bold text-green-600">R$ {forecast.forecast?.margem_prevista?.toLocaleString?.('pt-BR')}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-slate-600">Confiança</p>
              <p className="text-2xl font-bold text-purple-600">{forecast.forecast?.confianca_percentual}%</p>
            </div>
          </div>

          {forecast.alertas?.length > 0 && (
            <div className="space-y-2">
              {forecast.alertas.map((alerta, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4" />
                  {alerta}
                </div>
              ))}
            </div>
          )}

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="vendas" fill="#3b82f6" />
              <Bar dataKey="margem" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}