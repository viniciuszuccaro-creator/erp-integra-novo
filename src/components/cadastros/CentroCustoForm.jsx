import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Receipt, Trash2, Power, PowerOff, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { checkGlobalUniqueness } from "@/components/lib/sanitizeOnWrite";
import { toast } from "sonner";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function CentroCustoForm({ centroCusto, item, data, initialData, defaultValues, onSubmit, onSave, onClose, isSubmitting, windowMode = false }) {
  const dadosCentroCusto = item || data || initialData || defaultValues || centroCusto;
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || dadosCentroCusto?.group_id || null;
  const podeCriar = canCreate("Cadastros", "CentroCusto") || canCreate("Financeiro", "CentroCusto") || canCreate("Cadastros", null);
  const podeEditar = canEdit("Cadastros", "CentroCusto") || canEdit("Financeiro", "CentroCusto") || canEdit("Cadastros", null);
  const podeExcluir = canDelete("Cadastros", "CentroCusto") || canDelete("Financeiro", "CentroCusto") || canDelete("Cadastros", null);
  const [formData, setFormData] = useState(dadosCentroCusto || {
    codigo: "",
    descricao: "",
    tipo: "Despesa",
    categoria: "Administrativo",
    responsavel: "",
    orcamento_mensal: "",
    status: "Ativo",
    observacoes: ""
  });

  const prevIdRef = React.useRef(dadosCentroCusto?.id);
  useEffect(() => {
    if (dadosCentroCusto?.id && dadosCentroCusto.id !== prevIdRef.current) {
      prevIdRef.current = dadosCentroCusto.id;
      setFormData({ ...dadosCentroCusto });
    }
  }, [dadosCentroCusto?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dadosCentroCusto?.id && !podeEditar) {
      toast.error("Sem permissão para editar centros de custo.");
      return;
    }
    if (!dadosCentroCusto?.id && !podeCriar) {
      toast.error("Sem permissão para criar centros de custo.");
      return;
    }
    const dataToSubmit = {
      ...formData,
      orcamento_mensal: formData.orcamento_mensal ? parseFloat(formData.orcamento_mensal) : null,
      group_id: groupId || formData.group_id,
      nome: formData.nome || formData.descricao || '',
    };
    const erroUnicidade = await checkGlobalUniqueness('CentroCusto', dataToSubmit, { groupId, empresaId: empresaAtual?.id, currentId: dadosCentroCusto?.id, isEdit: !!dadosCentroCusto?.id });
    if (erroUnicidade) { toast.error(erroUnicidade); return; }
    if (onSubmit) {
      try { await onSubmit(dataToSubmit); }
      catch (e) { toast.error(e?.message || 'Erro ao salvar centro de custo.'); }
    }
  };

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const handleExcluir = () => {
    if (!podeExcluir) {
      toast.error("Sem permissão para excluir centros de custo.");
      return;
    }
    setConfirmandoExclusao(true);
  };

  const confirmarExclusaoDefinitiva = async () => {
    setConfirmandoExclusao(false);
    if (onSubmit) {
      try { await onSubmit({ ...formData, _action: 'delete' }); }
      catch (e) { toast.error(e?.message || 'Erro ao excluir centro de custo.'); }
    }
  };

  const handleAlternarStatus = () => {
    const novoStatus = formData.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setFormData({ ...formData, status: novoStatus });
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ex: CC001"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Receita">Receita</SelectItem>
              <SelectItem value="Despesa">Despesa</SelectItem>
              <SelectItem value="Investimento">Investimento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Input
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrativo">Administrativo</SelectItem>
              <SelectItem value="Comercial">Comercial</SelectItem>
              <SelectItem value="Operacional">Operacional</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="TI">TI</SelectItem>
              <SelectItem value="RH">RH</SelectItem>
              <SelectItem value="Logística">Logística</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="responsavel">Responsável</Label>
          <Input
            id="responsavel"
            value={formData.responsavel}
            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="orcamento_mensal">Orçamento Mensal (R$)</Label>
          <Input
            id="orcamento_mensal"
            type="number"
            step="0.01"
            value={formData.orcamento_mensal}
            onChange={(e) => setFormData({ ...formData, orcamento_mensal: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      {confirmandoExclusao && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-red-900 font-medium">Confirmar exclusão do centro de custo "{formData.descricao}"?</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setConfirmandoExclusao(false)}>Cancelar</Button>
              <Button type="button" size="sm" variant="destructive" onClick={confirmarExclusaoDefinitiva}>Excluir</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-4">
        {dadosCentroCusto && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleAlternarStatus}
              disabled={!podeEditar}
              className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
            >
              {formData.status === 'Ativo' ? (
                <><PowerOff className="w-4 h-4 mr-2" />Inativar</>
              ) : (
                <><Power className="w-4 h-4 mr-2" />Ativar</>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleExcluir}
              disabled={!podeExcluir}
            >
              <Trash2 className="w-4 h-4 mr-2" />Excluir
            </Button>
          </>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || (dadosCentroCusto?.id ? !podeEditar : !podeCriar)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600" />
            {dadosCentroCusto ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}