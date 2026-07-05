import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Award, Trash2, Power, PowerOff, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import usePermissions from "@/components/lib/usePermissions";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function MarcaForm({ marca, item, data, initialData, defaultValues, onSubmit, isSubmitting, windowMode = false }) {
  const dadosIniciais = item || data || initialData || defaultValues || marca;
  const { hasPermission } = usePermissions();
  const { empresaAtual, grupoAtual, contextoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || dadosIniciais?.group_id || null;
  const contextoValido = Boolean(empresaAtual?.id || groupId || dadosIniciais?.empresa_id || dadosIniciais?.group_id);
  const podeCriar = hasPermission?.("Cadastros.Marca.criar") || hasPermission?.("Cadastros.Produto.criar");
  const podeEditar = hasPermission?.("Cadastros.Marca.editar") || hasPermission?.("Cadastros.Produto.editar");
  const podeExcluir = hasPermission?.("Cadastros.Marca.excluir") || hasPermission?.("Cadastros.Produto.excluir");
  const podeSalvar = dadosIniciais?.id ? podeEditar : podeCriar;
  const [formData, setFormData] = useState(dadosIniciais || {
    nome_marca: '',
    descricao: '',
    cnpj: '',
    pais_origem: 'Brasil',
    site: '',
    categoria: 'Aço',
    ativo: true
  });

  const prevIdRef = useRef(dadosIniciais?.id);
  useEffect(() => {
    if (dadosIniciais?.id && dadosIniciais.id !== prevIdRef.current) {
      prevIdRef.current = dadosIniciais.id;
      setFormData({ ...dadosIniciais });
    }
  }, [dadosIniciais?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_marca) {
      toast.error('Preencha o nome da marca');
      return;
    }
    if (!contextoValido) {
      toast.error('Selecione um grupo ou empresa antes de salvar.');
      return;
    }
    if (!podeSalvar) {
      toast.error('Sem permissão para salvar marca.');
      return;
    }
    onSubmit({
      ...formData,
      group_id: groupId || formData.group_id,
      empresa_id: contextoAtual === "empresa" ? empresaAtual?.id : formData.empresa_id,
      nome: formData.nome_marca
    });
  };

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const handleExcluir = () => {
    if (!podeExcluir) {
      toast.error('Sem permissão para excluir marca.');
      return;
    }
    setConfirmandoExclusao(true);
  };

  const confirmarExclusaoDefinitiva = () => {
    setConfirmandoExclusao(false);
    if (onSubmit) {
      onSubmit({ ...formData, _action: 'delete' });
    }
  };

  const handleAlternarStatus = () => {
    const novoStatus = !formData.ativo;
    setFormData({ ...formData, ativo: novoStatus });
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Marca *</Label>
        <Input
          value={formData.nome_marca}
          onChange={(e) => setFormData({...formData, nome_marca: e.target.value})}
          placeholder="Ex: Gerdau, ArcelorMittal"
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNPJ</Label>
          <Input
            value={formData.cnpj}
            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
          />
        </div>
        <div>
          <Label>País de Origem</Label>
          <Input
            value={formData.pais_origem}
            onChange={(e) => setFormData({...formData, pais_origem: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Site</Label>
          <Input
            value={formData.site}
            onChange={(e) => setFormData({...formData, site: e.target.value})}
            placeholder="https://..."
          />
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={formData.categoria} onValueChange={(v) => setFormData({...formData, categoria: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aço">Aço</SelectItem>
              <SelectItem value="Ferramentas">Ferramentas</SelectItem>
              <SelectItem value="EPIs">EPIs</SelectItem>
              <SelectItem value="Elétricos">Elétricos</SelectItem>
              <SelectItem value="Hidráulica">Hidráulica</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Marca Ativa</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
          disabled={!podeSalvar}
          data-permission="Cadastros.Marca.alterarStatus"
          data-sensitive="true"
        />
      </div>

      {confirmandoExclusao && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-red-900 font-medium">Confirmar exclusão da marca "{formData.nome_marca}"?</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setConfirmandoExclusao(false)}>Cancelar</Button>
              <Button type="button" size="sm" variant="destructive" data-permission="Cadastros.Marca.excluir" data-action="Cadastros.Marca.excluir" data-sensitive="true" onClick={confirmarExclusaoDefinitiva}>Excluir</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        {dadosIniciais && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleAlternarStatus}
              disabled={!podeSalvar}
              data-permission="Cadastros.Marca.alterarStatus"
              data-sensitive="true"
              className={formData.ativo ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
            >
              {formData.ativo ? (
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
              data-permission="Cadastros.Marca.excluir"
              data-sensitive="true"
            >
              <Trash2 className="w-4 h-4 mr-2" />Excluir
            </Button>
          </>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !contextoValido || !podeSalvar}
          data-permission="Cadastros.Marca.salvar"
          data-sensitive="true"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {dadosIniciais ? 'Atualizar' : 'Criar Marca'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            {dadosIniciais ? 'Editar Marca' : 'Nova Marca'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}