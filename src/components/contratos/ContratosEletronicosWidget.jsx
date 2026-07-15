import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, PenTool, CheckCircle, Clock, Plus } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ContratosEletronicosWidget() {
  const [contratos] = useState([
    { id: 1, titulo: 'Contrato Fornecedor A', assinante: 'João Silva', status: 'assinado', data_assinatura: '2027-01-15', blockchain_hash: '0x7f9e...' },
    { id: 2, titulo: 'Acordo NDA - Projeto X', assinante: 'Maria Santos', status: 'pendente', data_pendente: '2027-02-01', blockchain_hash: null },
    { id: 3, titulo: 'Contrato Transporte', assinante: 'Carlos Mendes', status: 'assinado', data_assinatura: '2027-01-28', blockchain_hash: '0x3a2c...' },
    { id: 4, titulo: 'Acordo Parceria B2B', assinante: 'Ana Costa', status: 'em_revisao', data_pendente: '2027-02-05', blockchain_hash: null },
  ]);
  const { empresaAtual } = useContextoVisual();

  const statusConfig = {
    assinado: { icon: CheckCircle, color: 'text-green-600', badge: 'Assinado' },
    pendente: { icon: Clock, color: 'text-amber-600', badge: 'Pendente' },
    em_revisao: { icon: PenTool, color: 'text-blue-600', badge: 'Em Revisão' },
  };

  const assinados = contratos.filter(c => c.status === 'assinado').length;
  const taxa = Math.round((assinados / contratos.length) * 100);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" /> Contratos Eletrônicos
        </CardTitle>
        <CardDescription>
          Gestão de contratos com assinatura digital e blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-50 p-2 rounded-lg">
            <div className="text-lg font-bold text-green-600">{assinados}</div>
            <div className="text-xs text-slate-600">Assinados</div>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg">
            <div className="text-lg font-bold text-amber-600">{contratos.length - assinados}</div>
            <div className="text-xs text-slate-600">Pendentes</div>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{taxa}%</div>
            <div className="text-xs text-slate-600">Taxa</div>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {contratos.map((contrato) => {
            const Config = statusConfig[contrato.status];
            const Icon = Config.icon;
            return (
              <div key={contrato.id} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-start gap-2 flex-1">
                    <Icon className={`w-4 h-4 ${Config.color} mt-0 />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{contrato.titulo}</div>
                      <div className="text-xs text-slate-500">{contrato.assinante}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {Config.badge}
                  </Badge>
                </div>
                {contrato.blockchain_hash && (
                  <div className="text-xs text-slate-400 ml-6 font-mono">
                    🔗 {contrato.blockchain_hash}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>

        <div className="border-t pt-3 text-xs text-slate-500">
          <strong>📜 Ciclo 20 (Fev 2027):</strong> Contratos com assinatura digital, verificação blockchain e gestão de documentos.
        </div>
      </CardContent>
    </Card>
  );
}