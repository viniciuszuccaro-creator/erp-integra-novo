import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Factory, Package } from "lucide-react";

/**
 * Step 2 do GerarOPModal: Configurações da OP
 */
export default function GerarOPStepConfig({ configGlobal, setConfigGlobal, configProducao, onVoltar, onGerar, isPending }) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Factory className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Configurações para a Ordem de Produção Única</p>
            <p>Estas configurações serão aplicadas à única OP que será gerada para este pedido.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data de Emissão</Label>
          <Input type="date" value={configGlobal.data_emissao}
            onChange={(e) => setConfigGlobal(prev => ({ ...prev, data_emissao: e.target.value }))} />
        </div>
        <div>
          <Label>Data Início Prevista *</Label>
          <Input type="date" value={configGlobal.data_inicio_prevista} required
            onChange={(e) => setConfigGlobal(prev => ({ ...prev, data_inicio_prevista: e.target.value }))} />
        </div>
        <div>
          <Label>Setor de Produção</Label>
          <Input value={configGlobal.setor_producao}
            onChange={(e) => setConfigGlobal(prev => ({ ...prev, setor_producao: e.target.value }))} />
        </div>
        <div>
          <Label>Responsável</Label>
          <Input value={configGlobal.responsavel} placeholder="Nome do responsável"
            onChange={(e) => setConfigGlobal(prev => ({ ...prev, responsavel: e.target.value }))} />
        </div>
        <div>
          <Label>Turno</Label>
          <Select value={configGlobal.turno} onValueChange={(value) => setConfigGlobal(prev => ({ ...prev, turno: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Manhã">Manhã</SelectItem>
              <SelectItem value="Tarde">Tarde</SelectItem>
              <SelectItem value="Noite">Noite</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Prioridade</Label>
          <Select value={configGlobal.prioridade} onValueChange={(value) => setConfigGlobal(prev => ({ ...prev, prioridade: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Baixa">Baixa</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">O que será gerado automaticamente:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Lista de materiais necessários (concreto, aço), totalizada para o pedido.</li>
              <li>Etapas do processo produtivo (padrão da empresa).</li>
              <li>Cálculo de custos consolidado para a OP.</li>
              <li>Data de conclusão prevista (baseada no prazo padrão da empresa).</li>
              <li>Vinculação com o pedido original.</li>
              {configProducao?.perda_aco_percentual && (
                <li>Considerada perda de aço de {configProducao.perda_aco_percentual}%</li>
              )}
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onVoltar}>Voltar</Button>
        <Button type="button" data-permission="Producao.OrdemProducao.criar" onClick={onGerar} className="bg-green-600 hover:bg-green-700" disabled={isPending}>
          <Factory className="w-4 h-4 mr-2" />
          Gerar Ordem de Produção Única
        </Button>
      </div>
    </div>
  );
}