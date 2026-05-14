import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ComplianceISO27001Widget() {
  const [controles] = useState([
    { id: 1, area: 'Segurança de Informação', status: 'conforme', progresso: 100, itens: 12 },
    { id: 2, area: 'Controle de Acesso', status: 'conforme', progresso: 98, itens: 18 },
    { id: 3, area: 'Criptografia e Chaves', status: 'conforme', progresso: 95, itens: 8 },
    { id: 4, area: 'Incidentes de Segurança', status: 'em_auditoria', progresso: 87, itens: 6 },
    { id: 5, area: 'Continuidade de Negócios', status: 'em_auditoria', progresso: 92, itens: 10 },
    { id: 6, area: 'Conformidade Legal', status: 'conforme', progresso: 100, itens: 7 },
  ]);
  const { empresaAtual } = useContextoVisual();

  const statusConfig = {
    conforme: { icon: CheckCircle, color: 'text-green-600', badge: 'Conforme' },
    em_auditoria: { icon: AlertCircle, color: 'text-amber-600', badge: 'Em Auditoria' },
  };

  const mediaProgresso = Math.round(controles.reduce((acc, c) => acc + c.progresso, 0) / controles.length);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" /> ISO 27001 Compliance
        </CardTitle>
        <CardDescription>
          Certificação de Segurança da Informação e Gestão de Risco
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Conformidade Geral</span>
            <span className="text-lg font-bold text-blue-600">{mediaProgresso}%</span>
          </div>
          <Progress value={mediaProgresso} className="h-2" />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {controles.map((controle) => {
            const Config = statusConfig[controle.status];
            const Icon = Config.icon;
            return (
              <div key={controle.id} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className={`w-4 h-4 ${Config.color}`} />
                    <span className="font-medium text-sm">{controle.area}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {controle.itens} itens
                  </Badge>
                </div>
                <Progress value={controle.progresso} className="h-1" />
              </div>
            );
          })}
        </div>

        <div className="border-t pt-3 text-xs text-slate-500">
          <strong>🔐 Ciclo 20 (Fev 2027):</strong> Certificação ISO 27001 com auditorias de segurança, gestão de risco e compliance legal.
        </div>
      </CardContent>
    </Card>
  );
}