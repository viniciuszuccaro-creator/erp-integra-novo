import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield, Plus, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, CheckSquare,
} from "lucide-react";
import { ESTRUTURA_SISTEMA, ACOES, NIVEIS_PERFIL } from "./estruturaSistema";

/**
 * PerfilFormDialog — formulário de criação/edição de perfil de acesso.
 * Extraído de GerenciamentoAcessosCompleto (Regra-Mãe: refatoração obrigatória).
 */
export default function PerfilFormDialog({
  open, onOpenChange,
  editingPerfil,
  formPerfil, setFormPerfil,
  onSubmit,
  aplicarTemplateNivel,
  conflitosSOD,
  selecionarTudoGlobal,
  moduloExpandido, setModuloExpandido,
  contarPermissoesModulo, temPermissao, togglePermissao,
  marcarTodoModulo, marcarTodoSecao,
  salvarPerfilMutation,
  resetFormPerfil,
  setEditingPerfil,
}) {
  return (
    <Dialog open={open} onOpenChange={(openVal) => {
      onOpenChange(openVal);
      if (!openVal) {
        setEditingPerfil(null);
        resetFormPerfil();
      }
    }}>
      <DialogTrigger asChild>
        <Button data-permission="Sistema.PerfilAcesso.criar" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            {editingPerfil ? 'Editar Perfil de Acesso' : 'Novo Perfil de Acesso'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex-1 overflow-hidden flex flex-col">
          {/* Dados Básicos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <Label>Nome do Perfil *</Label>
              <Input
                value={formPerfil.nome_perfil}
                onChange={(e) => setFormPerfil({ ...formPerfil, nome_perfil: e.target.value })}
                placeholder="Ex: Vendedor, Gerente Financeiro"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label>Nível do Perfil</Label>
              <Select
                value={formPerfil.nivel_perfil}
                onValueChange={(v) => aplicarTemplateNivel(v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NIVEIS_PERFIL.map(n => (
                    <SelectItem key={n.id} value={n.id}>
                      <div>
                        <span className="font-medium">{n.nome}</span>
                        <span className="text-xs text-slate-500 ml-2">{n.descricao}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch
                  checked={formPerfil.ativo}
                  onCheckedChange={(v) => setFormPerfil({ ...formPerfil, ativo: v })}
                />
                <span className="text-sm">{formPerfil.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Label>Descrição</Label>
            <Textarea
              value={formPerfil.descricao}
              onChange={(e) => setFormPerfil({ ...formPerfil, descricao: e.target.value })}
              placeholder="Descrição do perfil e suas responsabilidades"
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Alertas de SoD */}
          {conflitosSOD.length > 0 && (
            <div className="mb-4 space-y-2">
              {conflitosSOD.map((conflito, idx) => (
                <Alert key={idx} className={
                  conflito.severidade === "Crítica"
                    ? "border-red-300 bg-red-50"
                    : "border-orange-300 bg-orange-50"
                }>
                  {conflito.severidade === "Crítica" ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  )}
                  <AlertDescription>
                    <strong>[{conflito.regra}]</strong> {conflito.descricao}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Grid de Permissões */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <div className="p-3 bg-slate-100 border-b flex items-center justify-between sticky top-0 z-10">
              <span className="font-semibold text-sm">Permissões por Módulo</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={selecionarTudoGlobal}
                className="bg-white"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Selecionar/Desmarcar Tudo
              </Button>
            </div>
            <Accordion type="multiple" value={moduloExpandido} onValueChange={setModuloExpandido}>
              {Object.entries(ESTRUTURA_SISTEMA).map(([moduloId, modulo]) => {
                const Icone = modulo.icone;
                const qtdPerms = contarPermissoesModulo(moduloId);

                return (
                  <AccordionItem key={moduloId} value={moduloId} className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3 flex-1">
                        <Icone className={`w-5 h-5 text-${modulo.cor}-600`} />
                        <span className="font-medium">{modulo.nome}</span>
                        {qtdPerms > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 ml-2">
                            {qtdPerms} permissões
                          </Badge>
                        )}
                        <div className="ml-auto mr-4 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarTodoModulo(moduloId, true);
                            }}
                          >
                            Marcar Tudo
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              marcarTodoModulo(moduloId, false);
                            }}
                          >
                            Desmarcar
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {Object.entries(modulo.secoes).map(([secaoId, secao]) => (
                          <div key={secaoId} className="border rounded-lg p-3 bg-slate-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{secao.nome}</span>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => marcarTodoSecao(moduloId, secaoId, true)}
                                >
                                  Todas
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => marcarTodoSecao(moduloId, secaoId, false)}
                                >
                                  Nenhuma
                                </Button>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {ACOES.map(acao => {
                                const marcado = temPermissao(moduloId, secaoId, acao.id);
                                const IconeAcao = acao.icone;

                                return (
                                  <label
                                    key={acao.id}
                                    className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border transition-colors ${
                                      marcado
                                        ? `bg-${acao.cor}-100 border-${acao.cor}-300 text-${acao.cor}-700`
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={marcado}
                                      onCheckedChange={() => togglePermissao(moduloId, secaoId, acao.id)}
                                    />
                                    <IconeAcao className="w-3.5 h-3.5" />
                                    <span className="text-sm">{acao.nome}</span>
                                  </label>
                                );
                              })}
                            </div>
                            {secao.abas?.length > 0 && (
                              <div className="mt-2 text-xs text-slate-500">
                                Abas: {secao.abas.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setEditingPerfil(null);
                resetFormPerfil();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvarPerfilMutation.isPending || conflitosSOD.some(c => c.severidade === "Crítica")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {salvarPerfilMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingPerfil ? 'Atualizar' : 'Criar'} Perfil
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}