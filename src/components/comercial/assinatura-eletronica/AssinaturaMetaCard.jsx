import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock, User, MapPin, Shield, Smartphone, Monitor } from "lucide-react";

/**
 * Card que exibe os metadados da assinatura (data/hora, dispositivo, IP, hash).
 */
export default function AssinaturaMetaCard({ dadosAssinatura, documentoId }) {
  return (
    <Card className="p-4 bg-slate-50">
      <p className="font-semibold mb-3 text-sm">Dados da Assinatura (registrados automaticamente):</p>
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-slate-500">Data/Hora</p>
            <p className="font-semibold">{new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dadosAssinatura.dispositivo === 'Mobile' ? (
            <Smartphone className="w-4 h-4 text-slate-500" />
          ) : (
            <Monitor className="w-4 h-4 text-slate-500" />
          )}
          <div>
            <p className="text-slate-500">Dispositivo</p>
            <p className="font-semibold">{dadosAssinatura.dispositivo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-slate-500">Navegador</p>
            <p className="font-semibold">{dadosAssinatura.navegador}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-slate-500">IP</p>
            <p className="font-semibold">{dadosAssinatura.ip_address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <Shield className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-slate-500">Hash SHA-256</p>
            <p className="font-mono text-xs">{documentoId?.substring(0, 16)}...</p>
          </div>
        </div>
      </div>
    </Card>
  );
}