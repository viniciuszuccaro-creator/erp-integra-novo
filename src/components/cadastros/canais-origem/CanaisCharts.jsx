import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bolt } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

export default function CanaisCharts({ dadosBarras, dadosPizza, metricas, CORES, insights }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume de Pedidos por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="canal" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="totalPedidos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => {
                    const metrica = Object.values(metricas).find((m) => m.canal === entry.name);
                    return <Cell key={`cell-${index}`} fill={CORES[metrica?.cor] || "#3b82f6"} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bolt className="w-5 h-5 text-purple-600" />
            💡 Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                insight.tipo === "success"
                  ? "bg-green-50 border-green-200"
                  : insight.tipo === "warning"
                  ? "bg-orange-50 border-orange-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <p className="text-sm text-slate-700">{insight.texto}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}