import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Zap } from "lucide-react";
import BuscaCEP from "../comercial/BuscaCEP";

/**
 * Sub-componente extraído de FormularioEntrega.jsx
 * Seções: Endereço de Entrega + Contato para Entrega + Google Maps IA.
 */
export default function EntregaEnderecoContato({ formData, setFormData, buscarDadosGoogleMaps }) {
  return (
    <>
      {/* Endereço de Entrega */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2"><MapPin className="w-5 h-5" />Endereço de Entrega</h3>
        <BuscaCEP value={formData.endereco_entrega_completo.cep} onCEPFound={(dados) => setFormData({ ...formData, endereco_entrega_completo: { ...formData.endereco_entrega_completo, cep: dados.cep, logradouro: dados.logradouro, bairro: dados.bairro, cidade: dados.cidade, estado: dados.uf } })} />
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3"><Label>Logradouro</Label><Input value={formData.endereco_entrega_completo.logradouro} onChange={(e) => setFormData({ ...formData, endereco_entrega_completo: { ...formData.endereco_entrega_completo, logradouro: e.target.value } })} /></div>
          <div><Label>Número</Label><Input value={formData.endereco_entrega_completo.numero} onChange={(e) => setFormData({ ...formData, endereco_entrega_completo: { ...formData.endereco_entrega_completo, numero: e.target.value } })} /></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Bairro</Label><Input value={formData.endereco_entrega_completo.bairro} onChange={(e) => setFormData({ ...formData, endereco_entrega_completo: { ...formData.endereco_entrega_completo, bairro: e.target.value } })} /></div>
          <div><Label>Cidade</Label><Input value={formData.endereco_entrega_completo.cidade} onChange={(e) => setFormData({ ...formData, endereco_entrega_completo: { ...formData.endereco_entrega_completo, cidade: e.target.value } })} /></div>
          <div><Label>UF</Label><Input value={formData.endereco_entrega_completo.estado} onChange={(e) => setFormData({ ...formData, endereco_entrega_completo: { ...formData.endereco_entrega_completo, estado: e.target.value } })} maxLength={2} /></div>
        </div>
        <div><Label>Complemento / Referência</Label><Input value={formData.endereco_entrega_completo.complemento} onChange={(e) => setFormData({ ...formData, endereco_entrega_completo: { ...formData.endereco_entrega_completo, complemento: e.target.value } })} placeholder="Apto, bloco, próximo a..." /></div>
        <Card className="bg-purple-50 border-purple-300">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-600" /><span className="text-sm text-purple-900 font-medium">{formData.endereco_entrega_completo.link_google_maps ? '✅ Geolocalização Configurada' : '📍 Gerar Link Google Maps'}</span></div>
            <RBACButton type="button" module="Expedicao" action="editar" onClick={buscarDadosGoogleMaps} variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-100"><Zap className="w-4 h-4 mr-1" />Gerar com IA</RBACButton>
          </div>
        </Card>
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border border-blue-200">
          <input type="checkbox" id="salvar-endereco" checked={formData.salvar_endereco_no_cliente} onChange={(e) => setFormData({ ...formData, salvar_endereco_no_cliente: e.target.checked })} />
          <label htmlFor="salvar-endereco" className="text-sm text-blue-900">💾 Salvar este endereço no cadastro do cliente</label>
        </div>
      </div>

      {/* Contato para Entrega */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2"><Phone className="w-5 h-5" />Contato para Entrega</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Nome do Contato</Label><Input value={formData.contato_entrega.nome} onChange={(e) => setFormData({ ...formData, contato_entrega: { ...formData.contato_entrega, nome: e.target.value } })} placeholder="Quem vai receber" /></div>
          <div><Label>Telefone/WhatsApp</Label><Input value={formData.contato_entrega.whatsapp} onChange={(e) => setFormData({ ...formData, contato_entrega: { ...formData.contato_entrega, whatsapp: e.target.value } })} placeholder="(11) 99999-9999" /></div>
        </div>
        <div><Label>Instruções Especiais</Label><Input value={formData.contato_entrega.instrucoes_especiais} onChange={(e) => setFormData({ ...formData, contato_entrega: { ...formData.contato_entrega, instrucoes_especiais: e.target.value } })} placeholder="Ligar antes, entregar na portaria..." /></div>
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded border border-green-200">
          <input type="checkbox" id="salvar-contato" checked={formData.salvar_contato_no_cliente} onChange={(e) => setFormData({ ...formData, salvar_contato_no_cliente: e.target.checked })} />
          <label htmlFor="salvar-contato" className="text-sm text-green-900">💾 Salvar este contato no cadastro do cliente</label>
        </div>
      </div>
    </>
  );
}