import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MapPin } from "lucide-react";
import { ESTADOS_BRASIL } from "./regiaoConstants";

export default function RegiaoTabGeral({ formData, setFormData, novaCidade, setNovaCidade, adicionarCidade, removerCidade, toggleEstado }) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome_regiao">Nome da Região *</Label>
          <Input id="nome_regiao" value={formData.nome_regiao} onChange={(e) => setFormData({ ...formData, nome_regiao: e.target.value })} placeholder="Ex: Grande São Paulo" />
        </div>
        <div>
          <Label htmlFor="codigo_regiao">Código</Label>
          <Input id="codigo_regiao" value={formData.codigo_regiao} onChange={(e) => setFormData({ ...formData, codigo_regiao: e.target.value })} placeholder="Ex: GSP" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo_regiao">Tipo de Região</Label>
          <Select value={formData.tipo_regiao} onValueChange={(value) => setFormData({ ...formData, tipo_regiao: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Macro Região">Macro Região</SelectItem><SelectItem value="Estado">Estado</SelectItem>
              <SelectItem value="Região Metropolitana">Região Metropolitana</SelectItem><SelectItem value="Microrregião">Microrregião</SelectItem><SelectItem value="Personalizada">Personalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cor_identificacao">Cor de Identificação</Label>
          <div className="flex gap-2">
            <Input id="cor_identificacao" type="color" value={formData.cor_identificacao} onChange={(e) => setFormData({ ...formData, cor_identificacao: e.target.value })} className="w-20" />
            <Input value={formData.cor_identificacao} onChange={(e) => setFormData({ ...formData, cor_identificacao: e.target.value })} placeholder="#3B82F6" />
          </div>
        </div>
      </div>
      <div>
        <Label>Estados Abrangidos</Label>
        <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-7 gap-2">
            {ESTADOS_BRASIL.map((estado) => (
              <Badge key={estado} variant={formData.estados_abrangidos.includes(estado) ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleEstado(estado)}>{estado}</Badge>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Label>Cidades Específicas</Label>
        <div className="border rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-5 gap-2">
            <Input placeholder="Cidade" value={novaCidade.cidade} onChange={(e) => setNovaCidade({ ...novaCidade, cidade: e.target.value })} />
            <Select value={novaCidade.estado} onValueChange={(value) => setNovaCidade({ ...novaCidade, estado: value })}>
              <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
              <SelectContent className="z-[99999]">{ESTADOS_BRASIL.map((estado) => (<SelectItem key={estado} value={estado}>{estado}</SelectItem>))}</SelectContent>
            </Select>
            <Input placeholder="CEP Inicial" value={novaCidade.cep_inicial} onChange={(e) => setNovaCidade({ ...novaCidade, cep_inicial: e.target.value })} />
            <Input placeholder="CEP Final" value={novaCidade.cep_final} onChange={(e) => setNovaCidade({ ...novaCidade, cep_final: e.target.value })} />
            <Button type="button" onClick={adicionarCidade} size="sm"><Plus className="w-4 h-4" /></Button>
          </div>
          {formData.cidades_abrangidas.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {formData.cidades_abrangidas.map((cidade, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                  <span className="text-sm">{cidade.cidade} - {cidade.estado}{cidade.cep_inicial && ` (${cidade.cep_inicial} - ${cidade.cep_final})`}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removerCidade(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={3} />
      </div>
    </div>
  );
}