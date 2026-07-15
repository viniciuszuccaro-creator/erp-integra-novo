import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { AnimatePresence } from 'framer-motion';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import TemplateFormCard from './templates-mensagens/TemplateFormCard';
import TemplateCard from './templates-mensagens/TemplateCard';

const CATEGORIAS = ['Saudação', 'Despedida', 'Orçamento', 'Pedido', 'Entrega', 'Financeiro', 'Suporte', 'Geral'];

const VARIAVEIS = [
  { nome: '{{cliente}}', descricao: 'Nome do cliente' },
  { nome: '{{pedido}}', descricao: 'Número do pedido' },
  { nome: '{{valor}}', descricao: 'Valor monetário' },
  { nome: '{{data}}', descricao: 'Data atual' },
  { nome: '{{empresa}}', descricao: 'Nome da empresa' },
  { nome: '{{atendente}}', descricao: 'Nome do atendente' },
  { nome: '{{link}}', descricao: 'Link relevante' },
];

export default function TemplatesMensagens({ onSelecionarTemplate }) {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [editando, setEditando] = useState(null);
  const [novoTemplate, setNovoTemplate] = useState({ nome: '', categoria: 'Geral', conteudo: '' });
  const [exibirForm, setExibirForm] = useState(false);

  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates-mensagens-lista', empresaAtual?.id],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoCanal.filter({ empresa_id: empresaAtual?.id });
      const allTemplates = [];
      configs.forEach(config => {
        (config.templates_mensagem || []).forEach(t => allTemplates.push({ ...t, config_id: config.id, canal: config.canal }));
      });
      return allTemplates;
    },
    enabled: !!empresaAtual?.id,
  });

  const salvarTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const configs = await base44.entities.ConfiguracaoCanal.filter({ empresa_id: empresaAtual?.id, ativo: true });
      let config = configs[0];
      if (!config) {
        config = await base44.entities.ConfiguracaoCanal.create({
          canal: 'Portal', empresa_id: empresaAtual?.id,
          group_id: grupoAtual?.id || empresaAtual?.group_id, ativo: true, templates_mensagem: [],
        });
      }
      const templatesAtuais = config.templates_mensagem || [];
      const novoTpl = {
        id: editando?.id || `tpl-${Date.now()}`,
        nome: template.nome, categoria: template.categoria, conteudo: template.conteudo,
        variaveis: template.conteudo.match(/\{\{[^}]+\}\}/g) || [],
        ativo: true, criado_em: editando?.criado_em || new Date().toISOString(),
      };
      const templatesAtualizados = editando
        ? templatesAtuais.map(t => t.id === editando.id ? novoTpl : t)
        : [...templatesAtuais, novoTpl];
      await base44.entities.ConfiguracaoCanal.update(config.id, { templates_mensagem: templatesAtualizados });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates-mensagens-lista'] });
      toast.success(editando ? 'Template atualizado!' : 'Template criado!');
      resetForm();
    },
  });

  const excluirTemplateMutation = useMutation({
    mutationFn: async (template) => {
      const config = await base44.entities.ConfiguracaoCanal.get(template.config_id);
      const templatesAtualizados = (config.templates_mensagem || []).filter(t => t.id !== template.id);
      await base44.entities.ConfiguracaoCanal.update(config.id, { templates_mensagem: templatesAtualizados });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates-mensagens-lista'] });
      toast.success('Template excluído!');
    },
  });

  const resetForm = () => {
    setNovoTemplate({ nome: '', categoria: 'Geral', conteudo: '' });
    setEditando(null);
    setExibirForm(false);
  };

  const handleEditar = (template) => {
    setEditando(template);
    setNovoTemplate({ nome: template.nome, categoria: template.categoria, conteudo: template.conteudo });
    setExibirForm(true);
  };

  const handleCopiar = async (conteudo) => {
    await navigator.clipboard.writeText(conteudo);
    toast.success('Copiado!');
  };

  const substituirVariaveis = (texto) => texto
    .replace(/\{\{cliente\}\}/g, 'João Silva')
    .replace(/\{\{pedido\}\}/g, 'PED-001234')
    .replace(/\{\{valor\}\}/g, 'R$ 5.000,00')
    .replace(/\{\{data\}\}/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/\{\{empresa\}\}/g, empresaAtual?.nome_fantasia || 'Empresa')
    .replace(/\{\{atendente\}\}/g, 'Maria')
    .replace(/\{\{link\}\}/g, 'https://exemplo.com');

  const templatesFiltrados = templates.filter(t => {
    const matchBusca = !busca || t.nome?.toLowerCase().includes(busca.toLowerCase()) || t.conteudo?.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === 'Todas' || t.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  });

  return (
    <div className="w-full h-full overflow-auto">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar templates..." className="pl-9" />
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white flex-1 sm:flex-none">
              <option value="Todas">Todas Categorias</option>
              {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <Button onClick={() => setExibirForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Novo
            </Button>
          </div>
        </div>

        <AnimatePresence>
          <TemplateFormCard
            exibirForm={exibirForm}
            editando={editando}
            novoTemplate={novoTemplate}
            setNovoTemplate={setNovoTemplate}
            categorias={CATEGORIAS}
            variaveisDisponiveis={VARIAVEIS}
            substituirVariaveis={substituirVariaveis}
            onSalvar={() => salvarTemplateMutation.mutate(novoTemplate)}
            onReset={resetForm}
            isPending={salvarTemplateMutation.isPending}
          />
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-slate-500">Carregando templates...</div>
          ) : templatesFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum template encontrado</p>
            </div>
          ) : (
            templatesFiltrados.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onCopiar={handleCopiar}
                onEditar={handleEditar}
                onExcluir={async () => {
                  const ok = await confirm({ title: 'Excluir Template', description: 'Deseja realmente excluir este template de mensagem?', variant: 'danger', confirmText: 'Excluir' });
                  if (ok) excluirTemplateMutation.mutate(template);
                }}
                onSelecionarTemplate={onSelecionarTemplate}
              />
            ))
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}