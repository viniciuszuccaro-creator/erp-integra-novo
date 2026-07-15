import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPinned, CheckCircle, Plus, Trash2, AlertTriangle } from "lucide-react";

export default function EntregaTab({
  locaisEntrega = [],
  onAddLocal,
  onRemoveLocal,
  onGeocode,
  formData,
  setFormData,
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Endereços de Entrega</h3>
        <Button type="button" variant="outline" onClick={onAddLocal}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Local
        </Button>
      </div>

      {locaisEntrega.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPinned className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum local de entrega cadastrado</p>
          <Button type="button" variant="outline" onClick={onAddLocal} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Local
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {locaisEntrega.map((local, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold">Local {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveLocal(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Apelido *</Label>
                  <Input
                    value={local.apelido}
                    onChange={(e) => {
                      setFormData((prev) => {
                        const novos = [...(prev.locais_entrega || [])];
                        novos[index] = { ...novos[index], apelido: e.target.value };
                        return { ...prev, locais_entrega: novos };
                      });
                    }}
                    placeholder="Ex: Matriz, Filial 1"
                  />
                </div>
                <div>
                  <Label>CEP *</Label>
                  <Input
                    value={local.cep}
                    onChange={(e) => {
                      setFormData((prev) => {
                        const novos = [...(prev.locais_entrega || [])];
                        novos[index] = { ...novos[index], cep: e.target.value };
                        return { ...prev, locais_entrega: novos };
                      });
                    }}
                  />
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input
                    value={local.numero}
                    onChange={(e) => {
                      setFormData((prev) => {
                        const novos = [...(prev.locais_entrega || [])];
                        novos[index] = { ...novos[index], numero: e.target.value };
                        return { ...prev, locais_entrega: novos };
                      });
                    }}
                  />
                </div>

                <div className="col-span-3 border-t pt-3">
                  <Label className="text-sm font-semibold">Horário de Recebimento (CRÍTICO)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="text-xs">Início</Label>
                      <Input
                        type="time"
                        value={local.horario_inicio}
                        onChange={(e) => {
                          setFormData((prev) => {
                            const novos = [...(prev.locais_entrega || [])];
                            novos[index] = { ...novos[index], horario_inicio: e.target.value };
                            return { ...prev, locais_entrega: novos };
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Fim</Label>
                      <Input
                        type="time"
                        value={local.horario_fim}
                        onChange={(e) => {
                          setFormData((prev) => {
                            const novos = [...(prev.locais_entrega || [])];
                            novos[index] = { ...novos[index], horario_fim: e.target.value };
                            return { ...prev, locais_entrega: novos };
                          });
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Horário será exibido como alerta CRÍTICO na Expedição
                  </p>
                </div>

                <div className="col-span-3 border-t pt-3">
                  <Label>Contato no Local *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Input
                      value={local.contato_nome}
                      onChange={(e) => {
                        setFormData((prev) => {
                          const novos = [...(prev.locais_entrega || [])];
                          novos[index] = { ...novos[index], contato_nome: e.target.value };
                          return { ...prev, locais_entrega: novos };
                        });
                      }}
                      placeholder="Nome do contato"
                    />
                    <Input
                      value={local.contato_telefone}
                      onChange={(e) => {
                        setFormData((prev) => {
                          const novos = [...(prev.locais_entrega || [])];
                          novos[index] = { ...novos[index], contato_telefone: e.target.value };
                          return { ...prev, locais_entrega: novos };
                        });
                      }}
                      placeholder="Telefone"
                    />
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center justify-between">
                    <Label>Geolocalização (GPS)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onGeocode(index)}
                    >
                      <MapPinned className="w-4 h-4 mr-2" />
                      Geocodificar
                    </Button>
                  </div>
                  {local.latitude && local.longitude && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Lat: {local.latitude.toFixed(6)}, Lng: {local.longitude.toFixed(6)}
                    </div>
                  )}
                </div>

                <div className="col-span-3 flex items-center gap-2">
                  <Checkbox
                    checked={local.principal}
                    onCheckedChange={(checked) => {
                      setFormData((prev) => {
                        const novos = [...(prev.locais_entrega || [])];
                        novos[index] = { ...novos[index], principal: checked };
                        return { ...prev, locais_entrega: novos };
                      });
                    }}
                  />
                  <Label>Marcar como endereço principal de entrega</Label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}