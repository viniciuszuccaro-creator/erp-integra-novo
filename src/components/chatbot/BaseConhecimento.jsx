import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.5 - BASE DE CONHECIMENTO IA
 * Base de conhecimento para treinar o chatbot
 */
export default function BaseConhecimento() {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);
  const queryClient = useQueryClient();
  const { empresaAtual, filterInContext, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const [form, setForm] = useState({
    pergunta: '',
    resposta: '',
    categoria: 'Geral',
    tags: []
  });

  const { data: conhecimentos = [] } = useQuery({
    queryKey: ['base-conhecimento', contextoKey],
    queryFn: async () => {
      const configs = await filterInContext('ConfiguracaoCanal', {}, '-updated_date', 999);
      return configs.flatMap(c => c.base_conhecimento || []);
    },
    enabled: !!contexto
  });

  const salvarMutation = useMutation({
    mutationFn: async (dados) => {
      const configs = await base44.entities.ConfiguracaoCanal.filter({ empresa_id: empresaAtual?.id });
      let config = configs[0];
      
      if (!config) {
        config = await base44.entities.ConfiguracaoCanal.create({
          canal: 'Portal',
          empresa_id: empresaAtual?.id,
          ativo: true,
          base_conhecimento: []
        });
      }

      const baseAtual = config.base_conhecimento || [];
      const novo = {
        id: editando?.id || `kb-${Date.now()}`,
        ...dados,
        criado_em: new Date().toISOString()
      };

      const baseAtualizada = editando
        ? baseAtual.map(k => k.id === editando.id ? novo : k)
        : [...baseAtual, novo];

      await base44.entities.ConfiguracaoCanal.update(config.id, {
        base_conhecimento: baseAtualizada
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['base-conhecimento'] });
      toast.success('Conhecimento salvo!');
      resetForm();
    }
  });

  const resetForm = () => {
    setForm({ pergunta: '', resposta: '', categoria: 'Geral', tags: [] });
    setEditando(null);
    setDialogAberto(false);
  };

  const conhecimentosFiltrados = conhecimentos.filter(k =>
    !busca || 
    k.pergunta?.toLowerCase().includes(busca.toLowerCase()) ||
    k.resposta?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Base de Conhecimento
          </h2>
          <p className="text-sm text-slate-600 mt-1">Treine o chatbot com perguntas frequentes</p>
        </div>
        <Button data-permission="Chatbot.BaseConhecimento.criar" onClick={() => setDialogAberto(true)} className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Buscar na base de conhecimento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {conhecimentosFiltrados.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.pergunta}</p>
                  <Badge className="mt-2 text-xs">{item.categoria}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" data-permission="Chatbot.BaseConhecimento.editar" className="h-8 w-8" onClick={() => {
                    setEditando(item);
                    setForm(item);
                    setDialogAberto(true);
                  }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{item.resposta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar' : 'Novo'} Conhecimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Input
                placeholder="Pergunta"
                value={form.pergunta}
                onChange={(e) => setForm({ ...form, pergunta: e.target.value })}
              />
            </div>
            <div>
              <Textarea
                placeholder="Resposta"
                value={form.resposta}
                onChange={(e) => setForm({ ...form, resposta: e.target.value })}
                className="h-24"
              />
            </div>
            <div>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option>Geral</option>
                <option>Produtos</option>
                <option>Pedidos</option>
                <option>Financeiro</option>
                <option>Logística</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" data-permission="Chatbot.BaseConhecimento.visualizar" onClick={resetForm}>Cancelar</Button>
            <Button data-permission="Chatbot.BaseConhecimento.criar" onClick={() => salvarMutation.mutate(form)} className="bg-blue-600">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}