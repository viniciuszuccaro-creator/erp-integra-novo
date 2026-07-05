import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import IntegrationConfigButtons from './IntegrationConfigButtons';

export default function IntegracaoCard({ integracao, empresaId, groupId }) {
  const Icon = integracao.icon;
  const status = integracao.status;
  const configurado = status?.configurado || status?.conectado;

  return (
    <Card className={`border-2 ${configurado ? 'border-green-300' : 'border-orange-300'}`}>
      <CardHeader className="border-b bg-slate-50">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="w-5 h-5 text-slate-700" />
          {integracao.titulo}
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">{integracao.descricao}</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          {configurado ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Configurado</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Não Configurado</span>
            </>
          )}
        </div>

        {integracao.provedor_atual && (
          <div>
            <p className="text-xs text-slate-600">Provedor</p>
            <Badge className="mt-1 bg-slate-700">{integracao.provedor_atual}</Badge>
          </div>
        )}

        {status?.erro && (
          <div className="p-2 bg-orange-50 rounded text-xs text-orange-700 border border-orange-200">{status.erro}</div>
        )}

        {integracao.id === 'whatsapp' && status?.qrcode && (
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-2">Escaneie para conectar:</p>
            <img src={status.qrcode} alt="QR Code" className="w-32 h-32 mx-auto border" />
          </div>
        )}

        <div>
          <p className="text-xs text-slate-600 mb-2">Provedores suportados:</p>
          <div className="flex flex-wrap gap-1">
            {integracao.provedores.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}
          </div>
        </div>

        <IntegrationConfigButtons integracao={integracao} empresaId={empresaId} groupId={groupId} />
      </CardContent>
    </Card>
  );
}