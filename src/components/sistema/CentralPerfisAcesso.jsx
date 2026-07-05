// Central de Perfis RBAC — refatorada (modular, multiempresa, auditável)
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Shield, Search, Plus } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { getAccessScope, isUserInAccessScope, buildAccessAudit } from "@/components/administracao-sistema/gestao-acessos/accessScope";
import PerfilCard from "@/components/administracao-sistema/gestao-acessos/PerfilCard";
import PerfilFormModal from "@/components/administracao-sistema/gestao-acessos/PerfilFormModal";
import { useUser } from "@/components/lib/UserContext";

const FORM_INICIAL = {
  nome_perfil: "",
  descricao: "",
  nivel_perfil: "Operacional",
  permissoes: {},
  ativo: true,
};

export default function CentralPerfisAcesso() {
  const [perfilAberto, setPerfilAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [formPerfil, setFormPerfil] = useState(FORM_INICIAL);

  const queryClient = useQueryClient();
  const { contexto, empresaAtual, grupoAtual, empresasDoGrupo = [], filterInContext } = useContextoVisual();
  const { user } = useUser();
  const { hasPermission, isAdmin } = usePermissions();
  const { confirm, ConfirmDialog } = useConfirm();

  const accessScope = getAccessScope({ contexto, empresaAtual, grupoAtual, empresasDoGrupo });
  const { groupId: grupoAtivoId, empresaId: empresaAtivaId, scopeKey, contextoValido } = accessScope;

  const podeCriarPerfil = isAdmin() || hasPermission("Sistema", ["Controle de Acesso"], "criar");
  const podeEditarPerfil = isAdmin() || hasPermission("Sistema", ["Controle de Acesso"], "editar");
  const podeExcluirPerfil = isAdmin() || hasPermission("Sistema", ["Controle de Acesso"], "excluir");
  const canManageOpenProfile = perfilAberto?.novo ? podeCriarPerfil : podeEditarPerfil;

  const { data: perfis = [] } = useQuery({
    queryKey: ["perfis-acesso", scopeKey],
    queryFn: async () => {
      const scoped = contextoValido
        ? await filterInContext("PerfilAcesso", {}, "-updated_date", 500)
        : [];
      if (scoped.length) return scoped;
      return base44.entities.PerfilAcesso.list("-updated_date", 500);
    },
    enabled: true,
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios", scopeKey],
    queryFn: async () => {
      const rows = await base44.entities.User.list();
      return rows.filter((u) =>
        isUserInAccessScope(u, accessScope, contexto, empresaAtual)
      );
    },
    enabled: contextoValido,
  });

  const salvarPerfilMutation = useMutation({
    mutationFn: async (data) => {
      if (!contextoValido)
        throw new Error("Selecione um grupo ou empresa antes de salvar o perfil.");
      const perfilId = perfilAberto?.id;
      if (perfilId && !perfilAberto.novo)
        return base44.entities.PerfilAcesso.update(perfilId, data);
      return base44.entities.PerfilAcesso.create(data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["perfis-acesso", scopeKey] });
      const foiCriacao = perfilAberto?.novo;
      toast.success(foiCriacao ? "Perfil criado com sucesso!" : "Perfil atualizado com sucesso!");
      try {
        base44.entities.AuditLog.create(
          buildAccessAudit({
            operador: user,
            scope: accessScope,
            empresaAtual,
            acao: foiCriacao ? "Criacao" : "Edicao",
            entidade: "PerfilAcesso",
            registroId: result?.id || perfilAberto?.id,
            descricao:
              (foiCriacao ? "Criacao" : "Atualizacao") +
              ` do perfil "${result?.nome_perfil || formPerfil.nome_perfil}"`,
            dadosAnteriores: foiCriacao ? null : perfilAberto,
            dadosNovos: result || formPerfil,
          })
        );
      } catch {}
      setTimeout(() => {
        setPerfilAberto(null);
        setFormPerfil(FORM_INICIAL);
      }, 300);
    },
    onError: (error) => toast.error("Erro ao salvar: " + error.message),
  });

  const excluirPerfilMutation = useMutation({
    mutationFn: (id) => {
      if (!contextoValido)
        throw new Error("Selecione um grupo ou empresa antes de excluir o perfil.");
      return base44.entities.PerfilAcesso.delete(id);
    },
    onSuccess: (_res, id) => {
      queryClient.invalidateQueries({ queryKey: ["perfis-acesso", scopeKey] });
      toast.success("Perfil excluído!");
      try {
        base44.entities.AuditLog.create(
          buildAccessAudit({
            operador: user,
            scope: accessScope,
            empresaAtual,
            acao: "Exclusao",
            entidade: "PerfilAcesso",
            registroId: id,
            descricao: "Perfil de acesso excluído",
          })
        );
      } catch {}
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const abrirEdicaoPerfil = (perfil) => {
    setPerfilAberto(perfil);
    setFormPerfil({
      nome_perfil: perfil.nome_perfil || "",
      descricao: perfil.descricao || "",
      nivel_perfil: perfil.nivel_perfil || "Operacional",
      permissoes: perfil.permissoes || {},
      ativo: perfil.ativo !== false,
    });
  };

  const handleExcluirPerfil = async (perfil) => {
    const using = usuarios.filter((u) => u.perfil_acesso_id === perfil.id);
    if (using.length > 0) {
      toast.error(`❌ ${using.length} usuário(s) usando este perfil`);
      return;
    }
    const ok = await confirm({
      title: "Excluir Perfil",
      description: `Confirma exclusão do perfil "${perfil.nome_perfil}"? Esta ação sensível será auditada.`,
      variant: "danger",
      confirmText: "Excluir"
    });
    if (ok) {
      excluirPerfilMutation.mutate(perfil.id);
    }
  };

  const handleSubmitPerfil = (data) => {
    salvarPerfilMutation.mutate({
      ...data,
      group_id: grupoAtivoId || null,
      grupo_id: grupoAtivoId || null,
      ...(empresaAtivaId ? { empresa_id: empresaAtivaId } : {}),
    });
  };

  const stats = useMemo(() => {
    const totalUsuarios = usuarios.length;
    const usuariosComPerfil = usuarios.filter((u) => u.perfil_acesso_id).length;
    const cobertura =
      totalUsuarios > 0
        ? Math.round((usuariosComPerfil / totalUsuarios) * 100)
        : 0;
    return {
      totalPerfis: perfis.length,
      perfisAtivos: perfis.filter((p) => p.ativo !== false).length,
      cobertura,
    };
  }, [perfis, usuarios]);

  const perfisFiltrados = perfis.filter(
    (p) => !busca || p.nome_perfil?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-bold text-slate-900">Perfis de Acesso RBAC</h3>
            <p className="text-slate-500 text-xs">
              Defina permissões granulares por módulo, seção e ação
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
            {stats.totalPerfis} Perfis
          </Badge>
          <Badge
            className={`px-3 py-1 ${
              stats.cobertura >= 80
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {stats.cobertura}% Cobertura
          </Badge>
        </div>
      </div>

      {/* Busca + botão novo */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar perfis..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => {
            setFormPerfil(FORM_INICIAL);
            setPerfilAberto({ novo: true });
          }}
          disabled={!contextoValido || !podeCriarPerfil}
          className="bg-blue-600 hover:bg-blue-700"
          data-action="RBAC.Perfil.novo"
          data-permission="Sistema.Controle de Acesso.criar"
          data-sensitive="true"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      {/* Grid de Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {perfisFiltrados.map((perfil) => (
          <PerfilCard
            key={perfil.id}
            perfil={perfil}
            usuariosCount={
              usuarios.filter((u) => u.perfil_acesso_id === perfil.id).length
            }
            onEdit={() => abrirEdicaoPerfil(perfil)}
            onDelete={() => handleExcluirPerfil(perfil)}
            canEdit={podeEditarPerfil}
            canDelete={podeExcluirPerfil && !excluirPerfilMutation.isPending}
          />
        ))}
      </div>

      {perfisFiltrados.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum perfil encontrado</p>
        </div>
      )}

      {/* Modal de criação/edição */}
      {perfilAberto && (
        <PerfilFormModal
          perfilAberto={perfilAberto}
          formPerfil={formPerfil}
          setFormPerfil={setFormPerfil}
          onClose={() => setPerfilAberto(null)}
          onSubmit={handleSubmitPerfil}
          isSaving={salvarPerfilMutation.isPending}
          canManage={canManageOpenProfile}
        />
      )}
      <ConfirmDialog />
    </div>
  );
}