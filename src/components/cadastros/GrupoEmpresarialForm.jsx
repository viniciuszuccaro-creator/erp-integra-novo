import React, { useState, useEffect } from "react";
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

  // Carrega TODAS as empresas globalmente (não filtradas por contexto)
  // Necessário porque o admin precisa ver empresas sem grupo para vinculá-las
  const { data: todasEmpresas = [] } = useQuery({
    queryKey: ['empresas-grupo-vinculo', grupo?.id || 'novo'],
    queryFn: async () => {
      const res = await base44.functions.invoke("entityListSorted", {
        entityName: 'Empresa', filter: {},
        sortField: 'nome_fantasia', sortDirection: 'asc', limit: 500,
      });
      return Array.isArray(res?.data) ? res.data : [];
    },
  });

  // Quando editando, pré-popula empresas_ids com as empresas já vinculadas a este grupo
  useEffect(() => {
    if (!grupo?.id || !todasEmpresas.length) return;
    const vinculadas = todasEmpresas
      .filter(e => e.group_id === grupo.id)
      .map(e => e.id);
    if (vinculadas.length && (!formData.empresas_ids || formData.empresas_ids.length === 0)) {
      setFormData(prev => ({ ...prev, empresas_ids: vinculadas }));
    }
  }, [grupo?.id, todasEmpresas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome) {
      toast.error('Preencha o nome do grupo');
      return;
    }
    // Mapeia campos do formulário para o schema da entidade GrupoEmpresarial
    // Remove empresas_ids (não faz parte do schema — o vínculo é feito via Empresa.group_id)
    const { empresas_ids, ...restData } = formData;
    const mapped = {
      ...restData,
      nome_do_grupo: formData.nome_do_grupo || formData.nome,
      cnpj_grupo: formData.cnpj_grupo || formData.cnpj,
      razao_social_grupo: formData.razao_social_grupo || formData.razao_social || formData.nome,
      status: formData.status || 'Ativo',
    };
    // Salva o grupo e obtém a entidade criada/atualizada (com ID)
    const savedGrupo = await onSubmit(mapped);
    const grupoId = savedGrupo?.id || grupo?.id;
    if (!grupoId) return;

    // Sincroniza vínculo de empresas: atualiza Empresa.group_id para cada empresa selecionada
    const selectedIds = empresas_ids || [];
    try {
      // Empresas que agora devem ter group_id = grupoId
      const toLink = todasEmpresas
        .filter(e => selectedIds.includes(e.id) && e.group_id !== grupoId)
        .map(e => e.id);
      // Empresas que tinham este grupo mas foram desmarcadas
      const toUnlink = todasEmpresas
        .filter(e => !selectedIds.includes(e.id) && e.group_id === grupoId)
        .map(e => e.id);

      // Atualiza em lotes — usa bulkUpdate para performance
      if (toLink.length) {
        await base44.entities.Empresa.bulkUpdate(
          toLink.map(id => ({ id, group_id: grupoId }))
        );
      }
      if (toUnlink.length) {
        await base44.entities.Empresa.bulkUpdate(
          toUnlink.map(id => ({ id, group_id: null }))
        );
      }

      // Auditoria do vínculo
      if (toLink.length || toUnlink.length) {
        try {
          const user = await base44.auth.me().catch(() => null);
          await base44.entities.AuditLog.create({
            acao: 'Edição',
            modulo: 'Cadastros',
            tipo_auditoria: 'entidade',
            entidade: 'GrupoEmpresarial',
            registro_id: grupoId,
            descricao: `Vínculo de empresas: ${toLink.length} vinculada(s), ${toUnlink.length} desvinculada(s)`,
            usuario: user?.full_name || user?.email || 'Usuário',
            usuario_id: user?.id || null,
            group_id: grupoId,
            dados_novos: { vinculadas: toLink, desvinculadas: toUnlink },
            data_hora: new Date().toISOString(),
          });
        } catch { /* auditoria não bloqueia */ }
      }

      if (toLink.length || toUnlink.length) {
        toast.success(`${toLink.length} empresa(s) vinculada(s), ${toUnlink.length} desvinculada(s)`);
      }
    } catch (err) {
      console.error('Erro ao vincular empresas:', err);
      toast.error('Grupo salvo, mas houve erro ao vincular empresas. Verifique manualmente.');
    }
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
            {todasEmpresas.map(empresa => (
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
            
            {todasEmpresas.length === 0 && (
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
              data-permission="Cadastros.GrupoEmpresarial.alternarStatus"
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
        <Button type="submit" data-permission="Cadastros.GrupoEmpresarial.salvar" disabled={isSubmitting}>
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