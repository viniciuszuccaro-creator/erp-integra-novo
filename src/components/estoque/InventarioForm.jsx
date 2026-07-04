import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import InventarioContagem from './InventarioContagem';
import { z } from 'zod';
import FormWrapper from '@/components/common/FormWrapper';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';

export default function InventarioForm({ windowMode = true }) { // w-full/h-full garantidos no container pai
  const { carimbarContexto, empresaAtual, grupoAtual } = useContextoVisual();
  const { canCreate, canEdit, canApprove } = usePermissions();
  const [inv, setInv] = useState({ descricao: '', data_referencia: new Date().toISOString().slice(0,10), status: 'Aberto', itens: [] });
  const [salvando, setSalvando] = useState(false);
  const contextoValido = Boolean(empresaAtual?.id || grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id);
  const podeSalvar = canCreate('Estoque', 'Inventário') || canCreate('Estoque', 'Inventario') || canEdit('Estoque', 'Inventário') || canEdit('Estoque', 'Inventario');
  const podeAprovar = canApprove('Estoque', 'Inventário') || canApprove('Estoque', 'Inventario') || canEdit('Estoque', 'Inventário') || canEdit('Estoque', 'Inventario');
  const controlesDesabilitados = !contextoValido || !podeSalvar || salvando;

  const schema = z.object({
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    data_referencia: z.string().min(4, 'Data é obrigatória'),
    status: z.string(),
  });

  const salvar = async (status = 'Aberto') => {
    if (salvando) return;
    if (!contextoValido) return toast.error('Selecione um grupo ou empresa antes de salvar inventario.');
    if (!podeSalvar) return toast.error('Sem permissao para salvar inventario.');
    setSalvando(true);
    try {
      const payload = carimbarContexto({ ...inv, status }, 'empresa_id');
      let res;
      if (inv.id) res = await base44.entities.Inventario.update(inv.id, payload);
      else res = await base44.entities.Inventario.create(payload);
      try {
        await base44.entities.AuditLog.create({
          acao: inv.id ? 'Edicao' : 'Criacao',
          modulo: 'Estoque',
          entidade: 'Inventario',
          registro_id: res?.id || inv.id || null,
          empresa_id: payload.empresa_id || null,
          group_id: payload.group_id || null,
          descricao: `Inventario ${status}`,
          dados_novos: res || payload,
          sucesso: true,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}
      setInv(res);
      toast.success('Inventário salvo');
    } catch (e) {
      toast.error(e.message);
    } finally { setSalvando(false); }
  };

  const aprovar = async () => {
    if (!podeAprovar) return toast.error('Sem permissao para aprovar inventario.');
    if (!inv.id) return toast.error('Salve o inventário antes de aprovar');
    await salvar('Aprovado');
    toast.info('Ajustes serão aplicados automaticamente');
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle>Inventário</CardTitle>
      </CardHeader>
      <FormWrapper schema={schema} defaultValues={inv} onSubmit={() => salvar('Em Contagem')} externalData={inv} className="flex-1 overflow-auto p-4 space-y-4">
        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-600">Descrição</label>
            <Input value={inv.descricao} disabled={controlesDesabilitados} onChange={(e)=>setInv({ ...inv, descricao: e.target.value })} placeholder="Inventário Mês/Ano" />
          </div>
          <div>
            <label className="text-xs text-slate-600">Data de Referência</label>
            <Input type="date" value={inv.data_referencia} disabled={controlesDesabilitados} onChange={(e)=>setInv({ ...inv, data_referencia: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-slate-600">Status</label>
            <Select value={inv.status} disabled={controlesDesabilitados} onValueChange={(v)=>setInv({ ...inv, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Aberto">Aberto</SelectItem>
                <SelectItem value="Em Contagem">Em Contagem</SelectItem>
                <SelectItem value="Em Aprovação">Em Aprovação</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <InventarioContagem itens={inv.itens} disabled={controlesDesabilitados} onChange={(itens)=>setInv({ ...inv, itens })} />

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" type="submit" data-permission="Estoque.Inventario.criar" disabled={controlesDesabilitados}>Salvar</Button>
          <Button onClick={aprovar} data-permission="Estoque.Inventario.aprovar" className="bg-green-600 hover:bg-green-700" disabled={salvando || inv.status==='Concluído' || !contextoValido || !podeAprovar}>Aprovar e Aplicar Ajustes</Button>
        </div>
      </CardContent>
      </FormWrapper>
    </Card>
  );
}