import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, User, MapPin, Shield, Smartphone, Monitor } from "lucide-react";

/**
 * Card com dados técnicos da assinatura (data/hora, dispositivo, IP, hash)
 * Extraído de AssinaturaEletronicaForm.jsx
 */
export default function AssinaturaDadosCard({ dadosAssinatura, documentoId }) {
  const campos = [
    { icon: Clock, label: 'Data/Hora', value: new Date().toLocaleString('pt-BR') },
    { icon: dadosAssinatura.dispositivo === 'Mobile' ? Smartphone : Monitor, label: 'Dispositivo', value: dadosAssinatura.dispositivo },
    { icon: User, label: 'Navegador', value: dadosAssinatura.navegador },
    { icon: MapPin, label: 'IP', value: dadosAssinatura.ip_address },
    { icon: Shield, label: 'Hash SHA-256', value: `${documentoId?.substring(0, 16)}...`, colSpan: true }
  ];

  return (
    <Card className="p-4 bg-slate-50">
      <p className="font-semibold mb-3 text-sm">Dados da Assinatura (registrados automaticamente):</p>
      <div className="grid grid-cols-3 gap-4 text-xs">
        {campos.map(({ icon: Icon, label, value, colSpan }) => (
          <div key={label} className={`flex items-center gap-2 ${colSpan ? 'col-span-2' : ''}`}>
            <Icon className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-slate-500">{label}</p>
              <p className={`font-semibold ${colSpan ? 'font-mono' : ''}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}