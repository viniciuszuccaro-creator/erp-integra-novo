import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

export default function PrincipalTab({
  formData,
  setFormData,
  buscarCep,
  buscandoCep,
  buscarCnpj,
  buscandoCnpj,
  adicionarContato,
  removerContato,
}) {
  if (!formData) return null;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Pessoa *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
              <SelectItem value="Pessoa Jurídica">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Prospect">Prospect</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
              <SelectItem value="Bloqueado">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(formData.status === "Inativo" || formData.status === "Bloqueado") && (
          <div className="col-span-2">
            <Label>Motivo da Inativação/Bloqueio *</Label>
            <Select
              value={formData.motivo_inatividade}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, motivo_inatividade: value }))}
            >
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Preço Alto">Preço Alto</SelectItem>
                <SelectItem value="Fechou">Empresa Fechou</SelectItem>
                <SelectItem value="Concorrência">Foi para Concorrência</SelectItem>
                <SelectItem value="Inadimplência">Inadimplência</SelectItem>
                <SelectItem value="Sem Demanda">Sem Demanda</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.tipo === "Pessoa Jurídica" ? (
          <>
            <div className="col-span-2">
              <Label>Razão Social *</Label>
              <Input
                value={formData.nome || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Nome Fantasia</Label>
              <Input
                value={formData.nome_fantasia || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome_fantasia: e.target.value }))}
              />
            </div>
            <div>
              <Label>CNPJ *</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.cnpj || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => buscarCnpj(formData.cnpj)}
                  disabled={buscandoCnpj}
                >
                  {buscandoCnpj ? "..." : "Buscar"}
                </Button>
              </div>
            </div>
            <div>
              <Label>Inscrição Estadual</Label>
              <Input
                value={formData.inscricao_estadual || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, inscricao_estadual: e.target.value }))}
              />
            </div>
            <div>
              <Label>Inscrição Municipal</Label>
              <Input
                value={formData.inscricao_municipal || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, inscricao_municipal: e.target.value }))}
              />
            </div>
          </>
        ) : (
          <>
            <div className="col-span-2">
              <Label>Nome Completo *</Label>
              <Input
                value={formData.nome || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input
                value={formData.cpf || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div>
              <Label>RG</Label>
              <Input
                value={formData.rg || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, rg: e.target.value }))}
              />
            </div>
          </>
        )}
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Endereço Principal</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>CEP *</Label>
            <div className="flex gap-2">
              <Input
                value={formData.endereco_principal?.cep || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endereco_principal: { ...prev.endereco_principal, cep: e.target.value },
                  }))
                }
                placeholder="00000-000"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => buscarCep(formData.endereco_principal?.cep)}
                disabled={buscandoCep}
              >
                {buscandoCep ? "..." : "Buscar"}
              </Button>
            </div>
          </div>
          <div>
            <Label>Número *</Label>
            <Input
              value={formData.endereco_principal?.numero || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_principal: { ...prev.endereco_principal, numero: e.target.value },
                }))
              }
              required
            />
          </div>
          <div className="col-span-2">
            <Label>Logradouro *</Label>
            <Input
              value={formData.endereco_principal?.logradouro || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_principal: { ...prev.endereco_principal, logradouro: e.target.value },
                }))
              }
              required
            />
          </div>
          <div>
            <Label>Complemento</Label>
            <Input
              value={formData.endereco_principal?.complemento || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_principal: { ...prev.endereco_principal, complemento: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label>Bairro *</Label>
            <Input
              value={formData.endereco_principal?.bairro || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_principal: { ...prev.endereco_principal, bairro: e.target.value },
                }))
              }
              required
            />
          </div>
          <div>
            <Label>Cidade *</Label>
            <Input
              value={formData.endereco_principal?.cidade || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_principal: { ...prev.endereco_principal, cidade: e.target.value },
                }))
              }
              required
            />
          </div>
          <div>
            <Label>Estado *</Label>
            <Input
              value={formData.endereco_principal?.estado || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  endereco_principal: { ...prev.endereco_principal, estado: e.target.value },
                }))
              }
              maxLength={2}
              placeholder="SP"
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-3">
          <h3 className="font-semibold">Contatos</h3>
          <Button type="button" variant="outline" size="sm" onClick={adicionarContato}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
        {(formData.contatos || []).map((contato, index) => (
          <Card key={index} className="mb-3 p-4">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select
                  value={contato.tipo}
                  onValueChange={(value) => {
                    setFormData((prev) => {
                      const novos = [...prev.contatos];
                      novos[index] = { ...novos[index], tipo: value };
                      return { ...prev, contatos: novos };
                    });
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Telefone">Telefone</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="E-mail">E-mail</SelectItem>
                    <SelectItem value="Celular">Celular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Valor</Label>
                <Input
                  value={contato.valor}
                  onChange={(e) => {
                    setFormData((prev) => {
                      const novos = [...prev.contatos];
                      novos[index] = { ...novos[index], valor: e.target.value };
                      return { ...prev, contatos: novos };
                    });
                  }}
                />
              </div>
              <div className="flex items-end gap-2">
                <Checkbox
                  checked={contato.principal}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => {
                      const novos = [...prev.contatos];
                      novos[index] = { ...novos[index], principal: checked };
                      return { ...prev, contatos: novos };
                    });
                  }}
                />
                <Label className="text-sm">Principal</Label>
                {formData.contatos.length > 1 && (
                  <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removerContato(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
          rows={3}
        />
      </div>
    </>
  );
}