import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Briefcase, Trash2, Power, PowerOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function CargoForm({ cargo, item, data, initialData, defaultValues, onSubmit, isSubmitting, windowMode = false }) {
  const dadosIniciais = item || data || initialData || defaultValues || cargo;
  const [formData, setFormData] = useState(dadosIniciais || {
    nome_cargo: '',
    descricao: '',
    codigo_cbo: '',
    nivel_hierarquico: 'Operacional',
    salario_base: 0,
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
    if (!formData.nome_cargo) {
      toast.error('Preencha o nome do cargo');
      return;
    }
    onSubmit({ ...formData, nome: formData.nome_cargo });
  };

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const handleExcluir = () => {
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
        <Label>Nome do Cargo *</Label>
        <Input
          value={formData.nome_cargo}
          onChange={(e) => setFormData({...formData, nome_cargo: e.target.value})}
          placeholder="Ex: Analista Financeiro, Operador de Produção"
        />
      </div>

      <div>
        <Label>Código CBO</Label>
        <Input
          value={formData.codigo_cbo}
          onChange={(e) => setFormData({...formData, codigo_cbo: e.target.value})}
          placeholder="Ex: 2522-10"
        />
      </div>

      <div>
        <Label>Nível Hierárquico</Label>
        <Select value={formData.nivel_hierarquico} onValueChange={(v) => setFormData({...formData, nivel_hierarquico: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Diretoria">Diretoria</SelectItem>
            <SelectItem value="Gerência">Gerência</SelectItem>
            <SelectItem value="Coordenação">Coordenação</SelectItem>
            <SelectItem value="Supervisão">Supervisão</SelectItem>
            <SelectItem value="Operacional">Operacional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Salário Base (R$)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.salario_base}
          onChange={(e) => setFormData({...formData, salario_base: parseFloat(e.target.value)})}
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <Label>Cargo Ativo</Label>
        <Switch
          checked={formData.ativo}
          onCheckedChange={(v) => setFormData({...formData, ativo: v})}
        />
      </div>

      {confirmandoExclusao && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-red-900 font-medium">Confirmar exclusão do cargo "{formData.nome_cargo}"?</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setConfirmandoExclusao(false)}>Cancelar</Button>
              <Button type="button" size="sm" variant="destructive" data-permission="Cadastros.Cargo.excluir" data-action="Cadastros.Cargo.excluir" data-sensitive="true" onClick={confirmarExclusaoDefinitiva}>Excluir</Button>
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
              data-permission="Cadastros.Cargo.alternarStatus"
              onClick={handleAlternarStatus}
              className={formData.ativo ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
            >
              {formData.ativo ? (
                <><PowerOff className="w-4 h-4 mr-2" />Inativar</>
              ) : (
                <><Power className="w-4 h-4 mr-2" />Ativar</>
              )}
            </Button>
            <Button type="button" variant="destructive" data-permission="Cadastros.Cargo.excluir" onClick={handleExcluir}>
              <Trash2 className="w-4 h-4 mr-2" />Excluir
            </Button>
          </>
        )}
        <Button type="submit" disabled={isSubmitting} data-permission="Cadastros.Cargo.salvar">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {dadosIniciais ? 'Atualizar' : 'Criar Cargo'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            {dadosIniciais ? 'Editar Cargo' : 'Novo Cargo'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}