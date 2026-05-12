import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Empresas() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ razao_social: '', nome_fantasia: '', cnpj: '' });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => base44.entities.Empresa.list('-updated_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Empresa.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      setShowForm(false);
      setFormData({ razao_social: '', nome_fantasia: '', cnpj: '' });
      toast.success('Empresa criada com sucesso');
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Empresa.update(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      setEditingId(null);
      setShowForm(false);
      setFormData({ razao_social: '', nome_fantasia: '', cnpj: '' });
      toast.success('Empresa atualizada com sucesso');
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Empresa.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast.success('Empresa removida com sucesso');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!formData.razao_social || !formData.cnpj) {
      toast.error('Razão social e CNPJ são obrigatórios');
      return;
    }
    
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate({ ...formData, status: 'Ativa' });
    }
  };

  const handleEdit = (empresa) => {
    setEditingId(empresa.id);
    setFormData(empresa);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ razao_social: '', nome_fantasia: '', cnpj: '' });
  };

  return (
    <div className="w-full h-full space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Empresas & Grupos
          </h1>
          <p className="text-slate-600 mt-1">Gerencie todas as empresas do seu grupo empresarial</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Empresa' : 'Criar Nova Empresa'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social *</label>
                <Input
                  placeholder="Ex: Zuccaro Distribuidora Ltda"
                  value={formData.razao_social}
                  onChange={(e) => setFormData(p => ({ ...p, razao_social: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia</label>
                <Input
                  placeholder="Ex: Zuccaro"
                  value={formData.nome_fantasia}
                  onChange={(e) => setFormData(p => ({ ...p, nome_fantasia: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ *</label>
                <Input
                  placeholder="Ex: 12.345.678/0001-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(p => ({ ...p, cnpj: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empresas.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-slate-500">
              Nenhuma empresa cadastrada. Crie uma para começar.
            </CardContent>
          </Card>
        ) : (
          empresas.map((empresa) => (
            <Card key={empresa.id} className="border-2 border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-slate-900 truncate">
                      {empresa.nome_fantasia || empresa.razao_social}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {empresa.razao_social}
                    </p>
                  </div>
                  <Badge className={empresa.status === 'Ativa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {empresa.status === 'Ativa' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {empresa.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600">
                  <strong>CNPJ:</strong> {empresa.cnpj}
                </p>

                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <Button
                    onClick={() => handleEdit(empresa)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate(empresa.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}