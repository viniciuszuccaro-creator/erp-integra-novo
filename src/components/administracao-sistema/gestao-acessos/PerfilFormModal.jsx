// Modal de criação/edição de perfil RBAC (refatorado, pequeno, modular)
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, RefreshCw, CheckSquare, Info } from "lucide-react";
import { ACOES, ESTRUTURA_SISTEMA, NIVEIS_PERFIL } from "./permissionsConfig";
import PermissoesAccordion from "./PermissoesAccordion";
import { toast } from "sonner";

export default function PerfilFormModal({
  perfilAberto,
  formPerfil,
  setFormPerfil,
  onClose,
  onSubmit,
  isSaving = false,
  canManage = true,
}) {
  const [modulosExpandidos, setModulosExpandidos] = useState([]);

  const contarPermissoesTotal = () =>
    Object.values(formPerfil.permissoes || {}).reduce(
      (t, m) =>
        t +
        Object.values(m || {}).reduce((s, sec) => s + (sec?.length || 0), 0),
      0
    );

  const togglePermissao = (modulo, secao, acao) => {
    if (!canManage) {
      toast.error("Sem permissão para alterar permissões deste perfil.");
      return;
    }
    setFormPerfil((prev) => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      if (!novasPerms[modulo][secao]) novasPerms[modulo][secao] = [];
      const idx = novasPerms[modulo][secao].indexOf(acao);
      novasPerms[modulo][secao] =
        idx > -1
          ? novasPerms[modulo][secao].filter((a) => a !== acao)
          : [...novasPerms[modulo][secao], acao];
      return { ...prev, permissoes: novasPerms };
    });
  };

  const toggleSecao = (modulo, secao) => {
    if (!canManage) {
      toast.error("Sem permissão para alterar permissões deste perfil.");
      return;
    }
    setFormPerfil((prev) => {
      const novasPerms = { ...prev.permissoes };
      if (!novasPerms[modulo]) novasPerms[modulo] = {};
      const todasAcoes = ACOES.map((a) => a.id);
      const temTodas = todasAcoes.every((a) =>
        novasPerms[modulo][secao]?.includes(a)
      );
      novasPerms[modulo][secao] = temTodas ? [] : [...todasAcoes];
      return { ...prev, permissoes: novasPerms };
    });
  };

  const toggleModulo = (modulo) => {
    if (!canManage) {
      toast.error("Sem permissão para alterar permissões deste perfil.");
      return;
    }
    setFormPerfil((prev) => {
      const novasPerms = { ...prev.permissoes };
      const todasAcoes = ACOES.map((a) => a.id);
      const secoes = Object.keys(ESTRUTURA_SISTEMA[modulo].secoes);
      const tudoMarcado = secoes.every((s) =>
        todasAcoes.every((a) => novasPerms[modulo]?.[s]?.includes(a))
      );
      novasPerms[modulo] = {};
      secoes.forEach((s) => {
        novasPerms[modulo][s] = tudoMarcado ? [] : [...todasAcoes];
      });
      return { ...prev, permissoes: novasPerms };
    });
  };

  const selecionarTudoGlobal = () => {
    if (!canManage) {
      toast.error("Sem permissão para alterar permissões deste perfil.");
      return;
    }
    setFormPerfil((prev) => {
      const todasAcoes = ACOES.map((a) => a.id);
      const algumVazio = Object.keys(ESTRUTURA_SISTEMA).some((m) =>
        Object.keys(ESTRUTURA_SISTEMA[m].secoes).some(
          (s) =>
            !prev.permissoes?.[m]?.[s] ||
            prev.permissoes[m][s].length < todasAcoes.length
        )
      );
      const novasPerms = {};
      Object.keys(ESTRUTURA_SISTEMA).forEach((m) => {
        novasPerms[m] = {};
        Object.keys(ESTRUTURA_SISTEMA[m].secoes).forEach((s) => {
          novasPerms[m][s] = algumVazio ? [...todasAcoes] : [];
        });
      });
      return { ...prev, permissoes: novasPerms };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formPerfil.nome_perfil) {
      toast.error("Nome é obrigatório");
      return;
    }
    onSubmit(formPerfil);
  };

  if (!perfilAberto) return null;

  return (
    <div className="fixed inset-2 sm:inset-4 z-[9999999] bg-white shadow-2xl flex flex-col rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 border-b p-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold">
            {perfilAberto.novo ? "Novo Perfil" : `Editar: ${perfilAberto.nome_perfil}`}
          </h3>
          {contarPermissoesTotal() > 0 && (
            <Badge className="bg-blue-600 text-white">
              {contarPermissoesTotal()} perm.
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          data-action="RBAC.Perfil.fechar"
        >
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input
                value={formPerfil.nome_perfil}
                onChange={(e) =>
                  setFormPerfil({ ...formPerfil, nome_perfil: e.target.value })
                }
                placeholder="Ex: Vendedor"
                className="mt-1"
                required
                disabled={!canManage}
              />
            </div>
            <div>
              <Label className="text-xs">Nível</Label>
              <Select
                value={formPerfil.nivel_perfil}
                onValueChange={(v) =>
                  setFormPerfil({ ...formPerfil, nivel_perfil: v })
                }
              >
                <SelectTrigger className="mt-1" disabled={!canManage}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NIVEIS_PERFIL.map((n) => (
                    <SelectItem key={n.id} value={n.nome}>
                      {n.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={formPerfil.ativo}
                  disabled={!canManage}
                  onCheckedChange={(v) =>
                    setFormPerfil({ ...formPerfil, ativo: v })
                  }
                />
                <span className="text-sm">
                  {formPerfil.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea
              value={formPerfil.descricao}
              onChange={(e) =>
                setFormPerfil({ ...formPerfil, descricao: e.target.value })
              }
              placeholder="Responsabilidades do perfil"
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Permissões granulares */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="font-bold">Permissões Granulares</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canManage}
                onClick={selecionarTudoGlobal}
                data-action="RBAC.Permissoes.tudoNada"
              >
                <CheckSquare className="w-3 h-3 mr-1" />
                Tudo/Nada
              </Button>
            </div>
            <Alert className="mb-3 border-blue-200 bg-blue-50 py-2">
              <Info className="w-3 h-3 text-blue-600" />
              <AlertDescription className="text-xs text-blue-800">
                {contarPermissoesTotal()} permissões selecionadas em{" "}
                {Object.keys(formPerfil.permissoes || {}).filter(
                  (m) =>
                    Object.values(formPerfil.permissoes[m] || {}).some(
                      (s) => s?.length > 0
                    )
                ).length}{" "}
                módulos
              </AlertDescription>
            </Alert>

            <PermissoesAccordion
              formPermissoes={formPerfil.permissoes || {}}
              onTogglePermissao={togglePermissao}
              onToggleSecao={toggleSecao}
              onToggleModulo={toggleModulo}
              modulosExpandidos={modulosExpandidos}
              onModulosExpandidosChange={setModulosExpandidos}
              disabled={!canManage}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-3 border-t">
            <Badge className="bg-slate-100 text-slate-700 text-xs">
              {contarPermissoesTotal()} perm. •{" "}
              {Object.keys(formPerfil.permissoes || {}).length} módulos
            </Badge>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-action="RBAC.Perfil.cancelar"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSaving || !formPerfil.nome_perfil || !canManage
                }
                className="bg-blue-600 hover:bg-blue-700"
                data-action="RBAC.Perfil.salvar"
                data-permission="Sistema.Controle de Acesso.editar"
                data-sensitive="true"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}