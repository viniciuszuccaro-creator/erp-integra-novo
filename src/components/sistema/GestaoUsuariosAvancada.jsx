import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { useUser } from "@/components/lib/UserContext";
import {
  UserPlus,
  Building2,
  Shield,
  CheckCircle,
  Fingerprint,
  Settings,
  Eye
} from "lucide-react";
import { getAccessScope, normalizeEmpresaIds, buildAccessAudit } from "@/components/administracao-sistema/gestao-acessos/accessScope";

export default function GestaoUsuariosAvancada({ 
  usuario, 
  perfis = [], 
  empresas = [],
  canEdit = true,
  onClose,
  onSuccess 
}) {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const { user: operador } = useUser();
  const accessScope = getAccessScope({ contexto, empresaAtual, grupoAtual });
  const groupId = accessScope.groupId;
  const empresaId = accessScope.empresaId;
  const contextoValido = accessScope.contextoValido;
  const podeEditarAcessos = hasPermission('Sistema', 'Controle de Acesso', 'editar');
  const controlesDesabilitados = !contextoValido || !canEdit || !podeEditarAcessos;
  const [formData, setFormData] = useState({
    perfil_acesso_id: usuario?.perfil_acesso_id || "sem-perfil",
    empresas_vinculadas: normalizeEmpresaIds(usuario?.empresas_vinculadas),
    restricoes_adicionais: usuario?.restricoes_adicionais || {
      pode_ver_apenas_proprios_registros: false,
      limite_aprovacao_valor: 0,
      departamentos_permitidos: [],
      centros_custo_permitidos: []
    },
    autenticacao_dois_fatores: usuario?.autenticacao_dois_fatores || false,
    telefone: usuario?.telefone || "",
    cargo: usuario?.cargo || "",
    departamento: usuario?.departamento || ""
  });

  const atualizarUsuarioMutation = useMutation({
    mutationFn: async (data) => {
      if (!contextoValido) {
        throw new Error("Selecione um grupo ou empresa antes de alterar acesso de usuario.");
      }
      if (!canEdit) {
        throw new Error("Sem permissao para alterar acesso de usuario.");
      }
      const perfilId = data.perfil_acesso_id === "sem-perfil" ? null : data.perfil_acesso_id;
      const perfilSelecionado = perfis.find(p => p.id === perfilId);
      const empresasPermitidas = new Set(empresas.map((empresa) => empresa.id));
      const empresasVinculadas = normalizeEmpresaIds(data.empresas_vinculadas).filter((id) => empresasPermitidas.has(id));
      const empresasNomes = empresas
        .filter(e => empresasVinculadas.includes(e.id))
        .map(e => e.nome_fantasia || e.razao_social);

      const payload = {
        ...data,
        perfil_acesso_id: perfilId,
        perfil_acesso_nome: perfilSelecionado?.nome_perfil || null,
        empresas_vinculadas: empresasVinculadas,
        empresas_vinculadas_nomes: empresasNomes,
        ...(groupId ? { group_id: groupId } : {}),
        ...(empresaId ? { empresa_id: empresaId } : {})
      };
      const result = await base44.entities.User.update(usuario.id, payload);
      try {
        await base44.entities.AuditLog.create(buildAccessAudit({
          operador,
          scope: accessScope,
          empresaAtual,
          acao: "Edicao",
          entidade: "User",
          registroId: usuario.id,
          descricao: `Configuracao de acesso alterada para ${usuario?.email || usuario?.full_name || usuario.id}`,
          dadosAnteriores: {
            perfil_acesso_id: usuario?.perfil_acesso_id || null,
            empresas_vinculadas: usuario?.empresas_vinculadas || [],
            autenticacao_dois_fatores: usuario?.autenticacao_dois_fatores || false,
            restricoes_adicionais: usuario?.restricoes_adicionais || null
          },
          dadosNovos: payload
        }));
      } catch (error) {
        console.warn("Falha ao auditar alteracao de usuario:", error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-gestao'] });
      queryClient.invalidateQueries({ queryKey: ['perfil-acesso'] });
      toast.success("Usuário atualizado com sucesso!");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    }
  });

  const toggleEmpresa = (empresaId) => {
    if (controlesDesabilitados) {
      toast.error("Sem permissao para alterar empresas vinculadas.");
      return;
    }
    setFormData(prev => {
      const empresas = prev.empresas_vinculadas || [];
      const index = empresas.indexOf(empresaId);
      
      if (index > -1) {
        return { ...prev, empresas_vinculadas: empresas.filter(e => e !== empresaId) };
      } else {
        return { ...prev, empresas_vinculadas: [...empresas, empresaId] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canEdit) {
      toast.error("Sem permissao para alterar acesso de usuario.");
      return;
    }
    atualizarUsuarioMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full h-full overflow-auto p-6">
      {/* Dados do Usuário */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="font-semibold text-lg">{usuario?.full_name}</p>
            <p className="text-sm text-slate-500">{usuario?.email}</p>
            <Badge className={usuario?.role === 'admin' ? 'bg-purple-600 mt-2' : 'bg-slate-600 mt-2'}>
              {usuario?.role}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Cargo</Label>
              <Input
                value={formData.cargo}
                disabled={controlesDesabilitados}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ex: Vendedor"
                className="mt-1"
               
               
              />
            </div>
            <div>
              <Label>Departamento</Label>
              <Input
                value={formData.departamento}
                disabled={controlesDesabilitados}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                placeholder="Ex: Comercial"
                className="mt-1"
               
               
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={formData.telefone}
                disabled={controlesDesabilitados}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="mt-1"
               
               
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Switch
                checked={formData.autenticacao_dois_fatores}
                disabled={controlesDesabilitados}
                onCheckedChange={(v) => setFormData({ ...formData, autenticacao_dois_fatores: v })}
               
               
              />
              <Label className="cursor-pointer flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-green-600" />
                Autenticação 2FA
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perfil de Acesso */}
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Perfil de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Label>Perfil de Acesso *</Label>
          <Select
            value={formData.perfil_acesso_id}
            disabled={controlesDesabilitados}
            onValueChange={(v) => setFormData({ ...formData, perfil_acesso_id: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecionar perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sem-perfil">Sem perfil</SelectItem>
              {perfis.filter(p => p.ativo !== false).map(p => (
                <SelectItem key={p.id} value={p.id}>
                  <div className="flex items-center gap-2">
                    <span>{p.nome_perfil}</span>
                    <Badge variant="outline" className="text-xs">
                      {p.nivel_perfil}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Empresas Vinculadas */}
      <Card>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-green-600" />
            Empresas Vinculadas ({formData.empresas_vinculadas?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {empresas.map(empresa => {
              const vinculado = formData.empresas_vinculadas?.includes(empresa.id);
              
              return (
                <label
                  key={empresa.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    vinculado ? 'bg-green-50 border-green-300' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <Checkbox
                    checked={vinculado}
                    disabled={controlesDesabilitados}
                    onCheckedChange={() => toggleEmpresa(empresa.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{empresa.nome_fantasia || empresa.razao_social}</p>
                    {empresa.cidade && (
                      <p className="text-xs text-slate-500">{empresa.cidade}/{empresa.estado}</p>
                    )}
                  </div>
                  {vinculado && <CheckCircle className="w-5 h-5 text-green-600" />}
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Restrições Adicionais */}
      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-600" />
            Restrições Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              Visualizar apenas próprios registros
            </Label>
            <Switch
              checked={formData.restricoes_adicionais?.pode_ver_apenas_proprios_registros}
              disabled={controlesDesabilitados}
              onCheckedChange={(v) => setFormData({
                ...formData,
                restricoes_adicionais: {
                  ...formData.restricoes_adicionais,
                  pode_ver_apenas_proprios_registros: v
                }
              })}
             
             
            />
          </div>

          <div>
            <Label>Limite de Aprovação (R$)</Label>
            <Input
              type="number"
              value={formData.restricoes_adicionais?.limite_aprovacao_valor || 0}
              disabled={controlesDesabilitados}
              onChange={(e) => setFormData({
                ...formData,
                restricoes_adicionais: {
                  ...formData.restricoes_adicionais,
                  limite_aprovacao_valor: parseFloat(e.target.value) || 0
                }
              })}
              className="mt-1"
              placeholder="0.00"
             
             
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={atualizarUsuarioMutation.isPending || controlesDesabilitados}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {atualizarUsuarioMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </form>
  );
}