import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, BarChart3, Table as TableIcon } from 'lucide-react';

export default function RelatorioConfigPanel({
  config, setConfig, entidadeAtual, entidadesDisponiveis, onGerar,
}) {
  const visOptions = [
    { v: 'tabela', l: 'Tabela', icon: TableIcon },
    { v: 'grafico_barras', l: 'Gráfico de Barras', icon: BarChart3 },
    { v: 'grafico_pizza', l: 'Gráfico de Pizza', icon: BarChart3 },
    { v: 'grafico_linha', l: 'Gráfico de Linha', icon: BarChart3 },
  ];

  return (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label>Entidade</Label>
          <Select value={config.entidade} onValueChange={(v) => setConfig({ ...config, entidade: v, campos: [], filtros: {} })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {entidadesDisponiveis.map(ent => <SelectItem key={ent.value} value={ent.value}>{ent.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tipo de Visualização</Label>
          <Select value={config.tipo_visualizacao} onValueChange={(v) => setConfig({ ...config, tipo_visualizacao: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {visOptions.map(o => {
                const Icon = o.icon;
                return <SelectItem key={o.v} value={o.v}><Icon className="w-4 h-4 inline mr-2" />{o.l}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>

        {config.tipo_visualizacao !== 'tabela' && (
          <div>
            <Label>Agrupar por</Label>
            <Select value={config.agrupamento} onValueChange={(v) => setConfig({ ...config, agrupamento: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {entidadeAtual?.campos.map(campo => <SelectItem key={campo} value={campo}>{campo.replace(/_/g, ' ')}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Data Início</Label>
          <Input type="date" value={config.data_inicio} onChange={(e) => setConfig({ ...config, data_inicio: e.target.value })} />
        </div>

        <div>
          <Label>Data Fim</Label>
          <Input type="date" value={config.data_fim} onChange={(e) => setConfig({ ...config, data_fim: e.target.value })} />
        </div>
      </div>

      {config.tipo_visualizacao === 'tabela' && (
        <div>
          <Label className="mb-3 block">Campos para Exibir</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {entidadeAtual?.campos.map(campo => (
              <div key={campo} className="flex items-center gap-2">
                <Checkbox checked={config.campos.includes(campo)} onCheckedChange={() => {
                  setConfig(prev => ({
                    ...prev,
                    campos: prev.campos.includes(campo) ? prev.campos.filter(c => c !== campo) : [...prev.campos, campo],
                  }));
                }} />
                <Label className="capitalize cursor-pointer">{campo.replace(/_/g, ' ')}</Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button data-permission="Relatorios.Personalizado.gerar" onClick={onGerar}>
          <Filter className="w-4 h-4 mr-2" />Gerar Relatório
        </Button>
      </div>
    </CardContent>
  );
}