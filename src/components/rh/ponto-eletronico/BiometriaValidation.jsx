import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle,
  Fingerprint,
  MapPin,
} from "lucide-react";

export default function BiometriaValidation({
  videoRef,
  cameraAtiva,
  registroPonto,
  onAtivarCamera,
  onCapturarFoto,
  onSimularBiometria,
  onCapturarLocalizacao,
  setCameraAtiva,
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          Validação Biométrica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Câmera facial */}
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="text-center mb-3">
            <Camera className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <div className="font-medium">Reconhecimento Facial</div>
            <div className="text-sm text-slate-600">Capture sua foto para validação</div>
          </div>
          {cameraAtiva ? (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay className="w-full rounded border" />
              <div className="flex gap-2">
                <Button
                  data-permission="RH.Ponto.registrar"
                  onClick={onCapturarFoto}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Capturar
                </Button>
                <Button
                  data-permission="RH.Ponto.registrar"
                  onClick={() => setCameraAtiva(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : registroPonto.foto_facial_url ? (
            <div className="space-y-3">
              <img
                src={registroPonto.foto_facial_url}
                alt="Foto facial"
                className="w-full rounded border"
              />
              <Badge variant="outline" className="w-full justify-center py-2">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Foto validada
              </Badge>
            </div>
          ) : (
            <Button
              data-permission="RH.Ponto.registrar"
              onClick={onAtivarCamera}
              className="w-full"
              variant="outline"
            >
              <Camera className="w-4 h-4 mr-2" />
              Ativar Câmera
            </Button>
          )}
        </div>

        {/* Biometria digital */}
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="text-center mb-3">
            <Fingerprint className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <div className="font-medium">Biometria Digital</div>
          </div>
          <Button
            data-permission="RH.Ponto.registrar"
            onClick={onSimularBiometria}
            className="w-full"
            variant={registroPonto.biometria_validada ? "default" : "outline"}
            disabled={registroPonto.biometria_validada}
          >
            {registroPonto.biometria_validada ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Biometria Validada
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 mr-2" />
                Validar Digital
              </>
            )}
          </Button>
        </div>

        {/* GPS */}
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="text-center mb-3">
            <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <div className="font-medium">Geolocalização</div>
          </div>
          <Button
            data-permission="RH.Ponto.registrar"
            onClick={onCapturarLocalizacao}
            className="w-full"
            variant="outline"
          >
            {registroPonto.localizacao_gps.latitude !== 0 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                GPS Capturado
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Capturar Localização
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}