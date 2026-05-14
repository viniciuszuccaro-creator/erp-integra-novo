import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, UserCog, Mail, Shield, Building2, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import GestaoUsuariosAvancada from "@/components/sistema/GestaoUsuariosAvancada";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";
import { getAccessScope, isUserInAccessScope, buildAccessAudit } from "@/components/administracao-sistema/gestao-acessos/accessScope";

export default function UsuariosTab() {
  const { contexto, filterInContext, empresaAtual, grupoAtual, empresasDoGrupo = [] } = useContextoVisual();
  const { user } = useUser();
  const { hasPermission, isAdmin } = usePermissions();
  const podeConvidar = isAdmin() || hasPermission("Sistema", "Controle de Acesso", "criar");
  const podeEditarUsuarios = isAdmin() || hasPermission("Sistema", "Controle de Acesso", "editar");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState("todos");
  const [perfilFilter, setPerfilFilter] = useState("todos");
  const accessScope = getAccessScope({ contexto, empresaAtual, grupoAtual, empresasDoGrupo });
  const grupoAtivoId = accessScope.groupId;
  const scopeKey = accessScope.scopeKey;
  const contextoValido = accessScope.contextoValido;

  const usuarioNoEscopo = (u) => isUserInAccessScope(u, accessScope, contexto, empresaAtual);

  const { data: usuarios = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["usuarios-gestao", scopeKey],
    queryFn: async () => {
      const rows = await base44.entities.User.list();
      return rows.filter(usuarioNoEscopo);
    },
    enabled: contextoValido,
  });

  const { data: perfis = [] } = useQuery({
    queryKey: ["perfis-acesso-tab", scopeKey],
    queryFn: async () => {
      const scoped = contextoValido ? await filterInContext("PerfilAcesso", {}, "-updated_date", 500) : [];
      if (scoped.length) return scoped;
      return base44.entities.PerfilAcesso.list("-updated_date", 500);
    },
    enabled: true,
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas-gestao", scopeKey],
    queryFn: () => filterInContext("Empresa", {}, "nome_fantasia", 500),
    enabled: contextoValido,
  });

  const handleInvite = async () => {
    if (!contextoValido) {
      toast.error("Selecione um grupo ou empresa antes de convidar usuário.");
      return;
    }
    const email = prompt("E-mail do novo usuário:");
    if (!email) return;
    try {
      await base44.users.inviteUser(email, "user");
      try {
        await base44.entities.AuditLog.create(buildAccessAudit({
          operador: user,
          scope: accessScope,
          empresaAtual,
          acao: "Convite",
          entidade: "User",
          registroId: email,
          descricao: `Convite enviado para usuário ${email}`,
          dadosNovos: { email, role: "user", contexto, empresa_id: empresaAtual?.id || null, group_id: grupoAtivoId || null }
        }));
      } catch {}
      toast.success(`Convite enviado para ${email}`);
      qc.invalidateQueries({ queryKey: ["usuarios-gestao", scopeKey] });
    } catch (e) {
      toast.error("Erro ao convidar: " + e.message);
    }
  };

  // Estatísticas
  const semPerfil = usuarios.filter(u => !u.perfil_acesso_id && u.role !== 'admin').length;
  const comPerfil = usuarios.filter(u => u.perfil_acesso_id || u.role === 'admin').length;

  const filtered = usuarios.filter((u) => {
    const text = `${u.full_name || ""} ${u.email || ""}`.toLowerCase();
    const matchSearch = !search || text.includes(search.toLowerCase());
    const matchRole = roleFilter === "todos" || u.role === roleFilter;
    const matchPerfil = perfilFilter === "todos"
      || (perfilFilter === "sem_perfil" && !u.perfil_acesso_id && u.role !== "admin")
      || (perfilFilter === "com_perfil" && (u.perfil_acesso_id || u.role === "admin"));
    return matchSearch && matchRole && matchPerfil;
  });

  const roleColor = (role) => role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600";

  return (
    <div className="w-full space-y-4">
      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-900">{usuarios.length}</p>
        </div>
        <div className={`rounded-lg border p-2 text-center ${comPerfil === usuarios.length ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
          <p className="text-xs text-slate-500">Com Perfil</p>
          <p className="text-lg font-bold text-green-700">{comPerfil}</p>
        </div>
        <div className={`rounded-lg border p-2 text-center ${semPerfil > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
          <p className="text-xs text-slate-500">Sem Perfil</p>
          <p className={`text-lg font-bold ${semPerfil > 0 ? 'text-amber-700' : 'text-slate-400'}`}>{semPerfil}</p>
        </div>
      </div>

      {/* Filtros e ações */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative min-w-[180px] flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <Input className="pl-8" placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} data-action="RBAC.Usuario.buscar" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32" data-action="RBAC.Usuario.filtroRole"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
          <Select value={perfilFilter} onValueChange={setPerfilFilter}>
            <SelectTrigger className="w-36" data-action="RBAC.Usuario.filtroPerfil"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="com_perfil">Com perfil</SelectItem>
              <SelectItem value="sem_perfil">⚠ Sem perfil</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {podeConvidar && (
          <Button onClick={handleInvite} disabled={!contextoValido} className="bg-blue-600 hover:bg-blue-700" data-action="RBAC.Usuario.convidar" data-permission="Sistema.Controle de Acesso.criar" data-sensitive="true">
            <UserCog className="w-4 h-4 mr-2" />Convidar Usuário
          </Button>
        )}
      </div>

      {/* Lista */}
      {loadingUsers ? (
        <div className="text-sm text-slate-500 p-4 text-center">Carregando usuários...</div>
      ) : (
        <div className="grid gap-2">
          {filtered.length === 0 && (
            <div className="text-sm text-slate-400 p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Nenhum usuário encontrado.
            </div>
          )}
          {filtered.map((u) => {
            const semPerfilUser = !u.perfil_acesso_id && u.role !== 'admin';
            return (
              <Card key={u.id} className={`hover:shadow-md transition-shadow ${semPerfilUser ? 'border-amber-200' : ''}`}>
                <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${u.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                    {u.full_name?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{u.full_name || "-"}</p>
                      <Badge className={roleColor(u.role) + " text-xs"}>{u.role}</Badge>
                      {u.perfil_acesso_nome ? (
                        <Badge variant="outline" className="text-xs"><Shield className="w-3 h-3 mr-1" />{u.perfil_acesso_nome}</Badge>
                      ) : u.role !== 'admin' ? (
                        <Badge className="bg-amber-100 text-amber-700 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Sem perfil</Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-700 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Admin</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <Mail className="w-3 h-3" />{u.email}
                      {u.empresas_vinculadas?.length > 0 && (
                        <span className="ml-2 flex items-center gap-1"><Building2 className="w-3 h-3" />{u.empresas_vinculadas.length} empresa(s)</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={semPerfilUser ? "default" : "outline"}
                    className={semPerfilUser ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                    disabled={!podeEditarUsuarios}
                    onClick={() => setSelectedUser(u)}
                    data-action="RBAC.Usuario.configurar"
                    data-permission="Sistema.Controle de Acesso.editar"
                    data-sensitive="true"
                  >
                    {semPerfilUser ? "Atribuir Perfil" : "Configurar"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Configurar Usuário — {selectedUser.full_name}</DialogTitle>
            </DialogHeader>
            <GestaoUsuariosAvancada
              usuario={selectedUser}
              perfis={perfis}
              empresas={empresas}
              canEdit={podeEditarUsuarios}
              onClose={() => setSelectedUser(null)}
              onSuccess={() => { setSelectedUser(null); qc.invalidateQueries({ queryKey: ["usuarios-gestao", scopeKey] }); }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}