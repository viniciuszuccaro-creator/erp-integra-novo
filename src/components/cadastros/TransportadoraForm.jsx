import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Truck, Trash2, Power, PowerOff } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { z } from 'zod';
import FormWrapper from '@/components/common/FormWrapper';
import { useToast } from '@/components/ui/use-toast';
import usePermissions from '@/components/lib/usePermissions';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import TransportadoraFormDados from './transportadora/TransportadoraFormDados';
import TransportadoraFormContato from './transportadora/TransportadoraFormContato';

const schema = z.object({
  razao_social: z.string().min(1, 'Razão Social é obrigatória'),
  cnpj: z.string().min(11, 'CNPJ é obrigatório'),
});

const DEFAULT_FORM = {
  razao_social: '', nome_fantasia: '', cnpj: '', inscricao_estadual: '', rntrc: '',
  email: '', telefone: '', whatsapp: '', contato_responsavel: '',
  endereco: '', cidade: '', estado: '', cep: '',
  prazo_entrega_padrao: 0, valor_frete_minimo: 0, status: 'Ativo', observacoes: '',
};

export default function TransportadoraForm({ transportadora: transportadoraProp, item, data, onSubmit, onSave, onClose, windowMode = false }) {
  const transportadora = transportadoraProp || item || data || null;
  const onCloseNorm = onClose || onSave;
  const { toast } = useToast();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = Boolean(empresaAtual?.id || groupId);
  const podeCriar = canCreate('Cadastros', 'Transportadora') || canCreate('Cadastros', null);
  const podeEditar = canEdit('Cadastros', 'Transportadora') || canEdit('Cadastros', null);
  const podeExcluir = canDelete('Cadastros', 'Transportadora') || canDelete('Cadastros', null);

  const [formData, setFormData] = useState(transportadora || DEFAULT_FORM);

  useEffect(() => {
    if (transportadora?.id) setFormData({ ...transportadora });
  }, [transportadora?.id]);

  const handleSubmit = async () => {
    if (!contextoValido) { toast({ title: 'Selecione um grupo ou empresa antes de salvar.', variant: 'destructive' }); return; }
    if (transportadora?.id && !podeEditar) { toast({ title: 'Seu perfil nao permite editar transportadoras.', variant: 'destructive' }); return; }
    if (!transportadora?.id && !podeCriar) { toast({ title: 'Seu perfil nao permite criar transportadoras.', variant: 'destructive' }); return; }
    if (onSubmit) {
      await onSubmit({
        ...formData,
        ...(empresaAtual?.id && !formData.empresa_id ? { empresa_id: empresaAtual.id } : {}),
        ...(empresaAtual?.id && !formData.empresa_dona_id ? { empresa_dona_id: formData.empresa_id || empresaAtual.id } : {}),
        ...(groupId && !formData.group_id ? { group_id: groupId } : {}),
      });
      return;
    }
    if (onCloseNorm) onCloseNorm();
  };

  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();

  const handleExcluir = async () => {
    if (!podeExcluir) { toast({ title: 'Seu perfil nao permite excluir transportadoras.', variant: 'destructive' }); return; }
    const ok = await confirm({ title: 'Confirmar Exclusão', description: `Tem certeza que deseja excluir a transportadora "${formData.razao_social}"? Esta ação não pode ser desfeita.`, confirmText: 'Excluir' });
    if (!ok) return;
    if (onSubmit) onSubmit({ ...formData, _action: 'delete' });
  };

  const content = (
    <FormWrapper schema={schema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} entityName="Transportadora" editItemId={transportadora?.id} className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-orange-600" />Dados da Transportadora</h3>
          <div className="grid grid-cols-2 gap-4">
            <TransportadoraFormDados formData={formData} setFormData={setFormData} />
            <TransportadoraFormContato formData={formData} setFormData={setFormData} />
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[99999]">
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Observações</Label>
              <Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        {transportadora && (
          <>
            <Button type="button" variant="outline" onClick={() => setFormData({ ...formData, status: formData.status === 'Ativo' ? 'Inativo' : 'Ativo' })} disabled={!podeEditar || !contextoValido} data-permission="Cadastros.Transportadora.alterarStatus" data-sensitive className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}>
              {formData.status === 'Ativo' ? <><PowerOff className="w-4 h-4 mr-2" />Inativar</> : <><Power className="w-4 h-4 mr-2" />Ativar</>}
            </Button>
            <Button type="button" variant="destructive" onClick={handleExcluir} disabled={!podeExcluir || !contextoValido} data-permission="Cadastros.Transportadora.excluir" data-sensitive>
              <Trash2 className="w-4 h-4 mr-2" />Excluir
            </Button>
          </>
        )}
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={!contextoValido || (transportadora?.id ? !podeEditar : !podeCriar)} data-permission="Cadastros.Transportadora.salvar" data-sensitive>
          <Save className="w-4 h-4 mr-2" />{transportadora ? 'Atualizar' : 'Criar'} Transportadora
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) return <div className="w-full h-full bg-white">{content}</div>;
  return (<>{content}<ConfirmExcluirDialog /></>);
}