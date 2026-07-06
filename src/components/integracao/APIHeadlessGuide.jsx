import React from 'react';
import { Code2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function APIHeadlessGuide() {
  const [copiadoIdx, setCopiadoIdx] = React.useState(null);

  const exemplos = [
    {
      titulo: 'REST — Listar Clientes',
      codigo: `curl -X GET https://api.seuapp.com/rest/clientes \\
  -H "Authorization: Bearer TOKEN" \\
  -H "X-Tenant: tenant_id"`
    },
    {
      titulo: 'GraphQL — Query Pedidos',
      codigo: `{
  pedidos(first: 10, status: "pendente") {
    id
    numero_pedido
    cliente { nome }
    valor_total
  }
}`
    },
    {
      titulo: 'Webhook — Novo Pedido',
      codigo: `POST /webhook/pedido-criado
{
  "id": "ped_123",
  "cliente_id": "cli_456",
  "valor": 1500.00,
  "status": "pendente",
  "timestamp": "2026-05-14T10:30:00Z"
}`
    }
  ];

  const copiar = (idx, codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2000);
  };

  return (
    <div className="w-full space-y-4 p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Code2 className="w-5 h-5 text-slate-700" />
        <h3 className="font-semibold">API Headless Multi-Tenant</h3>
      </div>

      <div className="space-y-3">
        {exemplos.map((ex, idx) => (
          <div key={idx} className="bg-white border rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 flex items-center justify-between">
              <p className="text-sm font-medium">{ex.titulo}</p>
              <Button data-permission="Sistema.APIHeadlessGuide.copiar"
                size="sm"
                variant="ghost"
                onClick={() => copiar(idx, ex.codigo)}
                className="gap-1"
              >
                <Copy className="w-3 h-3" />
                {copiadoIdx === idx ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <pre className="p-3 text-xs overflow-x-auto font-mono text-gray-700 whitespace-pre-wrap">
              {ex.codigo}
            </pre>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs">
        <p className="font-semibold text-blue-900 mb-2">Rate Limiting:</p>
        <ul className="text-blue-800 space-y-1">
          <li>• 100 req/min por tenant</li>
          <li>• Rate limit headers: X-RateLimit-*</li>
          <li>• Exponential backoff recomendado</li>
        </ul>
      </div>
    </div>
  );
}