import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BotaoBuscaAutomatica } from "@/components/lib/BuscaDadosPublicos";
import { Star } from "lucide-react";

/** Sub-componente: Aba Dados Gerais do Fornecedor */
export default function FornecedorTabDadosGerais({ formData, setFormData, fornecedor, handleDadosCNPJ, handleDadosRNTRC }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2"><Label htmlFor="nome">Nome / Razão Social *</Label><Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required /></div>
      <div><Label htmlFor="razao_social">Razão Social</Label><Input id="razao_social" value={formData.razao_social} onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })} /></div>
      <div><Label htmlFor="nome_fantasia">Nome Fantasia</Label><Input id="nome_fantasia" value={formData.nome_fantasia} onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })} /></div>
      <div><Label htmlFor="cnpj">CNPJ</Label><Input id="cnpj" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} placeholder="00.000.000/0000-00" /></div>
      <div><Label>&nbsp;</Label><BotaoBuscaAutomatica tipo="cnpj" valor={formData.cnpj} onDadosEncontrados={handleDadosCNPJ} disabled={!formData.cnpj || formData.cnpj.replace(/\D/g, '').length < 14} /></div>
      <div><Label htmlFor="inscricao_estadual">Inscrição Estadual</Label><Input id="inscricao_estadual" value={formData.inscricao_estadual} onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })} /></div>
      <div><Label htmlFor="categoria">Categoria *</Label>
        <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="Matéria Prima">Matéria Prima</SelectItem><SelectItem value="Equipamentos">Equipamentos</SelectItem><SelectItem value="Serviços">Serviços</SelectItem><SelectItem value="Transporte">Transporte</SelectItem><SelectItem value="Tecnologia">Tecnologia</SelectItem><SelectItem value="Outros">Outros</SelectItem></SelectContent></Select>
      </div>
      {formData.categoria === "Transporte" && (
        <>
          <div><Label htmlFor="rntrc">RNTRC (ANTT)</Label><Input id="rntrc" value={formData.rntrc} onChange={(e) => setFormData({ ...formData, rntrc: e.target.value })} placeholder="00000000" /></div>
          <div><Label>&nbsp;</Label><BotaoBuscaAutomatica tipo="rntrc" valor={formData.rntrc} onDadosEncontrados={handleDadosRNTRC} disabled={!formData.rntrc} /></div>
        </>
      )}
      <div><Label htmlFor="prazo_entrega_padrao">Prazo Entrega Padrão (dias)</Label><Input id="prazo_entrega_padrao" type="number" value={formData.prazo_entrega_padrao} onChange={(e) => setFormData({ ...formData, prazo_entrega_padrao: parseFloat(e.target.value) || 0 })} /></div>
      <div><Label htmlFor="status_fornecedor">Status do Fornecedor</Label>
        <Select value={formData.status_fornecedor} onValueChange={(v) => setFormData({ ...formData, status_fornecedor: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="Em Análise">Em Análise</SelectItem><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Bloqueado">Bloqueado</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent></Select>
      </div>
      <div><Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="z-[99999]"><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent></Select>
      </div>
      {fornecedor?.id && (
        <div className="col-span-2 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-sm text-slate-600">Última Compra</p><p className="font-semibold">{formData.ultima_compra ? new Date(formData.ultima_compra).toLocaleDateString('pt-BR') : '-'}</p></div>
            <div><p className="text-sm text-slate-600">Total de Compras</p><p className="font-semibold">{formData.quantidade_compras || 0}</p></div>
            <div><p className="text-sm text-slate-600">Nota Média</p><div className="flex items-center gap-2"><div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`w-4 h-4 ${star <= (formData.nota_media || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />)}</div><span className="font-semibold">{(formData.nota_media || 0).toFixed(1)}</span></div></div>
          </div>
        </div>
      )}
    </div>
  );
}