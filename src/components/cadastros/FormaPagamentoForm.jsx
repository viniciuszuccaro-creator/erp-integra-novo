import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, CreditCard, Trash2, Power, PowerOff } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function FormaPagamentoForm({ forma, onSubmit, isSubmitting, windowMode = false }) {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const podeCriar = canCreate("Cadastros", "FormaPagamento") || canCreate("Financeiro", "FormaPagamento") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "FormaPagamento") || canEdit("Financeiro", "FormaPagamento") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "FormaPagamento") || canDelete("Financeiro", "FormaPagamento") || canDelete("Cadastros", null);
  const [formData, setFormData] = useState(forma || {
    codigo: '',
    descricao: '',
    tipo: 'Dinheiro',
    ativa: true,
    aceita_desconto: true,
    percentual_desconto_padrao: 0,
    aplicar_acrescimo: false,
    percentual_acrescimo_padrao: 0,
    prazo_compensacao_dias: 0,
    gerar_cobranca_online: false,
    permite_parcelamento: false,
    maximo_parcelas: 1,
    intervalo_parcelas_dias: 30
  });

  const schema = z.object({
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    tipo: z.string().min(1, 'Tipo é obrigatório')
  });

  const handleSubmit = async () => {
    if (forma && !podeEditar) {
      toast.error("Sem permissão para editar formas de pagamento.");
      return;
    }
    if (!forma && !podeCriar) {
      toast.error("Sem permissão para criar formas de pagamento.");
      return;
    }
    onSubmit(formData);
  };

  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();

  const handleExcluir = async () => {
    if (!podeExcluir) {
      toast.error("Sem permissão para excluir formas de pagamento.");
      return;
    }
    const ok = await confirm({ title: 'Confirmar Exclusão', description: `Tem certeza que deseja excluir a forma de pagamento "${formData.descricao}"? Esta ação não pode ser desfeita.`, confirmText: 'Excluir' });
    if (!ok) return;
    if (onSubmit) {
      onSubmit({ ...formData, _action: 'delete' });
    }
  };

  const handleAlternarStatus = () => {
    const novoStatus = !formData.ativa;
    setFormData({ ...formData, ativa: novoStatus });
  };

  const formContent = (
    <FormWrapper schema={schema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Descrição *</Label>
          <Input
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Ex: PIX, Boleto 30 dias"
          />
        </div>

        <div>
          <Label>Código (opcional)</Label>
          <Input
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            placeholder="PIX-01"
          />
        </div>
      </div>

      <div>
        <Label>Tipo de Pagamento *</Label>
        <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
            <SelectItem value="PIX">PIX</SelectItem>
            <SelectItem value="Boleto">Boleto</SelectItem>
            <SelectItem value="Cartão Crédito">Cartão Crédito</SelectItem>
            <SelectItem value="Cartão Débito">Cartão Débito</SelectItem>
            <SelectItem value="Transferência">Transferência</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Prazo Compensação (dias)</Label>
          <Input
            type="number"
            value={formData.prazo_compensacao_dias}
            onChange={(e) => setFormData({...formData, prazo_compensacao_dias: parseInt(e.target.value) || 0})}
            placeholder="0"
          />
        </div>

        <div>
          <Label>Desconto Padrão (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.percentual_desconto_padrao}
            onChange={(e) => setFormData({...formData, percentual_desconto_padrao: parseFloat(e.target.value) || 0})}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Permite Parcelamento</Label>
          <p className="text-xs text-slate-500">Habilita parcelamento nesta forma</p>
        </div>
        <Switch
          checked={formData.permite_parcelamento}
          onCheckedChange={(v) => setFormData({...formData, permite_parcelamento: v})}
        />
      </div>

      {formData.permite_parcelamento && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded border">
          <div>
            <Label>Máximo de Parcelas</Label>
            <Input
              type="number"
              value={formData.maximo_parcelas}
              onChange={(e) => setFormData({...formData, maximo_parcelas: parseInt(e.target.value) || 1})}
              placeholder="12"
            />
          </div>

          <div>
            <Label>Intervalo (dias)</Label>
            <Input
              type="number"
              value={formData.intervalo_parcelas_dias}
              onChange={(e) => setFormData({...formData, intervalo_parcelas_dias: parseInt(e.target.value) || 30})}
              placeholder="30"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Forma Ativa</Label>
        <Switch
          checked={formData.ativa}
          onCheckedChange={(v) => setFormData({...formData, ativa: v})}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {forma && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleAlternarStatus}
              disabled={!podeEditar}
              data-permission="Cadastros.FormaPagamento.alterarStatus"
              data-sensitive
              className={formData.ativa ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
            >
              {formData.ativa ? (
                <><PowerOff className="w-4 h-4 mr-2" />Inativar</>
              ) : (
                <><Power className="w-4 h-4 mr-2" />Ativar</>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-permission="Cadastros.FormaPagamento.excluir"
              onClick={handleExcluir}
              disabled={!podeExcluir}
              data-permission="Cadastros.FormaPagamento.excluir"
              data-sensitive
            >
              <Trash2 className="w-4 h-4 mr-2" />Excluir
            </Button>
          </>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || (forma ? !podeEditar : !podeCriar)}
          data-permission="Cadastros.FormaPagamento.salvar"
          data-sensitive
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {forma ? 'Atualizar' : 'Criar Forma de Pagamento'}
        </Button>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            {forma ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return (<>{formContent}<ConfirmExcluirDialog /></>);
}