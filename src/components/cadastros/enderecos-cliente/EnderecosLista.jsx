import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, ExternalLink, Route } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * Lista de endereços cadastrados com ações de editar/excluir
 * Extraído de GerenciarEnderecosClienteForm.jsx
 */
export default function EnderecosLista({ enderecos, onEditar, onExcluir }) {
  if (!enderecos || enderecos.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">Nenhum endereço cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {enderecos.map((endereco, idx) => (
        <div key={idx} className="p-3 border rounded-lg hover:border-blue-500 transition-all bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <p className="font-semibold">{endereco.apelido || `Endereço ${idx + 1}`}</p>
                {endereco.principal && <Badge className="bg-green-600 text-xs">Principal</Badge>}
                <Badge variant="outline" className="text-xs">{endereco.tipo_endereco || 'Entrega'}</Badge>
              </div>
              <p className="text-sm text-slate-700">
                {endereco.logradouro}, {endereco.numero}{endereco.complemento && ` - ${endereco.complemento}`}
              </p>
              <p className="text-sm text-slate-600">
                {endereco.bairro} - {endereco.cidade}/{endereco.estado}{endereco.cep && ` - CEP: ${endereco.cep}`}
              </p>
              {endereco.contato_nome && (
                <p className="text-xs text-slate-500 mt-1">Contato: {endereco.contato_nome} {endereco.contato_telefone && `- ${endereco.contato_telefone}`}</p>
              )}
              {endereco.horario_inicio && endereco.horario_fim && (
                <p className="text-xs text-slate-500 mt-1">Horário: {endereco.horario_inicio} às {endereco.horario_fim}</p>
              )}
              <div className="flex gap-2 mt-2">
                {endereco.mapa_url && (
                  <a href={endereco.mapa_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="w-3 h-3" />Ver no Google Maps
                  </a>
                )}
                {endereco.latitude && endereco.longitude && (
                  <Link to={createPageUrl('Expedicao') + '?tab=rotas'} className="text-xs text-green-600 hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Route className="w-3 h-3" />Roteirizar
                  </Link>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEditar(idx)}>
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onExcluir(idx)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}