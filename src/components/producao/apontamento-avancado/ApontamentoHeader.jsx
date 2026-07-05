import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, TrendingUp, Zap, Award } from "lucide-react";

export default function ApontamentoHeader({ cronometro, produtividade, formatarTempo, toggleCronometro, opNumero, op }) {
  return (
    <>
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Apontamento de Produção</CardTitle>
              <CardDescription className="text-blue-100">
                OP: {opNumero} • {op?.tipo_producao || "N/A"}
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold font-mono">{formatarTempo(cronometro.segundos)}</div>
              <Button onClick={toggleCronometro} variant="outline" className="mt-2">
                {cronometro.ativo ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {cronometro.ativo ? "Pausar" : "Iniciar"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {produtividade.kgPorHora > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Produtividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">{produtividade.kgPorHora}</span>
                <span className="text-sm text-slate-600">kg/h</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Eficiência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${produtividade.eficiencia >= 100 ? "text-green-600" : "text-yellow-600"}`} />
                <span className="text-2xl font-bold">{produtividade.eficiencia}%</span>
                <Badge variant={produtividade.eficiencia >= 100 ? "default" : "secondary"}>
                  {produtividade.eficiencia >= 100 ? "Meta atingida!" : "Abaixo da meta"}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Gamificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold">+{Math.floor(produtividade.eficiencia / 10)}</span>
                <span className="text-sm text-slate-600">pontos</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}