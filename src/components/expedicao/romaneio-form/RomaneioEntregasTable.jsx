import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Truck, MapPin } from 'lucide-react';

export default function RomaneioEntregasTable({ entregas, selecionadas, onToggle, onToggleAll }) {
  return (
    <Card>
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="text-base">
          Selecionar Entregas ({selecionadas.length} selecionadas)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selecionadas.length === entregas.length && entregas.length > 0}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Volumes</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Prioridade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entregas.map(entrega => (
              <TableRow key={entrega.id}>
                <TableCell>
                  <Checkbox
                    checked={selecionadas.includes(entrega.id)}
                    onCheckedChange={() => onToggle(entrega.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{entrega.numero_pedido || '-'}</TableCell>
                <TableCell>{entrega.cliente_nome}</TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    {entrega.endereco_entrega_completo?.cidade}/{entrega.endereco_entrega_completo?.estado}
                  </div>
                </TableCell>
                <TableCell>{entrega.volumes || 0}</TableCell>
                <TableCell>{entrega.peso_total_kg?.toFixed(1) || 0} kg</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    entrega.prioridade === 'Urgente' ? 'border-red-500 text-red-700' :
                    entrega.prioridade === 'Alta' ? 'border-orange-500 text-orange-700' :
                    'border-slate-400'
                  }>
                    {entrega.prioridade}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {entregas.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhuma entrega pronta para romaneio</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}