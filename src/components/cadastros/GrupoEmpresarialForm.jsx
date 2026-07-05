import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Network, CheckCircle2, Trash2, Power, PowerOff, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function GrupoEmpresarialForm({ grupo, onSubmit, isSubmitting, windowMode = false }) {
  // Suporte a legado: campos antigos nome_do_grupo/cnpj_opcional mapeados para nome/cnpj
  const normalize = (g) => {
    if (!g) return null;
    return {
      ...g,
      nome: g.nome || g.nome_do_grupo || '',
      cnpj: g.cnpj || g.cnpj_opcional || '',
    };
  };
  const [formData, setFormData] = useState(normalize(grupo) || {
    nome: '',
    cnpj: '',
    descricao: '',
    inscricao_estadual: '',
    empresas_ids: [],
    status: 'Ativo',
    governanca_consolidada: false,
    score_integracao_erp: 0
  });

  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas', grupoAtual?.id, empresaAtual?.id],
    queryFn: () => filterInContext('Empresa', {}, 'nome_fantasia', 999),
    enabled: !!contexto,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) {
      toast.error('Preencha o nome do grupo');
      return;
    }
    onSubmit(formData);
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
    const novoStatus = formData.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setFormData({ ...formData, status: novoStatus });
  };

  const toggleEmpresa = (empresaId) => {
    const ids = formData.empresas_ids || [];
    if (ids.includes(empresaId)) {
      setFormData({
        ...formData,
        empresas_ids: ids.filter(id => id !== empresaId)
      });
    } else {
      setFormData({
        ...formData,
        empresas_ids: [...ids, empresaId]
      });
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome do Grupo *</Label>
        <Input
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          placeholder="Ex: Grupo Integra, Holding XYZ"
        />
      </div>

      <div>
        <Label>Descrição</Label>
        <Textarea
          value={formData.descricao || ''}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          placeholder="Descrição do grupo empresarial..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNPJ do Grupo</Label>
          <Input
            value={formData.cnpj || ''}
            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            placeholder="00.000.000/0001-00"
          />
        </div>

        <div>
          <Label>Inscrição Estadual</Label>
          <Input
            value={formData.inscricao_estadual}
            onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Empresas Vinculadas ({(formData.empresas_ids || []).length})</Label>
        <Card className="border">
          <CardContent className="p-4 max-h-60 overflow-y-auto space-y-2">
            {empresas.map(empresa => (
              <div key={empresa.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(formData.empresas_ids || []).includes(empresa.id)}
                    onChange={() => toggleEmpresa(empresa.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium">{empresa.razao_social}</p>
                    <p className="text-xs text-slate-500">{empresa.cnpj}</p>
                  </div>
                </div>
                {(formData.empresas_ids || []).includes(empresa.id) && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            ))}
            
            {empresas.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Nenhuma empresa cadastrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <Label>Governança Consolidada</Label>
          <p className="text-xs text-slate-500">Sincroniza Plano de Contas entre empresas</p>
        </div>
        <Switch
          checked={formData.governanca_consolidada}
          onCheckedChange={(v) => setFormData({...formData, governanca_consolidada: v})}
        />
      </div>

      <Badge className="bg-blue-100 text-blue-700">
        <Network className="w-3 h-3 mr-1" />
        Score Integração ERP: {formData.score_integracao_erp}% (calculado por IA)
      </Badge>

      {confirmandoExclusao && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-red-900 font-medium">Confirmar exclusão do grupo "{formData.nome}"?</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setConfirmandoExclusao(false)}>Cancelar</Button>
              <Button type="button" size="sm" variant="destructive" data-permission="Cadastros.GrupoEmpresarial.excluir" data-action="Cadastros.GrupoEmpresarial.excluir" data-sensitive="true" onClick={confirmarExclusaoDefinitiva}>Excluir</Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        {grupo && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleAlternarStatus}
              className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
            >
              {formData.status === 'Ativo' ? (
                <><PowerOff className="w-4 h-4 mr-2" />Inativar</>
              ) : (
                <><Power className="w-4 h-4 mr-2" />Ativar</>
              )}
            </Button>
            <Button type="button" variant="destructive" data-permission="Cadastros.GrupoEmpresarial.excluir" onClick={handleExcluir}>
              <Trash2 className="w-4 h-4 mr-2" />Excluir
            </Button>
          </>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {grupo ? 'Atualizar Grupo' : 'Criar Grupo'}
        </Button>
      </div>
    </form>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full overflow-auto bg-white p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            {grupo ? 'Editar Grupo Empresarial' : 'Novo Grupo Empresarial'}
          </h2>
        </div>
        {formContent}
      </div>
    );
  }

  return formContent;
}