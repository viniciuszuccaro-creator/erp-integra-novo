import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConfigTabAparencia({ preferencesForm, updateSystemPref }) {
  const sys = preferencesForm.configuracoes_sistema;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="border-b bg-slate-50"><CardTitle>Preferências de Exibição</CardTitle></CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label>Tema do Sistema</Label>
          <Select value={sys.tema} onValueChange={(v) => updateSystemPref('tema', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Claro">☀️ Claro</SelectItem>
              <SelectItem value="Escuro">🌙 Escuro</SelectItem>
              <SelectItem value="Auto">🔄 Automático (Sistema)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">Em breve disponível</p>
        </div>
        <div>
          <Label>Idioma</Label>
          <Select value={sys.idioma} onValueChange={(v) => updateSystemPref('idioma', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
              <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
              <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Formato de Data</Label>
          <Select value={sys.formato_data} onValueChange={(v) => updateSystemPref('formato_data', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Brasileiro)</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (Americano)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Formato de Moeda</Label>
          <Select value={sys.formato_moeda} onValueChange={(v) => updateSystemPref('formato_moeda', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">R$ Real Brasileiro (BRL)</SelectItem>
              <SelectItem value="USD">$ Dólar Americano (USD)</SelectItem>
              <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fuso Horário</Label>
          <Select value={sys.timezone} onValueChange={(v) => updateSystemPref('timezone', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Sao_Paulo">🇧🇷 São Paulo (GMT-3)</SelectItem>
              <SelectItem value="America/New_York">🇺🇸 Nova York (GMT-5)</SelectItem>
              <SelectItem value="Europe/London">🇬🇧 Londres (GMT+0)</SelectItem>
              <SelectItem value="Asia/Tokyo">🇯🇵 Tóquio (GMT+9)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}