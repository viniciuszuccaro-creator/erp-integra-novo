import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { z } from "zod";
import FormWrapper from "@/components/common/FormWrapper";
import { Save, User, Trash2, Power, PowerOff } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";

/**
 * V21.1.2: Colaborador Form - Adaptado para Window Mode
 * Suporte para Dialog (fallback) e Window Mode (multitarefa)
 * V22.1: Departamento e Cargo agora buscam dados reais de Cadastros Gerais via useRLSQuery
 */
function ColaboradorForm({ colaborador: colaboradorProp, item, data, onSubmit, onSave, onClose, windowMode = false }) {
  const colaborador = colaboradorProp || item || data || null;
  const onCloseNorm = onClose || onSave;
  // Sync form when editing existing record
  const [_syncKey, _setSyncKey] = React.useState(colaborador?.id || 'new');
  const { carimbarContexto } = useContextoVisual();

  // Busca dados reais de Cadastros Gerais
  const { data: departamentos = [] } = useRLSQuery('Departamento', {}, 'nome_departamento', 999);
  const { data: cargos = [] } = useRLSQuery('Cargo', {}, 'nome_cargo', 999);
  const [formData, setFormData] = useState(colaborador || {
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    data_admissao: '',
    cargo: '',
    departamento: '',
    salario: 0,
    tipo_contrato: 'CLT',
    status: 'Ativo',
    endereco: '',
    banco: '',
    agencia: '',
    conta: '',
    pode_apontar_producao: false,
    pode_dirigir: false,
    cnh_numero: '',
    cnh_categoria: '',
    cnh_validade: '',
    aso_validade: ''
  });

  useEffect(() => {
    if (colaborador?.id) {
      setFormData({ ...colaborador });
    }
  }, [colaborador?.id]);

  const schema = z.object({
    nome_completo: z.string().min(3, 'Nome é obrigatório'),
    cpf: z.string().min(11, 'CPF é obrigatório'),
    data_admissao: z.string().min(4, 'Data de admissão é obrigatória'),
    cargo: z.string().min(2, 'Cargo é obrigatório'),
    departamento: z.string().min(2, 'Departamento é obrigatório'),
  });

  const handleSubmit = async () => {
    onSubmit(carimbarContexto(formData, 'empresa_alocada_id'));
  };

  const { confirm, ConfirmDialog: ConfirmExcluirDialog } = useConfirm();

  const handleExcluir = async () => {
    const ok = await confirm({ title: 'Confirmar Exclusão', description: `Tem certeza que deseja excluir o colaborador "${formData.nome_completo}"? Esta ação não pode ser desfeita.`, confirmText: 'Excluir' });
    if (!ok) return;
    if (onSubmit) {
      onSubmit({ ...carimbarContexto(formData, 'empresa_alocada_id'), _action: 'delete' });
    }
  };

  const handleAlternarStatus = () => {
    const novoStatus = formData.status === 'Ativo' ? 'Desligado' : 'Ativo';
    setFormData({ ...formData, status: novoStatus });
  };

  const content = (
    <FormWrapper schema={schema} defaultValues={formData} onSubmit={handleSubmit} externalData={formData} entityName="Colaborador" editItemId={colaborador?.id} className={`w-full h-full space-y-6 ${windowMode ? 'p-6 overflow-auto' : ''}`}>
      <div className="space-y-4">
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-md rounded-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" />
              Dados Pessoais
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-md rounded-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Vínculo Empregatício</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Admissão *</Label>
                <Input
                  type="date"
                  value={formData.data_admissao}
                  onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Tipo de Contrato</Label>
                <Select value={formData.tipo_contrato} onValueChange={(v) => setFormData({ ...formData, tipo_contrato: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="Estágio">Estágio</SelectItem>
                    <SelectItem value="Temporário">Temporário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cargo *</Label>
                <Select value={formData.cargo} onValueChange={(v) => setFormData({ ...formData, cargo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((c) => (
                      <SelectItem key={c.id} value={c.nome_cargo || c.nome || ''}>
                        {c.nome_cargo || c.nome || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!cargos.length && (
                  <Input
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    placeholder="Digite o cargo"
                    className="mt-1"
                    required
                  />
                )}
              </div>

              <div>
                <Label>Departamento *</Label>
                <Select value={formData.departamento} onValueChange={(v) => setFormData({ ...formData, departamento: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((d) => (
                      <SelectItem key={d.id} value={d.nome_departamento || d.nome || ''}>
                        {d.nome_departamento || d.nome || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!departamentos.length && (
                  <Input
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    placeholder="Digite o departamento"
                    className="mt-1"
                    required
                  />
                )}
              </div>

              <div>
                <Label>Salário</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Férias">Férias</SelectItem>
                    <SelectItem value="Afastado">Afastado</SelectItem>
                    <SelectItem value="Desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Pode Apontar Produção?</Label>
                <p className="text-xs text-slate-500">Acesso ao módulo de apontamento</p>
              </div>
              <Switch
                checked={formData.pode_apontar_producao}
                onCheckedChange={(v) => setFormData({ ...formData, pode_apontar_producao: v })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Pode Dirigir Veículos?</Label>
                <p className="text-xs text-slate-500">Habilitação para conduzir</p>
              </div>
              <Switch
                checked={formData.pode_dirigir}
                onCheckedChange={(v) => setFormData({ ...formData, pode_dirigir: v })}
              />
            </div>

            {formData.pode_dirigir && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <Label>Número CNH</Label>
                  <Input
                    value={formData.cnh_numero}
                    onChange={(e) => setFormData({ ...formData, cnh_numero: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Categoria CNH</Label>
                  <Input
                    value={formData.cnh_categoria}
                    onChange={(e) => setFormData({ ...formData, cnh_categoria: e.target.value })}
                    placeholder="B, C, D, E"
                  />
                </div>
                <div>
                  <Label>Validade CNH</Label>
                  <Input
                    type="date"
                    value={formData.cnh_validade}
                    onChange={(e) => setFormData({ ...formData, cnh_validade: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white/80 backdrop-blur">
          {colaborador && (
            <>
              <Button
                type="button"
                variant="outline"
                data-sensitive
                onClick={handleAlternarStatus}
                className={formData.status === 'Ativo' ? 'border-orange-300 text-orange-700' : 'border-green-300 text-green-700'}
              >
                {formData.status === 'Ativo' ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Desligar
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Reativar
                  </>
                )}
              </Button>
              <Button
                                type="button"
                                variant="destructive"
                                data-sensitive
                                onClick={handleExcluir}
                              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
          <Button type="submit" data-sensitive className="bg-pink-600 hover:bg-pink-700">
            <Save className="w-4 h-4 mr-2" />
            {colaborador ? 'Atualizar' : 'Criar'} Colaborador
          </Button>
        </div>
      </div>
    </FormWrapper>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return (<>{content}<ConfirmExcluirDialog /></>);
}

export default React.memo(ColaboradorForm);