import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

export default function FilialForm({ filial, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState(filial || {
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    tipo: 'Filial',
    matriz_id: '',
    status: 'Ativa'
  });

  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas', grupoAtual?.id, empresaAtual?.id],
    queryFn: () => filterInContext('Empresa', {}, 'nome_fantasia', 999),
    enabled: !!contexto,
  });

  const matrizes = empresas.filter(e => e.tipo === 'Matriz');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.razao_social || !formData.cnpj) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Razão Social *</Label>
        <Input
          value={formData.razao_social}
          onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
          placeholder="Empresa Filial Ltda"
        />
      </div>

      <div>
        <Label>Nome Fantasia</Label>
        <Input
          value={formData.nome_fantasia}
          onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>CNPJ *</Label>
          <Input
            value={formData.cnpj}
            onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            placeholder="00.000.000/0001-00"
          />
        </div>
        <div>
          <Label>Inscrição Estadual</Label>
          <Input
            value={formData.inscricao_estadual}
            onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
          />
        </div>
      </div>

      <div>
        <Label>Matriz</Label>
        <Select value={formData.matriz_id} onValueChange={(v) => setFormData({...formData, matriz_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a matriz" />
          </SelectTrigger>
          <SelectContent>
            {matrizes.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.razao_social}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit" data-permission="Cadastros.Filial.salvar" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {filial ? 'Atualizar' : 'Criar Filial'}
        </Button>
      </div>
    </form>
  );
}