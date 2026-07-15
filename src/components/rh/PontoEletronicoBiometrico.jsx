import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  User,
  LogIn,
  LogOut,
  Coffee,
  Zap,
} from "lucide-react";
import usePontoEletronico from "./ponto-eletronico/usePontoEletronico";
import BiometriaValidation from "./ponto-eletronico/BiometriaValidation";
import PontosHojeList from "./ponto-eletronico/PontosHojeList";

export default function PontoEletronicoBiometrico() {
  const h = usePontoEletronico();

  const PONTO_ACTIONS = [
    { tipo: "entrada", label: "Entrada", icon: LogIn, color: "bg-green-600 hover:bg-green-700" },
    { tipo: "intervalo_inicio", label: "Intervalo", icon: Coffee, color: "bg-yellow-600 hover:bg-yellow-700" },
    { tipo: "intervalo_fim", label: "Retorno", icon: Zap, color: "bg-blue-600 hover:bg-blue-700" },
    { tipo: "saida", label: "Saída", icon: LogOut, color: "bg-red-600 hover:bg-red-700" },
  ];

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Ponto Eletrônico Biométrico</CardTitle>
              <CardDescription className="text-indigo-100">
                Sistema inteligente com validação facial e IA
              </CardDescription>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">
                {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-sm text-indigo-200">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seleção de colaborador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Identificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {h.colaboradores.slice(0, 8).map((colab) => (
                <Button
                  key={colab.id}
                  variant={h.colaboradorSelecionado?.id === colab.id ? "default" : "outline"}
                  className="justify-start h-auto py-3"
                  onClick={() => h.setColaboradorSelecionado(colab)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-indigo-700">
                        {colab.nome_completo?.[0]}
                      </span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{colab.nome_completo}</div>
                      <div className="text-sm text-slate-600">{colab.cargo}</div>
                    </div>
                    <Badge variant="secondary">{h.calcularHorasHoje(colab.id)}</Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validação biométrica */}
        <BiometriaValidation
          videoRef={h.videoRef}
          cameraAtiva={h.cameraAtiva}
          registroPonto={h.registroPonto}
          onAtivarCamera={h.ativarCamera}
          onCapturarFoto={h.capturarFotoFacial}
          onSimularBiometria={h.simularBiometria}
          onCapturarLocalizacao={h.capturarLocalizacao}
          setCameraAtiva={h.setCameraAtiva}
        />
      </div>

      {/* Ações de registro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Registrar Ponto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PONTO_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.tipo}
                  onClick={() => h.handleRegistrarPonto(action.tipo)}
                  disabled={!h.colaboradorSelecionado}
                  className={`h-24 flex-col gap-2 ${action.color}`}
                >
                  <Icon className="w-8 h-8" />
                  <span className="text-lg">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pontos de hoje */}
      <PontosHojeList pontosHoje={h.pontosHoje} />
    </div>
  );
}