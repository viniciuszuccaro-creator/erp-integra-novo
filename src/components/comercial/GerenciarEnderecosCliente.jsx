import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Plus, Edit, Trash2, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import BuscaCEP from "./BuscaCEP";

export default function GerenciarEnderecosCliente({ clienteId, onSelecionarEndereco }) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [novoEndereco, setNovoEndereco] = useState({
    apelido: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    latitude: null,
    longitude: null,
    contato_nome: "",
    contato_telefone: "",
    link_mapa: "",
    principal: false
  });

  const { data: cliente } = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      const clientes = await base44.entities.Cliente.filter({ id: clienteId });
      return clientes[0] || null;
    },
    enabled: !!clienteId
  });

  const updateClienteMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Cliente.update(clienteId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente', clienteId] });
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: "✅ Endereços Atualizados!" });
      setDialogAberto(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setNovoEndereco({
      apelido: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      latitude: null,
      longitude: null,
      contato_nome: "",
      contato_telefone: "",
      link_mapa: "",
      principal: false
    });
    setEnderecoEditando(null);
  };

  const handleSalvarEndereco = () => {
    if (!novoEndereco.logradouro || !novoEndereco.numero) {
      toast({ 
        title: "❌ Erro", 
        description: "Preencha logradouro e número", 
        variant: "destructive" 
      });
      return;
    }

    const enderecosAtualizados = [...(cliente?.locais_entrega || [])];

    if (enderecoEditando !== null) {
      // Editando
      enderecosAtualizados[enderecoEditando] = novoEndereco;
    } else {
      // Adicionando
      enderecosAtualizados.push(novoEndereco);
    }

    // Se marcar como principal, remove principal dos outros
    if (novoEndereco.principal) {
      enderecosAtualizados.forEach((end, idx) => {
        if (idx !== enderecoEditando) {
          end.principal = false;
        }
      });
    }

    updateClienteMutation.mutate({ locais_entrega: enderecosAtualizados });
  };

  const handleEditarEndereco = (index) => {
    setEnderecoEditando(index);
    setNovoEndereco({ ...(cliente?.locais_entrega[index]) });
    setDialogAberto(true);
  };

  const handleExcluirEndereco = (index) => {
    const enderecosAtualizados = (cliente?.locais_entrega || []).filter((_, i) => i !== index);
    updateClienteMutation.mutate({ locais_entrega: enderecosAtualizados });
  };

  const handleSelecionarEndereco = (endereco) => {
    onSelecionarEndereco({
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      latitude: endereco.latitude,
      longitude: endereco.longitude,
      contato_nome: endereco.contato_nome,
      contato_telefone: endereco.contato_telefone,
      instrucoes_entrega: endereco.observacoes || ""
    });

    toast({ title: "✅ Endereço Selecionado!" });
  };

  if (!clienteId) return null;

  const enderecos = cliente?.locais_entrega || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Endereços Cadastrados ({enderecos.length})</CardTitle>
        <Button onClick={() => { resetForm(); setDialogAberto(true); }} data-permission="Comercial.Cliente.editar">
          <Plus className="w-4 h-4 mr-2" />
          Novo Endereço
        </Button>
      </CardHeader>
      <CardContent>
        {enderecos.length > 0 ? (
          <div className="space-y-2">
            {enderecos.map((endereco, idx) => (
              <div 
                key={idx} 
                className="p-3 border rounded hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => handleSelecionarEndereco(endereco)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="font-semibold">{endereco.apelido || `Endereço ${idx + 1}`}</p>
                      {endereco.principal && <Badge className="bg-green-600">Principal</Badge>}
                    </div>
                    <p className="text-sm text-slate-700">
                      {endereco.logradouro}, {endereco.numero}
                      {endereco.complemento && ` - ${endereco.complemento}`}
                    </p>
                    <p className="text-sm text-slate-600">
                      {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                    </p>
                    {endereco.contato_nome && (
                      <p className="text-xs text-slate-500 mt-1">
                        Contato: {endereco.contato_nome} - {endereco.contato_telefone}
                      </p>
                    )}
                    {endereco.link_mapa && (
                      <a 
                        href={endereco.link_mapa} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver no Google Maps
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditarEndereco(idx)}
                      data-permission="Comercial.Cliente.editar"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExcluirEndereco(idx)}
                      data-permission="Comercial.Cliente.excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-6">
            Nenhum endereço cadastrado. Clique em "Novo Endereço" para adicionar.
          </p>
        )}
      </CardContent>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {enderecoEditando !== null ? 'Editar' : 'Novo'} Endereço
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Apelido do Endereço *</Label>
              <Input
                value={novoEndereco.apelido}
                onChange={(e) => setNovoEndereco({ ...novoEndereco, apelido: e.target.value })}
                placeholder="Ex: Matriz, Filial Centro, Galpão 2"
              />
            </div>

            <BuscaCEP
              enderecoAtual={novoEndereco}
              onEnderecoEncontrado={(endereco) => {
                setNovoEndereco({
                  ...novoEndereco,
                  ...endereco
                });
              }}
            />

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <Label>Logradouro *</Label>
                <Input
                  value={novoEndereco.logradouro}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, logradouro: e.target.value })}
                />
              </div>
              <div>
                <Label>Número *</Label>
                <Input
                  value={novoEndereco.numero}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, numero: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Bairro</Label>
                <Input
                  value={novoEndereco.bairro}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, bairro: e.target.value })}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  value={novoEndereco.cidade}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, cidade: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  value={novoEndereco.estado}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, estado: e.target.value })}
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <Label>Complemento</Label>
              <Input
                value={novoEndereco.complemento}
                onChange={(e) => setNovoEndereco({ ...novoEndereco, complemento: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={novoEndereco.latitude || ""}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, latitude: parseFloat(e.target.value) || null })}
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={novoEndereco.longitude || ""}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, longitude: parseFloat(e.target.value) || null })}
                />
              </div>
            </div>

            <div>
              <Label>Link do Google Maps</Label>
              <Input
                value={novoEndereco.link_mapa}
                onChange={(e) => setNovoEndereco({ ...novoEndereco, link_mapa: e.target.value })}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Contato no Local</Label>
                <Input
                  value={novoEndereco.contato_nome}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, contato_nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Telefone do Contato</Label>
                <Input
                  value={novoEndereco.contato_telefone}
                  onChange={(e) => setNovoEndereco({ ...novoEndereco, contato_telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 rounded border">
              <input
                type="checkbox"
                checked={novoEndereco.principal}
                onChange={(e) => setNovoEndereco({ ...novoEndereco, principal: e.target.checked })}
                className="w-4 h-4"
              />
              <Label className="cursor-pointer">Marcar como endereço principal</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarEndereco} disabled={updateClienteMutation.isPending}>
                <Check className="w-4 h-4 mr-2" />
                {updateClienteMutation.isPending ? 'Salvando...' : 'Salvar Endereço'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}