import { Badge } from '@/components/ui/badge';

export default function RegiaoDetalheCard({ regiao, corFallback }) {
  const metricas = [
    { label: 'Pedidos', value: regiao.quantidadePedidos },
    { label: 'Valor Total', value: `R$ ${regiao.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, cor: 'text-green-600' },
    { label: 'Ticket Médio', value: `R$ ${regiao.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, cor: 'text-blue-600' },
    { label: 'Meta Mensal', value: regiao.metaMensal > 0 ? `R$ ${regiao.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não definida', cor: 'text-slate-700' },
  ];

  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: regiao.cor || corFallback }} />
          <div>
            <p className="font-bold text-lg">{regiao.nome}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-xs">{regiao.tipo}</Badge>
              <Badge className="bg-blue-100 text-blue-700 text-xs">{regiao.totalClientes} clientes</Badge>
            </div>
          </div>
        </div>
        {regiao.metaMensal > 0 && (
          <Badge className={
            regiao.percentualMeta >= 100 ? 'bg-green-100 text-green-700' :
            regiao.percentualMeta >= 70 ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }>{regiao.percentualMeta.toFixed(1)}% da meta</Badge>
        )}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {metricas.map((m, i) => (
          <div key={i}>
            <p className="text-xs text-slate-500">{m.label}</p>
            <p className={`text-xl font-bold ${m.cor || ''}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}