import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import BuscaCEP from "@/components/comercial/BuscaCEP";

/**
 * Dialog com formulário de endereço (novo/editar)
 * Extraído de GerenciarEnderecosClienteForm.jsx
 */
export default function EnderecoFormDialog({
  dialogAberto, setDialogAberto, enderecoEditando,
  novoEndereco, setNovoEndereco, handleSalvarEndereco, resetForm
}) {
  const set = (field) => (e) => setNovoEndereco(prev => ({ ...prev, [field]: e.target.value }));
  const setNum = (field) => (e) => setNovoEndereco(prev => ({ ...prev, [field]: parseFloat(e.target.value) || null }));

  return (
    <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>{enderecoEditando !== null ? 'Editar' : 'Novo'} Endereço</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Apelido do Endereço *</Label>
              <Input value={novoEndereco.apelido} onChange={set('apelido')} placeholder="Ex: Matriz, Filial Centro, Obra SP" />
            </div>
            <div>
              <Label>Tipo de Endereço</Label>
              <Select value={novoEndereco.tipo_endereco || "Entrega"} onValueChange={(value) => setNovoEndereco({ ...novoEndereco, tipo_endereco: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="Entrega">Entrega</SelectItem>
                  <SelectItem value="Cobrança">Cobrança</SelectItem>
                  <SelectItem value="Matriz">Matriz</SelectItem>
                  <SelectItem value="Obra">Obra</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <BuscaCEP
            enderecoAtual={novoEndereco}
            onEnderecoEncontrado={(endereco) => {
              setNovoEndereco({
                ...novoEndereco,
                cep: endereco.cep || novoEndereco.cep,
                logradouro: endereco.logradouro || novoEndereco.logradouro,
                bairro: endereco.bairro || novoEndereco.bairro,
                cidade: endereco.cidade || novoEndereco.cidade,
                estado: endereco.estado || novoEndereco.estado,
                complemento: endereco.complemento || novoEndereco.complemento,
                latitude: endereco.latitude !== undefined ? endereco.latitude : novoEndereco.latitude,
                longitude: endereco.longitude !== undefined ? endereco.longitude : novoEndereco.longitude,
                mapa_url: endereco.mapa_url || novoEndereco.mapa_url
              });
            }}
          />

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <Label>Logradouro *</Label>
              <Input value={novoEndereco.logradouro} onChange={set('logradouro')} />
            </div>
            <div>
              <Label>Número *</Label>
              <Input value={novoEndereco.numero} onChange={set('numero')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><Label>Bairro</Label><Input value={novoEndereco.bairro} onChange={set('bairro')} /></div>
            <div><Label>Cidade</Label><Input value={novoEndereco.cidade} onChange={set('cidade')} /></div>
            <div><Label>Estado</Label><Input value={novoEndereco.estado} onChange={set('estado')} maxLength={2} placeholder="SP" /></div>
          </div>

          <div><Label>Complemento</Label><Input value={novoEndereco.complemento} onChange={set('complemento')} placeholder="Apto, Sala, Bloco..." /></div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Latitude (GPS)</Label><Input type="number" step="0.000001" value={novoEndereco.latitude || ""} onChange={setNum('latitude')} placeholder="-23.550520" /></div>
            <div><Label>Longitude (GPS)</Label><Input type="number" step="0.000001" value={novoEndereco.longitude || ""} onChange={setNum('longitude')} placeholder="-46.633308" /></div>
          </div>

          <div>
            <Label>Link do Google Maps 🗺️</Label>
            <Input value={novoEndereco.mapa_url} onChange={set('mapa_url')} placeholder="https://www.google.com/maps/..." />
            <p className="text-xs text-slate-500 mt-1">Cole o link direto do Google Maps ou deixe em branco para gerar automaticamente</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Horário Início Recebimento</Label><Input type="time" value={novoEndereco.horario_inicio} onChange={set('horario_inicio')} /></div>
            <div><Label>Horário Fim Recebimento</Label><Input type="time" value={novoEndereco.horario_fim} onChange={set('horario_fim')} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Contato no Local</Label><Input value={novoEndereco.contato_nome} onChange={set('contato_nome')} placeholder="Nome de quem recebe" /></div>
            <div><Label>Telefone do Contato</Label><Input value={novoEndereco.contato_telefone} onChange={set('contato_telefone')} placeholder="(11) 99999-9999" /></div>
          </div>

          <div><Label>Observações</Label><Input value={novoEndereco.observacoes} onChange={set('observacoes')} placeholder="Instruções especiais de entrega..." /></div>

          <div className="flex items-center gap-2 p-3 bg-green-50 rounded border">
            <input type="checkbox" checked={novoEndereco.principal} onChange={(e) => setNovoEndereco({ ...novoEndereco, principal: e.target.checked })} className="w-4 h-4" />
            <Label className="cursor-pointer font-normal">Marcar como endereço principal</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => { setDialogAberto(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSalvarEndereco}>
              <Check className="w-4 h-4 mr-2" />Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}